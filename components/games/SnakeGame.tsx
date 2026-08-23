'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { playScoreSound, playHitSound, playPowerupSound, toggleSound, getIsMuted } from '@/lib/games/sound';
import { getHighScore, saveHighScore } from '@/lib/games/scores';

const GRID_SIZE = 20;
const INITIAL_SPEED = 120;

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };
type Food = { x: number; y: number; type: 'normal' | 'bonus' };

export function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [snake, setSnake] = useState<Position[]>([
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
  ]);
  const [direction, setDirection] = useState<Direction>('UP');
  const [food, setFood] = useState<Food>({ x: 5, y: 5, type: 'normal' });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isNewHigh, setIsNewHigh] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [muted, setMuted] = useState(false);

  const directionRef = useRef<Direction>('UP');
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setHighScore(getHighScore('snake'));
    setMuted(getIsMuted());
  }, []);

  const spawnFood = useCallback((currentSnake: Position[]): Food => {
    let newX: number, newY: number;
    while (true) {
      newX = Math.floor(Math.random() * GRID_SIZE);
      newY = Math.floor(Math.random() * GRID_SIZE);
      if (!currentSnake.some(seg => seg.x === newX && seg.y === newY)) {
        break;
      }
    }
    const isBonus = Math.random() < 0.25;
    return { x: newX, y: newY, type: isBonus ? 'bonus' : 'normal' };
  }, []);

  const handleToggleMute = () => {
    const isM = toggleSound();
    setMuted(isM);
  };

  const startGame = () => {
    const initialSnake = [
      { x: 10, y: 10 },
      { x: 10, y: 11 },
      { x: 10, y: 12 },
    ];
    setSnake(initialSnake);
    setDirection('UP');
    directionRef.current = 'UP';
    setScore(0);
    setIsNewHigh(false);
    setGameOver(false);
    setIsPaused(false);
    setFood(spawnFood(initialSnake));
    setIsPlaying(true);
  };

  const handleDirectionChange = (newDir: Direction) => {
    const current = directionRef.current;
    if (newDir === 'UP' && current !== 'DOWN') directionRef.current = 'UP';
    if (newDir === 'DOWN' && current !== 'UP') directionRef.current = 'DOWN';
    if (newDir === 'LEFT' && current !== 'RIGHT') directionRef.current = 'LEFT';
    if (newDir === 'RIGHT' && current !== 'LEFT') directionRef.current = 'RIGHT';
    setDirection(directionRef.current);
  };

  // Keyboard Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        handleDirectionChange('UP');
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        handleDirectionChange('DOWN');
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        handleDirectionChange('LEFT');
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        handleDirectionChange('RIGHT');
      } else if (e.code === 'Space') {
        e.preventDefault();
        if (isPlaying && !gameOver) {
          setIsPaused(prev => !prev);
        } else if (!isPlaying || gameOver) {
          startGame();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, gameOver]);

  // Main Game Loop
  useEffect(() => {
    if (!isPlaying || isPaused || gameOver) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = { ...prevSnake[0] };
        const dir = directionRef.current;

        if (dir === 'UP') head.y -= 1;
        if (dir === 'DOWN') head.y += 1;
        if (dir === 'LEFT') head.x -= 1;
        if (dir === 'RIGHT') head.x += 1;

        // Collision detection (Walls)
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          playHitSound();
          setGameOver(true);
          setIsPlaying(false);
          setScore(finalScore => {
            const isHigh = saveHighScore('snake', finalScore);
            if (isHigh) {
              setIsNewHigh(true);
              setHighScore(finalScore);
            }
            return finalScore;
          });
          return prevSnake;
        }

        // Collision detection (Self)
        if (prevSnake.some((seg, idx) => idx > 0 && seg.x === head.x && seg.y === head.y)) {
          playHitSound();
          setGameOver(true);
          setIsPlaying(false);
          setScore(finalScore => {
            const isHigh = saveHighScore('snake', finalScore);
            if (isHigh) {
              setIsNewHigh(true);
              setHighScore(finalScore);
            }
            return finalScore;
          });
          return prevSnake;
        }

        const newSnake = [head, ...prevSnake];

        // Eat Food
        if (head.x === food.x && head.y === food.y) {
          const addedPoints = food.type === 'bonus' ? 30 : 10;
          if (food.type === 'bonus') {
            playPowerupSound();
          } else {
            playScoreSound();
          }

          setScore(s => s + addedPoints);
          setFood(spawnFood(newSnake));
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const speed = Math.max(60, INITIAL_SPEED - Math.floor(score / 50) * 5);
    gameLoopRef.current = setTimeout(moveSnake, speed);

    return () => {
      if (gameLoopRef.current) clearTimeout(gameLoopRef.current);
    };
  }, [isPlaying, isPaused, gameOver, food, score, spawnFood]);

  // Render Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = canvas.width / GRID_SIZE;

    // Clear background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Subtle Grid Lines
    ctx.strokeStyle = '#152033';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellSize, 0);
      ctx.lineTo(i * cellSize, canvas.height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * cellSize);
      ctx.lineTo(canvas.width, i * cellSize);
      ctx.stroke();
    }

    // Draw Food with Glow
    ctx.shadowBlur = 10;
    if (food.type === 'bonus') {
      ctx.shadowColor = '#eab308';
      ctx.fillStyle = '#facc15';
    } else {
      ctx.shadowColor = '#f43f5e';
      ctx.fillStyle = '#fb7185';
    }
    ctx.beginPath();
    ctx.arc(
      food.x * cellSize + cellSize / 2,
      food.y * cellSize + cellSize / 2,
      cellSize / 2.4,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Draw Snake with Cyan/Pink Glow
    snake.forEach((seg, idx) => {
      ctx.shadowBlur = idx === 0 ? 12 : 6;
      ctx.shadowColor = idx === 0 ? '#06b6d4' : '#38bdf8';
      ctx.fillStyle = idx === 0 ? '#22d3ee' : '#0284c7';

      const padding = 1.5;
      const x = seg.x * cellSize + padding;
      const y = seg.y * cellSize + padding;
      const size = cellSize - padding * 2;
      const radius = idx === 0 ? 4 : 2;

      ctx.beginPath();
      ctx.roundRect(x, y, size, size, radius);
      ctx.fill();
    });

    ctx.shadowBlur = 0;
  }, [snake, food]);

  // Touch Swipe Handlers for Tablets & Touch Screens
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

    if (Math.max(absDx, absDy) > 20) {
      if (absDx > absDy) {
        handleDirectionChange(dx > 0 ? 'RIGHT' : 'LEFT');
      } else {
        handleDirectionChange(dy > 0 ? 'DOWN' : 'UP');
      }
    }
    touchStartRef.current = null;
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 max-w-xl mx-auto text-slate-100 select-none">
      {/* Header Bar */}
      <div className="w-full flex items-center justify-between bg-[#111927] border border-cyan-500/20 rounded-xl p-4 mb-4 shadow-lg">
        <div>
          <h2 className="text-xl font-bold font-display text-cyan-400 flex items-center gap-2">
            SNAKE
          </h2>
          <p className="text-xs text-slate-400">Arrows / WASD / Swipe to move</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-slate-400 uppercase tracking-wider">Score</div>
            <div className="text-xl font-bold text-cyan-300 font-mono">{score}</div>
          </div>
          <div className="text-right border-l border-slate-700 pl-4">
            <div className="text-xs text-slate-400 uppercase tracking-wider">High Score</div>
            <div className="text-xl font-bold text-amber-400 font-mono">{highScore}</div>
          </div>

          <button
            onClick={handleToggleMute}
            aria-label={muted ? 'Unmute Sound' : 'Mute Sound'}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-all cursor-pointer"
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-cyan-400" />}
          </button>
        </div>
      </div>

      {/* Canvas Game Box */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative rounded-2xl overflow-hidden border-2 border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.15)] bg-[#090d16] touch-none"
      >
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="w-[290px] h-[290px] sm:w-[360px] sm:h-[360px] md:w-[400px] md:h-[400px] block"
        />

        {/* Start / Pause / Overlay */}
        {(!isPlaying || isPaused || gameOver) && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10">
            {gameOver ? (
              <>
                <h3 className="text-3xl font-extrabold text-rose-500 font-display mb-2">GAME OVER</h3>
                <p className="text-slate-300 mb-1">Final Score: <span className="font-mono text-cyan-400 font-bold">{score}</span></p>
                {isNewHigh && (
                  <p className="text-amber-400 text-sm font-bold animate-pulse mb-4">★ NEW HIGH SCORE! ★</p>
                )}
                <button
                  onClick={startGame}
                  className="mt-3 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_#06b6d4] cursor-pointer"
                >
                  <RotateCcw className="w-5 h-5" /> Play Again
                </button>
              </>
            ) : isPaused ? (
              <>
                <h3 className="text-3xl font-extrabold text-amber-400 font-display mb-4">PAUSED</h3>
                <button
                  onClick={() => setIsPaused(false)}
                  className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_#06b6d4] cursor-pointer"
                >
                  <Play className="w-5 h-5" /> Resume
                </button>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-cyan-300 font-display mb-2">READY TO SLITHER?</h3>
                <p className="text-slate-400 text-sm mb-6 max-w-xs">
                  Eat food to grow. Avoid crashing into walls or yourself!
                </p>
                <button
                  onClick={startGame}
                  className="px-8 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-lg flex items-center gap-2 transition-all shadow-[0_0_20px_#06b6d4] cursor-pointer"
                >
                  <Play className="w-6 h-6 fill-current" /> START GAME
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Touch D-Pad Controls for Mobile & Tablets */}
      <div className="mt-6 flex flex-col items-center gap-2">
        <button
          onClick={() => handleDirectionChange('UP')}
          aria-label="Move Up"
          className="p-4 bg-slate-800 active:bg-cyan-500/40 rounded-xl border border-slate-700 text-cyan-400 shadow-md min-w-[56px] min-h-[56px] flex items-center justify-center cursor-pointer"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
        <div className="flex gap-4">
          <button
            onClick={() => handleDirectionChange('LEFT')}
            aria-label="Move Left"
            className="p-4 bg-slate-800 active:bg-cyan-500/40 rounded-xl border border-slate-700 text-cyan-400 shadow-md min-w-[56px] min-h-[56px] flex items-center justify-center cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => handleDirectionChange('DOWN')}
            aria-label="Move Down"
            className="p-4 bg-slate-800 active:bg-cyan-500/40 rounded-xl border border-slate-700 text-cyan-400 shadow-md min-w-[56px] min-h-[56px] flex items-center justify-center cursor-pointer"
          >
            <ArrowDown className="w-6 h-6" />
          </button>
          <button
            onClick={() => handleDirectionChange('RIGHT')}
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
