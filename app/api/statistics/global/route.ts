import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Total players
    const playersRes = await query(`SELECT COUNT(*) FROM players`);
    const totalPlayers = parseInt(playersRes.rows[0].count, 10);

    // Total XP
    const xpRes = await query(`SELECT COALESCE(SUM(totalxp),0) FROM players`);
    const totalXP = parseInt(xpRes.rows[0].coalesce, 10);

    // Total sessions
    const sessionsRes = await query(`SELECT COUNT(*) FROM sessions`);
    const totalSessions = parseInt(sessionsRes.rows[0].count, 10);

    // Total cum events
    const cumRes = await query(`SELECT COUNT(*) FROM cumevents`);
    const totalCumEvents = parseInt(cumRes.rows[0].count, 10);

    // Average level
    const avgLevelRes = await query(`SELECT COALESCE(AVG(level),0) FROM players`);
    const avgLevel = parseFloat(avgLevelRes.rows[0].coalesce);

    return NextResponse.json({
      totalPlayers,
      totalXP,
      totalSessions,
      totalCumEvents,
      averageLevel: Number(avgLevel.toFixed(2)),
    });
  } catch (error) {
    console.error('global statistics error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}