// app/api/notifications/read/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

const schema = z.object({
  ids: z.array(z.string().uuid()).optional(),
  markAll: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Auth
    const token = getTokenFromHeader(
      req.headers.get('authorization') || undefined
    );
    const payload = verifyToken(token);

    const playerId = payload.playerId;

    // 2. Validate body
    const body = schema.parse(await req.json());

    // 3. Mark notifications
    if (body.markAll) {
      await query(
        `UPDATE notifications
         SET isread = TRUE
         WHERE playerid = $1`,
        [playerId]
      );
    } else if (body.ids && body.ids.length > 0) {
      await query(
        `UPDATE notifications
         SET isread = TRUE
         WHERE playerid = $1
           AND id = ANY($2::uuid[])`,
        [playerId, body.ids]
      );
    } else {
      return NextResponse.json(
        { error: 'No notifications specified' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error('notifications/read error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Unauthorized or internal server error' },
      { status: 401 }
    );
  }
}