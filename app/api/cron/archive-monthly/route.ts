// app/api/cron/archive-monthly/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

const CRON_SECRET = process.env.CRON_SECRET!;

function getMonthKey(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export async function GET(req: NextRequest) {
  try {
    // 1. AUTH CHECK
    const auth = req.headers.get('authorization');
    if (!auth || auth !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();

    // IMPORTANT:
    // We archive the PREVIOUS month, not current
    const previousMonth = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth() - 1,
      1
    ));

    const monthKey = getMonthKey(previousMonth);

    const types: ('xp' | 'cum' | 'dom' | 'sub' | 'time')[] = [
      'xp',
      'cum',
      'dom',
      'sub',
      'time',
    ];

    // 2. For each leaderboard type
    for (const type of types) {
      // 3. Fetch monthly leaderboard snapshot
      const res = await query(
        `SELECT rank, playerid, displayname, score
         FROM leaderboardcache
         WHERE leaderboardtype = $1
           AND period = 'monthly'
         ORDER BY rank ASC`,
        [type]
      );

      const rows = res.rows;

      // 4. Insert into archive (idempotent-safe via unique index)
      for (const row of rows) {
        await query(
          `INSERT INTO monthlyarchives
           (monthyear, leaderboardtype, rank, playerid, displayname, score)
           VALUES ($1,$2,$3,$4,$5,$6)
           ON CONFLICT (monthyear, leaderboardtype, rank) DO NOTHING`,
          [
            monthKey,
            type,
            row.rank,
            row.playerid,
            row.displayname,
            row.score,
          ]
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Monthly leaderboard archived',
      archivedMonth: monthKey,
      timestamp: now,
    });
  } catch (error) {
    console.error('archive-monthly cron error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}