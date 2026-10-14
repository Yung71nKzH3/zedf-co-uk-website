'use client';

import React, { useState, useEffect, useRef, useCallback, useSyncExternalStore } from 'react';
import confetti from 'canvas-confetti';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import Link from 'next/link';
import { ArrowLeft, Volume2, VolumeX, Users, Share2, Sparkles, Copy, Check, Radio } from 'lucide-react';
import styles from './electio.module.css';

interface OptionItem {
  id: number;
  text: string;
  weight?: number;
  isRiskApplied?: boolean;
}

const PRESETS: Record<string, string[]> = {
  dinner: ['Pizza 🍕', 'Sushi 🍣', 'Burgers 🍔', 'Tacos 🌮', 'Thai 🍜', 'Pasta 🍝'],
  decisions: ['Yes 👍', 'No 👎', 'Maybe 🤔', 'Spin Again 🔄'],
  activities: ['Movie Night 🍿', 'Gym Session 🏋️', 'Gaming 🎮', 'Read Book 📚', 'Walk in Park 🌳'],
};

// Generate fixed, cryptographically secure UUID room code (fails closed if unavailable)
const generateSecureRoomCode = () => {
  if (typeof window === 'undefined' || !window.crypto?.randomUUID) {
    throw new Error('Secure room ID generation is unavailable.');
  }
  return window.crypto.randomUUID();
};

const isValidRoomCode = (code: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(code);

// Web Audio API Synthesizers
const playTickSound = (audioCtx: AudioContext | null) => {
  if (!audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
  } catch {
    // Audio context may be suspended or unsupported
  }
};

const playFanfareSound = (audioCtx: AudioContext | null) => {
  if (!audioCtx) return;
  try {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const startTime = audioCtx.currentTime + i * 0.12;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.4, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });
  } catch {
    // Audio context may be suspended or unsupported
  }
};

