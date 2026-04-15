// app/api/announcements/route.ts

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query(
      `SELECT 
        id,
        title,
        content,
        type,
        createdat
       FROM announcements
       WHERE isactive = TRUE
       ORDER BY createdat DESC
       LIMIT 50`
    );

    return NextResponse.json({
      announcements: result.rows,
    });
  } catch (error) {
    console.error('announcements error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}