import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db';

const querySchema = z.object({
  month: z.string().optional(), // format: YYYY-MM
  type: z.enum(['xp', 'cum', 'dom', 'sub', 'time']).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const parsed = querySchema.parse({
      month: searchParams.get('month') || undefined,
      type: searchParams.get('type') || undefined,
    });

    let whereClauses: string[] = [];
    let values: any[] = [];

    if (parsed.month) {
      values.push(parsed.month);
      whereClauses.push(`monthyear = $${values.length}`);
    }

    if (parsed.type) {
      values.push(parsed.type);
      whereClauses.push(`leaderboardtype = $${values.length}`);
    }

    const whereSQL =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const result = await query(
      `SELECT 
        monthyear,
        leaderboardtype,
        rank,
        playerid,
        displayname,
        score,
        createdat
       FROM monthlyarchives
       ${whereSQL}
       ORDER BY monthyear DESC, leaderboardtype, rank ASC
       LIMIT 500`,
      values
    );

    return NextResponse.json({
      archives: result.rows,
    });
  } catch (error: any) {
    console.error('archives error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query params', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}