export default function ElectioPage() {
  const [options, setOptions] = useState<OptionItem[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<OptionItem | null>(null);
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [chips, setChips] = useState<Record<number, boolean>>({});
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const [rotationDegrees, setRotationDegrees] = useState(0);

  // Connection & Room States (Invite Link + Supabase Realtime Relay)
  const [roomCode, setRoomCode] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [peerCount, setPeerCount] = useState(1);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const supabaseChannelRef = useRef<RealtimeChannel | null>(null);

  // Live mutable refs to eliminate stale closure bugs
  const optionsRef = useRef(options);
  const chipsRef = useRef(chips);
  const soundEnabledRef = useRef(soundEnabled);
  const isSpinningRef = useRef(isSpinning);
  const rotationDegreesRef = useRef(rotationDegrees);
  const roomCodeRef = useRef(roomCode);
  const isConnectedRef = useRef(isConnected);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);
  useEffect(() => {
    chipsRef.current = chips;
  }, [chips]);
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);
  useEffect(() => {
    isSpinningRef.current = isSpinning;
  }, [isSpinning]);
  useEffect(() => {
    rotationDegreesRef.current = rotationDegrees;
  }, [rotationDegrees]);
  useEffect(() => {
    roomCodeRef.current = roomCode;
  }, [roomCode]);
  useEffect(() => {
    isConnectedRef.current = isConnected;
  }, [isConnected]);

  const getAudioContext = useCallback(() => {
    if (!soundEnabledRef.current) return null;
    if (!audioCtxRef.current && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }
    return audioCtxRef.current;
  }, []);

  // Spin animation with exact modulo wheel alignment
  const executeSpinAnimation = useCallback((selectedWinner: OptionItem | null, winnerIndex: number, weightedOpts?: OptionItem[]) => {
    const audioCtx = getAudioContext();
    setIsSpinning(true);
    isSpinningRef.current = true;
    setWinner(null);
    setHighlightedId(null);

    const count = (weightedOpts && weightedOpts.length) || optionsRef.current.length;
    if (count < 2) {
      setIsSpinning(false);
      isSpinningRef.current = false;
      return;
    }

    const sliceAngle = 360 / count;
    const midAngle = winnerIndex * sliceAngle + sliceAngle / 2;

    const targetMod = (360 - (midAngle % 360)) % 360;
    const currentMod = ((rotationDegreesRef.current % 360) + 360) % 360;
    const delta = (targetMod - currentMod + 360) % 360;
    const extraSpins = 1800; // 5 full rotations (360 * 5)
    const nextRotation = rotationDegreesRef.current + extraSpins + delta;

    setRotationDegrees(nextRotation);
    rotationDegreesRef.current = nextRotation;

    const tickTimes = [100, 250, 450, 700, 1000, 1350, 1750, 2200, 2650];
    tickTimes.forEach((delay) => {
      setTimeout(() => playTickSound(audioCtx), delay);
    });

    setTimeout(() => {
      setHighlightedId(selectedWinner?.id ?? null);
      setWinner(selectedWinner);
      setIsSpinning(false);
      isSpinningRef.current = false;

      playFanfareSound(audioCtx);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#ffd700', '#d40000', '#ffffff', '#008000'],
      });
    }, 3000);
  }, [getAudioContext]);

  const executeSpinAnimationRef = useRef(executeSpinAnimation);
  useEffect(() => {
    executeSpinAnimationRef.current = executeSpinAnimation;
  }, [executeSpinAnimation]);

  // Hydration-safe LocalStorage Persistence
  useEffect(() => {
    try {
      const saved = localStorage.getItem('electio-options');
      const savedChips = localStorage.getItem('electio-chips');
      if (saved) setOptions(JSON.parse(saved));
      if (savedChips) setChips(JSON.parse(savedChips));
    } catch (e) {
      console.error('Failed to parse stored electio state:', e);
    }
  }, []);

  useEffect(() => {
    if (!isMounted || isConnected) return;
    localStorage.setItem('electio-options', JSON.stringify(options));
    localStorage.setItem('electio-chips', JSON.stringify(chips));
  }, [options, chips, isMounted, isConnected]);

  // Broadcast state updates over Supabase channel
  const broadcastState = useCallback((newOpts: OptionItem[], newChips: Record<number, boolean>) => {
    if (!roomCodeRef.current || !supabaseChannelRef.current) return;

    supabaseChannelRef.current.send({
      type: 'broadcast',
      event: 'ROOM_STATE_SYNC',
      payload: { options: newOpts, chips: newChips },
    });
  }, []);

  // Supabase Realtime Room Setup
  const setupSupabaseRoom = useCallback((code: string, isHost: boolean) => {
    if (!isValidRoomCode(code)) {
      alert('Invalid room invite link.');
      return;
    }

    if (typeof window === 'undefined' || !window.crypto?.randomUUID) {
      alert('Secure random UUID generation is not supported in this browser.');
      return;
    }

    if (!supabase) {
      alert('Supabase is not configured yet. Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.');
      return;
    }

    setIsConnecting(true);

    if (supabaseChannelRef.current) {
      supabase.removeChannel(supabaseChannelRef.current);
      supabaseChannelRef.current = null;
    }

    const presenceKey = window.crypto.randomUUID();

    const channel = supabase.channel(`electio-room-${code}`, {
      config: {
        broadcast: { ack: false, self: false },
        presence: { key: presenceKey },
      },
    });

    supabaseChannelRef.current = channel;

    channel
      .on('broadcast', { event: 'ROOM_STATE_SYNC' }, ({ payload }) => {
        // Guard against callbacks from stale or replaced channels
        if (supabaseChannelRef.current !== channel) return;

        // Exhaustive payload validation for options
        if (payload && Array.isArray(payload.options) && payload.options.length <= 100) {
          const ids = new Set<number>();
          const validOptions = payload.options.every((o: unknown): o is OptionItem => {
            if (typeof o !== 'object' || o === null) return false;
            const item = o as OptionItem;
            if (typeof item.id !== 'number' || !Number.isSafeInteger(item.id)) return false;
            if (typeof item.text !== 'string' || item.text.trim().length === 0 || item.text.length > 200) return false;
            if (item.weight !== undefined && (typeof item.weight !== 'number' || item.weight <= 0 || !Number.isFinite(item.weight))) return false;
            if (item.isRiskApplied !== undefined && typeof item.isRiskApplied !== 'boolean') return false;
            if (ids.has(item.id)) return false; // Must be unique
            ids.add(item.id);
            return true;
          });

          if (validOptions) {
            setOptions(payload.options);
          }
        }

        // Exhaustive payload validation for chips
        if (
          payload &&
          typeof payload.chips === 'object' &&
          payload.chips !== null &&
          !Array.isArray(payload.chips)
        ) {
          const validChips = Object.entries(payload.chips).every(([key, value]) => {
            const numKey = Number(key);
            return Number.isSafeInteger(numKey) && typeof value === 'boolean';
          });

          if (validChips) {
            setChips(payload.chips as Record<number, boolean>);
          }
        }
      })
      .on('broadcast', { event: 'SPIN_EVENT' }, ({ payload }) => {
        // Guard against callbacks from stale or replaced channels
        if (supabaseChannelRef.current !== channel) return;

        // Exhaustive payload validation for spin events
        if (
          payload &&
          typeof payload.winnerIndex === 'number' &&
          Number.isSafeInteger(payload.winnerIndex) &&
          Array.isArray(payload.weightedOptions) &&
          payload.weightedOptions.length <= 100 &&
          payload.winnerIndex >= 0 &&
          payload.winnerIndex < payload.weightedOptions.length &&
          typeof payload.selectedWinner === 'object' &&
          payload.selectedWinner !== null &&
          typeof payload.selectedWinner.id === 'number' &&
          Number.isSafeInteger(payload.selectedWinner.id)
        ) {
          // Validate every item in weightedOptions (strictly require positive finite weights)
          const validWeighted = payload.weightedOptions.every(
            (item: unknown): item is OptionItem =>
              typeof item === 'object' &&
              item !== null &&
              typeof (item as OptionItem).id === 'number' &&
              Number.isSafeInteger((item as OptionItem).id) &&
              typeof (item as OptionItem).text === 'string' &&
              (item as OptionItem).text.length <= 200 &&
              typeof (item as OptionItem).weight === 'number' &&
              (item as OptionItem).weight! > 0 &&
              Number.isFinite((item as OptionItem).weight)
          );

          // Ensure selectedWinner matches the item at winnerIndex, and use validated itemAtIndex
          const itemAtIndex = payload.weightedOptions[payload.winnerIndex];
          if (validWeighted && itemAtIndex && itemAtIndex.id === payload.selectedWinner.id) {
            executeSpinAnimationRef.current(itemAtIndex, payload.winnerIndex, payload.weightedOptions);
          }
        }
      })
      .on('broadcast', { event: 'REQUEST_ROOM_SYNC' }, () => {
        // Guard against callbacks from stale or replaced channels
        if (supabaseChannelRef.current !== channel) return;

        // Any peer currently having options sends their state back
        channel.send({
          type: 'broadcast',
          event: 'ROOM_STATE_SYNC',
          payload: { options: optionsRef.current, chips: chipsRef.current },
        });
      })
      .on('presence', { event: 'sync' }, () => {
        if (supabaseChannelRef.current !== channel) return;
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        setPeerCount(count || 1);
      })
      .subscribe((status, err) => {
        // Ignore status events from stale/replaced channels
        if (supabaseChannelRef.current !== channel) return;

        if (status === 'SUBSCRIBED') {
          channel.track({ online_at: new Date().toISOString() });
          setRoomCode(code);
          setIsConnected(true);
          setIsConnecting(false);

          // Preserve Next.js router state when updating URL
          if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('room', code);
            window.history.replaceState(window.history.state, '', url.toString());
          }

          if (isHost) {
            setShowRoomModal(true);
          } else {
            // Request existing wheel state from room peers
            channel.send({
              type: 'broadcast',
              event: 'REQUEST_ROOM_SYNC',
              payload: {},
            });
          }
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          console.error(`Supabase channel error: ${status}`, err);
          
          // Terminal cleanup: null the ref before removing the failed channel
          if (supabaseChannelRef.current === channel) {
            supabaseChannelRef.current = null;
            void supabase?.removeChannel(channel);
          }

          setIsConnecting(false);
          setIsConnected(false);
          setRoomCode('');
          setPeerCount(1);

          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            alert(`Connection failed (${status}). Please check your connection or try again.`);
          }
        }
      });
  }, []);

  // Read URL query parameter for auto-join via invite link
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const param = new URLSearchParams(window.location.search).get('room');
    if (param && isValidRoomCode(param.trim())) {
      setupSupabaseRoom(param.trim(), false);
    }
  }, [setupSupabaseRoom]);

  // Clean up Supabase channel on unmount
  useEffect(() => {
    return () => {
      if (supabaseChannelRef.current) {
        supabase?.removeChannel(supabaseChannelRef.current);
        supabaseChannelRef.current = null;
      }
    };
  }, []);

  const createAndShareRoom = () => {
    if (isConnecting) return;
    const code = generateSecureRoomCode();
    setupSupabaseRoom(code, true);
  };

  const leaveRoom = () => {
    if (supabaseChannelRef.current) {
      supabase?.removeChannel(supabaseChannelRef.current);
      supabaseChannelRef.current = null;
    }
    setIsConnected(false);
    setIsConnecting(false);
    setRoomCode('');
    setPeerCount(1);
    setShowRoomModal(false);

    // Delete just the room parameter and keep the rest of the URL & router state
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('room');
      window.history.replaceState(window.history.state, '', url.toString());
    }
  };

  const copyInviteLink = () => {
    if (typeof window === 'undefined' || !roomCode) return;
    const shareUrl = `${window.location.origin}/electio?room=${roomCode}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      });
    }
  };

  const addOption = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isSpinning) return;
    const newOpt = { id: Date.now(), text: inputValue.trim() };
    const updated = [...options, newOpt];

    setOptions(updated);
    setInputValue('');

    if (isConnected) {
      broadcastState(updated, chips);
    }
  };

  const toggleChip = (id: number) => {
    if (isSpinning) return;
    const updated = { ...chips, [id]: !chips[id] };
    setChips(updated);

    if (isConnected) {
      broadcastState(options, updated);
    }
  };

  const removeOption = (id: number) => {
    if (isSpinning) return;
    const updated = options.filter((o) => o.id !== id);
    setOptions(updated);

    if (isConnected) {
      broadcastState(updated, chips);
    }
  };

  const clearAll = () => {
    if (isSpinning) return;
    setOptions([]);
    setChips({});
    setWinner(null);
    setHighlightedId(null);

    if (isConnected) {
      broadcastState([], {});
    }
  };

  const loadPreset = (key: string) => {
    if (isSpinning) return;
    const presetItems = PRESETS[key] || [];
    const newOptions = presetItems.map((text, idx) => ({
      id: Date.now() + idx,
      text,
    }));

    setOptions(newOptions);
    setChips({});
    setWinner(null);
    setHighlightedId(null);

    if (isConnected) {
      broadcastState(newOptions, {});
    }
  };

  const spinRoulette = () => {
    if (options.length < 2 || isSpinning) return;

    // Apply risk chip weights
    const weightedOptions: OptionItem[] = options.map((opt) => {
      let weight = 100;
      let isRiskApplied = false;
      if (chips[opt.id]) {
        const isUp = Math.random() > 0.5;
        weight = isUp ? 200 : 50;
        isRiskApplied = true;
      }
      return { ...opt, weight, isRiskApplied };
    });

    const totalWeight = weightedOptions.reduce((acc, opt) => acc + (opt.weight || 100), 0);
    let random = Math.random() * totalWeight;
    let selectedWinner = weightedOptions[0];

    for (const opt of weightedOptions) {
      const w = opt.weight || 100;
      if (random < w) {
        selectedWinner = opt;
        break;
      }
      random -= w;
    }

    const winnerIndex = options.findIndex((o) => o.id === selectedWinner.id);

    if (isConnected) {
      if (supabaseChannelRef.current) {
        supabaseChannelRef.current.send({
          type: 'broadcast',
          event: 'SPIN_EVENT',
          payload: { selectedWinner, winnerIndex, weightedOptions },
        });
      }
      // Also execute locally for the person who clicked Spin
      executeSpinAnimation(selectedWinner, winnerIndex, weightedOptions);
    } else {
      executeSpinAnimation(selectedWinner, winnerIndex, weightedOptions);
    }
  };

  const totalBaseWeight = options.length * 100;
  let wheelGradient = 'var(--border) 0deg 360deg';
  if (options.length > 0) {
    wheelGradient = options
      .map((_, i) => {
        const startAngle = (i * 360) / options.length;
        const endAngle = ((i + 1) * 360) / options.length;
        const color = i % 2 === 0 ? 'var(--secondary)' : 'var(--primary)';
        return `${color} ${startAngle}deg ${endAngle}deg`;
      })
      .join(', ');
  }

  const numOptions = options.length;
  const sliceAngle = numOptions > 0 ? 360 / numOptions : 360;

  return (
    <div className={styles.electioContainer}>
      {/* Top Navigation */}
      <div className={styles.backBar}>
        <Link href="/" className={styles.backBtn}>
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </Link>
        <Link href="/project-space" className={styles.backBtn}>
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Nebula Space</span>
        </Link>
      </div>

      <main className={styles.electioMain}>
        <header>
          <div className={styles.headerTop}>
            <h1 className={styles.title}>ELECTIO</h1>
            <div className={styles.topRightBtns}>
              <button 
                className={styles.roomBadgeBtn} 
                disabled={isConnecting}
                onClick={() => {
                  if (!isConnected) {
                    createAndShareRoom();
                  } else {
                    setShowRoomModal(true);
                  }
                }}
              >
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  {isConnecting 
                    ? 'Connecting...' 
                    : isConnected 
                    ? `Live (${peerCount} online)` 
                    : 'Invite Friends'}
                </span>
              </button>
              <button
                className={styles.soundToggle}
                onClick={() => setSoundEnabled(!soundEnabled)}
                title={soundEnabled ? 'Mute audio' : 'Enable audio'}
              >
                {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          <p className={styles.subtitle}>High-Tech Decision Roulette</p>

          {isConnected && (
            <div className={styles.networkBanner}>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
              Live Relay Active &bull; {peerCount} {peerCount === 1 ? 'player' : 'players'} connected &bull; 
              <button 
                type="button" 
                onClick={copyInviteLink} 
                className="ml-2 underline text-yellow-300 hover:text-white cursor-pointer font-semibold"
              >
                {copiedLink ? 'Copied link!' : 'Copy invite link'}
              </button>
            </div>
          )}
        </header>

        {/* INPUT AND PRESETS */}
        <section className={styles.glass}>
          <form className={styles.inputArea} onSubmit={addOption}>
            <input
              type="text"
              placeholder="Add choice or scenario..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isSpinning}
              maxLength={40}
            />
            <button type="submit" className={styles.addBtn} disabled={isSpinning}>
              +
            </button>
          </form>

          <div className={styles.presetBar}>
            <span className={styles.presetLabel}>Presets:</span>
            {Object.keys(PRESETS).map((key) => (
              <button
                key={key}
                type="button"
                className={styles.presetBtn}
                onClick={() => loadPreset(key)}
                disabled={isSpinning}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
            <button
              type="button"
              className={styles.clearBtn}
              onClick={clearAll}
              disabled={isSpinning || options.length === 0}
            >
              Clear
            </button>
          </div>
        </section>

        {/* OPTIONS TABLE / CHIPS GRID */}
        <section className={styles.tableGrid}>
          {!isMounted ? (
            <p className={styles.emptyMsg}>Loading choices...</p>
          ) : options.length === 0 ? (
            <p className={styles.emptyMsg}>Add options or load a preset above to begin!</p>
          ) : (
            options.map((opt, index) => {
              const baseOdds = ((100 / totalBaseWeight) * 100).toFixed(1);
              return (
                <div
                  key={opt.id}
                  className={`${styles.tableCell} ${highlightedId === opt.id ? styles.highlighted : ''}`}
                  onClick={() => toggleChip(opt.id)}
                  title={isSpinning ? undefined : 'Click to toggle Risk Chip (C)'}
                >
                  <div
                    className={styles.cellColor}
                    style={{ background: index % 2 === 0 ? 'var(--secondary)' : 'var(--primary)' }}
                  />
                  <div className={styles.cellNum}>#{index + 1}</div>
                  <div className={styles.cellText}>{opt.text}</div>

                  {chips[opt.id] ? (
                    <div className={styles.chipHUD}>
                      <div className={styles.chip}>C</div>
                      <span className={styles.riskOddsText}>⚡ 50% 2x | 50% 0.5x</span>
                    </div>
                  ) : (
                    <span className={styles.baseOddsText}>{baseOdds}% odds</span>
                  )}

                  <button
                    type="button"
                    className={styles.removeSmall}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeOption(opt.id);
                    }}
                    disabled={isSpinning}
                    title="Remove option"
                  >
                    &times;
                  </button>
                </div>
              );
            })
          )}
        </section>

        {/* ROULETTE WHEEL & CONTROLS */}
        <section className={`${styles.rouletteContainer} ${styles.glass}`}>
          <div className={styles.wheelWrapper}>
            <div className={styles.pointer}>▼</div>
            <div
              className={styles.wheel}
              style={{
                background: `conic-gradient(${wheelGradient})`,
                transform: `rotate(${rotationDegrees}deg)`,
              }}
            >
              {options.map((opt, index) => {
                const midAngle = index * sliceAngle + sliceAngle / 2;
                return (
                  <div
                    key={opt.id}
                    className={styles.sliceLabel}
                    style={{ transform: `rotate(${midAngle}deg)` }}
                  >
                    <span
                      className={styles.sliceContent}
                      style={{ color: index % 2 === 0 ? '#ffffff' : '#000000' }}
                    >
                      #{index + 1} {opt.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            className={styles.spinBtn}
            onClick={spinRoulette}
            disabled={isSpinning || options.length < 2}
          >
            {isSpinning ? 'SPINNING...' : 'SPIN WHEEL'}
          </button>
        </section>

        {winner && (
          <section className={`${styles.winnerCard} ${styles.glass}`}>
            <p>THE CHOICE IS:</p>
            <h2>{winner.text}</h2>
            {winner.isRiskApplied && (
              <p className={styles.riskMsg}>⚡ Risk Chip Outcome Triggered ({winner.weight}% weight)!</p>
            )}
          </section>
        )}
      </main>

      {/* MULTIPLAYER INVITE / ROOM MODAL */}
      {showRoomModal && (
        <div className={styles.modalOverlay} onClick={() => setShowRoomModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeModalBtn} onClick={() => setShowRoomModal(false)}>
              &times;
            </button>
            
            <div className="flex items-center justify-center gap-2 mb-1">
              <Radio className="w-5 h-5 text-yellow-400 animate-pulse" />
              <h2 style={{ margin: 0 }}>Multiplayer Session</h2>
            </div>
            <p className={styles.modalSub}>
              Realtime broadcast relay. Anyone with your invite link can collaborate live!
            </p>

            <div className={styles.roomActiveInfo}>
              <div className={styles.codeDisplay}>
                Invite Link:
                <span className="truncate block mt-1 text-xs md:text-sm select-all">
                  {typeof window !== 'undefined' ? `${window.location.origin}/electio?room=${roomCode}` : roomCode}
                </span>
              </div>

              <div className="flex items-center justify-between w-full px-2 py-1 text-xs text-slate-300">
                <span>Peers Connected:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  {peerCount} Online
                </span>
              </div>

              <button 
                type="button" 
                className={`${styles.copyLinkBtn} ${copiedLink ? styles.copyLinkBtnCopied : ''}`} 
                onClick={copyInviteLink}
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4" />
                    Invite Link Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Invite Link
                  </>
                )}
              </button>

              <button type="button" className={styles.leaveBtn} onClick={leaveRoom}>
                Leave Room & Go Solo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
