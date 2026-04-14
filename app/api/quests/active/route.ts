// app/api/quests/active/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromHeader } from '@/lib/auth';
import { getActiveQuestsForPlayer, assignActiveQuests } from '@/lib/services/QuestService';

export async function GET(req: NextRequest) {
  try {
    // 1. Auth
    const token = getTokenFromHeader(
      req.headers.get('authorization') || undefined
    );
    const payload = verifyToken(token);

    const playerId = payload.playerId;

    // 2. Ensure quests are assigned
    await assignActiveQuests(playerId);

    // 3. Fetch active quests
    const quests = await getActiveQuestsForPlayer(playerId);

    return NextResponse.json({
      quests,
    });
  } catch (error) {
    console.error('active quests error:', error);

    return NextResponse.json(
      { error: 'Unauthorized or internal server error' },
      { status: 401 }
    );
  }
}