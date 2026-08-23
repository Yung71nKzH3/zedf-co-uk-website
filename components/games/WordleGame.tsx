'use client';

import React, { useState, useEffect } from 'react';
import { RotateCcw, Volume2, VolumeX, Delete, Check } from 'lucide-react';
import { playScoreSound, playClearSound, playHitSound, playPowerupSound, toggleSound, getIsMuted } from '@/lib/games/sound';
import { getHighScore, saveHighScore } from '@/lib/games/scores';

const WORD_BANK = [
  'CYBER', 'ROBOT', 'MODEL', 'LOGIC', 'PIXEL', 'STACK', 'ARRAY', 'REACT', 'GRAPH', 'INDEX',
  'SHELL', 'TOKEN', 'BYTES', 'CLASH', 'GAMES', 'POWER', 'SMART', 'CLOUD', 'SUPER', 'SPACE'
];

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DELETE'],
];

type KeyStatus = 'correct' | 'present' | 'absent' | 'unused';

export function WordleGame() {
  const [targetWord, setTargetWord] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameWon, setGameWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState('');
  const [keyStatuses, setKeyStatuses] = useState<Record<string, KeyStatus>>({});
  const [highScore, setHighScore] = useState(0);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setHighScore(getHighScore('wordle'));
    setMuted(getIsMuted());
    initGame();
  }, []);

  const initGame = () => {
    const randomWord = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
    setTargetWord(randomWord);
    setGuesses([]);
    setCurrentGuess('');
    setGameWon(false);
    setGameOver(false);
    setMessage('');
    setKeyStatuses({});
  };

  const handleKeyPress = (key: string) => {
    if (gameOver) return;

    if (key === 'ENTER') {
      if (currentGuess.length !== 5) {
        setMessage('Word must be 5 letters!');
        playHitSound();
        return;
      }

      const newGuesses = [...guesses, currentGuess];
      setGuesses(newGuesses);

      // Evaluate letter statuses for QWERTY keyboard
      const newKeyStatuses = { ...keyStatuses };
      currentGuess.split('').forEach((letter, idx) => {
        if (targetWord[idx] === letter) {
          newKeyStatuses[letter] = 'correct';
        } else if (targetWord.includes(letter) && newKeyStatuses[letter] !== 'correct') {
          newKeyStatuses[letter] = 'present';
        } else if (!targetWord.includes(letter)) {
          newKeyStatuses[letter] = 'absent';
        }
      });
      setKeyStatuses(newKeyStatuses);

      if (currentGuess === targetWord) {
        playClearSound();
        setGameWon(true);
        setGameOver(true);
        setMessage(`★ EXCELLENT! Word: ${targetWord} ★`);
        const scoreCalc = Math.max(10, 600 - newGuesses.length * 80);
        saveHighScore('wordle', scoreCalc);
        setHighScore(getHighScore('wordle'));
      } else if (newGuesses.length >= 6) {
        playHitSound();
        setGameOver(true);
        setMessage(`Game Over! The word was ${targetWord}.`);
      } else {
        playScoreSound();
        setMessage('');
      }

      setCurrentGuess('');
    } else if (key === 'DELETE' || key === 'BACKSPACE') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
      setCurrentGuess(prev => prev + key);
      playPowerupSound();
    }
  };

  // Keyboard Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleKeyPress('ENTER');
      } else if (e.key === 'Backspace') {
        handleKeyPress('DELETE');
      } else {
        const letter = e.key.toUpperCase();
        if (/^[A-Z]$/.test(letter)) {
          handleKeyPress(letter);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentGuess, guesses, gameOver, targetWord]);

  return (
    <div className="flex flex-col items-center justify-center p-4 max-w-xl mx-auto text-slate-100 select-none font-sans">
      {/* Header */}
      <div className="w-full flex items-center justify-between bg-[#111927] border border-cyan-500/20 rounded-xl p-4 mb-4 shadow-lg">
        <div>
          <h2 className="text-xl font-bold font-display text-cyan-400">WORDLE</h2>
          <p className="text-xs text-slate-400">Guess the 5-letter CS & tech word in 6 tries</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-slate-400 uppercase">Guesses</div>
            <div className="text-xl font-bold font-mono text-cyan-300">{guesses.length} / 6</div>
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
      <div className="w-full flex justify-between items-center mb-4">
        <span className="text-xs font-bold text-amber-300 font-display">
          {message || 'Type letters and press Enter'}
        </span>

        <button
          onClick={initGame}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold transition-all shadow-[0_0_12px_#06b6d4] cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" /> New Word
        </button>
      </div>

      {/* 6x5 Word Grid */}
      <div className="flex flex-col gap-2 mb-6">
        {Array.from({ length: 6 }).map((_, rIdx) => {
          const guess = guesses[rIdx] || (rIdx === guesses.length ? currentGuess : '');
          const isSubmitted = rIdx < guesses.length;

          return (
            <div key={rIdx} className="flex gap-2">
              {Array.from({ length: 5 }).map((_, cIdx) => {
                const char = guess[cIdx] || '';
                let bgColor = 'bg-[#111927] border-slate-800';

                if (isSubmitted) {
                  if (targetWord[cIdx] === char) {
                    bgColor = 'bg-emerald-600 border-emerald-400 text-white font-extrabold shadow-[0_0_12px_#10b981]';
                  } else if (targetWord.includes(char)) {
                    bgColor = 'bg-amber-500 border-amber-300 text-slate-950 font-extrabold shadow-[0_0_12px_#facc15]';
                  } else {
                    bgColor = 'bg-slate-800 border-slate-700 text-slate-400';
                  }
                } else if (char) {
                  bgColor = 'bg-[#1e293b] border-cyan-400 text-cyan-300 font-bold scale-105';
                }

                return (
                  <div
                    key={cIdx}
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 flex items-center justify-center font-mono text-xl sm:text-2xl uppercase transition-all duration-300 ${bgColor}`}
                  >
                    {char}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* QWERTY Touch Keyboard */}
      <div className="w-full flex flex-col items-center gap-1.5 max-w-md">
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex gap-1 justify-center w-full">
            {row.map(key => {
              const status = keyStatuses[key];
              let keyStyle = 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700';

              if (status === 'correct') {
                keyStyle = 'bg-emerald-600 border-emerald-400 text-white font-bold';
              } else if (status === 'present') {
                keyStyle = 'bg-amber-500 border-amber-300 text-slate-950 font-bold';
              } else if (status === 'absent') {
                keyStyle = 'bg-slate-900 border-slate-800 text-slate-600';
              }

              const isWide = key === 'ENTER' || key === 'DELETE';

              return (
                <button
                  key={key}
                  onClick={() => handleKeyPress(key)}
                  className={`h-11 rounded-lg border text-xs sm:text-sm font-mono font-bold flex items-center justify-center transition-all cursor-pointer ${isWide ? 'px-3 sm:px-4 bg-cyan-600 border-cyan-400 text-white' : 'w-8 sm:w-10'
                    } ${keyStyle}`}
                >
                  {key === 'DELETE' ? <Delete className="w-4 h-4" /> : key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
