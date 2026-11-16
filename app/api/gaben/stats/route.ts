import { NextResponse } from 'next/server';
import { getD1 } from '@/lib/d1';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await getD1();
    if (!db) {
      return NextResponse.json({
        totalSeconds: 0,
        walletsSacrificed: 0,
        source: 'local-fallback'
      });
    }

    const row = await db
      .prepare('SELECT total_seconds as totalSeconds, wallets_sacrificed as walletsSacrificed FROM gaben_global_stats WHERE id = ?')
      .bind('global')
      .first<{ totalSeconds: number; walletsSacrificed: number }>();

    return NextResponse.json({
      totalSeconds: row?.totalSeconds || 0,
      walletsSacrificed: row?.walletsSacrificed || 0,
      source: 'd1-database'
    });
  } catch (err: any) {
    console.error('D1 Gaben Stats Fetch Error:', err);
    return NextResponse.json({ totalSeconds: 0, walletsSacrificed: 0 }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = ((await request.json().catch(() => ({}))) || {}) as any;
    const { addSeconds = 0, sacrificeWallet = false } = body;

    // Safety clamps against abuse
    const safeSeconds = Math.max(0, Math.min(60, Math.floor(Number(addSeconds) || 0)));
    const safeWallets = sacrificeWallet ? 1 : 0;

    if (safeSeconds === 0 && safeWallets === 0) {
      return NextResponse.json({ error: 'No stats to update' }, { status: 400 });
    }

    const db = await getD1();
    if (!db) {
      return NextResponse.json({ error: 'D1 database binding unavailable' }, { status: 503 });
    }

    await db
      .prepare("INSERT OR IGNORE INTO gaben_global_stats (id, total_seconds, wallets_sacrificed) VALUES ('global', 0, 0)")
      .run()
      .catch(() => {});

    const updated = await db
      .prepare(`
        UPDATE gaben_global_stats
        SET
          total_seconds = total_seconds + ?,
          wallets_sacrificed = wallets_sacrificed + ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = 'global'
        RETURNING total_seconds as totalSeconds, wallets_sacrificed as walletsSacrificed
      `)
      .bind(safeSeconds, safeWallets)
      .first<{ totalSeconds: number; walletsSacrificed: number }>();

    return NextResponse.json({
      success: true,
      totalSeconds: updated?.totalSeconds || 0,
      walletsSacrificed: updated?.walletsSacrificed || 0
    });
  } catch (err: any) {
    console.error('D1 Gaben Stats Update Error:', err);
    return NextResponse.json({ error: err.message || 'Database error' }, { status: 500 });
  }
}
