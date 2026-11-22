import { NextResponse } from 'next/server';
import { getD1 } from '@/lib/d1';
import { serializeWord, type WtWordRow } from '@/lib/woody-tinny/helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const db = await getD1();
  if (!db) return NextResponse.json({ word: null }, { status: 503 });

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode') || 'borderline';

  const stats = await db
    .prepare('SELECT total, borderline_total FROM wt_stats WHERE id = 1')
    .first<{ total: number; borderline_total: number }>();

  if (!stats || stats.total === 0) {
    return NextResponse.json({ word: null });
  }

  let row: WtWordRow | null = null;

  if (mode === 'borderline' && stats.borderline_total > 0) {
    const target = Math.floor(Math.random() * stats.borderline_total) + 1;
    row = await db
      .prepare(
        `SELECT * FROM wt_words
         WHERE borderline_seq >= ? AND woody_votes = 0 AND tinny_votes = 0
         ORDER BY borderline_seq LIMIT 1`,
      )
      .bind(target)
      .first<WtWordRow>();

    if (!row) {
      row = await db
        .prepare('SELECT * FROM wt_words WHERE borderline_seq >= ? ORDER BY borderline_seq LIMIT 1')
        .bind(target)
        .first<WtWordRow>();
    }
  } else if (mode === 'unvoted') {
    const target = Math.floor(Math.random() * stats.total) + 1;
    row = await db
      .prepare(
        `SELECT * FROM wt_words
         WHERE id >= ? AND woody_votes = 0 AND tinny_votes = 0
         ORDER BY id LIMIT 1`,
      )
      .bind(target)
      .first<WtWordRow>();
  }

  if (!row) {
    const target = Math.floor(Math.random() * stats.total) + 1;
    row = await db
      .prepare('SELECT * FROM wt_words WHERE id >= ? ORDER BY id LIMIT 1')
      .bind(target)
      .first<WtWordRow>();
  }

  return NextResponse.json(row ? serializeWord(row) : { word: null });
}
