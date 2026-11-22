'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

type Mode = 'borderline' | 'unvoted' | 'all';

interface WordPayload {
  word: string | null;
  algo_label?: 'WOODY' | 'TINNY';
  final_label?: 'WOODY' | 'TINNY';
  score?: number;
  confidence?: 'high' | 'medium' | 'low';
  woody_votes?: number;
  tinny_votes?: number;
  reasons?: string[];
}

interface StatsPayload {
  total: number;
  woody: number;
  tinny: number;
  borderline_total: number;
  borderline_voted: number;
  total_votes: number;
  words_voted: number;
}

export default function WoodyTinnyPage() {
  const [mode, setMode] = useState<Mode>('borderline');
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [current, setCurrent] = useState<WordPayload | null>(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<WordPayload[] | null>(null);

  const loadStats = useCallback(async () => {
    const res = await fetch('/api/woody-tinny/stats');
    if (res.ok) setStats((await res.json()) as StatsPayload);
  }, []);

  const loadNext = useCallback(async (targetMode: Mode) => {
    const res = await fetch(`/api/woody-tinny/next?mode=${encodeURIComponent(targetMode)}`);
    if (res.ok) setCurrent((await res.json()) as WordPayload);
  }, []);

  useEffect(() => {
    void loadStats();
    void loadNext(mode);
  }, [loadStats, loadNext, mode]);

  const castVote = useCallback(
    async (vote: 'WOODY' | 'TINNY') => {
      if (!current?.word) return;
      const votedWord = current.word;
      const res = await fetch('/api/woody-tinny/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: votedWord, vote }),
      });

      if (res.status === 429) {
        setStatusMsg('Slow down a bit — rate limit reached.');
        return;
      }
      if (res.ok) {
        const data = (await res.json()) as {
          already_voted?: boolean;
          stats?: StatsPayload;
        };
        if (data.stats) setStats(data.stats);
        setStatusMsg(
          data.already_voted
            ? `You already voted ${vote} on "${votedWord}".`
            : `Voted ${vote} on "${votedWord}".`,
        );
        await loadNext(mode);
      }
    },
    [current, loadNext, mode],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      const key = e.key.toLowerCase();
      if (key === 'w') void castVote('WOODY');
      else if (key === 't') void castVote('TINNY');
      else if (key === 's') {
        if (current?.word) setStatusMsg(`Skipped "${current.word}".`);
        void loadNext(mode);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [castVote, current, loadNext, mode]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults(null);
      return;
    }
    const res = await fetch(`/api/woody-tinny/search?q=${encodeURIComponent(q)}`);
    if (res.ok) {
      setSearchResults((await res.json()) as WordPayload[]);
    }
  };

  const total = stats?.total || 1;
  const woodyPct = stats ? ((stats.woody / total) * 100).toFixed(1) : '0.0';
  const tinnyPct = stats ? ((stats.tinny / total) * 100).toFixed(1) : '0.0';

  const confLabels: Record<string, string> = {
    low: 'Borderline (Low Confidence)',
    medium: 'Medium Confidence',
    high: 'High Confidence',
  };

  return (
    <div className="min-h-screen bg-[#f6f2ea] text-[#1e1b18] flex flex-col">
      <header className="border-b border-[#dfd6c7] bg-[#fffdf9] px-4 py-5">
        <div className="max-w-[820px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Link
                href="/project-space"
                className="text-xs font-semibold uppercase tracking-wider text-[#645c53] hover:text-[#1e1b18] underline-offset-4 hover:underline"
              >
                ← Personal Space
              </Link>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mt-1">Woody or Tinny?</h1>
            <p className="text-sm text-[#645c53] mt-0.5">
              Definitive classification of all 370,105 English words — vote on borderline words to settle the dictionary.
            </p>
          </div>
          <a
            href="/api/woody-tinny/export"
            download="woody_tinny_final.csv"
            className="inline-flex items-center min-h-[44px] px-4 py-2 rounded-lg bg-[#1e1b18] text-white text-sm font-semibold hover:opacity-90"
          >
            Export Final CSV
          </a>
        </div>
      </header>

      <main className="max-w-[820px] w-full mx-auto px-4 py-6 grid gap-5 flex-1">
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-3" aria-label="Dictionary statistics">
          <div className="bg-[#fffdf9] border border-[#dfd6c7] rounded-xl px-4 py-3">
            <span className="block text-xs uppercase tracking-wider text-[#645c53]">Woody</span>
            <strong className="text-lg font-bold text-[#7c3f14]">
              {stats ? `${stats.woody.toLocaleString()} (${woodyPct}%)` : '—'}
            </strong>
          </div>
          <div className="bg-[#fffdf9] border border-[#dfd6c7] rounded-xl px-4 py-3">
            <span className="block text-xs uppercase tracking-wider text-[#645c53]">Tinny</span>
            <strong className="text-lg font-bold text-[#334155]">
              {stats ? `${stats.tinny.toLocaleString()} (${tinnyPct}%)` : '—'}
            </strong>
          </div>
          <div className="bg-[#fffdf9] border border-[#dfd6c7] rounded-xl px-4 py-3">
            <span className="block text-xs uppercase tracking-wider text-[#645c53]">Borderline Reviewed</span>
            <strong className="text-lg font-bold">
              {stats
                ? `${stats.borderline_voted.toLocaleString()} / ${stats.borderline_total.toLocaleString()}`
                : '—'}
            </strong>
          </div>
          <div className="bg-[#fffdf9] border border-[#dfd6c7] rounded-xl px-4 py-3">
            <span className="block text-xs uppercase tracking-wider text-[#645c53]">Total Votes</span>
            <strong className="text-lg font-bold">
              {stats ? stats.total_votes.toLocaleString() : '—'}
            </strong>
          </div>
        </section>

        <section className="flex flex-wrap items-center justify-between gap-3" aria-label="Queue and search controls">
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Word queue mode">
            {([
              ['borderline', 'Borderline Queue'],
              ['unvoted', 'Any Unvoted'],
              ['all', 'All Words'],
            ] as const).map(([m, label]) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`min-h-[44px] px-3.5 py-2 rounded-lg border text-sm font-semibold cursor-pointer ${
                  mode === m
                    ? 'bg-[#1e1b18] text-white border-[#1e1b18]'
                    : 'bg-[#fffdf9] text-[#1e1b18] border-[#dfd6c7]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearch} className="flex gap-1.5 flex-1 max-w-[340px]" role="search">
            <label htmlFor="wt-search" className="sr-only">
              Search dictionary word
            </label>
            <input
              id="wt-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Look up a word (e.g. antelope)…"
              autoComplete="off"
              className="flex-1 min-h-[44px] px-3 py-2 rounded-lg border border-[#dfd6c7] bg-[#fffdf9] text-sm"
            />
            <button
              type="submit"
              className="min-h-[44px] px-4 py-2 rounded-lg border border-[#dfd6c7] bg-[#fffdf9] text-sm font-semibold cursor-pointer"
            >
              Find
            </button>
          </form>
        </section>

        {searchResults && (
          <ul
            className="flex flex-wrap gap-1.5 p-2.5 bg-[#fffdf9] border border-[#dfd6c7] rounded-xl list-none m-0"
            aria-label="Search results"
          >
            {searchResults.length === 0 ? (
              <li className="text-sm text-[#645c53] px-2 py-1">No matches for &ldquo;{searchQuery}&rdquo;.</li>
            ) : (
              searchResults.map((item) => (
                <li key={item.word}>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrent(item);
                      setSearchResults(null);
                    }}
                    className="min-h-[38px] px-3 py-1 rounded-md border border-[#dfd6c7] bg-[#f6f2ea] text-sm cursor-pointer"
                  >
                    {item.word} ({item.final_label})
                  </button>
                </li>
              ))
            )}
          </ul>
        )}

        <article className="bg-[#fffdf9] border border-[#dfd6c7] rounded-2xl p-6 grid gap-5 shadow-sm">
          <header className="flex flex-wrap justify-between gap-2">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#f6f2ea] text-[#645c53]">
              {current?.confidence ? confLabels[current.confidence] : 'Loading…'}
            </span>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                current?.final_label === 'WOODY'
                  ? 'bg-[#f4e6d8] text-[#7c3f14]'
                  : 'bg-[#e2e8f0] text-[#334155]'
              }`}
            >
              {current?.final_label
                ? `Current: ${current.final_label} (Algo: ${current.algo_label})`
                : '—'}
            </span>
          </header>

          <div className="text-center">
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight my-2 break-words">
              {current?.word ?? 'Loading…'}
            </h2>
            <p className="text-sm text-[#645c53] mb-4">
              Votes: {current?.woody_votes ?? 0} Woody · {current?.tinny_votes ?? 0} Tinny
            </p>

            <details className="text-left bg-[#f6f2ea] rounded-lg px-4 py-2.5 text-sm">
              <summary className="cursor-pointer font-semibold">
                Why the algorithm scored it{' '}
                {current?.score !== undefined
                  ? current.score >= 0
                    ? `+${current.score}`
                    : current.score
                  : '0.0'}
              </summary>
              <ul className="mt-2 pl-5 text-[#645c53] list-disc">
                {(current?.reasons ?? []).map((r, i) => (
                  <li key={`${r}-${i}`}>{r}</li>
                ))}
              </ul>
            </details>
          </div>

          <footer className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3">
            <button
              type="button"
              onClick={() => void castVote('WOODY')}
              className="min-h-[52px] min-w-[44px] px-4 py-3 rounded-xl bg-[#7c3f14] hover:bg-[#5e2f0d] text-white text-lg font-bold cursor-pointer flex items-center justify-center gap-2"
            >
              Woody <kbd className="text-xs px-1.5 py-0.5 rounded bg-white/20 font-sans">W</kbd>
            </button>
            <button
              type="button"
              onClick={() => {
                if (current?.word) setStatusMsg(`Skipped "${current.word}".`);
                void loadNext(mode);
              }}
              className="min-h-[52px] min-w-[44px] px-4 py-3 rounded-xl bg-[#f6f2ea] border border-[#dfd6c7] text-[#1e1b18] text-lg font-bold cursor-pointer flex items-center justify-center gap-2"
            >
              Skip <kbd className="text-xs px-1.5 py-0.5 rounded bg-black/10 font-sans">S</kbd>
            </button>
            <button
              type="button"
              onClick={() => void castVote('TINNY')}
              className="min-h-[52px] min-w-[44px] px-4 py-3 rounded-xl bg-[#334155] hover:bg-[#1e293b] text-white text-lg font-bold cursor-pointer flex items-center justify-center gap-2"
            >
              Tinny <kbd className="text-xs px-1.5 py-0.5 rounded bg-white/20 font-sans">T</kbd>
            </button>
          </footer>
        </article>

        <p className="text-center text-sm text-[#645c53] min-h-[1.4em] m-0" aria-live="polite">
          {statusMsg}
        </p>

        <details className="bg-[#fffdf9] border border-[#dfd6c7] rounded-xl px-4 py-3 text-sm text-[#645c53]">
          <summary className="cursor-pointer font-semibold text-[#1e1b18]">
            About the Monty Python &ldquo;Woody and Tinny Words&rdquo; Sketch &amp; Ruleset
          </summary>
          <div className="mt-2.5 space-y-2 leading-relaxed">
            <p>
              In the classic Monty Python sketch, words are sorted into warm, resonant <strong>Woody</strong> words
              (like <em>Gorn</em>, <em>Sausage</em>, <em>Vole</em>, <em>Caribou</em>, and <em>Erogenous Zone</em>)
              versus sharp, metallic <strong>Tinny</strong> words (like <em>Newspaper</em>, <em>Litterbin</em>,
              <em>PVC</em>, <em>Tit</em>, and <em>Simpkins</em>), with a few sitting on the fence (<em>Antelope</em>,
              <em>Recidivist</em>).
            </p>
            <p>
              Our phonetic algorithm scores all 370,105 English dictionary words by vowel roundness/height and
              consonant voicing, then puts the 66,921 borderline words up for live community voting so human
              judgment settles the definitive list.
            </p>
          </div>
        </details>
      </main>

      <footer className="text-center px-4 pb-10 pt-4 text-sm text-[#645c53]">
        <p>
          Inspired by Monty Python’s{' '}
          <a
            href="https://youtu.be/M3-51DhOzHE"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#7c3f14] font-semibold underline underline-offset-4"
          >
            Woody and Tinny Words
          </a>{' '}
          sketch.
        </p>
      </footer>
    </div>
  );
}
