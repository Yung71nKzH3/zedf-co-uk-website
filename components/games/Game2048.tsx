'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RotateCcw, Volume2, VolumeX, Undo2, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { playClearSound, playScoreSound, toggleSound, getIsMuted } from '@/lib/games/sound';
import { getHighScore, saveHighScore } from '@/lib/games/scores';

type Board = number[][];

const TILE_COLORS: Record<number, { bg: string; text: string }> = {
  2: { bg: '#1e293b', text: '#38bdf8' },
  4: { bg: '#0f172a', text: '#22d3ee' },
  8: { bg: '#0284c7', text: '#ffffff' },
  16: { bg: '#0284c7', text: '#ffffff' },
  32: { bg: '#2563eb', text: '#ffffff' },
  64: { bg: '#7c3aed', text: '#ffffff' },
  128: { bg: '#9333ea', text: '#ffffff' },
  256: { bg: '#c026d3', text: '#ffffff' },
  512: { bg: '#db2777', text: '#ffffff' },
  1024: { bg: '#e11d48', text: '#ffffff' },
  2048: { bg: '#eab308', text: '#000000' },
};

export function Game2048() {
  const [board, setBoard] = useState<Board>([
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ]);
  const [previousBoard, setPreviousBoard] = useState<Board | null>(null);
  const [score, setScore] = useState(0);
  const [previousScore, setPreviousScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setHighScore(getHighScore('2048'));
    setMuted(getIsMuted());
    initGame();
  }, []);

  const addRandomTile = (currentBoard: Board): Board => {
    const emptyCells: { r: number; c: number }[] = [];
    currentBoard.forEach((row, r) => {
      row.forEach((val, c) => {
        if (val === 0) emptyCells.push({ r, c });
      });
    });

    if (emptyCells.length === 0) return currentBoard;

    const newBoard = currentBoard.map(row => [...row]);
    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    newBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
    return newBoard;
  };

  const initGame = () => {
    let b = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    b = addRandomTile(b);
    b = addRandomTile(b);
    setBoard(b);
    setPreviousBoard(null);
    setScore(0);
    setGameOver(false);
    setGameWon(false);
  };

  const checkGameOver = (currentBoard: Board): boolean => {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (currentBoard[r][c] === 0) return false;
        if (r < 3 && currentBoard[r][c] === currentBoard[r + 1][c]) return false;
        if (c < 3 && currentBoard[r][c] === currentBoard[r][c + 1]) return false;
      }
    }
    return true;
  };

  const slideLeft = (row: number[], currentScore: number): { row: number[]; scoreGain: number } => {
    let arr = row.filter(val => val !== 0);
    let scoreGain = 0;
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        scoreGain += arr[i];
        arr[i + 1] = 0;
      }
    }
    arr = arr.filter(val => val !== 0);
    while (arr.length < 4) arr.push(0);
    return { row: arr, scoreGain };
  };

  const rotateClockwise = (matrix: Board): Board => {
    return matrix[0].map((_, index) => matrix.map(row => row[index]).reverse());
  };

  const move = useCallback((direction: 'LEFT' | 'RIGHT' | 'UP' | 'DOWN') => {
    if (gameOver) return;

    let tempBoard = board.map(row => [...row]);
    let rotations = 0;

    if (direction === 'UP') rotations = 3;
    if (direction === 'RIGHT') rotations = 2;
    if (direction === 'DOWN') rotations = 1;

    for (let i = 0; i < rotations; i++) {
      tempBoard = rotateClockwise(tempBoard);
    }

    let gainedScore = 0;
    const newBoard: Board = [];

    for (let r = 0; r < 4; r++) {
      const { row, scoreGain } = slideLeft(tempBoard[r], score);
      newBoard.push(row);
      gainedScore += scoreGain;
    }

    tempBoard = newBoard;
    for (let i = 0; i < (4 - rotations) % 4; i++) {
      tempBoard = rotateClockwise(tempBoard);
    }

    // Check if board changed
    const changed = JSON.stringify(board) !== JSON.stringify(tempBoard);
    if (changed) {
      setPreviousBoard(board);
      setPreviousScore(score);

      const withNewTile = addRandomTile(tempBoard);
      setBoard(withNewTile);
      
      const nextScore = score + gainedScore;
      setScore(nextScore);

      if (gainedScore > 0) {
        playScoreSound();
      }

      // Check win
      if (withNewTile.some(row => row.some(val => val >= 2048)) && !gameWon) {
        setGameWon(true);
        playClearSound();
      }

      // Check game over
      if (checkGameOver(withNewTile)) {
        setGameOver(true);
        saveHighScore('2048', nextScore);
        setHighScore(getHighScore('2048'));
      }
    }
  }, [board, score, gameOver, gameWon]);

  // Handle Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        move('LEFT');
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        move('RIGHT');
      } else if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        move('UP');
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        move('DOWN');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  const handleUndo = () => {
    if (previousBoard) {
      setBoard(previousBoard);
      setScore(previousScore);
      setPreviousBoard(null);
      setGameOver(false);
    }
  };

  // Touch Swipe Handlers for 2048
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) > 25) {
      if (absDx > absDy) {
        move(dx > 0 ? 'RIGHT' : 'LEFT');
      } else {
        move(dy > 0 ? 'DOWN' : 'UP');
      }
    }
    touchStartRef.current = null;
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 max-w-xl mx-auto text-slate-100 select-none">
      {/* Header */}
      <div className="w-full flex items-center justify-between bg-[#111927] border border-cyan-500/20 rounded-xl p-4 mb-4 shadow-lg">
        <div>
          <h2 className="text-xl font-bold font-display text-cyan-400">2048 NEON</h2>
          <p className="text-xs text-slate-400">Arrow keys / Swipe to merge tiles</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-slate-400 uppercase">Score</div>
            <div className="text-xl font-bold font-mono text-cyan-300">{score}</div>
          </div>
          <div className="text-right border-l border-slate-700 pl-4">
            <div className="text-xs text-slate-400 uppercase">Best</div>
            <div className="text-xl font-bold font-mono text-amber-400">{highScore}</div>
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

      {/* Buttons bar */}
      <div className="w-full flex justify-between gap-3 mb-4">
        <button
          onClick={handleUndo}
          disabled={!previousBoard}
          aria-label="Undo move"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-sm font-bold border border-slate-700 transition-all cursor-pointer"
        >
          <Undo2 className="w-4 h-4 text-cyan-400" /> Undo
        </button>

        <button
          onClick={initGame}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-extrabold transition-all shadow-[0_0_12px_#06b6d4] cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" /> Reset Game
        </button>
      </div>

      {/* Grid Container */}
      <div 
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative bg-[#090d16] border-2 border-cyan-500/30 rounded-2xl p-4 shadow-[0_0_25px_rgba(6,182,212,0.15)] touch-none"
      >
        <div className="grid grid-cols-4 gap-3 w-[290px] h-[290px] sm:w-[360px] sm:h-[360px]">
          {board.map((row, rIdx) =>
            row.map((val, cIdx) => {
              const styleInfo = TILE_COLORS[val] || { bg: '#4c1d95', text: '#ffffff' };
              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className="rounded-xl flex items-center justify-center font-bold text-xl sm:text-2xl transition-all duration-150 transform shadow-md select-none"
                  style={{
                    backgroundColor: val === 0 ? '#111827' : styleInfo.bg,
                    color: styleInfo.text,
                    boxShadow: val > 0 ? `0 0 10px ${styleInfo.bg}80` : 'none',
                  }}
                >
                  {val > 0 ? val : ''}
                </div>
              );
            })
          )}
        </div>

        {/* Overlay */}
        {(gameOver || gameWon) && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center z-20">
            <h3 className={`text-3xl font-extrabold font-display mb-2 ${gameWon ? 'text-amber-400 animate-pulse' : 'text-rose-500'}`}>
              {gameWon ? '★ YOU REACHED 2048! ★' : 'GAME OVER'}
            </h3>
            <p className="text-slate-300 mb-4">Final Score: <span className="font-mono text-cyan-400 font-bold">{score}</span></p>
            <button
              onClick={initGame}
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_#06b6d4] cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" /> Play Again
            </button>
          </div>
        )}
      </div>

      {/* Touch Buttons */}
      <div className="mt-6 flex flex-col items-center gap-2">
        <button 
          onClick={() => move('UP')} 
          aria-label="Slide Up"
          className="p-4 bg-slate-800 active:bg-cyan-500/40 rounded-xl border border-slate-700 text-cyan-400 shadow-md min-w-[56px] min-h-[56px] flex items-center justify-center cursor-pointer"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
        <div className="flex gap-4">
          <button 
            onClick={() => move('LEFT')} 
            aria-label="Slide Left"
            className="p-4 bg-slate-800 active:bg-cyan-500/40 rounded-xl border border-slate-700 text-cyan-400 shadow-md min-w-[56px] min-h-[56px] flex items-center justify-center cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={() => move('DOWN')} 
            aria-label="Slide Down"
            className="p-4 bg-slate-800 active:bg-cyan-500/40 rounded-xl border border-slate-700 text-cyan-400 shadow-md min-w-[56px] min-h-[56px] flex items-center justify-center cursor-pointer"
          >
            <ArrowDown className="w-6 h-6" />
          </button>
          <button 
            onClick={() => move('RIGHT')} 
            aria-label="Slide Right"
            className="p-4 bg-slate-800 active:bg-cyan-500/40 rounded-xl border border-slate-700 text-cyan-400 shadow-md min-w-[56px] min-h-[56px] flex items-center justify-center cursor-pointer"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
