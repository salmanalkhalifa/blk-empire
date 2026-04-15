import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query(
      `SELECT 
        role,
        COUNT(*) as count
       FROM players
       GROUP BY role`
    );

    // Normalize into predictable structure
    const stats = {
      dom: 0,
      sub: 0,
      switch: 0,
      unassigned: 0,
    };

    for (const row of result.rows) {
      const role = row.role || 'unassigned';
      stats[role as keyof typeof stats] = parseInt(row.count, 10);
    }

    return NextResponse.json({
      roleStats: stats,
    });
  } catch (error) {
    console.error('role statistics error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}