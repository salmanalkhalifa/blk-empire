// app/api/quests/complete/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';
import { completeQuest } from '@/lib/services/QuestService';

const schema = z.object({
  questid: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Auth
    const token = getTokenFromHeader(
      req.headers.get('authorization') || undefined
    );
    const payload = verifyToken(token);

    const playerId = payload.playerId;

    // 2. Validate input
    const body = schema.parse(await req.json());

    // 3. Complete quest (backend validates progress)
    const result = await completeQuest(playerId, body.questid);

    return NextResponse.json({
      xpreward: result.xpreward,
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
    console.error('quest complete error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    if (
      error.message === 'Quest not found' ||
      error.message === 'Quest already completed' ||
      error.message === 'Quest not complete'
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Unauthorized or internal server error' },
      { status: 401 }
    );
  }
}