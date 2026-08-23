'use client';

import React, { useState, useEffect } from 'react';
import { RotateCcw, Volume2, VolumeX, Lightbulb, Eraser, CheckCircle2 } from 'lucide-react';
import { playScoreSound, playClearSound, playHitSound, playPowerupSound, toggleSound, getIsMuted } from '@/lib/games/sound';
import { getHighScore, saveHighScore } from '@/lib/games/scores';

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

// Pre-generated valid Sudoku boards
const SAMPLE_BOARDS: Record<Difficulty, { initial: number[][]; solution: number[][] }> = {
  EASY: {
    initial: [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9],
    ],
    solution: [
      [5, 3, 4, 6, 7, 8, 9, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 3, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 9],
    ],
  },
  MEDIUM: {
    initial: [
      [0, 0, 0, 6, 0, 0, 4, 0, 0],
      [7, 0, 0, 0, 0, 3, 6, 0, 0],
      [0, 0, 0, 0, 9, 1, 0, 8, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 5, 0, 1, 8, 0, 0, 0, 3],
      [0, 0, 0, 3, 0, 6, 0, 4, 5],
      [0, 4, 0, 2, 0, 0, 0, 6, 0],
      [9, 0, 3, 0, 0, 0, 0, 0, 0],
      [0, 2, 0, 0, 0, 0, 1, 0, 0],
    ],
    solution: [
      [5, 8, 1, 6, 7, 2, 4, 3, 9],
      [7, 9, 2, 8, 4, 3, 6, 5, 1],
      [3, 6, 4, 5, 9, 1, 7, 8, 2],
      [4, 3, 8, 9, 5, 7, 2, 1, 6],
      [2, 5, 6, 1, 8, 4, 9, 7, 3],
      [1, 7, 9, 3, 2, 6, 8, 4, 5],
      [8, 4, 5, 2, 1, 9, 3, 6, 7],
      [9, 1, 3, 7, 6, 5, 5, 2, 8],
      [6, 2, 7, 4, 3, 8, 1, 9, 4],
    ],
  },
  HARD: {
    initial: [
      [0, 0, 0, 0, 0, 0, 0, 1, 2],
      [0, 0, 0, 0, 0, 0, 0, 0, 3],
      [0, 0, 2, 3, 0, 0, 4, 0, 0],
      [0, 0, 1, 8, 0, 0, 0, 0, 5],
      [0, 6, 0, 0, 7, 0, 8, 0, 0],
      [0, 0, 0, 0, 0, 9, 0, 0, 0],
      [0, 0, 8, 5, 0, 0, 0, 0, 0],
      [9, 0, 0, 0, 4, 0, 5, 0, 0],
      [4, 7, 0, 0, 0, 6, 0, 0, 0],
    ],
    solution: [
      [6, 3, 4, 7, 5, 8, 9, 1, 2],
      [5, 1, 7, 4, 9, 2, 6, 8, 3],
      [8, 9, 2, 3, 6, 1, 4, 5, 7],
      [3, 4, 1, 8, 2, 5, 7, 9, 6],
      [2, 6, 9, 1, 7, 4, 8, 3, 5],
      [7, 8, 5, 6, 3, 9, 2, 4, 1],
      [1, 2, 8, 5, 4, 3, 7, 6, 9],
      [9, 5, 6, 2, 4, 7, 5, 3, 8],
      [4, 7, 3, 9, 8, 6, 1, 2, 5],
    ],
  },
};

