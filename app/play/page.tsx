'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import {
  Gamepad2, Search, ArrowLeft, Trophy, Play, Sparkles,
  RotateCcw, ShieldAlert, Cpu, Flame, ChevronRight, X
} from 'lucide-react';
import { SnakeGame } from '@/components/games/SnakeGame';
import { TetrisGame } from '@/components/games/TetrisGame';
import { PongGame } from '@/components/games/PongGame';
import { Game2048 } from '@/components/games/Game2048';
import { MinesweeperGame } from '@/components/games/MinesweeperGame';
import { AsteroidsGame } from '@/components/games/AsteroidsGame';
import { MemoryGame } from '@/components/games/MemoryGame';
import { SpeedTyperGame } from '@/components/games/SpeedTyperGame';
import { BlackjackGame } from '@/components/games/BlackjackGame';
import { CrapsGame } from '@/components/games/CrapsGame';
import { SudokuGame } from '@/components/games/SudokuGame';
import { WordleGame } from '@/components/games/WordleGame';
import { SlidePuzzleGame } from '@/components/games/SlidePuzzleGame';
import { MazeGame } from '@/components/games/MazeGame';
import { getHighScore } from '@/lib/games/scores';

interface GameInfo {
  id: string;
  title: string;
  category: 'Arcade' | 'Puzzle' | 'Action' | 'Retro' | 'Skill' | 'Casino';
  description: string;
  color: string;
  icon: string;
  component: React.ComponentType;
}

const GAMES_LIST: GameInfo[] = [
  {
    id: 'sudoku',
    title: 'Sudoku',
    category: 'Puzzle',
    description: '9x9 logic puzzle grid with Easy, Medium, and Hard difficulty modes.',
    color: '#38bdf8',
    icon: '🧩',
    component: SudokuGame,
  },
  {
    id: 'wordle',
    title: 'Wordle',
    category: 'Puzzle',
    description: 'Guess the 5-letter tech word in 6 attempts with colorful hints.',
    color: '#10b981',
    icon: '🔤',
    component: WordleGame,
  },
  {
    id: 'slide',
    title: '15-Puzzle Slider',
    category: 'Puzzle',
    description: 'Classic 4x4 sliding number tile puzzle with move & time tracking.',
    color: '#facc15',
    icon: '🔢',
    component: SlidePuzzleGame,
  },
  {
    id: 'maze',
    title: 'Labyrinth',
    category: 'Puzzle',
    description: 'Procedurally generated maze - navigate to the exit.',
    color: '#ec4899',
    icon: '🌀',
    component: MazeGame,
  },
  {
    id: 'blackjack',
    title: 'Blackjack',
    category: 'Casino',
    description: 'Classic 21 table game with chip betting, dealer soft 17, & double down.',
    color: '#10b981',
    icon: '♠️',
    component: BlackjackGame,
  },
  {
    id: 'craps',
    title: 'Craps',
    category: 'Casino',
    description: 'Casino table dice game with Pass Line, Field bets, and 3D rolling dice.',
    color: '#38bdf8',
    icon: '🎲',
    component: CrapsGame,
  },
  {
    id: 'snake',
    title: 'Snake',
    category: 'Retro',
    description: 'Classic grid snake with glowing trails and food power-ups.',
    color: '#06b6d4',
    icon: '🐍',
    component: SnakeGame,
  },
  {
    id: 'tetris',
    title: 'Neon Tetris',
    category: 'Puzzle',
    description: 'The ultimate block-stacking puzzle classic with line clears.',
    color: '#a855f7',
    icon: '🧱',
    component: TetrisGame,
  },
  {
    id: 'pong',
    title: 'Pong',
    category: 'Arcade',
    description: '1P vs AI or 2P local paddle clash with speed ramps.',
    color: '#ec4899',
    icon: '🏓',
    component: PongGame,
  },
  {
    id: '2048',
    title: '2048',
    category: 'Puzzle',
    description: 'Slide, combine, and merge matching numbers to hit 2048.',
    color: '#eab308',
    icon: '🔢',
    component: Game2048,
  },
  {
    id: 'minesweeper',
    title: 'Minesweeper',
    category: 'Skill',
    description: 'Classic grid sweeper with safe first clicks and timer.',
    color: '#ef4444',
    icon: '💣',
    component: MinesweeperGame,
  },
  {
    id: 'asteroids',
    title: 'Space Blaster',
    category: 'Action',
    description: 'Rotate your ship and shoot asteroids into cosmic dust.',
    color: '#3b82f6',
    icon: '🚀',
    component: AsteroidsGame,
  },
  {
    id: 'memory',
    title: 'Memory Match',
    category: 'Skill',
    description: 'Flip cyberpunk cards to test and train your memory.',
    color: '#22c55e',
    icon: '🎴',
    component: MemoryGame,
  },
  {
    id: 'typer',
    title: 'Speed Typer',
    category: 'Skill',
    description: 'Arcade typing challenge with code snippets.',
    color: '#f97316',
    icon: '⌨️',
    component: SpeedTyperGame,
  },
];

