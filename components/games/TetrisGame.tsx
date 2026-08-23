'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, ArrowRight, ArrowDown, RotateCw, Play, Pause, RotateCcw, Volume2, VolumeX, ChevronDown } from 'lucide-react';
import { playClearSound, playHitSound, playScoreSound, toggleSound, getIsMuted } from '@/lib/games/sound';
import { getHighScore, saveHighScore } from '@/lib/games/scores';

const COLS = 10;
const ROWS = 20;

type TetrominoType = 'I' | 'L' | 'J' | 'O' | 'Z' | 'S' | 'T';

const SHAPES: Record<TetrominoType, number[][]> = {
  I: [[1, 1, 1, 1]],
  L: [[1, 0], [1, 0], [1, 1]],
  J: [[0, 1], [0, 1], [1, 1]],
  O: [[1, 1], [1, 1]],
  Z: [[1, 1, 0], [0, 1, 1]],
  S: [[0, 1, 1], [1, 1, 0]],
  T: [[1, 1, 1], [0, 1, 0]],
};

const COLORS: Record<TetrominoType, string> = {
  I: '#06b6d4',
  L: '#f97316',
  J: '#3b82f6',
  O: '#eab308',
  Z: '#ef4444',
  S: '#22c55e',
  T: '#a855f7',
};

interface Piece {
  type: TetrominoType;
  shape: number[][];
  color: string;
  pos: { x: number; y: number };
}