export function SudokuGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>('EASY');
  const [board, setBoard] = useState<number[][]>([]);
  const [initialBoard, setInitialBoard] = useState<number[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number } | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setHighScore(getHighScore('sudoku'));
    setMuted(getIsMuted());
    initGame('EASY');
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying && !gameWon) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, gameWon]);

  const initGame = (diff: Difficulty) => {
    const sample = SAMPLE_BOARDS[diff];
    const copyInit = sample.initial.map(row => [...row]);
    setDifficulty(diff);
    setInitialBoard(copyInit);
    setBoard(copyInit.map(row => [...row]));
    setSelectedCell(null);
    setMistakes(0);
    setTimer(0);
    setGameWon(false);
    setIsPlaying(true);
  };

  const handleCellClick = (r: number, c: number) => {
    setSelectedCell({ r, c });
  };

  const handleInputNumber = (val: number) => {
    if (!selectedCell || gameWon) return;
    const { r, c } = selectedCell;
    if (initialBoard[r][c] !== 0) return; // Cannot edit fixed initial numbers

    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = val;
    setBoard(newBoard);

    const solution = SAMPLE_BOARDS[difficulty].solution;
    if (val !== 0 && solution[r][c] !== val) {
      playHitSound();
      setMistakes(m => m + 1);
    } else if (val !== 0) {
      playScoreSound();
    }

    // Check Victory
    const isComplete = newBoard.every((row, rIdx) =>
      row.every((cellVal, cIdx) => cellVal === solution[rIdx][cIdx])
    );

    if (isComplete) {
      playClearSound();
      setGameWon(true);
      setIsPlaying(false);
      const scoreCalc = Math.max(10, 2000 - mistakes * 100 - timer * 2);
      saveHighScore('sudoku', scoreCalc);
      setHighScore(getHighScore('sudoku'));
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell || gameWon) return;
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= 9) {
        e.preventDefault();
        handleInputNumber(num);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        handleInputNumber(0); // Erase
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, gameWon, difficulty, board, initialBoard, mistakes, timer]);

  return (
    <div className="flex flex-col items-center justify-center p-4 max-w-xl mx-auto text-slate-100 select-none font-sans">
      {/* Header */}
      <div className="w-full flex items-center justify-between bg-[#111927] border border-cyan-500/20 rounded-xl p-4 mb-4 shadow-lg">
        <div>
          <h2 className="text-xl font-bold font-display text-cyan-400">SUDOKU</h2>
          <p className="text-xs text-slate-400">Select cell & tap numbers or use 1-9 keys</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-slate-400 uppercase">Mistakes</div>
            <div className="text-xl font-bold font-mono text-rose-400">{mistakes}</div>
          </div>
          <div className="text-right border-l border-slate-700 pl-4">
            <div className="text-xs text-slate-400 uppercase">Time</div>
            <div className="text-xl font-bold font-mono text-amber-400">{timer}s</div>
          </div>

          <button
            onClick={() => setMuted(toggleSound())}
            aria-label={muted ? 'Unmute Sound' : 'Mute Sound'}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
          >
            {muted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* Preset Difficulty Bar */}
      <div className="w-full flex justify-between items-center gap-3 mb-4">
        <div className="flex gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
          {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map(diff => (
            <button
              key={diff}
              onClick={() => initGame(diff)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${difficulty === diff ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              {diff}
            </button>
          ))}
        </div>

        <button
          onClick={() => initGame(difficulty)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-cyan-400" /> Restart
        </button>
      </div>

      {/* 9x9 Sudoku Grid */}
      <div className="relative bg-[#090d16] border-2 border-cyan-500/30 rounded-2xl p-3 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
        <div className="grid grid-cols-9 gap-[1.5px] bg-cyan-500/30 p-1 rounded-xl w-[300px] h-[300px] sm:w-[380px] sm:h-[380px]">
          {board.map((row, r) =>
            row.map((val, c) => {
              const isInitial = initialBoard[r][c] !== 0;
              const isSelected = selectedCell?.r === r && selectedCell?.c === c;
              const isSameRowCol = selectedCell?.r === r || selectedCell?.c === c;
              const isWrong =
                val !== 0 &&
                !isInitial &&
                SAMPLE_BOARDS[difficulty].solution[r][c] !== val;

              // 3x3 Box Thick Borders
              const isBorderRight = c === 2 || c === 5;
              const isBorderBottom = r === 2 || r === 5;

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`flex items-center justify-center font-bold text-sm sm:text-base font-mono transition-all border-0 ${isSelected
                    ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-[0_0_10px_#06b6d4]'
                    : isWrong
                      ? 'bg-rose-950 text-rose-400 border border-rose-500'
                      : isInitial
                        ? 'bg-[#111927] text-slate-100 font-extrabold'
                        : isSameRowCol
                          ? 'bg-slate-800/80 text-cyan-300'
                          : 'bg-[#0c1422] text-cyan-400 hover:bg-slate-800'
                    } ${isBorderRight ? 'mr-[2px]' : ''} ${isBorderBottom ? 'mb-[2px]' : ''}`}
                >
                  {val > 0 ? val : ''}
                </button>
              );
            })
          )}
        </div>

        {/* Win Overlay */}
        {gameWon && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center z-20">
            <h3 className="text-3xl font-extrabold text-amber-400 font-display mb-2 animate-pulse">
              ★ SUDOKU SOLVED! ★
            </h3>
            <p className="text-slate-300 mb-1">Time Taken: <span className="font-mono text-cyan-400 font-bold">{timer}s</span></p>
            <p className="text-slate-300 mb-4">Mistakes: <span className="font-mono text-rose-400 font-bold">{mistakes}</span></p>
            <button
              onClick={() => initGame(difficulty)}
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_#06b6d4] cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" /> Play Again
            </button>
          </div>
        )}
      </div>

      {/* Touch Number Pad (1-9 + Eraser) */}
      <div className="mt-4 flex flex-wrap justify-center gap-2 max-w-sm">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
          <button
            key={num}
            onClick={() => handleInputNumber(num)}
            aria-label={`Input ${num}`}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 font-bold font-mono text-base border border-slate-700 shadow-md transition-all cursor-pointer flex items-center justify-center"
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => handleInputNumber(0)}
          aria-label="Erase Cell"
          className="px-3 h-10 sm:h-11 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-400 hover:text-white font-bold text-xs border border-rose-500/40 shadow-md transition-all cursor-pointer flex items-center gap-1"
        >
          <Eraser className="w-4 h-4" /> Erase
        </button>
      </div>
    </div>
  );
}
