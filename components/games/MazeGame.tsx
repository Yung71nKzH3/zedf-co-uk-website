'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RotateCcw, Volume2, VolumeX, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Flag } from 'lucide-react';
import { playScoreSound, playClearSound, playPowerupSound, toggleSound, getIsMuted } from '@/lib/games/sound';
import { getHighScore, saveHighScore } from '@/lib/games/scores';

const MAZE_SIZE = 15; // 15x15 grid

interface Cell {
  r: number;
  c: number;
  walls: { N: boolean; E: boolean; S: boolean; W: boolean };
  visited: boolean;
}

function generateMaze(size: number): Cell[][] {
  const grid: Cell[][] = [];
  for (let r = 0; r < size; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < size; c++) {
      row.push({
        r,
        c,
        walls: { N: true, E: true, S: true, W: true },
        visited: false,
      });
    }
    grid.push(row);
  }

  // Recursive Backtracker algorithm
  const stack: Cell[] = [];
  const startCell = grid[0][0];
  startCell.visited = true;
  stack.push(startCell);

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors: { cell: Cell; dir: 'N' | 'E' | 'S' | 'W' }[] = [];

    const { r, c } = current;
    if (r > 0 && !grid[r - 1][c].visited) neighbors.push({ cell: grid[r - 1][c], dir: 'N' });
    if (c < size - 1 && !grid[r][c + 1].visited) neighbors.push({ cell: grid[r][c + 1], dir: 'E' });
    if (r < size - 1 && !grid[r + 1][c].visited) neighbors.push({ cell: grid[r + 1][c], dir: 'S' });
    if (c > 0 && !grid[r][c - 1].visited) neighbors.push({ cell: grid[r][c - 1], dir: 'W' });

    if (neighbors.length > 0) {
      const { cell: next, dir } = neighbors[Math.floor(Math.random() * neighbors.length)];
      if (dir === 'N') {
        current.walls.N = false;
        next.walls.S = false;
      } else if (dir === 'E') {
        current.walls.E = false;
        next.walls.W = false;
      } else if (dir === 'S') {
        current.walls.S = false;
        next.walls.N = false;
      } else if (dir === 'W') {
        current.walls.W = false;
        next.walls.E = false;
      }
      next.visited = true;
      stack.push(next);
    } else {
      stack.pop();
    }
  }

  return grid;
}

