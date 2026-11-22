import { NextResponse } from 'next/server';
import { getD1 } from '@/lib/d1';
import type { WtStatsRow } from '@/lib/woody-tinny/helpers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = await getD1();
  if (!db) {
    return NextResponse.json({
      total: 0,
      woody: 0,
      tinny: 0,
      borderline_total: 0,
      borderline_voted: 0,
      total_votes: 0,
      words_voted: 0,
    });
  }

  const stats = await db.prepare('SELECT * FROM wt_stats WHERE id = 1').first<WtStatsRow>();
  return NextResponse.json(
    stats || {
      total: 0,
      woody: 0,
      tinny: 0,
      borderline_total: 0,
      borderline_voted: 0,
      total_votes: 0,
      words_voted: 0,
    },
  );
}
