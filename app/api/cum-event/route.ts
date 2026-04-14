// app/api/cum-event/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';
import { processCumEvent } from '@/lib/services/CumService';

const schema = z.object({
  provideruuid: z.string().uuid(),
  recipientuuid: z.string().uuid(),
  bodypart: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Auth (system JWT)
    const token = getTokenFromHeader(
      req.headers.get('authorization') || undefined
    );
    verifyToken(token);

    // 2. Validate input
    const body = schema.parse(await req.json());

    // 3. Process event
    const result = await processCumEvent(
      body.provideruuid,
      body.recipientuuid,
      body.bodypart
    );

    return NextResponse.json({
      xpawarded: result.xpawarded,
      newtotalxp: result.newtotalxp,
      newlevel: result.newlevel,
      levelup: result.levelup,
      dom_level: result.dom_level,
      dom_levelup: result.dom_levelup,
      sub_level: result.sub_level,
      sub_levelup: result.sub_levelup,
      switch_level: result.switch_level,
      switch_levelup: result.switch_levelup,
      time_level: result.time_level,
      time_levelup: result.time_levelup,
      cumlevel: result.cumlevel,
      cum_levelup: result.cum_levelup,
      newachievements: [],
      newbadges: [],
      newtitles: [],
    });
  } catch (error: any) {
    console.error('cum-event error:', error);

    if (error.message === 'Rate limited') {
      return NextResponse.json(
        { error: 'Too many events' },
        { status: 429 }
      );
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    if (error.message === 'Invalid body part') {
      return NextResponse.json(
        { error: 'Invalid body part' },
        { status: 400 }
      );
    }

    if (error.message === 'Player not found') {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}