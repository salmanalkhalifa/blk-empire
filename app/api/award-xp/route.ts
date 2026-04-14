// app/api/award-xp/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';
import { awardXP } from '@/lib/services/XPService';

const schema = z.object({
  avataruuid: z.string().uuid(),
  sessionid: z.string().uuid(),
  sourcetype: z.enum(['furniture', 'zone', 'quest', 'achievement', 'cum']),
  xpamount: z.number().int().positive(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Auth
    const token = getTokenFromHeader(
      req.headers.get('authorization') || undefined
    );
    verifyToken(token);

    // 2. Validate body
    const body = schema.parse(await req.json());

    // 3. Resolve player
    const playerRes = await query(
      `SELECT id FROM players WHERE avataruuid = $1`,
      [body.avataruuid]
    );

    if (!playerRes.rowCount) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    const playerId = playerRes.rows[0].id;

    // 4. Validate session (must be active)
    const sessionRes = await query(
      `SELECT id FROM sessions 
       WHERE id = $1 AND playerid = $2 AND isactive = TRUE`,
      [body.sessionid, playerId]
    );

    if (!sessionRes.rowCount) {
      return NextResponse.json(
        { error: 'Invalid or inactive session' },
        { status: 400 }
      );
    }

    // 5. Award XP
    const result = await awardXP(
      playerId,
      body.xpamount,
      body.sourcetype,
      body.sessionid
    );

    // 6. Update session XP
    await query(
      `UPDATE sessions
       SET xpawarded = xpawarded + $1
       WHERE id = $2`,
      [body.xpamount, body.sessionid]
    );

    return NextResponse.json({
      newtotalxp: result.newtotalxp,
      newlevel: result.newlevel,
      levelup: result.levelup,
      dom_level: result.dom_level,
      dom_levelup: result.dom_levelup,
      sub_level: result.sub_level,
      sub_levelup: result.sub_levelup,
      switch_level: result.switch_level,
      switch_levelup: result.switch_levelup,
      time_level: result.time_level,
      time_levelup: result.time_levelup,
      cumlevel: result.cumlevel,
      cum_levelup: result.cum_levelup,
      newachievements: [],
      newbadges: [],
      newtitles: [],
    });
  } catch (error: any) {
    console.error('award-xp error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}