'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, ArrowUp, ArrowLeft, ArrowRight, Zap } from 'lucide-react';
import { playLaserSound, playHitSound, playScoreSound, playClearSound, toggleSound, getIsMuted } from '@/lib/games/sound';
import { getHighScore, saveHighScore } from '@/lib/games/scores';

interface Asteroid {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  points: number;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

export function AsteroidsGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [highScore, setHighScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [muted, setMuted] = useState(false);

  const keysRef = useRef<{ [key: string]: boolean }>({});
  const gameStateRef = useRef({
    shipX: 300,
    shipY: 200,
    shipAngle: 0,
    shipVx: 0,
    shipVy: 0,
    asteroids: [] as Asteroid[],
    bullets: [] as Bullet[],
  });

  useEffect(() => {
    setHighScore(getHighScore('asteroids'));
    setMuted(getIsMuted());
  }, []);

  const spawnAsteroid = (x?: number, y?: number, radius = 35): Asteroid => {
    const canvasWidth = 600;
    const canvasHeight = 400;
    const spawnX = x ?? (Math.random() < 0.5 ? 0 : canvasWidth);
    const spawnY = y ?? (Math.random() < 0.5 ? 0 : canvasHeight);
    const speed = 1 + Math.random() * 2;
    const angle = Math.random() * Math.PI * 2;

    return {
      x: spawnX,
      y: spawnY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius,
      points: radius > 25 ? 20 : radius > 15 ? 50 : 100,
    };
  };

  const startGame = () => {
    const initialAsteroids: Asteroid[] = [];
    for (let i = 0; i < 4; i++) {
      initialAsteroids.push(spawnAsteroid());
    }

    gameStateRef.current = {
      shipX: 300,
      shipY: 200,
      shipAngle: -Math.PI / 2,
      shipVx: 0,
      shipVy: 0,
      asteroids: initialAsteroids,
      bullets: [],
    };
    setScore(0);
    setLives(3);
    setGameOver(false);
    setIsPlaying(true);
  };

  // Input Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;

      // Shoot laser on Space
      if (e.code === 'Space' && isPlaying && !gameOver) {
        e.preventDefault();
        const state = gameStateRef.current;
        const speed = 7;
        state.bullets.push({
          x: state.shipX + Math.cos(state.shipAngle) * 15,
          y: state.shipY + Math.sin(state.shipAngle) * 15,
          vx: state.shipVx + Math.cos(state.shipAngle) * speed,
          vy: state.shipVy + Math.sin(state.shipAngle) * speed,
          life: 40,
        });
        playLaserSound();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying, gameOver]);

  // Main Loop
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    let animId: number;
    const canvasWidth = 600;
    const canvasHeight = 400;

