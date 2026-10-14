'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { RotateCcw, Volume2, VolumeX, Lightbulb, Trophy, Delete, CheckCircle2, Flame, Sparkles } from 'lucide-react';
import { playScoreSound, playClearSound, playHitSound, playPowerupSound, toggleSound, getIsMuted } from '@/lib/games/sound';
import { getHighScore, saveHighScore } from '@/lib/games/scores';

// Curated classic starting sets known for great puzzle dynamics
const CURATED_PUZZLES = [
  [3, 8, 3, 1],   // (8 - (3 - 1)) * 3 or similar
  [1, 3, 4, 6],   // 6 / (1 - 3/4) = 24
  [5, 5, 5, 1],   // (5 - 1/5) * 5 = 24
  [3, 3, 8, 8],   // 8 / (3 - 8/3) = 24
  [4, 6, 8, 2],   // (8 - 2) * (6 - 4) ... wait: 6 * (8 - 4) = 24
  [2, 3, 4, 6],   // (6 - 2) * (3 + 3)... or (2 * 6) + (3 * 4) = 24
  [7, 3, 7, 3],   // (7 - 3) * (7 - 1)... (3 * 7) + 3 = 24
  [2, 4, 10, 10], // (10 / 10 + 2) * 4 = 12... (10 - 4) * 2 + 10 = 22... (10 * 10 - 4) / 4 = 24
  [1, 2, 3, 4],   // 1 * 2 * 3 * 4 = 24
  [4, 4, 4, 4],   // 4 * 4 + 4 + 4 = 24
  [6, 6, 6, 6],   // 6 + 6 + 6 + 6 = 24
  [2, 8, 8, 8],   // (8 + 8 + 8) / 1 or (8 - 2) * (8 - ...
  [3, 5, 7, 9],   // (9 - 7) * (5 + 7)... (9 + 7 - 5) * 2...
  [2, 7, 8, 9],   // (9 - 7) * 8 + 8?
  [4, 5, 6, 8],   // (8 - 5) * (6 + 2)...
  [1, 4, 5, 6],   // 4 / (1 - 5/6) = 24
  [2, 3, 5, 8],   // (5 - 2) * 8 = 24
  [3, 4, 7, 8],   // (7 - 4) * 8 = 24
];

// Algorithmic 24-Solver
function solve24(nums: number[]): string | null {
  const EPS = 1e-6;

  interface Item {
    val: number;
    expr: string;
  }

  function recurse(list: Item[]): string | null {
    if (list.length === 1) {
      if (Math.abs(list[0].val - 24) < EPS) {
        return list[0].expr;
      }
      return null;
    }

    for (let i = 0; i < list.length; i++) {
      for (let j = 0; j < list.length; j++) {
        if (i === j) continue;
        const remaining: Item[] = [];
        for (let k = 0; k < list.length; k++) {
          if (k !== i && k !== j) remaining.push(list[k]);
        }

        const a = list[i];
        const b = list[j];

        // Try addition
        let res = recurse([...remaining, { val: a.val + b.val, expr: `(${a.expr} + ${b.expr})` }]);
        if (res) return res;

        // Try subtraction (a - b)
        res = recurse([...remaining, { val: a.val - b.val, expr: `(${a.expr} - ${b.expr})` }]);
        if (res) return res;

        // Try multiplication
        res = recurse([...remaining, { val: a.val * b.val, expr: `(${a.expr} × ${b.expr})` }]);
        if (res) return res;

        // Try division (a / b)
        if (Math.abs(b.val) > EPS) {
          res = recurse([...remaining, { val: a.val / b.val, expr: `(${a.expr} ÷ ${b.expr})` }]);
          if (res) return res;
        }
      }
    }
    return null;
  }

  const items = nums.map(n => ({ val: n, expr: n.toString() }));
  return recurse(items);
}

// Generate a guaranteed solvable 4-number set
function generatePuzzle(usedIndices: number[]): { numbers: number[]; solution: string } {
  // First try from curated puzzles
  const availableIndices = CURATED_PUZZLES.map((_, i) => i).filter(i => !usedIndices.includes(i));
  if (availableIndices.length > 0) {
    const chosenIdx = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    const nums = CURATED_PUZZLES[chosenIdx];
    const solution = solve24(nums);
    if (solution) return { numbers: nums, solution };
  }

  // Fallback random search for solvable sets
  for (let attempt = 0; attempt < 50; attempt++) {
    const nums = [
      Math.floor(Math.random() * 9) + 1,
      Math.floor(Math.random() * 9) + 1,
      Math.floor(Math.random() * 9) + 1,
      Math.floor(Math.random() * 9) + 1,
    ];
    const solution = solve24(nums);
    if (solution) return { numbers: nums, solution };
  }

  // Safety fallback
  return { numbers: [1, 2, 3, 4], solution: '(1 × 2 × 3 × 4)' };
}

