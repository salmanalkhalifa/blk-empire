// app/api/settings/password/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';

const schema = z.object({
  currentPassword: z.string().min(6).max(100),
  newPassword: z.string().min(6).max(100),
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

    // 3. Get current password hash
    const result = await query(
      `SELECT passwordhash FROM players WHERE id = $1`,
      [payload.playerId]
    );

    if (!result.rowCount) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    const currentHash = result.rows[0].passwordhash;

    // 4. Verify current password
    const isValid = await bcrypt.compare(
      body.currentPassword,
      currentHash
    );

    if (!isValid) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // 5. Hash new password
    const newHash = await bcrypt.hash(body.newPassword, 10);

    // 6. Update password
    await query(
      `UPDATE players
       SET passwordhash = $1
       WHERE id = $2`,
      [newHash, payload.playerId]
    );

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    console.error('password update error:', error);

    return NextResponse.json(
      { error: 'Unauthorized or internal server error' },
      { status: 401 }
    );
  }
}