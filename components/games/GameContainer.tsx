'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Gamepad2 } from 'lucide-react';
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

const GAME_MAP: Record<string, React.ComponentType> = {
  sudoku: SudokuGame,
  wordle: WordleGame,
  slide: SlidePuzzleGame,
  maze: MazeGame,
  blackjack: BlackjackGame,
  craps: CrapsGame,
  snake: SnakeGame,
  tetris: TetrisGame,
  pong: PongGame,
  '2048': Game2048,
  minesweeper: MinesweeperGame,
  asteroids: AsteroidsGame,
  memory: MemoryGame,
  typer: SpeedTyperGame,
};

export function GameContainer({ gameKey }: { gameKey: string }) {
  const Component = GAME_MAP[gameKey];

  if (!Component) {
    return (
      <main className="min-h-screen bg-[#0c1422] text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-bold font-display text-rose-500 mb-2">GAME NOT FOUND</h1>
        <p className="text-slate-400 mb-6">The requested game route does not exist.</p>
        <Link
          href="/play"
          className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_#06b6d4]"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Arcade Hub
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0c1422] text-slate-100 p-4 md:p-8 relative overflow-x-hidden">
      {/* Top Header */}
      <div className="max-w-4xl mx-auto flex items-center justify-between py-4 mb-6">
        <Link
          href="/play"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#111927] hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-400 transition-all text-sm font-display shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Arcade Hub</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
            <Gamepad2 className="w-4 h-4" /> Arcade Play Mode
          </span>
        </div>
      </div>

      {/* Embedded Game Component */}
      <div className="max-w-4xl mx-auto">
        <Component />
      </div>
    </main>
  );
}
