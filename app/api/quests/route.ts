// app/api/quests/route.ts

import { NextResponse } from 'next/server';
import { getAllQuests } from '@/lib/services/QuestService';

export async function GET() {
  try {
    const quests = await getAllQuests();

    return NextResponse.json({
      quests,
    });
  } catch (error) {
    console.error('quests error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}