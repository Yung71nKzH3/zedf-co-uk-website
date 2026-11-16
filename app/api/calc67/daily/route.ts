import { NextResponse } from 'next/server';
import { getD1 } from '@/lib/d1';

export const dynamic = 'force-dynamic';

function getDeterministicStartingNumber(todayKey: string): number {
  const seed = parseInt(todayKey.replace(/-/g, '').substring(4), 10) || 12345;
  const seededNum = (seed * 9301 + 49297) % 233280;
  return Math.floor((seededNum / 233280.0) * (10000 - 10 + 1)) + 10;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');
  const todayKey = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) 
    ? dateParam 
    : new Date().toISOString().split('T')[0];

  const fallbackNumber = getDeterministicStartingNumber(todayKey);

  try {
    const db = await getD1();
    if (!db) {
      return NextResponse.json({
        date: todayKey,
        startingNumber: fallbackNumber,
        source: 'deterministic-offline-ready'
      });
    }

    const existing = await db
      .prepare('SELECT starting_number FROM daily_challenges WHERE date = ?')
      .bind(todayKey)
      .first<{ starting_number: number }>();

    if (existing?.starting_number) {
      return NextResponse.json({
        date: todayKey,
        startingNumber: existing.starting_number,
        source: 'd1-database'
      });
    }

    // Insert newly generated starting number
    await db
      .prepare('INSERT OR IGNORE INTO daily_challenges (date, starting_number) VALUES (?, ?)')
      .bind(todayKey, fallbackNumber)
      .run();

    return NextResponse.json({
      date: todayKey,
      startingNumber: fallbackNumber,
      source: 'd1-database-initialized'
    });
  } catch (err: any) {
    console.error('D1 Daily Challenge Fetch Error:', err);
    return NextResponse.json({
      date: todayKey,
      startingNumber: fallbackNumber,
      source: 'deterministic-fallback'
    });
  }
}
