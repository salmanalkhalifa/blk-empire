// app/api/badges/route.ts

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query(
      `SELECT 
        id,
        name,
        description,
        category,
        rarity,
        iconemoji,
        conditiontype,
        conditionvalue
       FROM badges
       WHERE isactive = TRUE
       ORDER BY rarity DESC, name ASC`
    );

    return NextResponse.json({
      badges: result.rows,
    });
  } catch (error) {
    console.error('badges error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}