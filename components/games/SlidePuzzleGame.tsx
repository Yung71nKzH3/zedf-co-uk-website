'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Volume2, VolumeX, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { playScoreSound, playClearSound, toggleSound, getIsMuted } from '@/lib/games/sound';
import { getHighScore, saveHighScore } from '@/lib/games/scores';

type Board = number[];

function isSolvable(board: Board): boolean {
  let inversions = 0;
  const size = 4;
  for (let i = 0; i < board.length; i++) {
    for (let j = i + 1; j < board.length; j++) {
      if (board[i] !== 0 && board[j] !== 0 && board[i] > board[j]) {
        inversions++;
      }
    }
  }
  const emptyRowFromBottom = size - Math.floor(board.indexOf(0) / size);
  if (emptyRowFromBottom % 2 === 0) {
    return inversions % 2 !== 0;
  } else {
    return inversions % 2 === 0;
  }
}

function generateSolvableBoard(): Board {
  let board: Board = [];
  do {
    board = Array.from({ length: 16 }, (_, i) => (i === 15 ? 0 : i + 1)).sort(
      () => Math.random() - 0.5
    );
  } while (!isSolvable(board));
  return board;
}

export function SlidePuzzleGame() {
  const [board, setBoard] = useState<Board>([]);
  const [moves, setMoves] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setHighScore(getHighScore('slide'));
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
    const newBoard = generateSolvableBoard();
    setBoard(newBoard);
    setMoves(0);
    setTimer(0);
    setGameWon(false);
    setIsPlaying(true);
  };

  const handleTileClick = useCallback((index: number) => {
    if (gameWon) return;

    const emptyIdx = board.indexOf(0);
    const row = Math.floor(index / 4);
    const col = index % 4;
    const emptyRow = Math.floor(emptyIdx / 4);
    const emptyCol = emptyIdx % 4;

    const isAdjacent =
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow);

    if (isAdjacent) {
      const newBoard = [...board];
      newBoard[emptyIdx] = board[index];
      newBoard[index] = 0;
      setBoard(newBoard);
      setMoves(m => m + 1);
      playScoreSound();

      // Check win
      const isSolved = newBoard.every((val, i) => (i === 15 ? val === 0 : val === i + 1));
      if (isSolved) {
        playClearSound();
        setGameWon(true);
        setIsPlaying(false);
        const scoreCalc = Math.max(10, 1000 - moves * 10 - timer * 5);
        saveHighScore('slide', scoreCalc);
        setHighScore(getHighScore('slide'));
      }
    }
  }, [board, gameWon, moves, timer]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const emptyIdx = board.indexOf(0);
      let targetIdx = -1;

      if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        if (emptyIdx + 4 < 16) targetIdx = emptyIdx + 4;
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        if (emptyIdx - 4 >= 0) targetIdx = emptyIdx - 4;
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        if (emptyIdx % 4 !== 3) targetIdx = emptyIdx + 1;
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        if (emptyIdx % 4 !== 0) targetIdx = emptyIdx - 1;
      }

      if (targetIdx !== -1) {
        e.preventDefault();
        handleTileClick(targetIdx);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [board, handleTileClick]);

  return (
    <div className="flex flex-col items-center justify-center p-4 max-w-xl mx-auto text-slate-100 select-none font-sans">
      {/* Header */}
      <div className="w-full flex items-center justify-between bg-[#111927] border border-cyan-500/20 rounded-xl p-4 mb-4 shadow-lg">
        <div>
          <h2 className="text-xl font-bold font-display text-cyan-400">15-PUZZLE SLIDER</h2>
          <p className="text-xs text-slate-400">Click tile or use Arrows to slide numbers 1 to 15</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-slate-400 uppercase">Moves</div>
            <div className="text-xl font-bold font-mono text-cyan-300">{moves}</div>
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

      {/* Control bar */}
      <div className="w-full flex justify-between gap-3 mb-4">
        <span className="text-xs font-bold text-slate-400">
          Target: <span className="text-cyan-400 font-mono">1, 2, 3... 15 in order</span>
        </span>

        <button
          onClick={initGame}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold transition-all shadow-[0_0_12px_#06b6d4] cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" /> Shuffle Grid
        </button>
      </div>

      {/* 4x4 Grid */}
      <div className="relative bg-[#090d16] border-2 border-cyan-500/30 rounded-2xl p-4 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
        <div className="grid grid-cols-4 gap-3 w-[290px] h-[290px] sm:w-[360px] sm:h-[360px]">
          {board.map((val, idx) => {
            const isCorrect = val === idx + 1;
            return (
              <button
                key={idx}
                onClick={() => handleTileClick(idx)}
                disabled={val === 0}
                aria-label={val > 0 ? `Tile ${val}` : 'Empty Tile'}
                className={`rounded-xl flex items-center justify-center font-bold text-xl sm:text-2xl font-mono transition-all duration-150 transform shadow-md cursor-pointer ${
                  val === 0
                    ? 'opacity-0 cursor-default'
                    : isCorrect
                    ? 'bg-emerald-950 border-2 border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                    : 'bg-[#1e293b] border-2 border-slate-700 text-cyan-300 hover:bg-slate-700 hover:scale-105 active:scale-95'
                }`}
              >
                {val > 0 ? val : ''}
              </button>
            );
          })}
        </div>

        {/* Win Overlay */}
        {gameWon && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center z-20">
            <h3 className="text-3xl font-extrabold text-amber-400 font-display mb-2 animate-pulse">
              ★ PUZZLE SOLVED! ★
            </h3>
            <p className="text-slate-300 mb-1">Total Moves: <span className="font-mono text-cyan-400 font-bold">{moves}</span></p>
            <p className="text-slate-300 mb-4">Time Taken: <span className="font-mono text-amber-400 font-bold">{timer}s</span></p>
            <button
              onClick={initGame}
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_#06b6d4] cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" /> Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