    const update = () => {
      const state = gameStateRef.current;

      // Rotate Ship
      if (keysRef.current['ArrowLeft'] || keysRef.current['KeyA']) {
        state.shipAngle -= 0.08;
      }
      if (keysRef.current['ArrowRight'] || keysRef.current['KeyD']) {
        state.shipAngle += 0.08;
      }

      // Thrust
      if (keysRef.current['ArrowUp'] || keysRef.current['KeyW']) {
        state.shipVx += Math.cos(state.shipAngle) * 0.15;
        state.shipVy += Math.sin(state.shipAngle) * 0.15;
      }

      // Drag
      state.shipVx *= 0.985;
      state.shipVy *= 0.985;

      state.shipX = (state.shipX + state.shipVx + canvasWidth) % canvasWidth;
      state.shipY = (state.shipY + state.shipVy + canvasHeight) % canvasHeight;

      // Move Bullets
      state.bullets.forEach(b => {
        b.x = (b.x + b.vx + canvasWidth) % canvasWidth;
        b.y = (b.y + b.vy + canvasHeight) % canvasHeight;
        b.life -= 1;
      });
      state.bullets = state.bullets.filter(b => b.life > 0);

      // Move Asteroids
      state.asteroids.forEach(a => {
        a.x = (a.x + a.vx + canvasWidth) % canvasWidth;
        a.y = (a.y + a.vy + canvasHeight) % canvasHeight;
      });

      // Bullet-Asteroid Collisions
      const newAsteroids: Asteroid[] = [];
      state.bullets.forEach((bullet, bIdx) => {
        state.asteroids.forEach((ast, aIdx) => {
          const dist = Math.hypot(bullet.x - ast.x, bullet.y - ast.y);
          if (dist < ast.radius) {
            bullet.life = 0; // Destroy bullet
            playScoreSound();

            setScore(s => {
              const newS = s + ast.points;
              return newS;
            });

            // Split asteroid if large enough
            if (ast.radius > 18) {
              newAsteroids.push(spawnAsteroid(ast.x, ast.y, ast.radius / 1.8));
              newAsteroids.push(spawnAsteroid(ast.x, ast.y, ast.radius / 1.8));
            }
            ast.radius = 0; // Mark for removal
          }
        });
      });

      state.asteroids = state.asteroids.filter(a => a.radius > 0).concat(newAsteroids);

      // Respawn asteroids if empty
      if (state.asteroids.length === 0) {
        playClearSound();
        for (let i = 0; i < 5; i++) {
          state.asteroids.push(spawnAsteroid());
        }
      }

      // Ship-Asteroid Collisions
      state.asteroids.forEach(ast => {
        const dist = Math.hypot(state.shipX - ast.x, state.shipY - ast.y);
        if (dist < ast.radius + 10) {
          playHitSound();
          setLives(l => {
            const nextL = l - 1;
            if (nextL <= 0) {
              setGameOver(true);
              setIsPlaying(false);
              setScore(finalScore => {
                saveHighScore('asteroids', finalScore);
                setHighScore(getHighScore('asteroids'));
                return finalScore;
              });
            } else {
              // Reset Ship position
              state.shipX = canvasWidth / 2;
              state.shipY = canvasHeight / 2;
              state.shipVx = 0;
              state.shipVy = 0;
            }
            return nextL;
          });
        }
      });

      // Draw
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#090d16';
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);

          // Draw Bullets
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#06b6d4';
          ctx.fillStyle = '#22d3ee';
          state.bullets.forEach(b => {
            ctx.beginPath();
            ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
            ctx.fill();
          });

          // Draw Asteroids
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#ec4899';
          ctx.strokeStyle = '#f472b6';
          ctx.lineWidth = 2;
          state.asteroids.forEach(a => {
            ctx.beginPath();
            ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
            ctx.stroke();
          });

          // Draw Ship (Triangle)
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#facc15';
          ctx.strokeStyle = '#fde047';
          ctx.fillStyle = '#1e293b';
          ctx.lineWidth = 2.5;

          ctx.save();
          ctx.translate(state.shipX, state.shipY);
          ctx.rotate(state.shipAngle);
          ctx.beginPath();
          ctx.moveTo(15, 0);
          ctx.lineTo(-10, -10);
          ctx.lineTo(-6, 0);
          ctx.lineTo(-10, 10);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.restore();

