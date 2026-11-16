import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function GET() {
  const baseUrl = 'https://www.zedf.co.uk';
  const pubDate = new Date().toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>ZEDF | w1ll0w Digital Garden</title>
    <link>${baseUrl}</link>
    <description>UK-based Undergrad Data Science Student. Digital garden sharing Projects, Experiments, and personal links.</description>
    <language>en-gb</language>
    <lastBuildDate>${pubDate}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    
    <item>
      <title>Site Directory &amp; Minimalist Tree</title>
      <link>${baseUrl}/directory</link>
      <guid>${baseUrl}/directory</guid>
      <pubDate>${pubDate}</pubDate>
      <description>Accessible, super-simplified traversal and folder hierarchy covering every route and game on zedf.co.uk.</description>
    </item>

    <item>
      <title>Calc67 — Daily Target Math Puzzle</title>
      <link>${baseUrl}/calc67</link>
      <guid>${baseUrl}/calc67</guid>
      <pubDate>${pubDate}</pubDate>
      <description>Daily target math puzzle powered by Cloudflare D1 with global leaderboards and offline mode.</description>
    </item>

    <item>
      <title>Clarity — Infinite Collaborative Debate Canvas</title>
      <link>${baseUrl}/clarity</link>
      <guid>${baseUrl}/clarity</guid>
      <pubDate>${pubDate}</pubDate>
      <description>Realtime infinite canvas for debate trees and conceptual graphs powered by Cloudflare Durable Objects.</description>
    </item>

    <item>
      <title>Electio — Multiplayer Decision Roulette</title>
      <link>${baseUrl}/electio</link>
      <guid>${baseUrl}/electio</guid>
      <pubDate>${pubDate}</pubDate>
      <description>Realtime synchronized choice wheel and decision roulette.</description>
    </item>

    <item>
      <title>Gaben.tv — Praise Lord GabeN</title>
      <link>${baseUrl}/gaben</link>
      <guid>${baseUrl}/gaben</guid>
      <pubDate>${pubDate}</pubDate>
      <description>Sacrifice wallet praise simulator with global counter on Cloudflare D1.</description>
    </item>

    <item>
      <title>Arcade Suite — 15 Retro &amp; Puzzle Mini-Games</title>
      <link>${baseUrl}/play</link>
      <guid>${baseUrl}/play</guid>
      <pubDate>${pubDate}</pubDate>
      <description>Suite of 15 classic arcade and puzzle games including Target24, Wordle, Sudoku, Tetris, Pong, Snake, and 2048.</description>
    </item>

    <item>
      <title>Wote — Local-First Markdown Notebook</title>
      <link>${baseUrl}/wote</link>
      <guid>${baseUrl}/wote</guid>
      <pubDate>${pubDate}</pubDate>
      <description>Instant markdown writing space with local persistence and export.</description>
    </item>
  </channel>
</rss>`;

  return new Response(xml.trim(), {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
