// app/api/player/me/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // 1. Auth
    const token = getTokenFromHeader(
      req.headers.get('authorization') || undefined
    );
    const payload = verifyToken(token);

    // 2. Fetch player with ALL progression fields
    const result = await query(
      `SELECT 
        id,
        avataruuid,
        displayname,
        gender,
        role,

        level,
        totalxp,

        domxp,
        subxp,
        switchxp,
        timexp,

        dom_level,
        sub_level,
        switch_level,
        time_level,

        cumlevel,
        cumxp,
        cumcount,

        lastcumat,
        activetitleid,
        honorscore,
        createdat,
        lastactive

       FROM players
       WHERE id = $1`,
      [payload.playerId]
    );

    if (!result.rowCount) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    const player = result.rows[0];

    return NextResponse.json({
      player: {
        id: player.id,
        avataruuid: player.avataruuid,
        displayname: player.displayname,
        gender: player.gender,
        role: player.role,

        level: player.level,
        totalxp: player.totalxp,

        domxp: player.domxp,
        subxp: player.subxp,
        switchxp: player.switchxp,
        timexp: player.timexp,

        dom_level: player.dom_level,
        sub_level: player.sub_level,
        switch_level: player.switch_level,
        time_level: player.time_level,

        cumlevel: player.cumlevel,
        cumxp: player.cumxp,
        cumcount: player.cumcount,

        lastcumat: player.lastcumat,
        activetitleid: player.activetitleid,
        honorscore: player.honorscore,
        createdat: player.createdat,
        lastactive: player.lastactive,
      },
    });
  } catch (error) {
    console.error('player/me error:', error);

    return NextResponse.json(
      { error: 'Unauthorized or internal server error' },
      { status: 401 }
    );
  }
}