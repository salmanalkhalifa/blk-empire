// app/api/titles/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromHeader(
      req.headers.get('authorization') || undefined
    );
    const payload = verifyToken(token);

    const result = await query(
      `SELECT 
        t.id,
        t.name,
        t.category,
        t.description,
        pt.unlockedat
       FROM playertitles pt
       JOIN titles t ON t.id = pt.titleid
       WHERE pt.playerid = $1
       ORDER BY pt.unlockedat DESC`,
      [payload.playerId]
    );

    return NextResponse.json({
      titles: result.rows,
    });
  } catch (error) {
    console.error('titles error:', error);

    return NextResponse.json(
      { error: 'Unauthorized or internal server error' },
      { status: 401 }
    );
  }
}