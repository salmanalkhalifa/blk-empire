// app/api/register/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { signToken } from '@/lib/auth';

const registerSchema = z.object({
  avataruuid: z.string().uuid(),
  displayname: z.string().min(2).max(50),
  password: z.string().min(6).max(100),
  gender: z.enum(['male', 'female', 'unknown']).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const parsed = registerSchema.parse(body);
    const { avataruuid, displayname, password, gender } = parsed;

    // Check if player already exists
    const existing = await query(
      'SELECT id FROM players WHERE avataruuid = $1',
      [avataruuid]
    );

    if (existing.rowCount && existing.rowCount > 0) {
      return NextResponse.json(
        { error: 'Player already registered' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordhash = await bcrypt.hash(password, 10);

    // Insert player
    const result = await query(
      `INSERT INTO players (avataruuid, displayname, passwordhash, gender)
       VALUES ($1, $2, $3, $4)
       RETURNING id, avataruuid, displayname`,
      [avataruuid, displayname, passwordhash, gender || 'unknown']
    );

    const player = result.rows[0];

    // Create JWT
    const token = signToken({
      playerId: player.id,
      avataruuid: player.avataruuid,
      displayname: player.displayname,
    });

    return NextResponse.json({
      token,
      player,
    });
  } catch (error: any) {
    console.error('Register error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}