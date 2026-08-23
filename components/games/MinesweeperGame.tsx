'use client';

import React, { useState, useEffect } from 'react';
import { Flag, RotateCcw, Volume2, VolumeX, Clock, Bomb, ShieldCheck } from 'lucide-react';
import { playHitSound, playScoreSound, playClearSound, toggleSound, getIsMuted } from '@/lib/games/sound';
import { getHighScore, saveHighScore } from '@/lib/games/scores';

type Level = 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT';

interface Config {
  rows: number;
  cols: number;
  mines: number;
}

const CONFIGS: Record<Level, Config> = {
  BEGINNER: { rows: 9, cols: 9, mines: 10 },
  INTERMEDIATE: { rows: 16, cols: 16, mines: 40 },
  EXPERT: { rows: 16, cols: 30, mines: 99 },
};

interface Cell {
  r: number;
  c: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
}

export function MinesweeperGame() {
  const [level, setLevel] = useState<Level>('BEGINNER');
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [firstClick, setFirstClick] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [flagMode, setFlagMode] = useState(false);
  const [timer, setTimer] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setHighScore(getHighScore('minesweeper'));
    setMuted(getIsMuted());
    initGrid('BEGINNER');
  }, []);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (!firstClick && !gameOver && !gameWon) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [firstClick, gameOver, gameWon]);

  const initGrid = (lvl: Level) => {
    const { rows, cols } = CONFIGS[lvl];
    const newGrid: Cell[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < cols; c++) {
        row.push({
          r,
          c,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          neighborMines: 0,
        });
      }
      newGrid.push(row);
    }
    setGrid(newGrid);
    setFirstClick(true);
    setGameOver(false);
    setGameWon(false);
    setTimer(0);
  };

  const populateMines = (initialGrid: Cell[][], safeR: number, safeC: number, lvl: Level) => {
    const { rows, cols, mines } = CONFIGS[lvl];
    let placed = 0;
    const g = initialGrid.map(row => row.map(cell => ({ ...cell })));

    while (placed < mines) {
      const r = Math.floor(Math.random() * rows);
      const c = Math.floor(Math.random() * cols);

      // Safe zone around first click
      if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue;
      if (!g[r][c].isMine) {
        g[r][c].isMine = true;
        placed++;
      }
    }

    // Calculate neighbor counts
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!g[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && g[nr][nc].isMine) {
                count++;
              }
            }
          }
          g[r][c].neighborMines = count;
        }
      }
    }
    return g;
  };

  const revealCell = (r: number, c: number) => {
    if (gameOver || gameWon) return;

    let currentGrid = grid;
    if (firstClick) {
      currentGrid = populateMines(grid, r, c, level);
      setFirstClick(false);
    }

    const cell = currentGrid[r][c];
    if (cell.isRevealed || cell.isFlagged) return;

    const g = currentGrid.map(row => row.map(item => ({ ...item })));

    if (g[r][c].isMine) {
      // Hit mine -> Game Over
      playHitSound();
      // Reveal all mines
      g.forEach(row => row.forEach(item => {
        if (item.isMine) item.isRevealed = true;
      }));
      setGrid(g);
      setGameOver(true);
      return;
    }

    // Flood fill zero neighbor cells
    const queue: { r: number; c: number }[] = [{ r, c }];
    const { rows, cols } = CONFIGS[level];

    while (queue.length > 0) {
      const { r: currR, c: currC } = queue.shift()!;
      const item = g[currR][currC];
      if (!item.isRevealed && !item.isFlagged) {
        item.isRevealed = true;
        playScoreSound();
        if (item.neighborMines === 0) {
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = currR + dr;
              const nc = currC + dc;
              if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !g[nr][nc].isRevealed) {
                queue.push({ r: nr, c: nc });
              }
            }
          }
        }
      }
    }

    setGrid(g);

    // Check Win
    let unrevealedNonMines = 0;
    g.forEach(row => row.forEach(item => {
      if (!item.isMine && !item.isRevealed) unrevealedNonMines++;
    }));

    if (unrevealedNonMines === 0) {
      playClearSound();
      setGameWon(true);
      const scoreCalc = Math.max(10, 1000 - timer * 5);
      saveHighScore('minesweeper', scoreCalc);
      setHighScore(getHighScore('minesweeper'));
    }
  };

  const toggleFlag = (r: number, c: number, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (gameOver || gameWon || firstClick) return;

    const cell = grid[r][c];
    if (cell.isRevealed) return;

    const g = grid.map(row => row.map(item => ({ ...item })));
    g[r][c].isFlagged = !g[r][c].isFlagged;
    setGrid(g);
  };

  const handleCellClick = (r: number, c: number) => {
    if (flagMode) {
      toggleFlag(r, c);
    } else {
      revealCell(r, c);
    }
  };

  const { mines } = CONFIGS[level];
  const flaggedCount = grid.flat().filter(cell => cell.isFlagged).length;

  return (
    <div className="flex flex-col items-center justify-center p-4 max-w-4xl mx-auto text-slate-100">
      {/* Header */}
      <div className="w-full flex items-center justify-between bg-[#111927] border border-cyan-500/20 rounded-xl p-4 mb-4 shadow-lg">
        <div>
          <h2 className="text-xl font-bold font-display text-cyan-400">MINESWEEPER</h2>
          <p className="text-xs text-slate-400">Tap to dig or toggle Flag Mode for tablets</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-cyan-300 font-mono text-lg">
            <Bomb className="w-5 h-5 text-rose-400" /> {mines - flaggedCount}
          </div>

          <div className="flex items-center gap-1.5 text-amber-400 font-mono text-lg border-l border-slate-700 pl-4">
            <Clock className="w-5 h-5" /> {timer}s
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

      {/* Difficulty & Flag Mode Toggle Bar */}
      <div className="w-full flex flex-wrap justify-between items-center gap-3 mb-4">
        <div className="flex gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
          {(['BEGINNER', 'INTERMEDIATE', 'EXPERT'] as Level[]).map(lvl => (
            <button
              key={lvl}
              onClick={() => {
                setLevel(lvl);
                initGrid(lvl);
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${level === lvl ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFlagMode(prev => !prev)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold transition-all ${flagMode
              ? 'bg-rose-500 text-white border-rose-400 shadow-[0_0_12px_#f43f5e]'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
          >
            <Flag className="w-4 h-4" /> {flagMode ? 'FLAG MODE ON' : 'DIG MODE'}
          </button>

          <button
            onClick={() => initGrid(level)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-extrabold transition-all shadow-[0_0_12px_#06b6d4]"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>
      </div>

      {/* Grid Arena */}
      <div className="relative bg-[#090d16] border-2 border-cyan-500/30 rounded-2xl p-4 shadow-[0_0_25px_rgba(6,182,212,0.15)] overflow-x-auto max-w-full">
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${CONFIGS[level].cols}, minmax(0, 1fr))`,
            width: level === 'EXPERT' ? '700px' : level === 'INTERMEDIATE' ? '450px' : '320px',
          }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => {
              let cellContent = '';
              let textColor = 'text-slate-100';

              if (cell.isRevealed) {
                if (cell.isMine) {
                  cellContent = '💣';
                } else if (cell.neighborMines > 0) {
                  cellContent = cell.neighborMines.toString();
                  const colors = [
                    '',
                    'text-cyan-400 font-bold',
                    'text-emerald-400 font-bold',
                    'text-rose-400 font-bold',
                    'text-purple-400 font-bold',
                    'text-amber-400 font-bold',
                    'text-teal-400 font-bold',
                    'text-pink-400 font-bold',
                    'text-red-500 font-bold',
                  ];
                  textColor = colors[cell.neighborMines] || 'text-slate-100';
                }
              } else if (cell.isFlagged) {
                cellContent = '🚩';
              }

              return (
                <button
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  onContextMenu={e => toggleFlag(r, c, e)}
                  className={`h-8 sm:h-9 rounded-md flex items-center justify-center text-sm sm:text-base font-mono transition-all border ${cell.isRevealed
                    ? cell.isMine
                      ? 'bg-rose-950 border-rose-600'
                      : 'bg-[#111927] border-slate-800'
                    : 'bg-[#1e293b] hover:bg-slate-700 border-slate-700 shadow-sm'
                    } ${textColor}`}
                >
                  {cellContent}
                </button>
              );
            })
          )}
        </div>

        {/* Win/Lose Overlay */}
        {(gameOver || gameWon) && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center z-20">
            <h3 className={`text-3xl font-extrabold font-display mb-2 ${gameWon ? 'text-amber-400 animate-pulse' : 'text-rose-500'}`}>
              {gameWon ? '★ GRID CLEARED! ★' : 'MINE DETONATED'}
            </h3>
            <p className="text-slate-300 mb-4">Time: <span className="font-mono text-cyan-400 font-bold">{timer}s</span></p>
            <button
              onClick={() => initGrid(level)}
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_#06b6d4]"
            >
              <RotateCcw className="w-5 h-5" /> Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
