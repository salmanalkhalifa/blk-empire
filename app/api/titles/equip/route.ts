// app/api/titles/equip/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

const schema = z.object({
  titleid: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Auth
    const token = getTokenFromHeader(
      req.headers.get('authorization') || undefined
    );
    const payload = verifyToken(token);

    // 2. Validate input
    const body = schema.parse(await req.json());

    // 3. Ensure player owns this title
    const ownership = await query(
      `SELECT id FROM playertitles
       WHERE playerid = $1 AND titleid = $2`,
      [payload.playerId, body.titleid]
    );

    if (!ownership.rowCount) {
      return NextResponse.json(
        { error: 'Title not owned' },
        { status: 403 }
      );
    }

    // 4. Equip title
    await query(
      `UPDATE players
       SET activetitleid = $1
       WHERE id = $2`,
      [body.titleid, payload.playerId]
    );

    return NextResponse.json({
      success: true,
      activetitleid: body.titleid,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('equip title error:', error);

    return NextResponse.json(
      { error: 'Unauthorized or internal server error' },
      { status: 401 }
    );
  }
}