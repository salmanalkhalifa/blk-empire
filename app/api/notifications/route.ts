// app/api/notifications/route.ts

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

    const playerId = payload.playerId;

    // 2. Fetch notifications
    const result = await query(
      `SELECT 
        id,
        type,
        title,
        message,
        isread,
        createdat
       FROM notifications
       WHERE playerid = $1
       ORDER BY createdat DESC
       LIMIT 100`,
      [playerId]
    );

    return NextResponse.json({
      notifications: result.rows,
    });
  } catch (error) {
    console.error('notifications error:', error);

    return NextResponse.json(
      { error: 'Unauthorized or internal server error' },
      { status: 401 }
    );
  }
}