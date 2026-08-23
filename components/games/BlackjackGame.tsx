'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Volume2, VolumeX, DollarSign, Shield, Award, Layers } from 'lucide-react';
import { playScoreSound, playClearSound, playHitSound, playPowerupSound, toggleSound, getIsMuted } from '@/lib/games/sound';
import { getHighScore, saveHighScore } from '@/lib/games/scores';

type Suit = '♠' | '♥' | '♦' | '♣';
type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

interface Card {
  suit: Suit;
  rank: Rank;
  value: number;
}

const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      let value = parseInt(rank, 10);
      if (['J', 'Q', 'K'].includes(rank)) value = 10;
      if (rank === 'A') value = 11;
      deck.push({ suit, rank, value });
    }
  }
  // Shuffle
  return deck.sort(() => Math.random() - 0.5);
}

function calculateHand(hand: Card[]): { score: number; isSoft: boolean } {
  let score = 0;
  let aces = 0;

  hand.forEach(card => {
    score += card.value;
    if (card.rank === 'A') aces++;
  });

  while (score > 21 && aces > 0) {
    score -= 10;
    aces--;
  }

  return { score, isSoft: aces > 0 };
}

export function BlackjackGame() {
  const [bankroll, setBankroll] = useState(1000);
  const [currentBet, setCurrentBet] = useState(25);
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gamePhase, setGamePhase] = useState<'BETTING' | 'PLAYER_TURN' | 'DEALER_TURN' | 'GAME_OVER'>('BETTING');
  const [message, setMessage] = useState('');
  const [highScore, setHighScore] = useState(0);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const savedChips = localStorage.getItem('zedf_blackjack_bankroll');
    if (savedChips) setBankroll(parseInt(savedChips, 10) || 1000);
    setHighScore(getHighScore('blackjack'));
    setMuted(getIsMuted());
  }, []);

  const updateBankroll = (newAmount: number) => {
    setBankroll(newAmount);
    if (typeof window !== 'undefined') {
      localStorage.setItem('zedf_blackjack_bankroll', newAmount.toString());
    }
    if (newAmount > highScore) {
      saveHighScore('blackjack', newAmount);
      setHighScore(newAmount);
    }
  };

  const handleBetChange = (amount: number) => {
    if (gamePhase !== 'BETTING' && gamePhase !== 'GAME_OVER') return;
    setCurrentBet(amount);
  };

  const handleResetChips = () => {
    updateBankroll(1000);
    setMessage('Bankroll reset to $1,000!');
  };

  const handleDeal = () => {
    if (bankroll < currentBet) {
      setMessage('Insufficient bankroll! Please select a smaller bet or reset your chips.');
      return;
    }

    const newDeck = createDeck();
    const pHand = [newDeck.pop()!, newDeck.pop()!];
    const dHand = [newDeck.pop()!, newDeck.pop()!];

    setDeck(newDeck);
    setPlayerHand(pHand);
    setDealerHand(dHand);

    const afterBetBankroll = bankroll - currentBet;
    updateBankroll(afterBetBankroll);
    playPowerupSound();

    const pScore = calculateHand(pHand).score;
    const dScore = calculateHand(dHand).score;

    if (pScore === 21 && dScore === 21) {
      setMessage('Both hit Natural Blackjack! Push!');
      updateBankroll(afterBetBankroll + currentBet);
      setGamePhase('GAME_OVER');
    } else if (pScore === 21) {
      playClearSound();
      const payout = Math.floor(currentBet * 2.5);
      const netWin = Math.floor(currentBet * 1.5);
      setMessage(`★ NATURAL BLACKJACK! Paid 3:2 (+$${netWin}) ★`);
      updateBankroll(afterBetBankroll + payout);
      setGamePhase('GAME_OVER');
    } else {
      setMessage('Hit, Stand, or Double Down?');
      setGamePhase('PLAYER_TURN');
    }
  };

  const handleHit = () => {
    if (gamePhase !== 'PLAYER_TURN' || deck.length === 0) return;
    const newDeck = [...deck];
    const card = newDeck.pop()!;
    const newHand = [...playerHand, card];

    setDeck(newDeck);
    setPlayerHand(newHand);
    playHitSound();

    const { score } = calculateHand(newHand);
    if (score > 21) {
      setMessage(`BUST! Hand total: ${score}. Dealer Wins.`);
      setGamePhase('GAME_OVER');
    }
  };

  const handleStand = () => {
    if (gamePhase !== 'PLAYER_TURN') return;
    setGamePhase('DEALER_TURN');
    playScoreSound();

    let newDeck = [...deck];
    let dHand = [...dealerHand];
    let dScore = calculateHand(dHand).score;

    // Dealer hits on < 17
    while (dScore < 17 && newDeck.length > 0) {
      dHand.push(newDeck.pop()!);
      dScore = calculateHand(dHand).score;
    }

    setDeck(newDeck);
    setDealerHand(dHand);

    const pScore = calculateHand(playerHand).score;

    if (dScore > 21) {
      playClearSound();
      setMessage(`Dealer Busted (${dScore})! YOU WIN +$${currentBet}!`);
      updateBankroll(bankroll + currentBet * 2);
    } else if (pScore > dScore) {
      playClearSound();
      setMessage(`YOU WIN! (${pScore} vs ${dScore}) +$${currentBet}!`);
      updateBankroll(bankroll + currentBet * 2);
    } else if (dScore > pScore) {
      setMessage(`Dealer Wins (${dScore} vs ${pScore}).`);
    } else {
      setMessage(`PUSH! Hand tied at ${pScore}. Bet Returned.`);
      updateBankroll(bankroll + currentBet);
    }

    setGamePhase('GAME_OVER');
  };

  const handleDoubleDown = () => {
    if (gamePhase !== 'PLAYER_TURN' || playerHand.length !== 2 || bankroll < currentBet) return;

    const afterDoubleBankroll = bankroll - currentBet;
    updateBankroll(afterDoubleBankroll);

    const newDeck = [...deck];
    const card = newDeck.pop()!;
    const newHand = [...playerHand, card];

    setDeck(newDeck);
    setPlayerHand(newHand);
    playHitSound();

    const pScore = calculateHand(newHand).score;
    if (pScore > 21) {
      setMessage(`BUST! Hand total: ${pScore}. Dealer Wins.`);
      setGamePhase('GAME_OVER');
    } else {
      // Dealer hits on < 17
      let dHand = [...dealerHand];
      let dScore = calculateHand(dHand).score;
      while (dScore < 17 && newDeck.length > 0) {
        dHand.push(newDeck.pop()!);
        dScore = calculateHand(dHand).score;
      }
      setDealerHand(dHand);

      if (dScore > 21) {
        playClearSound();
        setMessage(`DOUBLE DOWN WIN! Dealer Busted! +$${currentBet * 2}!`);
        updateBankroll(afterDoubleBankroll + currentBet * 4);
      } else if (pScore > dScore) {
        playClearSound();
        setMessage(`DOUBLE DOWN WIN! (${pScore} vs ${dScore}) +$${currentBet * 2}!`);
        updateBankroll(afterDoubleBankroll + currentBet * 4);
      } else if (dScore > pScore) {
        setMessage(`Dealer Wins (${dScore} vs ${pScore}).`);
      } else {
        setMessage(`PUSH! Double bet returned.`);
        updateBankroll(afterDoubleBankroll + currentBet * 2);
      }
      setGamePhase('GAME_OVER');
    }
  };

  const pScore = calculateHand(playerHand).score;
  const dScore = calculateHand(dealerHand).score;

  return (
    <div className="flex flex-col items-center justify-center p-4 max-w-2xl mx-auto text-slate-100 select-none font-sans">
      {/* Top Header */}
      <div className="w-full flex items-center justify-between bg-[#111927] border border-cyan-500/20 rounded-xl p-4 mb-4 shadow-lg">
        <div>
          <h2 className="text-xl font-bold font-display text-cyan-400">BLACKJACK</h2>
          <p className="text-xs text-slate-400">Standard 21 Rules | Dealer Stands on 17</p>
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

      {/* Felt Game Table */}
      <div className="w-full bg-[#072418] border-2 border-emerald-500/40 rounded-3xl p-6 shadow-[0_0_30px_rgba(16,185,129,0.15)] flex flex-col gap-6 relative overflow-hidden">

        {/* Dealer Hand Area */}
        <div className="flex flex-col items-center">
          <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-1">
            <Shield className="w-4 h-4 text-emerald-400" /> DEALER HAND {gamePhase === 'GAME_OVER' && `(${dScore})`}
          </div>

          <div className="flex gap-3 min-h-[100px] items-center justify-center">
            {dealerHand.map((card, idx) => {
              const isHidden = idx === 1 && gamePhase === 'PLAYER_TURN';
              const isRed = ['♥', '♦'].includes(card.suit);
              return (
                <div
                  key={idx}
                  className={`w-16 h-24 sm:w-20 sm:h-28 rounded-xl border-2 flex flex-col justify-between p-2 shadow-lg transition-all transform ${isHidden
                    ? 'bg-slate-900 border-cyan-500/50 flex items-center justify-center'
                    : 'bg-[#111927] border-emerald-400/60'
                    }`}
                >
                  {isHidden ? (
                    <span className="text-2xl text-cyan-400 font-bold font-mono">🂠</span>
                  ) : (
                    <>
                      <span className={`text-sm sm:text-base font-bold ${isRed ? 'text-rose-400' : 'text-slate-100'}`}>
                        {card.rank}
                      </span>
                      <span className={`text-2xl sm:text-3xl text-center ${isRed ? 'text-rose-400' : 'text-slate-100'}`}>
                        {card.suit}
                      </span>
                      <span className={`text-sm sm:text-base font-bold text-right ${isRed ? 'text-rose-400' : 'text-slate-100'}`}>
                        {card.rank}
                      </span>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Message Banner */}
        <div className="text-center py-2 px-4 rounded-xl bg-black/40 border border-emerald-500/20">
          <span className="text-sm font-bold text-cyan-300 font-display">
            {message || 'Select bet amount and press DEAL'}
          </span>
        </div>

        {/* Player Hand Area */}
        <div className="flex flex-col items-center">
          <div className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-2 flex items-center gap-1">
            <Award className="w-4 h-4 text-cyan-400" /> YOUR HAND {playerHand.length > 0 && `(${pScore})`}
          </div>

          <div className="flex gap-3 min-h-[100px] items-center justify-center">
            {playerHand.map((card, idx) => {
              const isRed = ['♥', '♦'].includes(card.suit);
              return (
                <div
                  key={idx}
                  className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl border-2 bg-[#111927] border-cyan-400/60 flex flex-col justify-between p-2 shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all"
                >
                  <span className={`text-sm sm:text-base font-bold ${isRed ? 'text-rose-400' : 'text-slate-100'}`}>
                    {card.rank}
                  </span>
                  <span className={`text-2xl sm:text-3xl text-center ${isRed ? 'text-rose-400' : 'text-slate-100'}`}>
                    {card.suit}
                  </span>
                  <span className={`text-sm sm:text-base font-bold text-right ${isRed ? 'text-rose-400' : 'text-slate-100'}`}>
                    {card.rank}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Chip Betting Selector */}
      <div className="w-full mt-4 flex flex-wrap justify-between items-center gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 font-bold uppercase">Bet:</span>
          {[10, 25, 50, 100, 500].map(chip => (
            <button
              key={chip}
              onClick={() => handleBetChange(chip)}
              disabled={gamePhase !== 'BETTING' && gamePhase !== 'GAME_OVER'}
              className={`w-10 h-10 rounded-full font-bold text-xs border-2 flex items-center justify-center transition-all cursor-pointer ${currentBet === chip
                ? 'bg-amber-400 border-amber-200 text-slate-950 scale-110 shadow-[0_0_12px_#facc15]'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-amber-400'
                }`}
            >
              ${chip}
            </button>
          ))}
          <button
            onClick={handleResetChips}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition-all cursor-pointer ml-1"
            title="Reset Bankroll to $1,000"
          >
            Reset $1K
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex gap-2">
          {gamePhase === 'BETTING' || gamePhase === 'GAME_OVER' ? (
            <button
              onClick={handleDeal}
              className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm flex items-center gap-2 transition-all shadow-[0_0_15px_#10b981] cursor-pointer"
            >
              DEAL (${currentBet})
            </button>
          ) : (
            <>
              <button
                onClick={handleHit}
                className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all shadow-[0_0_12px_#06b6d4] cursor-pointer"
              >
                HIT
              </button>
              <button
                onClick={handleStand}
                className="px-5 py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-sm transition-all shadow-[0_0_12px_#f43f5e] cursor-pointer"
              >
                STAND
              </button>
              {playerHand.length === 2 && bankroll >= currentBet && (
                <button
                  onClick={handleDoubleDown}
                  className="px-4 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm transition-all shadow-[0_0_12px_#facc15] cursor-pointer"
                >
                  2X DOUBLE
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
