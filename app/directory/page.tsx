'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Folder, FolderOpen, FileText, Gamepad2, Wrench, GraduationCap, 
  Search, ArrowLeft, ExternalLink, Copy, Check, Terminal, CornerDownRight,
  ListTree, Layers, ShieldCheck, Mail
} from 'lucide-react';

interface DirectoryNode {
  title: string;
  path: string;
  type: 'app' | 'game' | 'academic' | 'meta' | 'external';
  desc: string;
  badge?: string;
  external?: boolean;
  tags?: string[];
}

interface DirectoryFolder {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  nodes: DirectoryNode[];
}

const SMART_INTENT_MAP: Record<string, { types?: DirectoryNode['type'][]; keywords?: string[] }> = {
  game: { types: ['game'] },
  games: { types: ['game'] },
  gaming: { types: ['game'], keywords: ['steam', 'gaming'] },
  arcade: { types: ['game'] },
  play: { types: ['game'] },
  minigame: { types: ['game'] },
  minigames: { types: ['game'] },
  fun: { types: ['game'], keywords: ['gaben', 'nebula'] },
  tool: { types: ['app'], keywords: ['utility', 'calculator', 'notes', 'database', 'canvas', 'roulette', 'quiz'] },
  tools: { types: ['app'], keywords: ['utility', 'calculator', 'notes', 'database', 'canvas', 'roulette', 'quiz'] },
  utility: { types: ['app'] },
  utilities: { types: ['app'] },
  app: { types: ['app'] },
  apps: { types: ['app'] },
  productivity: { types: ['app'], keywords: ['wote', 'urlbase', 'clarity'] },
  uni: { types: ['academic'], keywords: ['university', 'portsmouth', 'campus', 'uop'] },
  university: { types: ['academic'], keywords: ['portsmouth', 'campus', 'uop'] },
  portsmouth: { types: ['academic'], keywords: ['campus', 'map', 'uni'] },
  uop: { types: ['academic'] },
  campus: { types: ['academic'] },
  academic: { types: ['academic'] },
  study: { types: ['academic'], keywords: ['notes', 'wote'] },
  social: { types: ['external'] },
  socials: { types: ['external'] },
  links: { types: ['external'] },
  profile: { types: ['external'] },
  profiles: { types: ['external'] },
  system: { types: ['meta'] },
  meta: { types: ['meta'] },
  seo: { types: ['meta'], keywords: ['sitemap', 'robots', 'rss'] },
  feed: { types: ['meta'] },
  feeds: { types: ['meta'] },
  api: { types: ['meta'], keywords: ['d1', 'websockets', 'realtime'] },
};

const SMART_QUICK_QUERIES = ['games', 'tools', 'uni', 'social', 'system', 'puzzle', 'websockets'];

