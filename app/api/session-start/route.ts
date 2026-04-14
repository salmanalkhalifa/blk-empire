import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

const sessionStartSchema = z.object({
  avataruuid: z.string().uuid(),
  objectuuid: z.string().min(1),
  objectname: z.string().optional(),
  region: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // 🔐 Auth (LSL system token or player token)
    const token = getTokenFromHeader(req.headers.get('authorization') || undefined);
    verifyToken(token);

    const body = await req.json();
    const parsed = sessionStartSchema.parse(body);

    const { avataruuid, objectuuid, objectname, region } = parsed;

    // 🔎 Get player
    const playerRes = await query(
      `SELECT id FROM players WHERE avataruuid = $1`,
      [avataruuid]
    );

    if (!playerRes.rowCount) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    const playerId = playerRes.rows[0].id;

    // 🛑 End any existing active sessions (safety)
    await query(
      `UPDATE sessions
       SET isactive = FALSE,
           endedat = NOW()
       WHERE playerid = $1 AND isactive = TRUE`,
      [playerId]
    );

    // ➕ Create new session
    const result = await query(
      `INSERT INTO sessions (playerid, objectuuid, objectname, region)
       VALUES ($1, $2, $3, $4)
       RETURNING id, startedat`,
      [playerId, objectuuid, objectname || null, region || null]
    );

    const session = result.rows[0];

    return NextResponse.json({
      sessionid: session.id,
      startedat: session.startedat,
    });
  } catch (error: any) {
    console.error('Session start error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    if (error.message?.includes('Authorization')) {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}