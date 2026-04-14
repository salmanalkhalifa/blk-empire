// app/api/cron/refresh-leaderboard/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

const CRON_SECRET = process.env.CRON_SECRET!;

export async function GET(req: NextRequest) {
  try {
    // 1. AUTH CHECK
    const auth = req.headers.get('authorization');
    if (!auth || auth !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();

    // Helper to rebuild leaderboard
    async function rebuildLeaderboard(
      type: 'xp' | 'cum' | 'dom' | 'sub' | 'time',
      period: 'alltime' | 'monthly'
    ) {
      // 2. Clear existing cache
      await query(
        `DELETE FROM leaderboardcache
         WHERE leaderboardtype = $1 AND period = $2`,
        [type, period]
      );

      // 3. Build query based on type + period
      let scoreField = '';
      let whereClause = '';
      let params: any[] = [];

      if (type === 'xp') scoreField = 'totalxp';
      if (type === 'cum') scoreField = 'cumxp';
      if (type === 'dom') scoreField = 'domxp';
      if (type === 'sub') scoreField = 'subxp';
      if (type === 'time') scoreField = 'timexp';

      if (period === 'monthly') {
        whereClause = `WHERE createdat >= date_trunc('month', NOW())`;
      }

      // 4. Fetch ranked players
      const res = await query(
        `SELECT id, displayname, ${scoreField} as score
         FROM players
         ${whereClause}
         ORDER BY ${scoreField} DESC
         LIMIT 100`,
        params
      );

      const players = res.rows;

      // 5. Insert ranked results
      for (let i = 0; i < players.length; i++) {
        const p = players[i];

        await query(
          `INSERT INTO leaderboardcache
           (leaderboardtype, period, rank, playerid, displayname, score, updatedat)
           VALUES ($1,$2,$3,$4,$5,$6,NOW())`,
          [type, period, i + 1, p.id, p.displayname, p.score]
        );
      }
    }

    // 6. Build ALL leaderboards
    const types: ('xp' | 'cum' | 'dom' | 'sub' | 'time')[] = [
      'xp',
      'cum',
      'dom',
      'sub',
      'time',
    ];

    const periods: ('alltime' | 'monthly')[] = ['alltime', 'monthly'];

    for (const type of types) {
      for (const period of periods) {
        await rebuildLeaderboard(type, period);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Leaderboards refreshed',
      timestamp: now,
    });
  } catch (error) {
    console.error('refresh-leaderboard cron error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}