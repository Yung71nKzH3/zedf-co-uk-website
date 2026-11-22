import { NextResponse } from 'next/server';
import { getD1 } from '@/lib/d1';
import { serializeWord, type WtWordRow } from '@/lib/woody-tinny/helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const db = await getD1();
  if (!db) return NextResponse.json([], { status: 503 });

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim().toLowerCase();
  if (!q) return NextResponse.json([]);

  const { results } = await db
    .prepare('SELECT * FROM wt_words WHERE word LIKE ? ORDER BY LENGTH(word), word LIMIT 25')
    .bind(`${q}%`)
    .all<WtWordRow>();

  return NextResponse.json((results || []).map(serializeWord));
}