const DIRECTORY_STRUCTURE: DirectoryFolder[] = [
  {
    id: 'apps',
    name: 'apps & experiments/',
    description: 'Interactive utilities, cloud experiments, and dynamic apps',
    keywords: ['tool', 'tools', 'utility', 'utilities', 'app', 'apps', 'experiment', 'experiments'],
    nodes: [
      { path: '/calc67', title: 'Calc67', type: 'app', desc: 'Daily target math puzzle with Cloudflare D1 leaderboard and offline fallback', badge: 'D1 + PWA', tags: ['tool', 'math', 'puzzle', 'daily', 'leaderboard', 'calculator'] },
      { path: '/clarity', title: 'Clarity', type: 'app', desc: 'Realtime collaborative node canvas and debate tree via Durable Objects', badge: 'WebSockets', tags: ['tool', 'canvas', 'collab', 'debate', 'realtime', 'diagram'] },
      { path: '/electio', title: 'Electio', type: 'app', desc: 'Multiplayer decision roulette and choice selector with live sync', badge: 'WebSockets', tags: ['tool', 'roulette', 'picker', 'decision', 'multiplayer'] },
      { path: '/gaben', title: 'Gaben.tv', type: 'app', desc: 'Interactive wallet sacrifice praise simulator with global counter', badge: 'D1 + Realtime', tags: ['fun', 'steam', 'meme', 'simulator'] },
      { path: '/wote', title: 'Wote', type: 'app', desc: 'Local-first distraction-free markdown notebook with export and autosave', badge: 'PWA Ready', tags: ['tool', 'notes', 'markdown', 'writing', 'productivity', 'editor'] },
      { path: '/characteristica', title: 'Characteristica', type: 'app', desc: '45-coordinate philosophical compass & ideological alignment quiz', badge: 'Interactive', tags: ['quiz', 'philosophy', 'compass', 'personality'] },
      { path: '/urlbase', title: 'UrlBase', type: 'app', desc: 'Zero-backend database compressed entirely inside shareable URLs', badge: 'Zero-Cloud', tags: ['tool', 'database', 'csv', 'kanban', 'table', 'productivity'] },
      { path: '/project-space', title: 'Project Space (Nebula)', type: 'app', desc: 'Interactive 3D particle universe exploring creative ideas', badge: 'Three.js', tags: ['3d', 'space', 'visual', 'fun'] },
    ]
  },
  {
    id: 'play',
    name: 'play/ (arcade suite)',
    description: 'Instant retro and puzzle arcade games with local high-score tracking',
    keywords: ['game', 'games', 'gaming', 'arcade', 'play', 'fun', 'minigames'],
    nodes: [
      { path: '/play', title: 'Arcade Hub', type: 'game', desc: 'Central showcase and launcher for all retro and puzzle mini-games', badge: 'Hub', tags: ['game', 'games', 'arcade', 'hub'] },
      { path: '/play/target24', title: 'Target 24', type: 'game', desc: 'Combine 4 cards using arithmetic operators to reach exactly 24', badge: 'Math Streak', tags: ['game', 'math', 'cards', 'puzzle'] },
      { path: '/play/sudoku', title: 'Sudoku', type: 'game', desc: '9x9 logic puzzle grid with Easy, Medium, and Hard difficulty modes', badge: 'Logic', tags: ['game', 'puzzle', 'logic', 'numbers'] },
      { path: '/play/wordle', title: 'Wordle', type: 'game', desc: 'Tech-themed 5-letter word puzzle with colored letter clues', badge: 'Daily Word', tags: ['game', 'word', 'puzzle', 'daily'] },
      { path: '/play/slide', title: '15-Puzzle Slider', type: 'game', desc: 'Sliding tile puzzle with move counter and timer', badge: 'Puzzle', tags: ['game', 'puzzle', 'tiles'] },
      { path: '/play/maze', title: 'Labyrinth', type: 'game', desc: 'Procedurally generated maze generator and runner', badge: 'Procedural', tags: ['game', 'maze', 'puzzle'] },
      { path: '/play/blackjack', title: 'Blackjack', type: 'game', desc: 'Classic casino 21 card game with soft-17 dealer logic and chips', badge: 'Casino', tags: ['game', 'casino', 'cards', '21'] },
      { path: '/play/craps', title: 'Craps', type: 'game', desc: 'Casino dice simulation with 3D rolls and Pass Line betting', badge: 'Dice', tags: ['game', 'casino', 'dice'] },
      { path: '/play/snake', title: 'Snake', type: 'game', desc: 'Retro glowing snake game with food power-ups and speed ramps', badge: 'Retro', tags: ['game', 'retro', 'arcade'] },
      { path: '/play/tetris', title: 'Neon Tetris', type: 'game', desc: 'Block-stacking puzzle classic with line clearing and neon aesthetic', badge: 'Arcade', tags: ['game', 'retro', 'arcade', 'puzzle'] },
      { path: '/play/pong', title: 'Pong', type: 'game', desc: '1P vs AI or 2P local split-keyboard paddle match', badge: 'Arcade', tags: ['game', 'retro', 'arcade', '2p'] },
      { path: '/play/2048', title: '2048', type: 'game', desc: 'Sliding number tile merger to build the 2048 block', badge: 'Puzzle', tags: ['game', 'puzzle', 'numbers'] },
      { path: '/play/minesweeper', title: 'Minesweeper', type: 'game', desc: 'Grid sweeper with safe first clicks, flag placement, and timer', badge: 'Classic', tags: ['game', 'classic', 'puzzle', 'logic'] },
      { path: '/play/asteroids', title: 'Space Blaster', type: 'game', desc: 'Inertia physics space rocket shooting cosmic asteroids', badge: 'Action', tags: ['game', 'arcade', 'space', 'shooter'] },
      { path: '/play/memory', title: 'Memory Match', type: 'game', desc: 'Flip cyberpunk cards to test visual memory and speed', badge: 'Memory', tags: ['game', 'cards', 'memory'] },
      { path: '/play/typer', title: 'Speed Typer', type: 'game', desc: 'Realtime WPM typing speed test with code snippets', badge: 'Skill', tags: ['game', 'tool', 'typing', 'wpm', 'code'] },
    ]
  },
  {
    id: 'academic',
    name: 'academic & resources/',
    description: 'Data science coursework, university portals, and personal curation',
    keywords: ['uni', 'university', 'portsmouth', 'academic', 'resources', 'hardware'],
    nodes: [
      { path: '/uni', title: 'University Dashboard', type: 'academic', desc: 'Quick launcher for university timetable, portal, and coursework', badge: 'Dashboard', tags: ['uni', 'portsmouth', 'uop', 'study', 'timetable'] },
      { path: '/uni/map', title: 'Campus Map', type: 'academic', desc: 'Interactive geographic campus map with building markers and filters', badge: 'Leaflet', tags: ['uni', 'portsmouth', 'uop', 'map', 'tool', 'buildings'] },
      { path: '/quotes', title: 'Favorite Quotes', type: 'academic', desc: 'Curated collection of philosophical, literary, and technical quotes', badge: 'Curated', tags: ['reading', 'philosophy', 'quotes'] },
      { path: '/showcase', title: 'Wallpaper Showcase', type: 'academic', desc: 'Curated high-resolution wallpapers and visual background themes', badge: 'Gallery', tags: ['wallpapers', 'images', 'gallery'] },
      { path: '/setup', title: 'Desk & Tech Setup', type: 'academic', desc: 'Hardware, monitors, peripherals, and workstation configuration', badge: 'Hardware', tags: ['pc', 'desk', 'hardware', 'gear'] },
    ]
  },
  {
    id: 'system',
    name: 'system & meta/',
    description: 'Accessible feeds, machine-readable manifests, and APIs',
    keywords: ['system', 'meta', 'seo', 'feed', 'feeds', 'api'],
    nodes: [
      { path: '/directory', title: 'Site Directory', type: 'meta', desc: 'This page — accessible minimalist folder hierarchy and site traversal', badge: 'Active', tags: ['sitemap', 'navigation', 'index'] },
      { path: '/sitemap.xml', title: 'Sitemap XML', type: 'meta', desc: 'Complete search engine sitemap indexing all routes with metadata', badge: 'XML', tags: ['seo', 'xml', 'crawler'] },
      { path: '/robots.txt', title: 'Robots.txt', type: 'meta', desc: 'Search engine spider and web crawler directives', badge: 'Robots', tags: ['seo', 'crawler'] },
      { path: '/feed.xml', title: 'RSS Feed XML', type: 'meta', desc: 'Standard XML RSS feed for site updates and projects', badge: 'RSS 2.0', tags: ['rss', 'xml', 'feed'] },
      { path: '/llms.txt', title: 'LLMs Context', type: 'meta', desc: 'Standardized context documentation formatted for AI assistants', badge: 'LLMs', tags: ['ai', 'llm', 'docs'] },
      { path: '/manifest.webmanifest', title: 'PWA Manifest', type: 'meta', desc: 'Progressive Web App installation manifest and icons', badge: 'PWA', tags: ['pwa', 'manifest', 'install'] },
    ]
  },
  {
    id: 'external',
    name: 'external & social/',
    description: 'Profiles, external repositories, and creative portfolios',
    keywords: ['external', 'social', 'socials', 'links', 'profile', 'profiles'],
    nodes: [
      { path: 'https://github.com/Yung71nKzH3', title: 'GitHub', type: 'external', desc: 'Open source repositories, developer projects, and source code', external: true, badge: 'Code', tags: ['code', 'git', 'repos'] },
      { path: 'https://open.spotify.com/user/vleonardo2006', title: 'Spotify Profile', type: 'external', desc: 'Music taste, curated playlists, and listening history', external: true, badge: 'Music', tags: ['music', 'playlists'] },
      { path: 'https://stats.fm/wi110w', title: 'Stats.fm', type: 'external', desc: 'Verified Spotify streaming analytics and artist statistics', external: true, badge: 'Stats', tags: ['music', 'analytics'] },
      { path: 'https://letterboxd.com/w1ll0ww/', title: 'Letterboxd', type: 'external', desc: 'Film diary, cinema reviews, and watchlist', external: true, badge: 'Cinema', tags: ['movies', 'films', 'reviews'] },
      { path: 'https://steamcommunity.com/id/zfw1ll0w/', title: 'Steam Profile', type: 'external', desc: 'Steam profile, library, and gaming achievements', external: true, badge: 'Gaming', tags: ['gaming', 'games', 'steam'] },
      { path: 'https://anilist.co/user/w1ll0wW/', title: 'AniList', type: 'external', desc: 'Anime & manga tracking list and ratings', external: true, badge: 'List', tags: ['anime', 'manga'] },
      { path: 'https://leetcode.com/u/yung71nkzh3/', title: 'LeetCode', type: 'external', desc: 'Algorithm challenges and Data Structures practice', external: true, badge: 'DSA', tags: ['code', 'algorithms'] },
      { path: 'https://monkeytype.com/profile/w1LL0w', title: 'MonkeyType', type: 'external', desc: 'Typing leaderboard stats and records', external: true, badge: 'Typing', tags: ['typing', 'wpm'] },
      { path: 'https://www.youtube.com/@w1ll0w62', title: 'YouTube', type: 'external', desc: 'Video clips, gaming sessions, and project demos', external: true, badge: 'Video', tags: ['video', 'clips'] },
    ]
  }
];

