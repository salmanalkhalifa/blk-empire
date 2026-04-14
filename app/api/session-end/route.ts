import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

const sessionEndSchema = z.object({
  avataruuid: z.string().uuid(),
  sessionid: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    // 🔐 Auth
    const token = getTokenFromHeader(req.headers.get('authorization') || undefined);
    verifyToken(token);

    const body = await req.json();
    const parsed = sessionEndSchema.parse(body);

    const { avataruuid, sessionid } = parsed;

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

    // 🔎 Get session
    const sessionRes = await query(
      `SELECT startedat, isactive
       FROM sessions
       WHERE id = $1 AND playerid = $2`,
      [sessionid, playerId]
    );

    if (!sessionRes.rowCount) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const session = sessionRes.rows[0];

    if (!session.isactive) {
      return NextResponse.json(
        { error: 'Session already ended' },
        { status: 400 }
      );
    }

    // ⏱ Calculate duration
    const result = await query(
      `UPDATE sessions
       SET 
         endedat = NOW(),
         durationseconds = EXTRACT(EPOCH FROM (NOW() - startedat)),
         isactive = FALSE
       WHERE id = $1
       RETURNING durationseconds`,
      [sessionid]
    );

    const updated = result.rows[0];

    return NextResponse.json({
      sessionid,
      durationseconds: updated.durationseconds,
    });
  } catch (error: any) {
    console.error('Session end error:', error);

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