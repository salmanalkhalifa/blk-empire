// app/api/auth/login/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { signToken } from '@/lib/auth';

const loginSchema = z.object({
  avataruuid: z.string().uuid(),
  password: z.string().min(6).max(100),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const parsed = loginSchema.parse(body);
    const { avataruuid, password } = parsed;

    // Get player
    const result = await query(
      `SELECT id, avataruuid, displayname, passwordhash
       FROM players
       WHERE avataruuid = $1`,
      [avataruuid]
    );

    if (!result.rowCount || result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const player = result.rows[0];

    // Compare password
    const isValid = await bcrypt.compare(password, player.passwordhash);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Create JWT
    const token = signToken({
      playerId: player.id,
      avataruuid: player.avataruuid,
      displayname: player.displayname,
    });

    return NextResponse.json({
      token,
      player: {
        id: player.id,
        avataruuid: player.avataruuid,
        displayname: player.displayname,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);

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