export default function DirectoryPage() {
  const [filter, setFilter] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    apps: true,
    play: true,
    academic: true,
    system: true,
    external: false
  });
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut '/' to search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        setFilter('');
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    DIRECTORY_STRUCTURE.forEach(f => { allExpanded[f.id] = true; });
    setExpandedFolders(allExpanded);
  };

  const collapseAll = () => {
    const allCollapsed: Record<string, boolean> = {};
    DIRECTORY_STRUCTURE.forEach(f => { allCollapsed[f.id] = false; });
    setExpandedFolders(allCollapsed);
  };

  const copyToClipboard = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const fullUrl = path.startsWith('http') ? path : `https://www.zedf.co.uk${path}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const totalRouteCount = useMemo(() => {
    return DIRECTORY_STRUCTURE.reduce((sum, f) => sum + f.nodes.length, 0);
  }, []);

  const filteredFolders = useMemo(() => {
    const raw = filter.toLowerCase().trim();
    if (!raw) return DIRECTORY_STRUCTURE;

    const tokens = raw.split(/\s+/).filter(Boolean);

    const matchesToken = (token: string, node: DirectoryNode, folder: DirectoryFolder): boolean => {
      const intent = SMART_INTENT_MAP[token];
      if (intent) {
        if (intent.types?.includes(node.type)) return true;
        if (intent.keywords?.some(kw =>
          node.title.toLowerCase().includes(kw) ||
          node.desc.toLowerCase().includes(kw) ||
          node.tags?.some(t => t.includes(kw)) ||
          (node.badge && node.badge.toLowerCase().includes(kw))
        )) {
          return true;
        }
      }

      const haystack = [
        node.title,
        node.path,
        node.desc,
        node.type,
        node.badge ?? '',
        ...(node.tags ?? []),
        folder.name,
        folder.description,
        ...folder.keywords,
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(token);
    };

    return DIRECTORY_STRUCTURE.map(folder => {
      const matchingNodes = folder.nodes.filter(node =>
        tokens.every(token => matchesToken(token, node, folder))
      );
      return {
        ...folder,
        nodes: matchingNodes
      };
    }).filter(folder => folder.nodes.length > 0);
  }, [filter]);

  const totalFilteredCount = useMemo(() => {
    return filteredFolders.reduce((sum, f) => sum + f.nodes.length, 0);
  }, [filteredFolders]);

  return (
    <div className="min-h-screen bg-[#080d16] text-slate-100 font-mono antialiased selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Top Header Navigation */}
      <header className="border-b border-slate-800/80 bg-[#0c1422]/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-cyan-400 hover:text-white transition-colors text-xs font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded px-2 py-1 bg-slate-900 border border-cyan-500/30"
              title="Return to Home Dashboard"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>/home</span>
            </Link>
            <span className="text-slate-600 hidden sm:inline" aria-hidden="true">|</span>
            <div className="flex items-center gap-2 text-xs">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
              <span className="text-slate-400">zedf.co.uk</span>
              <span className="text-slate-600">/</span>
              <span className="text-cyan-400 font-bold">directory</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <button
              onClick={expandAll}
              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
            >
              + Expand All
            </button>
            <button
              onClick={collapseAll}
              className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
            >
              - Collapse All
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main id="main-content" className="max-w-5xl mx-auto px-4 py-8">
        
        {/* Banner Section */}
        <section aria-labelledby="directory-heading" className="mb-8">
          <div className="p-5 rounded-2xl bg-gradient-to-b from-[#111c30] to-[#0c1422] border border-cyan-500/20 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 id="directory-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
                  <ListTree className="w-6 h-6 text-cyan-400" aria-hidden="true" />
                  <span>Site Directory &amp; Tree View</span>
                </h1>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                  Super-simplified, high-contrast, keyboard-friendly traversal of every tool, game, academic portal, and feed across <span className="text-cyan-300">zedf.co.uk</span>.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] bg-cyan-950/60 border border-cyan-500/40 text-cyan-300">
                  <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>WCAG 2.1 AA</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                  <span>{totalRouteCount} Live Routes</span>
                </span>
              </div>
            </div>

            {/* Accessible Live Search Filter Bar */}
            <div className="mt-5 relative">
              <label htmlFor="directory-search" className="sr-only">
                Smart search routes, categories, and tools
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
                <input
                  ref={searchInputRef}
                  id="directory-search"
                  type="text"
                  value={filter}
                  onChange={e => setFilter(e.target.value)}
                  placeholder="Smart search (try 'games', 'tools', 'uni', 'puzzle', or '/' to focus)..."
                  className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-[#080d16] border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/40 transition-all font-mono"
                  aria-describedby="search-count"
                />
                {filter && (
                  <button
                    type="button"
                    onClick={() => setFilter('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800"
                    aria-label="Clear filter"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 mr-1">Smart filters:</span>
                {SMART_QUICK_QUERIES.map(term => {
                  const isActive = filter.trim().toLowerCase() === term;
                  return (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setFilter(isActive ? '' : term)}
                      aria-pressed={isActive}
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${
                        isActive
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold'
                          : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:border-cyan-500/50 hover:text-cyan-300'
                      }`}
                    >
                      {term}
                    </button>
                  );
                })}
              </div>
              <div id="search-count" aria-live="polite" className="text-[11px] text-slate-400 mt-2 flex items-center justify-between px-1">
                <span>
                  Showing <strong className="text-cyan-400">{totalFilteredCount}</strong> nodes
                  {filter && <span> matching &ldquo;<span className="text-white">{filter}</span>&rdquo;</span>}
                </span>
                <span className="text-slate-500 text-[10px]">Tip: Use Tab &amp; Enter for keyboard navigation</span>
              </div>
            </div>
          </div>
        </section>

        {/* Directory Folder Tree */}
        <nav aria-label="Site Folder Hierarchy" className="space-y-6">
          {filteredFolders.length === 0 ? (
            <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
              <p className="text-sm text-slate-400">No pages or routes matched your search &ldquo;{filter}&rdquo;.</p>
              <button
                onClick={() => setFilter('')}
                className="mt-3 px-4 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-semibold text-xs hover:bg-cyan-400 transition-colors"
              >
                Reset Search Filter
              </button>
            </div>
          ) : (
            filteredFolders.map(folder => {
              const isExpanded = filter.trim() ? true : (expandedFolders[folder.id] ?? true);

              return (
                <section
                  key={folder.id}
                  aria-labelledby={`folder-head-${folder.id}`}
                  className="rounded-2xl border border-slate-800/80 bg-[#0c1422]/60 overflow-hidden shadow-lg transition-colors hover:border-slate-700"
                >
                  {/* Folder Header */}
                  <button
                    type="button"
                    onClick={() => toggleFolder(folder.id)}
                    aria-expanded={isExpanded}
                    aria-controls={`folder-content-${folder.id}`}
                    className="w-full text-left px-4 py-3 bg-[#111c30] flex items-center justify-between cursor-pointer select-none hover:bg-[#15233c] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <FolderOpen className="w-5 h-5 text-cyan-400 flex-shrink-0" aria-hidden="true" />
                      ) : (
                        <Folder className="w-5 h-5 text-slate-400 flex-shrink-0" aria-hidden="true" />
                      )}
                      <div>
                        <h2 id={`folder-head-${folder.id}`} className="text-sm font-bold text-white flex items-center gap-2">
                          <span>{folder.name}</span>
                          <span className="text-[10px] font-normal text-cyan-400/80 px-2 py-0.5 rounded-full bg-cyan-950/70 border border-cyan-800/40">
                            {folder.nodes.length}
                          </span>
                        </h2>
                        <p className="text-[11px] text-slate-400 hidden sm:block">
                          {folder.description}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs text-slate-500 font-mono">
                      {isExpanded ? '[ collapse - ]' : '[ expand + ]'}
                    </span>
                  </button>

                  {/* Folder Items List */}
                  {isExpanded && (
                    <ul
                      id={`folder-content-${folder.id}`}
                      className="divide-y divide-slate-800/50 p-2 sm:p-3 space-y-1"
                    >
                      {folder.nodes.map((node, nodeIdx) => {
                        const isLast = nodeIdx === folder.nodes.length - 1;
                        const isExternal = !!node.external;
                        const isCopied = copiedPath === node.path;

                        return (
                          <li
                            key={node.path}
                            className="group relative rounded-xl hover:bg-slate-900/80 transition-colors p-2.5 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                          >
                            {/* Branch connector + Route link */}
                            <div className="flex items-start gap-2.5 sm:gap-3 flex-1 min-w-0">
                              <span className="text-slate-600 font-mono text-xs select-none mt-0.5" aria-hidden="true">
                                {isLast ? '└──' : '├──'}
                              </span>

                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  {isExternal ? (
                                    <a
                                      href={node.path}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm font-bold text-cyan-400 hover:text-cyan-300 underline decoration-cyan-500/30 underline-offset-2 flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded"
                                    >
                                      <span>{node.title}</span>
                                      <ExternalLink className="w-3 h-3 text-slate-400" aria-label="(opens in a new tab)" />
                                    </a>
                                  ) : (
                                    <Link
                                      href={node.path}
                                      className="text-sm font-bold text-slate-100 hover:text-cyan-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded"
                                    >
                                      {node.title}
                                    </Link>
                                  )}

                                  <code className="text-[11px] font-mono text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                                    {node.path}
                                  </code>

                                  {node.badge && (
                                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                      {node.badge}
                                    </span>
                                  )}
                                </div>

                                <p className="text-xs text-slate-400 mt-1 leading-normal">
                                  {node.desc}
                                </p>
                              </div>
                            </div>

                            {/* Actions: Direct Visit + Copy Link */}
                            <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0 pt-1 sm:pt-0">
                              <button
                                onClick={e => copyToClipboard(node.path, e)}
                                title="Copy link to clipboard"
                                aria-label={`Copy link for ${node.title}`}
                                className="px-2 py-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400 border border-slate-700"
                              >
                                {isCopied ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" aria-hidden="true" />
                                    <span className="text-emerald-400 text-[10px]">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3 text-slate-400" aria-hidden="true" />
                                    <span className="text-[10px]">Copy</span>
                                  </>
                                )}
                              </button>

                              {isExternal ? (
                                <a
                                  href={node.path}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-xs font-semibold flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
                                >
                                  <span>Visit</span>
                                  <CornerDownRight className="w-3 h-3" aria-hidden="true" />
                                </a>
                              ) : (
                                <Link
                                  href={node.path}
                                  className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-xs font-semibold flex items-center gap-1 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400"
                                >
                                  <span>Open</span>
                                  <CornerDownRight className="w-3 h-3" aria-hidden="true" />
                                </Link>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>
              );
            })
          )}
        </nav>

        {/* Footer Section */}
        <footer className="mt-12 pt-8 border-t border-slate-800/80 text-center text-xs text-slate-400 space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono">
            <a
              href="mailto:contact@zedf.co.uk"
              className="text-cyan-400 hover:text-cyan-300 transition-colors underline decoration-cyan-500/30 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded px-1"
            >
              contact@zedf.co.uk
            </a>
            <span className="text-slate-600" aria-hidden="true">•</span>
            <span className="text-slate-300">w1ll0w</span>
            <span className="text-slate-600" aria-hidden="true">•</span>
            <Link
              href="/"
              className="hover:text-cyan-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded px-1"
            >
              /home
            </Link>
            <span className="text-slate-600" aria-hidden="true">•</span>
            <a
              href="/sitemap.xml"
              className="hover:text-cyan-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded px-1"
            >
              sitemap.xml
            </a>
          </div>

          <p className="text-[11px] text-slate-500">
            Compliant with Web Content Accessibility Guidelines (WCAG) 2.1 Level AA &bull; Zero tracking &bull; Pure Cloudflare Edge
          </p>
        </footer>

      </main>

    </div>
  );
}
