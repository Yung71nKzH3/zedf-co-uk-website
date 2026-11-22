import { explainWord } from './classifier';

export type WtLabel = 'WOODY' | 'TINNY';

export interface WtWordRow {
  id: number;
  word: string;
  algo_label: WtLabel;
  score: number;
  confidence: 'high' | 'medium' | 'low';
  borderline_seq: number | null;
  woody_votes: number;
  tinny_votes: number;
}

export interface WtStatsRow {
  total: number;
  woody: number;
  tinny: number;
  borderline_total: number;
  borderline_voted: number;
  total_votes: number;
  words_voted: number;
}

export function effectiveLabel(row: Pick<WtWordRow, 'algo_label' | 'woody_votes' | 'tinny_votes'>): WtLabel {
  if (row.woody_votes > row.tinny_votes) return 'WOODY';
  if (row.tinny_votes > row.woody_votes) return 'TINNY';
  return row.algo_label;
}

export function serializeWord(row: WtWordRow) {
  return {
    word: row.word,
    algo_label: row.algo_label,
    final_label: effectiveLabel(row),
    score: row.score,
    confidence: row.confidence,
    woody_votes: row.woody_votes,
    tinny_votes: row.tinny_votes,
    reasons: explainWord(row.word),
  };
}

export async function hmacHex(secret: string, value: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(value));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  }
  return out;
}
