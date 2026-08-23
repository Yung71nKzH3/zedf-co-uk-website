'use client';

import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Volume2, VolumeX, Keyboard, Zap, Award } from 'lucide-react';
import { playScoreSound, playClearSound, playHitSound, toggleSound, getIsMuted } from '@/lib/games/sound';
import { getHighScore, saveHighScore } from '@/lib/games/scores';

const TEXT_SAMPLES = [
  "def train_model(X, y):\n    model = LinearRegression()\n    return model.fit(X, y)",
  "const navigate = useRouter();\nuseEffect(() => {\n    fetchData();\n}, []);",
  "Data science combines domain expertise, programming skills, and knowledge of mathematics and statistics.",
  "import numpy as np\nimport pandas as pd\nimport torch\nimport tensorflow as font",
  "Optimization is the key to efficient software engineering and machine learning pipelines.",
  "Binary search runs in logarithmic O(log n) time complexity.",
  "Deep neural networks transform inputs through multiple hidden representation layers.",
];

export function SpeedTyperGame() {
  const [targetText, setTargetText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [muted, setMuted] = useState(false);

  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setHighScore(getHighScore('typer'));
    setMuted(getIsMuted());
    resetGame();
  }, []);

  const resetGame = () => {
    const randomText = TEXT_SAMPLES[Math.floor(Math.random() * TEXT_SAMPLES.length)];
    setTargetText(randomText);
    setUserInput('');
    setStartTime(null);
    setWpm(0);
    setAccuracy(100);
    setTimeLeft(30);
    setIsPlaying(false);
    setGameOver(false);
  };

  const startGame = () => {
    resetGame();
    setIsPlaying(true);
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 50);
  };

  // Timer countdown
  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;
    if (isPlaying && startTime && timeLeft > 0 && !gameOver) {
      timerId = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            endGame();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isPlaying, startTime, timeLeft, gameOver]);

  const endGame = () => {
    setGameOver(true);
    setIsPlaying(false);
    playClearSound();

    setWpm(finalWpm => {
      saveHighScore('typer', finalWpm);
      setHighScore(getHighScore('typer'));
      return finalWpm;
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (gameOver) return;

    const val = e.target.value;
    if (!startTime) {
      setStartTime(Date.now());
      setIsPlaying(true);
    }

    setUserInput(val);

    // Calculate accuracy & WPM
    let correctChars = 0;
    for (let i = 0; i < val.length; i++) {
      if (val[i] === targetText[i]) {
        correctChars++;
      }
    }

    const acc = val.length > 0 ? Math.round((correctChars / val.length) * 100) : 100;
    setAccuracy(acc);

    if (val.length > 0 && val[val.length - 1] === targetText[val.length - 1]) {
      playScoreSound();
    } else if (val.length > 0) {
      playHitSound();
    }

    const minutes = (30 - timeLeft) / 60 || 0.1 / 60;
    const words = correctChars / 5;
    const currentWpm = Math.round(words / minutes);
    setWpm(currentWpm);

    // Check completion
    if (val === targetText) {
      endGame();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 max-w-xl mx-auto text-slate-100">
      {/* Header */}
      <div className="w-full flex items-center justify-between bg-[#111927] border border-cyan-500/20 rounded-xl p-4 mb-4 shadow-lg">
        <div>
          <h2 className="text-xl font-bold font-display text-cyan-400">SPEED TYPER</h2>
          <p className="text-xs text-slate-400">Type the CS text as fast and accurately as possible</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-slate-400 uppercase">WPM</div>
            <div className="text-xl font-bold font-mono text-cyan-300">{wpm}</div>
          </div>
          <div className="text-right border-l border-slate-700 pl-4">
            <div className="text-xs text-slate-400 uppercase">Best WPM</div>
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

      {/* Metrics Bar */}
      <div className="w-full flex justify-between gap-3 mb-4">
        <div className="flex gap-4 text-sm font-bold">
          <span className="text-slate-400">Accuracy: <span className="text-emerald-400 font-mono">{accuracy}%</span></span>
          <span className="text-slate-400">Time Left: <span className="text-amber-400 font-mono">{timeLeft}s</span></span>
        </div>

        <button
          onClick={startGame}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-extrabold transition-all shadow-[0_0_12px_#06b6d4] cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" /> New Passage
        </button>
      </div>

      {/* Typer Box */}
      <div className="relative w-full bg-[#090d16] border-2 border-cyan-500/30 rounded-2xl p-6 shadow-[0_0_25px_rgba(6,182,212,0.15)] flex flex-col gap-4">
        {/* Target Text snippet with color highlights */}
        <div className="bg-[#111927] border border-slate-800 rounded-xl p-4 font-mono text-sm leading-relaxed min-h-[90px] whitespace-pre-wrap select-none">
          {targetText.split('').map((char, index) => {
            let color = 'text-slate-500';
            if (index < userInput.length) {
              color = userInput[index] === char ? 'text-cyan-300 bg-cyan-950/50' : 'text-rose-400 bg-rose-950/50 font-bold';
            }
            return (
              <span key={index} className={color}>
                {char}
              </span>
            );
          })}
        </div>

        {/* Input Textarea */}
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={userInput}
          onChange={handleInputChange}
          disabled={gameOver}
          placeholder="Tap here to start typing on your tablet or keyboard..."
          aria-label="Speed Typer Input"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          rows={3}
          className="w-full bg-[#1e293b]/60 border border-cyan-500/40 rounded-xl p-4 font-mono text-sm text-cyan-200 focus:outline-none focus:border-cyan-400 resize-none transition-all shadow-inner"
        />

        {/* Overlay */}
        {gameOver && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center z-20">
            <h3 className="text-3xl font-extrabold text-amber-400 font-display mb-2">
              TIME'S UP!
            </h3>
            <p className="text-slate-300 mb-1">Typing Speed: <span className="font-mono text-cyan-400 font-bold text-2xl">{wpm} WPM</span></p>
            <p className="text-slate-300 mb-4">Accuracy: <span className="font-mono text-emerald-400 font-bold">{accuracy}%</span></p>
            <button
              onClick={startGame}
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
