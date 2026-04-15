import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { z } from 'zod';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ uuid: string }> }
) {
  try {
    // ✅ FIX: await params
    const { uuid } = await context.params;

    const uuidSchema = z.string().uuid();

    const parsed = uuidSchema.safeParse(uuid);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid UUID' }, { status: 400 });
    }

    const result = await pool.query(
      `SELECT id, name, description, category, rarity, iconemoji
       FROM badges
       WHERE id = $1 AND isactive = TRUE`,
      [uuid]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Badge not found' }, { status: 404 });
    }

    return NextResponse.json({ badge: result.rows[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}