// app/api/settings/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

const updateSchema = z.object({
  isprivate: z.boolean().optional(),
  isanonymous: z.boolean().optional(),
  hidestatistics: z.boolean().optional(),
  hideachievements: z.boolean().optional(),
  hidebadges: z.boolean().optional(),
  hidepartners: z.boolean().optional(),
  hideactivity: z.boolean().optional(),
  notificationsenabled: z.boolean().optional(),
  notificationsound: z.boolean().optional(),
  showdidyouknow: z.boolean().optional(),
  genderdisplay: z.enum(['auto', 'male', 'female', 'neutral']).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromHeader(
      req.headers.get('authorization') || undefined
    );
    const payload = verifyToken(token);

    const result = await query(
      `SELECT * FROM playersettings WHERE playerid = $1`,
      [payload.playerId]
    );

    if (!result.rowCount) {
      // Create default settings if missing
      const insert = await query(
        `INSERT INTO playersettings (playerid)
         VALUES ($1)
         RETURNING *`,
        [payload.playerId]
      );

      return NextResponse.json({
        settings: insert.rows[0],
      });
    }

    return NextResponse.json({
      settings: result.rows[0],
    });
  } catch (error) {
    console.error('settings GET error:', error);

    return NextResponse.json(
      { error: 'Unauthorized or internal server error' },
      { status: 401 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = getTokenFromHeader(
      req.headers.get('authorization') || undefined
    );
    const payload = verifyToken(token);

    const body = updateSchema.parse(await req.json());

    // Ensure row exists
    await query(
      `INSERT INTO playersettings (playerid)
       VALUES ($1)
       ON CONFLICT (playerid) DO NOTHING`,
      [payload.playerId]
    );

    // Build dynamic update query
    const fields = Object.keys(body);
    if (fields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const setClauses = fields.map((field, i) => `${field} = $${i + 2}`);
    const values = fields.map((field) => (body as any)[field]);

    const result = await query(
      `UPDATE playersettings
       SET ${setClauses.join(', ')},
           updatedat = NOW()
       WHERE playerid = $1
       RETURNING *`,
      [payload.playerId, ...values]
    );

    return NextResponse.json({
      settings: result.rows[0],
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('settings POST error:', error);

    return NextResponse.json(
      { error: 'Unauthorized or internal server error' },
      { status: 401 }
    );
  }
}