export const dynamic = 'force-static';

interface FeedItem {
  title: string;
  path: string;
  guid: string;
  pubDate: string;
  description: string;
}

const BASE_URL = 'https://www.zedf.co.uk';

// Add new entries at the top with a unique guid and fixed RFC-2822 pubDate
// so RSS readers only notify subscribers when something new ships.
const FEED_ITEMS: FeedItem[] = [
  {
    title: 'Spatial ZUI Mode & Unified Site Tree',
    path: '/',
    guid: `${BASE_URL}/#zui-mode-2026-11`,
    pubDate: 'Fri, 27 Nov 2026 17:45:00 GMT',
    description:
      'Added an optional Spatial Zooming User Interface (ZUI) toggle on the homepage with cursor-anchored scroll zoom, semantic level-of-detail, and a unified subfolder hierarchy.',
  },
  {
    title: 'Site Directory & Minimalist Tree',
    path: '/directory',
    guid: `${BASE_URL}/directory`,
    pubDate: 'Sun, 01 Nov 2026 12:00:00 GMT',
    description:
      'Accessible, super-simplified traversal and folder hierarchy covering every route and game on zedf.co.uk.',
  },
  {
    title: 'UrlBase — In-URL Zero-Cloud Database',
    path: '/urlbase',
    guid: `${BASE_URL}/urlbase`,
    pubDate: 'Thu, 15 Oct 2026 12:00:00 GMT',
    description:
      'Zero-backend database compressed entirely inside shareable URLs with Table, Kanban, Card, and List views.',
  },
  {
    title: 'Characteristica — Philosophical Alignment Compass',
    path: '/characteristica',
    guid: `${BASE_URL}/characteristica`,
    pubDate: 'Thu, 01 Oct 2026 12:00:00 GMT',
    description:
      '45-coordinate philosophical compass and ideological alignment quiz with spider chart results.',
  },
  {
    title: 'Calc67 — Daily Target Math Puzzle',
    path: '/calc67',
    guid: `${BASE_URL}/calc67`,
    pubDate: 'Tue, 15 Sep 2026 12:00:00 GMT',
    description:
      'Daily target math puzzle powered by Cloudflare D1 with global leaderboards and offline mode.',
  },
  {
    title: 'Clarity — Infinite Collaborative Debate Canvas',
    path: '/clarity',
    guid: `${BASE_URL}/clarity`,
    pubDate: 'Tue, 01 Sep 2026 12:00:00 GMT',
    description:
      'Realtime infinite canvas for debate trees and conceptual graphs powered by Cloudflare Durable Objects.',
  },
  {
    title: 'Electio — Multiplayer Decision Roulette',
    path: '/electio',
    guid: `${BASE_URL}/electio`,
    pubDate: 'Sat, 15 Aug 2026 12:00:00 GMT',
    description: 'Realtime synchronized choice wheel and decision roulette.',
  },
  {
    title: 'Arcade Suite — 15 Retro & Puzzle Mini-Games',
    path: '/play',
    guid: `${BASE_URL}/play`,
    pubDate: 'Sat, 01 Aug 2026 12:00:00 GMT',
    description:
      'Suite of 15 classic arcade and puzzle games including Target24, Wordle, Sudoku, Tetris, Pong, Snake, and 2048.',
  },
  {
    title: 'Wote — Local-First Markdown Notebook',
    path: '/wote',
    guid: `${BASE_URL}/wote`,
    pubDate: 'Wed, 15 Jul 2026 12:00:00 GMT',
    description: 'Instant markdown writing space with local persistence and export.',
  },
  {
    title: 'Gaben.tv — Praise Lord GabeN',
    path: '/gaben',
    guid: `${BASE_URL}/gaben`,
    pubDate: 'Wed, 01 Jul 2026 12:00:00 GMT',
    description: 'Sacrifice wallet praise simulator with global counter on Cloudflare D1.',
  },
];

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const lastBuildDate = FEED_ITEMS[0]?.pubDate ?? new Date().toUTCString();

  const itemsXml = FEED_ITEMS.map(
    (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${BASE_URL}${item.path}</link>
      <guid isPermaLink="false">${escapeXml(item.guid)}</guid>
      <pubDate>${item.pubDate}</pubDate>
      <description>${escapeXml(item.description)}</description>
    </item>`,
  ).join('\n\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>ZEDF | w1ll0w Digital Garden</title>
    <link>${BASE_URL}</link>
    <description>UK-based Undergrad Data Science Student. Digital garden sharing Projects, Experiments, and personal links.</description>
    <language>en-gb</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>

${itemsXml}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
