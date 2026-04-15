import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query(
      `SELECT 
        gender,
        COUNT(*) as count
       FROM players
       GROUP BY gender`
    );

    // Normalize into predictable structure
    const stats = {
      male: 0,
      female: 0,
      unknown: 0,
    };

    for (const row of result.rows) {
      const g = row.gender || 'unknown';
      stats[g as keyof typeof stats] = parseInt(row.count, 10);
    }

    return NextResponse.json({
      genderStats: stats,
    });
  } catch (error) {
    console.error('gender statistics error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}