export default function PlayPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [highScores, setHighScores] = useState<Record<string, number>>({});

  useEffect(() => {
    const scores: Record<string, number> = {};
    GAMES_LIST.forEach(g => {
      scores[g.id] = getHighScore(g.id);
    });
    setHighScores(scores);
  }, [activeGameId]);

  const categories = ['All', 'Casino', 'Arcade', 'Puzzle', 'Action', 'Retro', 'Skill'];

  const filteredGames = GAMES_LIST.filter(g => {
    const matchesCat = selectedCategory === 'All' || g.category === selectedCategory;
    const matchesSearch = g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const ActiveComponent = GAMES_LIST.find(g => g.id === activeGameId)?.component;
  const activeGame = GAMES_LIST.find(g => g.id === activeGameId);

  return (
    <main className="min-h-screen bg-[#0c1422] text-slate-100 p-4 md:p-8 relative overflow-x-hidden font-sans">
      {/* Background Ambient Glow */}
      <div
        className="fixed inset-0 z-0 opacity-40 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 20%, #1e293b 0%, #0c1422 70%)',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto flex flex-col items-center">

        {/* Navigation Bar */}
        <div className="w-full flex items-center justify-between py-4 mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#111927] hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-400 transition-all text-sm font-display tracking-wide shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/project-space"
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-[#111927] hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-400 transition-all text-sm font-display tracking-wide shadow-md"
            >
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span>Project Space</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold flex items-center gap-1.5">
              <Gamepad2 className="w-4 h-4" /> {GAMES_LIST.length} RETRO GAMES
            </span>
          </div>
        </div>

        {/* Title Header */}
        <div className="text-center mb-10 max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold font-display tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-pink-500 bg-clip-text text-transparent mb-3"
          >
            ARCADE GAMES HUB
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-400 text-sm md:text-base"
          >
            A curated suite of simple, barebones retro and creative browser games. High scores are automatically saved locally.
          </motion.p>
        </div>

        {/* Filter Controls */}
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-2 md:pb-0 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${selectedCategory === cat
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_#06b6d4]'
                  : 'bg-[#111927] text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search games..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#111927] border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Games Grid */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredGames.map((game, index) => {
            const score = highScores[game.id] || 0;
            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-[#111927] border border-slate-800/80 hover:border-cyan-500/50 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.5),0_0_15px_rgba(6,182,212,0.2)] hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl p-3 bg-slate-900/80 rounded-2xl border border-slate-800 group-hover:scale-110 transition-transform">
                      {game.icon}
                    </span>
                    <span
                      className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border"
                      style={{
                        color: game.color,
                        borderColor: `${game.color}40`,
                        backgroundColor: `${game.color}15`
                      }}
                    >
                      {game.category}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold font-display text-slate-100 mb-1 group-hover:text-cyan-400 transition-colors">
                    {game.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    {game.description}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/60 mb-4 text-xs">
                    <span className="text-slate-500 flex items-center gap-1 font-medium">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" /> Best Score
                    </span>
                    <span className="font-mono font-bold text-amber-300">
                      {score > 0 ? score : '—'}
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveGameId(game.id)}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 hover:border-cyan-400 transition-all shadow-sm"
                  >
                    <Play className="w-4 h-4 fill-current" /> PLAY NOW
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Game Modal / Overlay */}
        <AnimatePresence>
          {activeGameId && ActiveComponent && activeGame && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full max-w-3xl bg-[#0c1422] border-2 border-cyan-500/30 rounded-3xl p-6 shadow-[0_0_50px_rgba(6,182,212,0.2)] my-8"
              >
                {/* Close Button */}
                <button
                  onClick={() => setActiveGameId(null)}
                  className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 hover:bg-rose-500 text-slate-300 hover:text-white transition-all z-30"
                  title="Close Game"
                >
                  <X className="w-6 h-6" />
                </button>

                {/* Game Component */}
                <ActiveComponent />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  );
}
