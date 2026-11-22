import { NextResponse } from 'next/server';
import { getD1 } from '@/lib/d1';
import {
  effectiveLabel,
  hmacHex,
  parseCookies,
  serializeWord,
  type WtLabel,
  type WtStatsRow,
  type WtWordRow,
} from '@/lib/woody-tinny/helpers';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const db = await getD1();
  if (!db) {
    return NextResponse.json({ error: 'D1 database binding unavailable' }, { status: 503 });
  }

  let body: { word?: string; vote?: string };
  try {
    body = (await request.json()) as { word?: string; vote?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const wordText = String(body.word || '').trim();
  const vote = String(body.vote || '').toUpperCase() as WtLabel;
  if (!wordText || (vote !== 'WOODY' && vote !== 'TINNY')) {
    return NextResponse.json({ error: "Provide 'word' and 'vote' ('WOODY' or 'TINNY')" }, { status: 400 });
  }

  const secret = process.env.VOTER_SECRET || 'zedf-woody-tinny-voter-secret';
  const cookies = parseCookies(request.headers.get('cookie'));
  const rawCookie = cookies['wt_vid'];
  let vid: string | null = null;
  let needsSetCookie = false;

  if (rawCookie && rawCookie.includes('.')) {
    const [idPart, sigPart] = rawCookie.split('.', 2);
    const expected = await hmacHex(secret, idPart);
    if (sigPart === expected) vid = idPart;
  }

  if (!vid) {
    vid = crypto.randomUUID();
    needsSetCookie = true;
  }

  const voterHash = await hmacHex(secret, `voter:${vid}`);

  const wordRow = await db
    .prepare('SELECT * FROM wt_words WHERE word = ?')
    .bind(wordText)
    .first<WtWordRow>();

  if (!wordRow) {
    return NextResponse.json({ error: 'Word not found' }, { status: 404 });
  }

  const existingVote = await db
    .prepare('SELECT vote FROM wt_votes WHERE word_id = ? AND voter_hash = ?')
    .bind(wordRow.id, voterHash)
    .first<{ vote: WtLabel }>();

  let responsePayload: Record<string, unknown>;

  if (existingVote && existingVote.vote === vote) {
    const stats = await db.prepare('SELECT * FROM wt_stats WHERE id = 1').first<WtStatsRow>();
    responsePayload = {
      already_voted: true,
      updated: serializeWord(wordRow),
      stats,
    };
  } else {
    const oldEffective = effectiveLabel(wordRow);
    const wasUnvoted = wordRow.woody_votes + wordRow.tinny_votes === 0;

    let newWoody = wordRow.woody_votes;
    let newTinny = wordRow.tinny_votes;
    let totalVotesDelta = 0;

    if (existingVote) {
      if (existingVote.vote === 'WOODY') newWoody = Math.max(0, newWoody - 1);
      else newTinny = Math.max(0, newTinny - 1);
    } else {
      totalVotesDelta = 1;
    }

    if (vote === 'WOODY') newWoody += 1;
    else newTinny += 1;

    const newEffective = effectiveLabel({
      algo_label: wordRow.algo_label,
      woody_votes: newWoody,
      tinny_votes: newTinny,
    });

    let woodyDelta = 0;
    let tinnyDelta = 0;
    if (oldEffective !== newEffective) {
      if (newEffective === 'WOODY') {
        woodyDelta = 1;
        tinnyDelta = -1;
      } else {
        woodyDelta = -1;
        tinnyDelta = 1;
      }
    }

    const wordsVotedDelta = wasUnvoted ? 1 : 0;
    const borderlineVotedDelta = wasUnvoted && wordRow.confidence === 'low' ? 1 : 0;

    await db.batch([
      db
        .prepare('UPDATE wt_words SET woody_votes = ?, tinny_votes = ? WHERE id = ?')
        .bind(newWoody, newTinny, wordRow.id),
      db
        .prepare(
          `INSERT INTO wt_votes (word_id, voter_hash, vote, updated_at)
           VALUES (?, ?, ?, datetime('now'))
           ON CONFLICT(word_id, voter_hash) DO UPDATE SET vote = excluded.vote, updated_at = datetime('now')`,
        )
        .bind(wordRow.id, voterHash, vote),
      db
        .prepare(
          `UPDATE wt_stats SET
             woody = woody + ?,
             tinny = tinny + ?,
             total_votes = total_votes + ?,
             words_voted = words_voted + ?,
             borderline_voted = borderline_voted + ?
           WHERE id = 1`,
        )
        .bind(woodyDelta, tinnyDelta, totalVotesDelta, wordsVotedDelta, borderlineVotedDelta),
    ]);

    const updatedWord: WtWordRow = {
      ...wordRow,
      woody_votes: newWoody,
      tinny_votes: newTinny,
    };
    const stats = await db.prepare('SELECT * FROM wt_stats WHERE id = 1').first<WtStatsRow>();

    responsePayload = {
      already_voted: false,
      updated: serializeWord(updatedWord),
      stats,
    };
  }

  const res = NextResponse.json(responsePayload);
  if (needsSetCookie) {
    const sig = await hmacHex(secret, vid);
    const isHttps = new URL(request.url).protocol === 'https:';
    res.cookies.set('wt_vid', `${vid}.${sig}`, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isHttps,
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return res;
}