export function TetrisGame() {
  const [grid, setGrid] = useState<string[][]>(
    Array(ROWS).fill(null).map(() => Array(COLS).fill(''))
  );
  const [activePiece, setActivePiece] = useState<Piece | null>(null);
  const [nextPiece, setNextPiece] = useState<TetrominoType>('I');
  const [holdPiece, setHoldPiece] = useState<TetrominoType | null>(null);
  const [canHold, setCanHold] = useState(true);
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [muted, setMuted] = useState(false);

  const activePieceRef = useRef<Piece | null>(null);
  const gridRef = useRef<string[][]>(grid);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  activePieceRef.current = activePiece;
  gridRef.current = grid;

  useEffect(() => {
    setHighScore(getHighScore('tetris'));
    setMuted(getIsMuted());
  }, []);

  const getRandomType = (): TetrominoType => {
    const keys: TetrominoType[] = ['I', 'L', 'J', 'O', 'Z', 'S', 'T'];
    return keys[Math.floor(Math.random() * keys.length)];
  };

  const createPiece = (type: TetrominoType): Piece => {
    const shape = SHAPES[type];
    return {
      type,
      shape,
      color: COLORS[type],
      pos: { x: Math.floor(COLS / 2) - Math.floor(shape[0].length / 2), y: 0 },
    };
  };

  const checkCollision = (pos: { x: number; y: number }, shape: number[][], currentGrid: string[][]) => {
    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x] !== 0) {
          const newX = pos.x + x;
          const newY = pos.y + y;
          if (newX < 0 || newX >= COLS || newY >= ROWS || (newY >= 0 && currentGrid[newY][newX] !== '')) {
            return true;
          }
        }
      }
    }
    return false;
  };

  const startGame = () => {
    const newGrid = Array(ROWS).fill(null).map(() => Array(COLS).fill(''));
    const firstType = getRandomType();
    const secondType = getRandomType();

    setGrid(newGrid);
    setActivePiece(createPiece(firstType));
    setNextPiece(secondType);
    setHoldPiece(null);
    setCanHold(true);
    setScore(0);
    setLines(0);
    setGameOver(false);
    setIsPaused(false);
    setIsPlaying(true);
  };

  const mergePieceToGrid = useCallback((piece: Piece, currentGrid: string[][]) => {
    const newGrid = currentGrid.map(row => [...row]);
    piece.shape.forEach((row, y) => {
      row.forEach((val, x) => {
        if (val !== 0) {
          const gridY = piece.pos.y + y;
          const gridX = piece.pos.x + x;
          if (gridY >= 0 && gridY < ROWS && gridX >= 0 && gridX < COLS) {
            newGrid[gridY][gridX] = piece.color;
          }
        }
      });
    });

    // Check line clears
    let clearedLines = 0;
    const filteredGrid = newGrid.filter(row => {
      const isFull = row.every(cell => cell !== '');
      if (isFull) clearedLines++;
      return !isFull;
    });

    while (filteredGrid.length < ROWS) {
      filteredGrid.unshift(Array(COLS).fill(''));
    }

    if (clearedLines > 0) {
      playClearSound();
      const pointsMap = [0, 100, 300, 500, 800];
      const addedScore = pointsMap[clearedLines] || clearedLines * 200;
      setScore(s => s + addedScore);
      setLines(l => l + clearedLines);
    } else {
      playHitSound();
    }

    setGrid(filteredGrid);

    // Spawn Next Piece
    const newPiece = createPiece(nextPiece);
    if (checkCollision(newPiece.pos, newPiece.shape, filteredGrid)) {
      setGameOver(true);
      setIsPlaying(false);
      setScore(finalScore => {
        saveHighScore('tetris', finalScore);
        setHighScore(getHighScore('tetris'));
        return finalScore;
      });
    } else {
      setActivePiece(newPiece);
      setNextPiece(getRandomType());
      setCanHold(true);
    }
  }, [nextPiece]);

  const moveLeft = () => {
    const piece = activePieceRef.current;
    if (!piece) return;
    const newPos = { ...piece.pos, x: piece.pos.x - 1 };
    if (!checkCollision(newPos, piece.shape, gridRef.current)) {
      setActivePiece({ ...piece, pos: newPos });
    }
  };

  const moveRight = () => {
    const piece = activePieceRef.current;
    if (!piece) return;
    const newPos = { ...piece.pos, x: piece.pos.x + 1 };
    if (!checkCollision(newPos, piece.shape, gridRef.current)) {
      setActivePiece({ ...piece, pos: newPos });
    }
  };

  const rotate = () => {
    const piece = activePieceRef.current;
    if (!piece) return;
    const newShape = piece.shape[0].map((_, index) =>
      piece.shape.map(row => row[index]).reverse()
    );
    if (!checkCollision(piece.pos, newShape, gridRef.current)) {
      setActivePiece({ ...piece, shape: newShape });
    }
  };

  const moveDown = useCallback(() => {
    const piece = activePieceRef.current;
    if (!piece) return;
    const newPos = { ...piece.pos, y: piece.pos.y + 1 };
    if (!checkCollision(newPos, piece.shape, gridRef.current)) {
      setActivePiece({ ...piece, pos: newPos });
    } else {
      mergePieceToGrid(piece, gridRef.current);
    }
  }, [mergePieceToGrid]);

  const hardDrop = () => {
    const piece = activePieceRef.current;
    if (!piece) return;
    let currentY = piece.pos.y;
    while (!checkCollision({ x: piece.pos.x, y: currentY + 1 }, piece.shape, gridRef.current)) {
      currentY++;
    }
    const droppedPiece = { ...piece, pos: { x: piece.pos.x, y: currentY } };
    mergePieceToGrid(droppedPiece, gridRef.current);
  };

  const handleHold = () => {
    if (!canHold || !activePiece) return;
    const currentType = activePiece.type;

    if (holdPiece === null) {
      setHoldPiece(currentType);
      setActivePiece(createPiece(nextPiece));
      setNextPiece(getRandomType());
    } else {
      const prevHold = holdPiece;
      setHoldPiece(currentType);
      setActivePiece(createPiece(prevHold));
    }
    setCanHold(false);
  };

  // Keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || isPaused || gameOver) return;

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault();
        moveLeft();
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        moveRight();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        moveDown();
      } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        rotate();
      } else if (e.code === 'Space') {
        e.preventDefault();
        hardDrop();
      } else if (e.code === 'KeyC' || e.code === 'ShiftLeft') {
        e.preventDefault();
        handleHold();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isPaused, gameOver, moveDown, handleHold]);

  // Tick loop
  useEffect(() => {
    if (!isPlaying || isPaused || gameOver) return;
    const speed = Math.max(100, 800 - Math.floor(lines / 5) * 50);
    gameLoopRef.current = setInterval(moveDown, speed);
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [isPlaying, isPaused, gameOver, lines, moveDown]);

  // Render display grid with active piece overlay
  const displayGrid = grid.map(row => [...row]);
  if (activePiece) {
    activePiece.shape.forEach((row, y) => {
      row.forEach((val, x) => {
        if (val !== 0) {
          const gridY = activePiece.pos.y + y;
          const gridX = activePiece.pos.x + x;
          if (gridY >= 0 && gridY < ROWS && gridX >= 0 && gridX < COLS) {
            displayGrid[gridY][gridX] = activePiece.color;
          }
        }
      });
    });
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 max-w-xl mx-auto text-slate-100">
      {/* Header */}
      <div className="w-full flex items-center justify-between bg-[#111927] border border-cyan-500/20 rounded-xl p-4 mb-4 shadow-lg">
        <div>
          <h2 className="text-xl font-bold font-display text-cyan-400">NEON TETRIS</h2>
          <p className="text-xs text-slate-400">Arrow keys / WASD to stack</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-slate-400 uppercase tracking-wider">Score</div>
            <div className="text-xl font-bold text-cyan-300 font-mono">{score}</div>
          </div>
          <div className="text-right border-l border-slate-700 pl-4">
            <div className="text-xs text-slate-400 uppercase tracking-wider">High</div>
            <div className="text-xl font-bold text-amber-400 font-mono">{highScore}</div>
          </div>

          <button
            onClick={() => setMuted(toggleSound())}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
          >
            {muted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* Main Game Arena */}
      <div className="flex gap-4 items-start">
        {/* Hold Piece Sidebar */}
        <div className="hidden sm:flex flex-col gap-4">
          <div className="bg-[#111927] border border-slate-800 rounded-xl p-3 text-center w-24">
            <div className="text-xs text-slate-400 font-bold mb-2">HOLD</div>
            <div className="h-16 flex items-center justify-center">
              {holdPiece && (
                <div
                  className="grid gap-0.5"
                  style={{
                    gridTemplateColumns: `repeat(${SHAPES[holdPiece][0].length}, 14px)`,
                  }}
                >
                  {SHAPES[holdPiece].map((row, rIdx) =>
                    row.map((val, cIdx) => (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        className="w-3.5 h-3.5 rounded-sm"
                        style={{ backgroundColor: val ? COLORS[holdPiece] : 'transparent' }}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Board */}
        <div className="relative bg-[#090d16] border-2 border-cyan-500/30 rounded-2xl overflow-hidden p-1 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
          <div
            className="grid gap-[1px] bg-slate-900/60 p-1 rounded-xl"
            style={{
              gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
              width: '260px',
              height: '520px',
            }}
          >
            {displayGrid.map((row, rIdx) =>
              row.map((cellColor, cIdx) => (
                <div
                  key={`${rIdx}-${cIdx}`}
                  className="rounded-[2px] transition-colors duration-75"
                  style={{
                    backgroundColor: cellColor || '#0c1422',
                    boxShadow: cellColor ? `inset 0 0 6px rgba(255,255,255,0.3), 0 0 4px ${cellColor}` : 'none',
                  }}
                />
              ))
            )}
          </div>

          {/* Overlay Screen */}
          {(!isPlaying || isPaused || gameOver) && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
              {gameOver ? (
                <>
                  <h3 className="text-3xl font-extrabold text-rose-500 font-display mb-2">GAME OVER</h3>
                  <p className="text-slate-300 mb-1">Score: <span className="font-mono text-cyan-400 font-bold">{score}</span></p>
                  <p className="text-slate-400 text-xs mb-4">Lines Cleared: {lines}</p>
                  <button
                    onClick={startGame}
                    className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_#06b6d4]"
                  >
                    <RotateCcw className="w-5 h-5" /> Play Again
                  </button>
                </>
              ) : isPaused ? (
                <>
                  <h3 className="text-3xl font-extrabold text-amber-400 font-display mb-4">PAUSED</h3>
                  <button
                    onClick={() => setIsPaused(false)}
                    className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_#06b6d4]"
                  >
                    <Play className="w-5 h-5" /> Resume
                  </button>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-cyan-300 font-display mb-2">NEON TETRIS</h3>
                  <p className="text-slate-400 text-xs mb-6">Stack blocks, clear lines, beat your high score!</p>
                  <button
                    onClick={startGame}
                    className="px-8 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-lg flex items-center gap-2 transition-all shadow-[0_0_20px_#06b6d4]"
                  >
                    <Play className="w-6 h-6 fill-current" /> PLAY NOW
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Next Piece Sidebar */}
        <div className="flex flex-col gap-4">
          <div className="bg-[#111927] border border-slate-800 rounded-xl p-3 text-center w-24">
            <div className="text-xs text-slate-400 font-bold mb-2">NEXT</div>
            <div className="h-16 flex items-center justify-center">
              {nextPiece && (
                <div
                  className="grid gap-0.5"
                  style={{
                    gridTemplateColumns: `repeat(${SHAPES[nextPiece][0].length}, 14px)`,
                  }}
                >
                  {SHAPES[nextPiece].map((row, rIdx) =>
                    row.map((val, cIdx) => (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        className="w-3.5 h-3.5 rounded-sm"
                        style={{ backgroundColor: val ? COLORS[nextPiece] : 'transparent' }}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#111927] border border-slate-800 rounded-xl p-3 text-center w-24">
            <div className="text-xs text-slate-400 font-bold">LINES</div>
            <div className="text-lg font-bold text-cyan-300 font-mono mt-1">{lines}</div>
          </div>
        </div>
      </div>

      {/* Touch Controls for Tablets & Mobile */}
      <div className="mt-6 flex flex-col items-center gap-3 select-none">
        <div className="flex gap-3">
          <button
            onClick={rotate}
            aria-label="Rotate Piece"
            className="px-5 py-3.5 bg-slate-800 active:bg-cyan-500/40 rounded-xl border border-slate-700 text-cyan-400 font-bold flex items-center gap-2 shadow-md cursor-pointer"
          >
            <RotateCw className="w-5 h-5" /> Rotate
          </button>
          <button
            onClick={handleHold}
            aria-label="Hold Piece"
            className="px-5 py-3.5 bg-slate-800 active:bg-cyan-500/40 rounded-xl border border-slate-700 text-purple-400 font-bold flex items-center gap-2 shadow-md cursor-pointer"
          >
            Hold
          </button>
          <button
            onClick={hardDrop}
            aria-label="Hard Drop Piece"
            className="px-5 py-3.5 bg-slate-800 active:bg-cyan-500/40 rounded-xl border border-slate-700 text-amber-400 font-bold flex items-center gap-2 shadow-md cursor-pointer"
          >
            <ChevronDown className="w-5 h-5" /> Drop
          </button>
        </div>

        <div className="flex gap-4">
          <button
            onClick={moveLeft}
            aria-label="Move Left"
            className="p-4 bg-slate-800 active:bg-cyan-500/40 rounded-xl border border-slate-700 text-cyan-400 shadow-md min-w-[56px] min-h-[56px] flex items-center justify-center cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            onClick={moveDown}
            aria-label="Move Down"
            className="p-4 bg-slate-800 active:bg-cyan-500/40 rounded-xl border border-slate-700 text-cyan-400 shadow-md min-w-[56px] min-h-[56px] flex items-center justify-center cursor-pointer"
          >
            <ArrowDown className="w-6 h-6" />
          </button>
          <button
            onClick={moveRight}
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