// Token types for expression building
type Token = 
  | { type: 'num'; value: number; cardId: number }
  | { type: 'op'; value: '+' | '-' | '×' | '÷' }
  | { type: 'paren'; value: '(' | ')' };

// Safe Arithmetic Evaluator
function evaluateExpression(tokens: Token[]): { result: number | null; error: string | null } {
  if (tokens.length === 0) return { result: null, error: null };

  // Convert to math expression string with * and /
  const exprStr = tokens
    .map(t => {
      if (t.type === 'op') {
        if (t.value === '×') return '*';
        if (t.value === '÷') return '/';
        return t.value;
      }
      return t.value;
    })
    .join(' ');

  try {
    // Validate characters strictly before arithmetic evaluation
    if (!/^[0-9+\-*/().\s]+$/.test(exprStr)) {
      return { result: null, error: 'Invalid characters in calculation' };
    }

    // Function evaluator within a safe sandbox
    const evalFn = new Function(`'use strict'; return (${exprStr});`);
    const val = evalFn();

    if (typeof val !== 'number' || !isFinite(val)) {
      return { result: null, error: 'Calculation resulted in infinity or undefined' };
    }

    return { result: val, error: null };
  } catch {
    return { result: null, error: 'Incomplete or invalid mathematical expression' };
  }
}

