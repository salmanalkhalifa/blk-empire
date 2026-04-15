import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';

const paramsSchema = z.object({
  uuid: z.string().uuid(),
});

export async function GET(
  req: NextRequest,
  context: { params: { uuid: string } }
) {
  try {
    const parsedParams = paramsSchema.parse(context.params);
    const { uuid } = parsedParams;

    // 1. Get player
    const playerRes = await query(
      `SELECT 
        id,
        avataruuid,
        displayname,
        gender,
        role,
        level,
        totalxp,
        dom_level,
        sub_level,
        switch_level,
        time_level,
        cumlevel,
        honorscore,
        createdat
       FROM players
       WHERE avataruuid = $1`,
      [uuid]
    );

    if (!playerRes.rowCount) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    const player = playerRes.rows[0];

    // 2. Get settings (privacy)
    const settingsRes = await query(
      `SELECT 
        isprivate,
        hidestatistics,
        hideachievements,
        hidebadges,
        hidepartners,
        hideactivity
       FROM playersettings
       WHERE playerid = $1`,
      [player.id]
    );

    const settings = settingsRes.rowCount
      ? settingsRes.rows[0]
      : {
          isprivate: false,
          hidestatistics: false,
          hideachievements: false,
          hidebadges: false,
          hidepartners: false,
          hideactivity: false,
        };

    // 3. Respect privacy
    if (settings.isprivate) {
      return NextResponse.json({
        private: true,
        message: 'This profile is private',
      });
    }

    return NextResponse.json({
      player,
      visibility: {
        statistics: !settings.hidestatistics,
        achievements: !settings.hideachievements,
        badges: !settings.hidebadges,
        partners: !settings.hidepartners,
        activity: !settings.hideactivity,
      },
    });
  } catch (error: any) {
    console.error('public player error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid UUID', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}