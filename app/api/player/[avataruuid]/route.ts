import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';

const paramsSchema = z.object({
  avataruuid: z.string().uuid(),
});

export async function GET(
  req: NextRequest,
  context: { params: { avataruuid: string } }
) {
  try {
    const parsedParams = paramsSchema.parse(context.params);
    const { avataruuid } = parsedParams;

    const result = await query(
      `SELECT 
        id,
        avataruuid,
        displayname,
        gender,
        role,
        level,
        totalxp,
        domxp,
        subxp,
        switchxp,
        timexp,
        dom_level,
        sub_level,
        switch_level,
        time_level,
        cumlevel,
        cumcount,
        cumxp,
        honorscore,
        createdat,
        lastactive
       FROM players
       WHERE avataruuid = $1`,
      [avataruuid]
    );

    if (!result.rowCount || result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      );
    }

    const player = result.rows[0];

    return NextResponse.json({
      player,
    });
  } catch (error: any) {
    console.error('Get player error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid avatar UUID', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}