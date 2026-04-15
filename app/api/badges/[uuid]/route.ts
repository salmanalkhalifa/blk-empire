// app/api/badges/[uuid]/route.ts

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

    const result = await query(
      `SELECT 
        id,
        name,
        description,
        category,
        rarity,
        iconemoji,
        conditiontype,
        conditionvalue
       FROM badges
       WHERE id = $1 AND isactive = TRUE`,
      [uuid]
    );

    if (!result.rowCount) {
      return NextResponse.json(
        { error: 'Badge not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      badge: result.rows[0],
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid badge UUID', details: error.issues },
        { status: 400 }
      );
    }

    console.error('badge detail error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}