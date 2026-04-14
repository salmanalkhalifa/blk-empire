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

    // 2. Fetch player
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
        cumcount,
        cumxp,
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
      player,
    });
  } catch (error) {
    console.error('player/me error:', error);

    return NextResponse.json(
      { error: 'Unauthorized or internal server error' },
      { status: 401 }
    );
  }
}