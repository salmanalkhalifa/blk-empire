// app/api/cron/rotate-quests/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

const CRON_SECRET = process.env.CRON_SECRET!;

function getNow() {
  return new Date();
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export async function GET(req: NextRequest) {
  try {
    // 1. AUTH CHECK
    const auth = req.headers.get('authorization');
    if (!auth || auth !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = getNow();

    // Helper to rotate a quest type
    async function rotate(type: 'daily' | 'weekly' | 'monthly', count: number, durationDays: number) {
      // 2. Delete old rotations
      await query(
        `DELETE FROM activequestrotations WHERE slottype = $1`,
        [type]
      );

      // 3. Fetch random quests
      const questsRes = await query(
        `SELECT id FROM quests
         WHERE rotationtype = $1 AND isactive = TRUE
         ORDER BY RANDOM()
         LIMIT $2`,
        [type, count]
      );

      const quests = questsRes.rows;

      const validFrom = now;
      const validUntil =
        type === 'daily'
          ? addDays(now, 1)
          : type === 'weekly'
          ? addDays(now, 7)
          : addMonths(now, 1);

      // 4. Insert new rotation slots
      for (let i = 0; i < quests.length; i++) {
        await query(
          `INSERT INTO activequestrotations
           (questid, slottype, slotindex, validfrom, validuntil)
           VALUES ($1, $2, $3, $4, $5)`,
          [quests[i].id, type, i + 1, validFrom, validUntil]
        );
      }
    }

    // DAILY → 3 quests
    await rotate('daily', 3, 1);

    // WEEKLY → 3 quests
    await rotate('weekly', 3, 7);

    // MONTHLY → 2 quests
    await rotate('monthly', 2, 30);

    return NextResponse.json({
      success: true,
      message: 'Quest rotations updated',
      timestamp: now,
    });
  } catch (error) {
    console.error('rotate-quests cron error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}