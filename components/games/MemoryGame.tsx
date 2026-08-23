'use client';

import React, { useState, useEffect } from 'react';
import { RotateCcw, Volume2, VolumeX, Sparkles, Clock, Award } from 'lucide-react';
import { playScoreSound, playClearSound, playPowerupSound, toggleSound, getIsMuted } from '@/lib/games/sound';
import { getHighScore, saveHighScore } from '@/lib/games/scores';

const ICONS = ['🚀', '⚡', '🎮', '👾', '💻', '🔮', '🤖', '🛰️'];

interface Card {
  id: number;
  icon: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export function MemoryGame() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setHighScore(getHighScore('memory'));
    setMuted(getIsMuted());
    initGame();
  }, []);

  // Timer
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
    const deck = [...ICONS, ...ICONS]
      .sort(() => Math.random() - 0.5)
      .map((icon, index) => ({
        id: index,
        icon,
        isFlipped: false,
        isMatched: false,
      }));

    setCards(deck);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setTimer(0);
    setGameWon(false);
    setIsPlaying(true);
  };

  const handleCardClick = (id: number) => {
    if (flippedCards.length >= 2) return;
    const clickedCard = cards.find(c => c.id === id);
    if (!clickedCard || clickedCard.isFlipped || clickedCard.isMatched) return;

    playPowerupSound();

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    // Flip card visually
    setCards(prev => prev.map(c => (c.id === id ? { ...c, isFlipped: true } : c)));

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === secondId);

      if (firstCard && secondCard && firstCard.icon === secondCard.icon) {
        // Match!
        playScoreSound();
        setCards(prev =>
          prev.map(c =>
            c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c
          )
        );
        setMatches(m => {
          const nextM = m + 1;
          if (nextM === ICONS.length) {
            playClearSound();
            setGameWon(true);
            setIsPlaying(false);
            const scoreCalc = Math.max(10, 1000 - moves * 25 - timer * 5);
            saveHighScore('memory', scoreCalc);
            setHighScore(getHighScore('memory'));
          }
          return nextM;
        });
        setFlippedCards([]);
      } else {
        // Unflip after delay
        setTimeout(() => {
          setCards(prev =>
            prev.map(c =>
              c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedCards([]);
        }, 800);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 max-w-xl mx-auto text-slate-100">
      {/* Header */}
      <div className="w-full flex items-center justify-between bg-[#111927] border border-cyan-500/20 rounded-xl p-4 mb-4 shadow-lg">
        <div>
          <h2 className="text-xl font-bold font-display text-cyan-400">MEMORY MATCH</h2>
          <p className="text-xs text-slate-400">Flip cards & match identical pairs</p>
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
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
          Matched: <span className="text-cyan-400 font-mono text-base">{matches} / {ICONS.length}</span>
        </div>

        <button
          onClick={initGame}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-extrabold transition-all shadow-[0_0_12px_#06b6d4] cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" /> Reset Cards
        </button>
      </div>

      {/* Cards Grid */}
      <div className="relative bg-[#090d16] border-2 border-cyan-500/30 rounded-2xl p-4 shadow-[0_0_25px_rgba(6,182,212,0.15)] select-none">
        <div className="grid grid-cols-4 gap-3 w-[290px] h-[290px] sm:w-[360px] sm:h-[360px]">
          {cards.map(card => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              aria-label={`Card ${card.id + 1} ${card.isFlipped || card.isMatched ? card.icon : 'hidden'}`}
              className={`rounded-xl flex items-center justify-center text-3xl sm:text-4xl transition-all duration-300 transform border shadow-md cursor-pointer ${card.isFlipped || card.isMatched
                ? 'bg-slate-900 border-cyan-400 scale-100 shadow-[0_0_12px_#06b6d4]'
                : 'bg-[#1e293b] border-slate-700 hover:bg-slate-700 hover:scale-105 active:scale-95'
                }`}
            >
              {card.isFlipped || card.isMatched ? card.icon : '❓'}
            </button>
          ))}
        </div>

        {/* Win Overlay */}
        {gameWon && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 text-center z-20">
            <h3 className="text-3xl font-extrabold text-amber-400 font-display mb-2 animate-pulse">
              ★ PERFECT MATCH! ★
            </h3>
            <p className="text-slate-300 mb-1">Total Moves: <span className="font-mono text-cyan-400 font-bold">{moves}</span></p>
            <p className="text-slate-300 mb-4">Time Taken: <span className="font-mono text-amber-400 font-bold">{timer}s</span></p>
            <button
              onClick={initGame}
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-2 transition-all shadow-[0_0_15px_#06b6d4]"
            >
              <RotateCcw className="w-5 h-5" /> Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
