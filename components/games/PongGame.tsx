'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Users, User } from 'lucide-react';
import { playHitSound, playScoreSound, playPowerupSound, toggleSound, getIsMuted } from '@/lib/games/sound';
import { getHighScore, saveHighScore } from '@/lib/games/scores';

type GameMode = '1P_EASY' | '1P_MEDIUM' | '1P_HARD' | '2P';

export function PongGame() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<GameMode>('1P_MEDIUM');
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);

  const gameStateRef = useRef({
    p1Y: 160,
    p2Y: 160,
    ballX: 300,
    ballY: 200,
    ballVx: 4,
    ballVy: 3,
    paddleHeight: 80,
    paddleWidth: 10,
  });

  const keysRef = useRef<{ [key: string]: boolean }>({});

  useEffect(() => {
    setHighScore(getHighScore('pong'));
    setMuted(getIsMuted());
  }, []);

  const startGame = () => {
    gameStateRef.current = {
      p1Y: 160,
      p2Y: 160,
      ballX: 300,
      ballY: 200,
      ballVx: Math.random() > 0.5 ? 4 : -4,
      ballVy: (Math.random() - 0.5) * 6,
      paddleHeight: 80,
      paddleWidth: 10,
    };
    setScore1(0);
    setScore2(0);
    setGameOver(false);
    setWinner(null);
    setIsPlaying(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
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
  }, []);

  // Main Loop
  useEffect(() => {
    if (!isPlaying || gameOver) return;

    let animId: number;

    const update = () => {
      const state = gameStateRef.current;
      const canvasHeight = 400;
      const canvasWidth = 600;
      const paddleSpeed = 6;

      // P1 Controls (W/S or Up/Down if 1P)
      if (keysRef.current['KeyW'] || keysRef.current['ArrowUp']) {
        state.p1Y = Math.max(0, state.p1Y - paddleSpeed);
      }
      if (keysRef.current['KeyS'] || keysRef.current['ArrowDown']) {
        state.p1Y = Math.min(canvasHeight - state.paddleHeight, state.p1Y + paddleSpeed);
      }

      // P2 Controls / AI
      if (mode === '2P') {
        if (keysRef.current['KeyI']) state.p2Y = Math.max(0, state.p2Y - paddleSpeed);
        if (keysRef.current['KeyK']) state.p2Y = Math.min(canvasHeight - state.paddleHeight, state.p2Y + paddleSpeed);
      } else {
        // AI Logic
        const aiSpeed = mode === '1P_EASY' ? 2.5 : mode === '1P_MEDIUM' ? 4 : 5.5;
        const targetY = state.ballY - state.paddleHeight / 2;
        if (state.p2Y < targetY - 10) {
          state.p2Y = Math.min(canvasHeight - state.paddleHeight, state.p2Y + aiSpeed);
        } else if (state.p2Y > targetY + 10) {
          state.p2Y = Math.max(0, state.p2Y - aiSpeed);
        }
      }

      // Ball Movement
      state.ballX += state.ballVx;
      state.ballY += state.ballVy;

      // Top / Bottom Bounces
      if (state.ballY - 6 <= 0 || state.ballY + 6 >= canvasHeight) {
        state.ballVy *= -1;
        playHitSound();
      }

      // Paddle 1 Collision
      if (
        state.ballX - 6 <= 20 + state.paddleWidth &&
        state.ballY >= state.p1Y &&
        state.ballY <= state.p1Y + state.paddleHeight
      ) {
        state.ballVx = Math.abs(state.ballVx) * 1.05; // speed up
        const deltaY = state.ballY - (state.p1Y + state.paddleHeight / 2);
        state.ballVy = deltaY * 0.15;
        state.ballX = 20 + state.paddleWidth + 6;
        playPowerupSound();
      }

      // Paddle 2 Collision
      if (
        state.ballX + 6 >= canvasWidth - 20 - state.paddleWidth &&
        state.ballY >= state.p2Y &&
        state.ballY <= state.p2Y + state.paddleHeight
      ) {
        state.ballVx = -Math.abs(state.ballVx) * 1.05;
        const deltaY = state.ballY - (state.p2Y + state.paddleHeight / 2);
        state.ballVy = deltaY * 0.15;
        state.ballX = canvasWidth - 20 - state.paddleWidth - 6;
        playPowerupSound();
      }

      // Scoring
      if (state.ballX < 0) {
        playScoreSound();
        setScore2(s => {
          const nextS = s + 1;
          if (nextS >= 7) {
            setWinner(mode === '2P' ? 'PLAYER 2' : 'AI COMPUTER');
            setGameOver(true);
            setIsPlaying(false);
          }
          return nextS;
        });
        // Reset Ball
        state.ballX = canvasWidth / 2;
        state.ballY = canvasHeight / 2;
        state.ballVx = 4;
        state.ballVy = (Math.random() - 0.5) * 6;
      }

      if (state.ballX > canvasWidth) {
        playScoreSound();
        setScore1(s => {
          const nextS = s + 1;
          if (nextS >= 7) {
            setWinner('PLAYER 1');
            setGameOver(true);
            setIsPlaying(false);
            if (mode !== '2P') {
              saveHighScore('pong', nextS * 100);
              setHighScore(getHighScore('pong'));
            }
          }
          return nextS;
        });
        // Reset Ball
        state.ballX = canvasWidth / 2;
        state.ballY = canvasHeight / 2;
        state.ballVx = -4;
        state.ballVy = (Math.random() - 0.5) * 6;
      }

      // Draw
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#090d16';
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);

          // Center Net Line
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 4;
          ctx.setLineDash([10, 10]);
          ctx.beginPath();
          ctx.moveTo(canvasWidth / 2, 0);
          ctx.lineTo(canvasWidth / 2, canvasHeight);
          ctx.stroke();
          ctx.setLineDash([]);

          // Draw Paddles
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#06b6d4';
          ctx.fillStyle = '#22d3ee';
          ctx.fillRect(20, state.p1Y, state.paddleWidth, state.paddleHeight);

          ctx.shadowColor = '#ec4899';
          ctx.fillStyle = '#f472b6';
          ctx.fillRect(canvasWidth - 20 - state.paddleWidth, state.p2Y, state.paddleWidth, state.paddleHeight);

          // Draw Ball
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#facc15';
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(state.ballX, state.ballY, 7, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, gameOver, mode]);

  const handleTouchMove = (e: React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const touchY = e.touches[0].clientY - rect.top;
    const scale = 400 / rect.height;
    const canvasY = touchY * scale;

    const state = gameStateRef.current;
    state.p1Y = Math.max(0, Math.min(400 - state.paddleHeight, canvasY - state.paddleHeight / 2));
  };

  const moveP1Up = () => {
    const state = gameStateRef.current;
    state.p1Y = Math.max(0, state.p1Y - 30);
  };

  const moveP1Down = () => {
    const state = gameStateRef.current;
    state.p1Y = Math.min(400 - state.paddleHeight, state.p1Y + 30);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 max-w-2xl mx-auto text-slate-100 select-none">
      {/* Header */}
      <div className="w-full flex items-center justify-between bg-[#111927] border border-cyan-500/20 rounded-xl p-4 mb-4 shadow-lg">
        <div>
          <h2 className="text-xl font-bold font-display text-cyan-400">PONG</h2>
          <p className="text-xs text-slate-400">P1: Touch drag / W/S / Arrows</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-slate-400 uppercase">P1 vs P2</div>
            <div className="text-xl font-bold font-mono text-cyan-400">{score1} : {score2}</div>
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

      {/* Mode Selector */}
      {!isPlaying && (
        <div className="flex flex-wrap gap-2 mb-4 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 justify-center">
          <button
            onClick={() => setMode('1P_EASY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === '1P_EASY' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
          >
            VS AI (EASY)
          </button>
          <button
            onClick={() => setMode('1P_MEDIUM')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === '1P_MEDIUM' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
          >
            VS AI (MEDIUM)
          </button>
          <button
            onClick={() => setMode('1P_HARD')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === '1P_HARD' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
          >
            VS AI (HARD)
          </button>
          <button
            onClick={() => setMode('2P')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${mode === '2P' ? 'bg-pink-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
          >
            2 PLAYER (I/K)
          </button>
        </div>
      )}

      {/* Canvas */}
      <div
        onTouchMove={handleTouchMove}
        className="relative rounded-2xl overflow-hidden border-2 border-cyan-500/30 shadow-[0_0_25px_rgba(6,182,212,0.15)] bg-[#090d16] touch-none"
      >
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
                <h3 className="text-3xl font-extrabold text-amber-400 font-display mb-2">{winner} VICTORIOUS!</h3>
                <p className="text-slate-300 mb-4">Final Score: <span className="font-mono text-cyan-400 font-bold">{score1} - {score2}</span></p>
                <button
                  onClick={startGame}
                  className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_#06b6d4] cursor-pointer"
                >
                  <RotateCcw className="w-5 h-5" /> Play Again
                </button>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-cyan-300 font-display mb-2">RETRO PONG CLASH</h3>
                <p className="text-slate-400 text-xs mb-6 max-w-xs">Deflect the cyber ball and score points against your opponent.</p>
                <button
                  onClick={startGame}
                  className="px-8 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-lg flex items-center gap-2 transition-all shadow-[0_0_20px_#06b6d4] cursor-pointer"
                >
                  <Play className="w-6 h-6 fill-current" /> SERVE BALL
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Touch Buttons for Tablet Paddles */}
      <div className="mt-4 flex gap-4">
        <button
          onClick={moveP1Up}
          aria-label="Paddle Up"
          className="px-6 py-3.5 bg-slate-800 active:bg-cyan-500/40 rounded-xl border border-slate-700 text-cyan-400 font-bold flex items-center gap-2 shadow-md cursor-pointer"
        >
          Paddle Up ▲
        </button>
        <button
          onClick={moveP1Down}
          aria-label="Paddle Down"
          className="px-6 py-3.5 bg-slate-800 active:bg-cyan-500/40 rounded-xl border border-slate-700 text-cyan-400 font-bold flex items-center gap-2 shadow-md cursor-pointer"
        >
          Paddle Down ▼
        </button>
      </div>
    </div>
  );
}
