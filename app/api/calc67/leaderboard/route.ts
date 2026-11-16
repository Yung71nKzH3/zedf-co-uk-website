import { NextResponse } from 'next/server';
import { getD1 } from '@/lib/d1';

export const dynamic = 'force-dynamic';

interface LeaderboardEntry {
  id: string;
  displayName: string;
  operations: number;
  diversityScore: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');
  const todayKey = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) 
    ? dateParam 
    : new Date().toISOString().split('T')[0];

  try {
    const db = await getD1();
    if (!db) {
      return NextResponse.json({ leaderboard: [] });
    }

    const { results } = await db
      .prepare(`
        SELECT user_id as id, display_name as displayName, operations, diversity_score as diversityScore
        FROM leaderboard_scores
        WHERE date = ? AND solved = 1
        ORDER BY diversity_score DESC, operations ASC
        LIMIT 10
      `)
      .bind(todayKey)
      .all<LeaderboardEntry>();

    return NextResponse.json({
      leaderboard: results || []
    });
  } catch (err: any) {
    console.error('D1 Leaderboard Fetch Error:', err);
    return NextResponse.json({ leaderboard: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId,
      date,
      displayName,
      solved = true,
      tagLocked = true,
      operations = 0,
      diversityScore = 1,
      result = 67,
      history = []
    } = body;

    // Strict validation
    if (!userId || typeof userId !== 'string' || userId.length > 64) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const cleanTag = (displayName || '').replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2);
    if (cleanTag.length !== 2) {
      return NextResponse.json({ error: 'Display tag must be exactly 2 letters' }, { status: 400 });
    }

    const todayKey = date && /^\d{4}-\d{2}-\d{2}$/.test(date) 
      ? date 
      : new Date().toISOString().split('T')[0];

    // Math result validation
    const numResult = Number(result);
    if (Math.abs(numResult - 67) > 0.001) {
      return NextResponse.json({ error: 'Target 67 not reached' }, { status: 400 });
    }

    const db = await getD1();
    if (!db) {
      return NextResponse.json({ error: 'D1 database binding unavailable' }, { status: 503 });
    }

    const scoreId = `${userId}_${todayKey}`;
    const historyJson = typeof history === 'string' ? history : JSON.stringify(history);

    // Batch upsert profile and score
    await db.batch([
      db.prepare(`
        INSERT INTO profiles (id, display_name)
        VALUES (?, ?)
        ON CONFLICT(id) DO UPDATE SET display_name = excluded.display_name
      `).bind(userId, cleanTag),
      db.prepare(`
        INSERT INTO leaderboard_scores (
          id, user_id, date, display_name, solved, tag_locked, operations, diversity_score, result, history
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id, date) DO UPDATE SET
          display_name = excluded.display_name,
          solved = excluded.solved,
          tag_locked = excluded.tag_locked,
          operations = excluded.operations,
          diversity_score = excluded.diversity_score,
          result = excluded.result,
          history = excluded.history
      `).bind(
        scoreId,
        userId,
        todayKey,
        cleanTag,
        solved ? 1 : 0,
        tagLocked ? 1 : 0,
        Math.max(1, Math.floor(Number(operations) || 1)),
        Math.max(1, Math.min(4, Math.floor(Number(diversityScore) || 1))),
        numResult,
        historyJson
      )
    ]);

    return NextResponse.json({ success: true, tag: cleanTag });
  } catch (err: any) {
    console.error('D1 Leaderboard Submit Error:', err);
    return NextResponse.json({ error: err.message || 'Database error' }, { status: 500 });
  }
}
