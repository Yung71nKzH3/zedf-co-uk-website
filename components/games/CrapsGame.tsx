'use client';

import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Volume2, VolumeX, Dices, Award, DollarSign } from 'lucide-react';
import { playScoreSound, playClearSound, playHitSound, playPowerupSound, toggleSound, getIsMuted } from '@/lib/games/sound';
import { getHighScore, saveHighScore } from '@/lib/games/scores';

type BetType = 'PASS_LINE' | 'DONT_PASS' | 'FIELD' | 'ANY_7';

interface Bet {
  type: BetType;
  amount: number;
}

export function CrapsGame() {
  const [bankroll, setBankroll] = useState(1000);
  const [chipBet, setChipBet] = useState(25);
  const [bets, setBets] = useState<Bet[]>([]);
  const [die1, setDie1] = useState(3);
  const [die2, setDie2] = useState(4);
  const [point, setPoint] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [message, setMessage] = useState('Place your bets on Pass Line or Field!');
  const [highScore, setHighScore] = useState(0);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const savedChips = localStorage.getItem('zedf_craps_bankroll');
    if (savedChips) setBankroll(parseInt(savedChips, 10) || 1000);
    setHighScore(getHighScore('craps'));
    setMuted(getIsMuted());
  }, []);

  const updateBankroll = (newAmount: number) => {
    setBankroll(newAmount);
    if (typeof window !== 'undefined') {
      localStorage.setItem('zedf_craps_bankroll', newAmount.toString());
    }
    if (newAmount > highScore) {
      saveHighScore('craps', newAmount);
      setHighScore(newAmount);
    }
  };

  const placeBet = (type: BetType) => {
    if (bankroll < chipBet) {
      setMessage('Insufficient bankroll! Resetting chips...');
      updateBankroll(1000);
      return;
    }

    playPowerupSound();
    updateBankroll(bankroll - chipBet);

    setBets(prev => {
      const existing = prev.find(b => b.type === type);
      if (existing) {
        return prev.map(b => (b.type === type ? { ...b, amount: b.amount + chipBet } : b));
      }
      return [...prev, { type, amount: chipBet }];
    });
  };

  const clearBets = () => {
    const totalBet = bets.reduce((sum, b) => sum + b.amount, 0);
    updateBankroll(bankroll + totalBet);
    setBets([]);
  };

  const rollDice = () => {
    if (isRolling) return;
    if (bets.length === 0) {
      setMessage('Please place at least one bet on the table first!');
      return;
    }

    setIsRolling(true);
    playHitSound();

    let count = 0;
    const interval = setInterval(() => {
      setDie1(Math.floor(Math.random() * 6) + 1);
      setDie2(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count > 12) {
        clearInterval(interval);
        finalizeRoll();
      }
    }, 60);
  };

  const finalizeRoll = () => {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const total = d1 + d2;

    setDie1(d1);
    setDie2(d2);
    setIsRolling(false);

    let netWinnings = 0;
    let newBets = [...bets];
    let logMsg = `Rolled ${d1} + ${d2} = ${total}. `;

    if (point === null) {
      // Come-Out Roll
      if (total === 7 || total === 11) {
        // Natural 7/11 -> Pass Line Wins
        playClearSound();
        const passBet = bets.find(b => b.type === 'PASS_LINE');
        if (passBet) {
          netWinnings += passBet.amount * 2;
          logMsg += `NATURAL ${total}! Pass Line Wins! `;
        }
      } else if (total === 2 || total === 3 || total === 12) {
        // Craps -> Pass Line Loses
        playHitSound();
        const dontPassBet = bets.find(b => b.type === 'DONT_PASS');
        if (dontPassBet) {
          netWinnings += dontPassBet.amount * 2;
          logMsg += `CRAPS ${total}! Don't Pass Wins! `;
        } else {
          logMsg += `CRAPS ${total}! Pass Line Loses. `;
        }
        newBets = newBets.filter(b => b.type !== 'PASS_LINE');
      } else {
        // Established Point
        setPoint(total);
        playScoreSound();
        logMsg += `POINT ESTABLISHED: ${total}! Roll again to hit ${total}!`;
      }
    } else {
      // Point Phase
      if (total === point) {
        // Hit Point!
        playClearSound();
        const passBet = bets.find(b => b.type === 'PASS_LINE');
        if (passBet) {
          netWinnings += passBet.amount * 2;
        }
        logMsg += `★ HIT THE POINT ${point}! Pass Line Wins! ★`;
        setPoint(null); // Reset to Come-Out
      } else if (total === 7) {
        // Seven Out -> Lose Point
        playHitSound();
        logMsg += `SEVEN OUT! Point lost. Table cleared.`;
        setPoint(null);
        newBets = []; // Clear all point bets
      } else {
        logMsg += `Point is ${point}. Roll again!`;
      }
    }

    // Evaluate One-Roll Bets (Field, Any 7)
    const fieldBet = bets.find(b => b.type === 'FIELD');
    if (fieldBet) {
      if ([2, 3, 4, 9, 10, 11, 12].includes(total)) {
        const mult = total === 2 || total === 12 ? 3 : 2;
        netWinnings += fieldBet.amount * mult;
        logMsg += ` Field Win!`;
      } else {
        newBets = newBets.filter(b => b.type !== 'FIELD');
      }
    }

    const any7Bet = bets.find(b => b.type === 'ANY_7');
    if (any7Bet) {
      if (total === 7) {
        netWinnings += any7Bet.amount * 5;
        logMsg += ` Any 7 Paid 4:1!`;
      } else {
        newBets = newBets.filter(b => b.type !== 'ANY_7');
      }
    }

    if (netWinnings > 0) {
      updateBankroll(bankroll + netWinnings);
    }
    setBets(newBets);
    setMessage(logMsg);
  };

  const getBetAmount = (type: BetType) => {
    const bet = bets.find(b => b.type === type);
    return bet ? bet.amount : 0;
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 max-w-2xl mx-auto text-slate-100 select-none font-sans">
      {/* Header */}
      <div className="w-full flex items-center justify-between bg-[#111927] border border-cyan-500/20 rounded-xl p-4 mb-4 shadow-lg">
        <div>
          <h2 className="text-xl font-bold font-display text-cyan-400">CRAPS</h2>
          <p className="text-xs text-slate-400">
            {point ? `Point Phase: Hit ${point} before 7!` : 'Come-Out Phase: 7/11 Wins, 2/3/12 Craps'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-slate-400 uppercase">Bankroll</div>
            <div className="text-xl font-bold font-mono text-emerald-400">${bankroll}</div>
          </div>
          <div className="text-right border-l border-slate-700 pl-4">
            <div className="text-xs text-slate-400 uppercase">Max Chips</div>
            <div className="text-xl font-bold font-mono text-amber-400">${highScore}</div>
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

      {/* Craps Layout Table */}
      <div className="w-full bg-[#072418] border-2 border-emerald-500/40 rounded-3xl p-6 shadow-[0_0_30px_rgba(16,185,129,0.15)] flex flex-col gap-6 relative overflow-hidden">

        {/* Dice & Point Display Area */}
        <div className="flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-emerald-500/20">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-emerald-400 uppercase">POINT:</span>
            <span className="px-3 py-1 bg-emerald-950 border border-emerald-500 text-amber-300 font-mono font-bold text-lg rounded-xl">
              {point ? point : 'OFF'}
            </span>
          </div>

          {/* Dice Graphics */}
          <div className="flex gap-4 items-center">
            {[die1, die2].map((val, idx) => (
              <div
                key={idx}
                className={`w-14 h-14 rounded-2xl bg-cyan-500 text-slate-950 font-bold text-3xl flex items-center justify-center shadow-[0_0_15px_#06b6d4] transition-transform ${isRolling ? 'animate-bounce scale-110' : ''
                  }`}
              >
                {val}
              </div>
            ))}
          </div>

          <button
            onClick={rollDice}
            disabled={isRolling || bets.length === 0}
            className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-extrabold text-sm flex items-center gap-2 transition-all shadow-[0_0_15px_#06b6d4] cursor-pointer"
          >
            <Dices className="w-5 h-5" /> ROLL DICE
          </button>
        </div>

        {/* Status Message */}
        <div className="text-center py-2 px-4 rounded-xl bg-black/50 border border-cyan-500/20 text-cyan-300 text-sm font-bold">
          {message}
        </div>

        {/* Table Betting Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => placeBet('PASS_LINE')}
            className={`p-4 rounded-2xl border-2 text-center transition-all cursor-pointer ${getBetAmount('PASS_LINE') > 0
              ? 'bg-emerald-950/80 border-cyan-400 shadow-[0_0_12px_#06b6d4]'
              : 'bg-slate-900/60 border-slate-700 hover:border-emerald-400'
              }`}
          >
            <div className="text-xs font-bold text-cyan-400 uppercase">PASS LINE</div>
            <div className="text-xs text-slate-400 mt-1">7/11 Wins</div>
            {getBetAmount('PASS_LINE') > 0 && (
              <div className="mt-2 text-sm font-bold font-mono text-amber-300">${getBetAmount('PASS_LINE')}</div>
            )}
          </button>

          <button
            onClick={() => placeBet('DONT_PASS')}
            className={`p-4 rounded-2xl border-2 text-center transition-all cursor-pointer ${getBetAmount('DONT_PASS') > 0
              ? 'bg-emerald-950/80 border-rose-400 shadow-[0_0_12px_#f43f5e]'
              : 'bg-slate-900/60 border-slate-700 hover:border-rose-400'
              }`}
          >
            <div className="text-xs font-bold text-rose-400 uppercase">DON'T PASS</div>
            <div className="text-xs text-slate-400 mt-1">2/3 Wins</div>
            {getBetAmount('DONT_PASS') > 0 && (
              <div className="mt-2 text-sm font-bold font-mono text-amber-300">${getBetAmount('DONT_PASS')}</div>
            )}
          </button>

          <button
            onClick={() => placeBet('FIELD')}
            className={`p-4 rounded-2xl border-2 text-center transition-all cursor-pointer ${getBetAmount('FIELD') > 0
              ? 'bg-emerald-950/80 border-amber-400 shadow-[0_0_12px_#facc15]'
              : 'bg-slate-900/60 border-slate-700 hover:border-amber-400'
              }`}
          >
            <div className="text-xs font-bold text-amber-400 uppercase">FIELD BET</div>
            <div className="text-xs text-slate-400 mt-1">2,3,4,9,10,11,12</div>
            {getBetAmount('FIELD') > 0 && (
              <div className="mt-2 text-sm font-bold font-mono text-amber-300">${getBetAmount('FIELD')}</div>
            )}
          </button>

          <button
            onClick={() => placeBet('ANY_7')}
            className={`p-4 rounded-2xl border-2 text-center transition-all cursor-pointer ${getBetAmount('ANY_7') > 0
              ? 'bg-emerald-950/80 border-purple-400 shadow-[0_0_12px_#c026d3]'
              : 'bg-slate-900/60 border-slate-700 hover:border-purple-400'
              }`}
          >
            <div className="text-xs font-bold text-purple-400 uppercase">ANY 7 (4:1)</div>
            <div className="text-xs text-slate-400 mt-1">Next roll 7</div>
            {getBetAmount('ANY_7') > 0 && (
              <div className="mt-2 text-sm font-bold font-mono text-amber-300">${getBetAmount('ANY_7')}</div>
            )}
          </button>
        </div>

      </div>

      {/* Chips & Controls */}
      <div className="w-full mt-4 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold uppercase">Chip Value:</span>
          {[10, 25, 50, 100, 500].map(chip => (
            <button
              key={chip}
              onClick={() => setChipBet(chip)}
              className={`w-10 h-10 rounded-full font-bold text-xs border-2 flex items-center justify-center transition-all cursor-pointer ${chipBet === chip
                ? 'bg-amber-400 border-amber-200 text-slate-950 scale-110 shadow-[0_0_12px_#facc15]'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-amber-400'
                }`}
            >
              ${chip}
            </button>
          ))}
        </div>

        <button
          onClick={clearBets}
          disabled={bets.length === 0}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-bold border border-slate-700 transition-all cursor-pointer"
        >
          Clear Bets
        </button>
      </div>
    </div>
  );
}