          ctx.shadowBlur = 0;
        }
      }

      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, gameOver]);

  const handleRotateLeft = () => {
    const state = gameStateRef.current;
    state.shipAngle -= 0.3;
  };

  const handleRotateRight = () => {
    const state = gameStateRef.current;
    state.shipAngle += 0.3;
  };

  const handleThrust = () => {
    const state = gameStateRef.current;
    state.shipVx += Math.cos(state.shipAngle) * 1.5;
    state.shipVy += Math.sin(state.shipAngle) * 1.5;
  };

  const handleFire = () => {
    if (!isPlaying || gameOver) return;
    const state = gameStateRef.current;
    state.bullets.push({
      x: state.shipX + Math.cos(state.shipAngle) * 15,
      y: state.shipY + Math.sin(state.shipAngle) * 15,
      vx: state.shipVx + Math.cos(state.shipAngle) * 7,
      vy: state.shipVy + Math.sin(state.shipAngle) * 7,
      life: 40,
    });
    playLaserSound();
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 max-w-2xl mx-auto text-slate-100 select-none">
      {/* Header */}
      <div className="w-full flex items-center justify-between bg-[#111927] border border-cyan-500/20 rounded-xl p-4 mb-4 shadow-lg">
        <div>
          <h2 className="text-xl font-bold font-display text-cyan-400">SPACE BLASTER</h2>
          <p className="text-xs text-slate-400">Rotate (A/D) | Thrust (W) | Fire (Space / Touch)</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-slate-400 uppercase">Score</div>
            <div className="text-xl font-bold font-mono text-cyan-300">{score}</div>
          </div>
          <div className="text-right border-l border-slate-700 pl-4">
            <div className="text-xs text-slate-400 uppercase">High Score</div>
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

      {/* Lives bar */}
      <div className="w-full flex justify-between items-center mb-2 px-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold uppercase">Shields:</span>
          {Array.from({ length: lives }).map((_, i) => (
            <span key={i} className="text-amber-400 text-lg">🚀</span>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div className="relative rounded-2xl overflow-hidden border-2 border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.15)] bg-[#090d16] touch-none">
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="w-[290px] h-[195px] sm:w-[450px] sm:h-[300px] md:w-[600px] md:h-[400px] block"
        />

        {(!isPlaying || gameOver) && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
            {gameOver ? (
              <>
                <h3 className="text-3xl font-extrabold text-rose-500 font-display mb-2">SHIP DESTROYED</h3>
                <p className="text-slate-300 mb-4">Final Score: <span className="font-mono text-cyan-400 font-bold">{score}</span></p>
                <button
                  onClick={startGame}
                  className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_#06b6d4] cursor-pointer"
                >
                  <RotateCcw className="w-5 h-5" /> Launch Again
                </button>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-cyan-300 font-display mb-2">ASTEROIDS DEFENCE</h3>
                <p className="text-slate-400 text-xs mb-6 max-w-xs">Blast retro space asteroids into cosmic dust!</p>
                <button
                  onClick={startGame}
                  className="px-8 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-lg flex items-center gap-2 transition-all shadow-[0_0_20px_#06b6d4] cursor-pointer"
                >
                  <Play className="w-6 h-6 fill-current" /> LAUNCH MISSION
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Tablet Touch Controls */}
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <button
          onClick={handleRotateLeft}
          aria-label="Rotate Left"
          className="p-3.5 bg-slate-800 active:bg-cyan-500/40 rounded-xl border border-slate-700 text-cyan-400 font-bold flex items-center gap-1 shadow-md cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" /> Rotate
        </button>

        <button
          onClick={handleThrust}
          aria-label="Thrust Ship"
          className="px-5 py-3.5 bg-slate-800 active:bg-cyan-500/40 rounded-xl border border-slate-700 text-amber-400 font-bold flex items-center gap-1 shadow-md cursor-pointer"
        >
          <ArrowUp className="w-5 h-5" /> Thrust
        </button>

        <button
          onClick={handleRotateRight}
          aria-label="Rotate Right"
          className="p-3.5 bg-slate-800 active:bg-cyan-500/40 rounded-xl border border-slate-700 text-cyan-400 font-bold flex items-center gap-1 shadow-md cursor-pointer"
        >
          Rotate <ArrowRight className="w-5 h-5" />
        </button>

        <button
          onClick={handleFire}
          aria-label="Fire Laser"
          className="px-6 py-3.5 bg-rose-500 hover:bg-rose-400 active:scale-95 text-white font-extrabold rounded-xl shadow-[0_0_12px_#f43f5e] flex items-center gap-1.5 cursor-pointer"
        >
          <Zap className="w-5 h-5 fill-current" /> FIRE LASER
        </button>
      </div>
    </div>
  );
}
