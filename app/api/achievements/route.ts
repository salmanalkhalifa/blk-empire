// app/api/achievements/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';

const querySchema = z.object({
  avataruuid: z.string().uuid().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const parsed = querySchema.parse({
      avataruuid: searchParams.get('avataruuid') || undefined,
    });

    // 1. If no avataruuid → return all achievements (no player context)
    if (!parsed.avataruuid) {
      const res = await query(
        `SELECT * FROM achievements WHERE isactive = TRUE`
      );

      return NextResponse.json({
        achievements: res.rows,
      });
    }

    // 2. Resolve player
    const playerRes = await query(
      `SELECT id FROM players WHERE avataruuid = $1`,
      [parsed.avataruuid]
    );

    if (!playerRes.rowCount) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    const playerId = playerRes.rows[0].id;

    // 3. Get achievements with unlock status
    const res = await query(
      `SELECT 
          a.*,
          pa.unlockedat
       FROM achievements a
       LEFT JOIN playerachievements pa
         ON pa.achievementid = a.id AND pa.playerid = $1
       WHERE a.isactive = TRUE
       ORDER BY a.category, a.name`,
      [playerId]
    );

    return NextResponse.json({
      achievements: res.rows,
    });
  } catch (error: any) {
    console.error('achievements error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}