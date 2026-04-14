// app/api/leaderboard/dom/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';

const querySchema = z.object({
  period: z.enum(['alltime', 'monthly']).optional(),
});

export async function GET(req: NextRequest) {
  try {
    // 1. Parse query params
    const { searchParams } = new URL(req.url);

    const parsed = querySchema.parse({
      period: searchParams.get('period') || 'alltime',
    });

    const period = parsed.period || 'alltime';

    // 2. Fetch leaderboard
    const res = await query(
      `SELECT 
        rank,
        playerid,
        displayname,
        score,
        updatedat
       FROM leaderboardcache
       WHERE leaderboardtype = 'dom'
         AND period = $1
       ORDER BY rank ASC
       LIMIT 100`,
      [period]
    );

    return NextResponse.json({
      type: 'dom',
      period,
      leaderboard: res.rows,
    });
  } catch (error: any) {
    console.error('leaderboard dom error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query params', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}