import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { signToken } from '@/lib/auth';

const schema = z.object({
  displayname: z.string().min(2),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());

    const result = await query(
      `SELECT id, avataruuid, displayname, passwordhash
       FROM players
       WHERE LOWER(displayname) = LOWER($1)`,
      [body.displayname]
    );

    if (!result.rowCount) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const player = result.rows[0];

    const valid = await bcrypt.compare(body.password, player.passwordhash);

    if (!valid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

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
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}