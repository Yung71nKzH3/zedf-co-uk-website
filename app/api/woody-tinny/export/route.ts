import { getD1 } from '@/lib/d1';
import { effectiveLabel, type WtWordRow } from '@/lib/woody-tinny/helpers';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = await getD1();
  if (!db) {
    return new Response('D1 database binding unavailable', { status: 503 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(
        encoder.encode('word,final_label,algo_label,score,confidence,woody_votes,tinny_votes\n'),
      );
      let lastId = 0;
      const pageSize = 10000;

      while (true) {
        const { results } = await db
          .prepare(
            'SELECT id, word, algo_label, score, confidence, woody_votes, tinny_votes FROM wt_words WHERE id > ? ORDER BY id LIMIT ?',
          )
          .bind(lastId, pageSize)
          .all<WtWordRow>();

        if (!results || results.length === 0) break;

        let chunk = '';
        for (const r of results) {
          chunk += `${r.word},${effectiveLabel(r)},${r.algo_label},${r.score},${r.confidence},${r.woody_votes},${r.tinny_votes}\n`;
          lastId = r.id;
        }
        controller.enqueue(encoder.encode(chunk));

        if (results.length < pageSize) break;
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="woody_tinny_final.csv"',
    },
  });
}