export function MazeGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [maze, setMaze] = useState<Cell[][]>([]);
  const [playerPos, setPlayerPos] = useState<{ r: number; c: number }>({ r: 0, c: 0 });
  const [steps, setSteps] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [muted, setMuted] = useState(false);

  const goalPos = { r: MAZE_SIZE - 1, c: MAZE_SIZE - 1 };

  useEffect(() => {
    setHighScore(getHighScore('maze'));
    setMuted(getIsMuted());
    initGame();
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

  const initGame = () => {
    const newMaze = generateMaze(MAZE_SIZE);
    setMaze(newMaze);
    setPlayerPos({ r: 0, c: 0 });
    setSteps(0);
    setTimer(0);
    setGameWon(false);
    setIsPlaying(true);
  };

  const movePlayer = useCallback((dir: 'N' | 'E' | 'S' | 'W') => {
    if (!isPlaying || gameWon || maze.length === 0) return;
    const { r, c } = playerPos;
    const cell = maze[r][c];

    let newR = r;
    let newC = c;
    let canMove = false;

    if (dir === 'N' && !cell.walls.N && r > 0) {
      newR = r - 1;
      canMove = true;
    } else if (dir === 'E' && !cell.walls.E && c < MAZE_SIZE - 1) {
      newC = c + 1;
      canMove = true;
    } else if (dir === 'S' && !cell.walls.S && r < MAZE_SIZE - 1) {
      newR = r + 1;
      canMove = true;
    } else if (dir === 'W' && !cell.walls.W && c > 0) {
      newC = c - 1;
      canMove = true;
    }

    if (canMove) {
      setPlayerPos({ r: newR, c: newC });
      setSteps(s => s + 1);
      playScoreSound();

      // Check Exit
      if (newR === goalPos.r && newC === goalPos.c) {
        playClearSound();
        setGameWon(true);
        setIsPlaying(false);
        const scoreCalc = Math.max(10, 1500 - steps * 5 - timer * 3);
        saveHighScore('maze', scoreCalc);
        setHighScore(getHighScore('maze'));
      }
    }
  }, [isPlaying, gameWon, maze, playerPos, steps, timer]);

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        movePlayer('N');
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        movePlayer('S');
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        movePlayer('W');
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        movePlayer('E');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer]);

  // Render Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || maze.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = canvas.width / MAZE_SIZE;

    // Clear background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Walls
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#06b6d4';

    for (let r = 0; r < MAZE_SIZE; r++) {
      for (let c = 0; c < MAZE_SIZE; c++) {
        const cell = maze[r][c];
        const x = c * cellSize;
        const y = r * cellSize;

        if (cell.walls.N) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + cellSize, y);
          ctx.stroke();
        }
        if (cell.walls.E) {
          ctx.beginPath();
          ctx.moveTo(x + cellSize, y);
          ctx.lineTo(x + cellSize, y + cellSize);
          ctx.stroke();
        }
        if (cell.walls.S) {
          ctx.beginPath();
          ctx.moveTo(x, y + cellSize);
          ctx.lineTo(x + cellSize, y + cellSize);
          ctx.stroke();
        }
        if (cell.walls.W) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + cellSize);
          ctx.stroke();
        }
      }
    }

    // Draw Goal Portal (Glowing Pink)
    ctx.shadowColor = '#ec4899';
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.arc(
      goalPos.c * cellSize + cellSize / 2,
      goalPos.r * cellSize + cellSize / 2,
      cellSize / 3,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw Player Orb (Glowing Yellow)
    ctx.shadowColor = '#facc15';
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(
      playerPos.c * cellSize + cellSize / 2,
      playerPos.r * cellSize + cellSize / 2,
      cellSize / 3.2,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.shadowBlur = 0;
  }, [maze, playerPos]);

  return (
    <div className="flex flex-col items-center justify-center p-4 max-w-xl mx-auto text-slate-100 select-none font-sans">
      {/* Header */}
      <div className="w-full flex items-center justify-between bg-[#111927] border border-cyan-500/20 rounded-xl p-4 mb-4 shadow-lg">
        <div>
          <h2 className="text-xl font-bold font-display text-cyan-400">LABYRINTH</h2>
          <p className="text-xs text-slate-400">Guide the orb (Yellow) to the exit portal (Pink)</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-slate-400 uppercase">Steps</div>
            <div className="text-xl font-bold font-mono text-cyan-300">{steps}</div>
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

      {/* Control Bar */}
      <div className="w-full flex justify-between items-center mb-4">
        <span className="text-xs font-bold text-slate-400">
          Controls: <span className="text-cyan-400 font-mono">Arrows / WASD / Touch D-pad</span>
        </span>

        <button
          onClick={initGame}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold transition-all shadow-[0_0_12px_#06b6d4] cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" /> New Maze
        </button>
      </div>

      {/* Canvas Arena */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.15)] bg-[#090d16] touch-none">
        <canvas
          ref={canvasRef}
          width={360}
          height={360}
          className="w-[290px] h-[290px] sm:w-[360px] sm:h-[360px] block"
        />

        {gameWon && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center z-20">
            <h3 className="text-3xl font-extrabold text-amber-400 font-display mb-2 animate-pulse">
              ★ MAZE ESCAPED! ★
            </h3>
            <p className="text-slate-300 mb-1">Steps Taken: <span className="font-mono text-cyan-400 font-bold">{steps}</span></p>
            <p className="text-slate-300 mb-4">Time Taken: <span className="font-mono text-amber-400 font-bold">{timer}s</span></p>
            <button
              onClick={initGame}
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_#06b6d4] cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" /> Next Maze
            </button>
          </div>
        )}
      </div>

      {/* Touch D-Pad */}
      <div className="mt-6 flex flex-col items-center gap-2">
        <button
          onClick={() => movePlayer('N')}
          aria-label="Move Up"
          className="p-4 bg-slate-800 active:bg-cyan-500/40 rounded-xl border border-slate-700 text-cyan-400 shadow-md min-w-[56px] min-h-[56px] flex items-center justify-center cursor-pointer"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
        <div className="flex gap-4">
          <button
            onClick={() => movePlayer('W')}
            aria-label="Move Left"
            className="p-4 bg-slate-800 active:bg-cyan-500/40 rounded-xl border border-slate-700 text-cyan-400 shadow-md min-w-[56px] min-h-[56px] flex items-center justify-center cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => movePlayer('S')}
            aria-label="Move Down"
            className="p-4 bg-slate-800 active:bg-cyan-500/40 rounded-xl border border-slate-700 text-cyan-400 shadow-md min-w-[56px] min-h-[56px] flex items-center justify-center cursor-pointer"
          >
            <ArrowDown className="w-6 h-6" />
          </button>
          <button
            onClick={() => movePlayer('E')}
            aria-label="Move Right"
            className="p-4 bg-slate-800 active:bg-cyan-500/40 rounded-xl border border-slate-700 text-cyan-400 shadow-md min-w-[56px] min-h-[56px] flex items-center justify-center cursor-pointer"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
