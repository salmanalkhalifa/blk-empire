import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { z } from 'zod';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ avataruuid: string }> }
) {
  try {
    // ✅ FIX: await params
    const { avataruuid } = await context.params;

    const uuidSchema = z.string().uuid();
    const parsed = uuidSchema.safeParse(avataruuid);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid avatar UUID' }, { status: 400 });
    }

    const result = await pool.query(
      `SELECT id, avataruuid, displayname, level, totalxp,
              dom_level, sub_level, switch_level, time_level,
              cumlevel, cumxp
       FROM players
       WHERE avataruuid = $1`,
      [avataruuid]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    return NextResponse.json({ player: result.rows[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}