export function Target24Game() {
  const [numbers, setNumbers] = useState<number[]>([3, 8, 3, 1]);
  const [usedCardIds, setUsedCardIds] = useState<number[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [solution, setSolution] = useState<string>('');
  const [showHint, setShowHint] = useState<boolean>(false);
  const [solved, setSolved] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('Use all 4 numbers to reach exactly 24!');
  const [usedPuzzleIndices, setUsedPuzzleIndices] = useState<number[]>([]);
  const [muted, setMuted] = useState(false);

  // Initialize
  useEffect(() => {
    setMuted(getIsMuted());
    const storedHigh = getHighScore('target24');
    setHighScore(storedHigh);
    loadNewPuzzle();
  }, []);

  const loadNewPuzzle = useCallback(() => {
    const { numbers: newNums, solution: newSol } = generatePuzzle(usedPuzzleIndices);
    setNumbers(newNums);
    setSolution(newSol);
    setUsedCardIds([]);
    setTokens([]);
    setSolved(false);
    setShowHint(false);
    setStatusMessage('Use all 4 numbers to reach exactly 24!');
  }, [usedPuzzleIndices]);

  // Handle number click
  const handleNumberClick = (num: number, cardId: number) => {
    if (solved || usedCardIds.includes(cardId)) return;

    // Check if the previous token was a number or closing paren (needs an operator in between)
    const lastToken = tokens[tokens.length - 1];
    if (lastToken && (lastToken.type === 'num' || (lastToken.type === 'paren' && lastToken.value === ')'))) {
      setStatusMessage('Choose an operator (+, -, ×, ÷) before another number!');
      playHitSound();
      return;
    }

    playScoreSound();
    setUsedCardIds(prev => [...prev, cardId]);
    setTokens(prev => [...prev, { type: 'num', value: num, cardId }]);
  };

  // Handle operator click
  const handleOperatorClick = (op: '+' | '-' | '×' | '÷') => {
    if (solved) return;
    const lastToken = tokens[tokens.length - 1];

    if (!lastToken) {
      setStatusMessage('Start with a number or an open parenthesis ( !');
      playHitSound();
      return;
    }

    // Replace previous operator if clicked consecutively
    if (lastToken.type === 'op') {
      setTokens(prev => [...prev.slice(0, -1), { type: 'op', value: op }]);
      return;
    }

    if (lastToken.type === 'paren' && lastToken.value === '(') {
      setStatusMessage('Operator cannot immediately follow an open parenthesis!');
      playHitSound();
      return;
    }

    playClearSound();
    setTokens(prev => [...prev, { type: 'op', value: op }]);
  };

  // Handle parenthesis
  const handleParenClick = (paren: '(' | ')') => {
    if (solved) return;
    const lastToken = tokens[tokens.length - 1];

    if (paren === '(') {
      // Open paren cannot follow a number or closing paren directly
      if (lastToken && (lastToken.type === 'num' || (lastToken.type === 'paren' && lastToken.value === ')'))) {
        setStatusMessage('Insert an operator before an open parenthesis!');
        playHitSound();
        return;
      }
      playClearSound();
      setTokens(prev => [...prev, { type: 'paren', value: '(' }]);
    } else {
      // Count open and close parens
      const openCount = tokens.filter(t => t.type === 'paren' && t.value === '(').length;
      const closeCount = tokens.filter(t => t.type === 'paren' && t.value === ')').length;

      if (openCount <= closeCount) {
        setStatusMessage('No matching open parenthesis to close!');
        playHitSound();
        return;
      }

      if (!lastToken || lastToken.type === 'op' || (lastToken.type === 'paren' && lastToken.value === '(')) {
        setStatusMessage('Close parenthesis must follow a number or expression!');
        playHitSound();
        return;
      }

      playClearSound();
      setTokens(prev => [...prev, { type: 'paren', value: ')' }]);
    }
  };

  // Backspace / Undo last token
  const handleBackspace = () => {
    if (solved || tokens.length === 0) return;
    const last = tokens[tokens.length - 1];
    if (last.type === 'num') {
      setUsedCardIds(prev => prev.filter(id => id !== last.cardId));
    }
    setTokens(prev => prev.slice(0, -1));
    setStatusMessage('Step undone.');
  };

  // Clear all
  const handleClear = () => {
    if (solved) return;
    setTokens([]);
    setUsedCardIds([]);
    setStatusMessage('Calculation reset.');
  };

  // Check Solution
  const handleCheck = () => {
    if (solved) return;

    // Must use all 4 cards
    if (usedCardIds.length < 4) {
      setStatusMessage(`You must use all 4 numbers! (${usedCardIds.length}/4 used)`);
      playHitSound();
      return;
    }

    const { result, error } = evaluateExpression(tokens);

    if (error || result === null) {
      setStatusMessage(error || 'Invalid expression syntax. Check your brackets!');
      playHitSound();
      return;
    }

    const diff = Math.abs(result - 24);
    if (diff < 1e-6) {
      // SUCCESS!
      playPowerupSound();
      setSolved(true);
      const newStreak = streak + 1;
      setStreak(newStreak);
      const points = 100 + (showHint ? 25 : 75) + newStreak * 20;
      setScore(prev => prev + points);

      if (newStreak > highScore) {
        setHighScore(newStreak);
        saveHighScore('target24', newStreak);
      }

      setStatusMessage(`🎉 BINGO! Target 24 achieved! (+${points} pts)`);
    } else {
      playHitSound();
      setStatusMessage(`Current result = ${Math.round(result * 100) / 100}. Keep trying to reach 24!`);
    }
  };

  // Skip puzzle
  const handleSkip = () => {
    setStreak(0);
    loadNewPuzzle();
  };

  // Format expression display
  const expressionString = useMemo(() => {
    if (tokens.length === 0) return 'Tap numbers & operators below...';
    return tokens.map(t => t.value).join(' ');
  }, [tokens]);

  // Current live preview of math evaluation
  const livePreview = useMemo(() => {
    if (tokens.length === 0) return null;
    const { result } = evaluateExpression(tokens);
    return result !== null ? Math.round(result * 100) / 100 : null;
  }, [tokens]);

  return (
    <div className="w-full max-w-xl mx-auto bg-[#111927] border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-6 text-slate-100">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <h2 className="text-xl font-black font-display tracking-tight text-cyan-400">TARGET 24</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Combine all 4 numbers to make 24</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Streak:</span>
            <span className="font-mono font-bold text-amber-300">{streak}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <Trophy className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Best:</span>
            <span className="font-mono font-bold text-cyan-300">{highScore}</span>
          </div>

          <button
            onClick={() => setMuted(toggleSound())}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title={muted ? 'Unmute' : 'Mute'}
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Target Display & Live Preview */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-950/80 border border-cyan-500/30 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-cyan-500/5 group-hover:bg-cyan-500/10 transition-colors" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 mb-1">TARGET GOAL</span>
          <span className="text-4xl font-black font-mono text-cyan-300 drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]">24</span>
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">CURRENT VALUE</span>
          <span className={`text-4xl font-black font-mono transition-colors ${
            livePreview === 24 ? 'text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.6)]' : 'text-slate-200'
          }`}>
            {livePreview !== null ? livePreview : '—'}
          </span>
        </div>
      </div>

      {/* Expression Display Box */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 min-h-[70px] flex items-center justify-between gap-3 shadow-inner">
        <div className="font-mono text-lg font-bold text-slate-100 tracking-wide overflow-x-auto whitespace-nowrap scrollbar-none py-1">
          {expressionString}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleBackspace}
            disabled={solved || tokens.length === 0}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 disabled:opacity-30 disabled:hover:bg-slate-900 transition-colors border border-slate-800"
            title="Backspace"
          >
            <Delete className="w-4 h-4" />
          </button>
          <button
            onClick={handleClear}
            disabled={solved || tokens.length === 0}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 disabled:opacity-30 disabled:hover:bg-slate-900 transition-colors border border-slate-800"
            title="Clear all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status banner */}
      <div className={`text-center py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
        solved
          ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
          : 'bg-slate-900/60 border border-slate-800/80 text-slate-300'
      }`}>
        {statusMessage}
      </div>

      {/* Four Number Cards */}
      <div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
          <span>Number Cards (Use all 4)</span>
          <span className="text-cyan-400">{usedCardIds.length}/4 Selected</span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {numbers.map((num, idx) => {
            const isUsed = usedCardIds.includes(idx);
            return (
              <button
                key={idx}
                disabled={solved || isUsed}
                onClick={() => handleNumberClick(num, idx)}
                className={`h-16 md:h-20 rounded-2xl text-2xl md:text-3xl font-black font-mono flex items-center justify-center transition-all duration-200 border ${
                  isUsed
                    ? 'bg-slate-900/40 border-slate-800/40 text-slate-600 scale-95 cursor-not-allowed opacity-40'
                    : 'bg-gradient-to-b from-slate-800 to-slate-900 hover:from-cyan-950 hover:to-slate-900 border-slate-700 hover:border-cyan-400 text-slate-100 hover:text-cyan-300 hover:scale-105 shadow-md hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] active:scale-95'
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>
      </div>

      {/* Operators & Controls Keypad */}
      <div className="grid grid-cols-6 gap-2">
        <button
          onClick={() => handleParenClick('(')}
          disabled={solved}
          className="h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 font-black text-lg border border-slate-800 hover:border-cyan-500/50 transition-all active:scale-95"
        >
          (
        </button>
        <button
          onClick={() => handleParenClick(')')}
          disabled={solved}
          className="h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 font-black text-lg border border-slate-800 hover:border-cyan-500/50 transition-all active:scale-95"
        >
          )
        </button>
        {(['+', '-', '×', '÷'] as const).map(op => (
          <button
            key={op}
            onClick={() => handleOperatorClick(op)}
            disabled={solved}
            className="h-12 rounded-xl bg-slate-900 hover:bg-cyan-500/20 text-cyan-300 font-black text-xl border border-slate-800 hover:border-cyan-400 transition-all active:scale-95"
          >
            {op}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-2">
        {!solved ? (
          <>
            <button
              onClick={handleCheck}
              className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition-all active:scale-98"
            >
              <CheckCircle2 className="w-4 h-4" /> CHECK SOLUTION
            </button>
            <button
              onClick={() => setShowHint(prev => !prev)}
              className="px-4 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Toggle Hint"
            >
              <Lightbulb className="w-4 h-4" /> Hint
            </button>
            <button
              onClick={handleSkip}
              className="px-4 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors text-xs font-semibold"
              title="Skip puzzle"
            >
              Skip
            </button>
          </>
        ) : (
          <button
            onClick={loadNewPuzzle}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(52,211,153,0.4)] transition-all active:scale-98"
          >
            <Sparkles className="w-4 h-4" /> NEXT PUZZLE
          </button>
        )}
      </div>

      {/* Hint Reveal Box */}
      {showHint && !solved && (
        <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-3 text-center">
          <span className="text-[11px] text-amber-400/80 font-bold block mb-1">POSSIBLE SOLUTION:</span>
          <span className="font-mono text-sm font-bold text-amber-300">{solution} = 24</span>
        </div>
      )}
    </div>
  );
}
