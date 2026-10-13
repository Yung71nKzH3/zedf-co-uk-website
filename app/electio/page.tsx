'use client';

import React, { useState, useEffect, useRef, useCallback, useSyncExternalStore } from 'react';
import confetti from 'canvas-confetti';
import { io, Socket } from 'socket.io-client';
import { supabase } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import Link from 'next/link';
import { ArrowLeft, Volume2, VolumeX, Users, Share2, Sparkles } from 'lucide-react';
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

// Generate 4-digit numeric room code
const generateRoomCode = () => Math.floor(1000 + Math.random() * 9000).toString();

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

  // Connection & Room States
  const [roomCode, setRoomCode] = useState('');
  const [joinInputCode, setJoinInputCode] = useState('');
  const [roomNameInput, setRoomNameInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [connectionType, setConnectionType] = useState<'supabase' | 'socket'>('supabase');
  const [customSocketUrl, setCustomSocketUrl] = useState('');
  const [peerCount, setPeerCount] = useState(1);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const socketRef = useRef<Socket | null>(null);
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

  // Read URL query parameter for auto-join
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const param = new URLSearchParams(window.location.search).get('room');
    if (param && /^\d{4}$/.test(param)) {
      setJoinInputCode(param);
      setShowRoomModal(true);
    }
  }, []);

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

  // Broadcast state updates over active channel
  const broadcastState = useCallback((newOpts: OptionItem[], newChips: Record<number, boolean>) => {
    if (!roomCodeRef.current) return;

    if (supabaseChannelRef.current) {
      supabaseChannelRef.current.send({
        type: 'broadcast',
        event: 'ROOM_STATE_SYNC',
        payload: { options: newOpts, chips: newChips },
      });
    } else if (socketRef.current) {
      socketRef.current.emit('UPDATE_ROOM_STATE', {
        roomCode: roomCodeRef.current,
        options: newOpts,
        chips: newChips,
      });
    }
  }, []);

  // Supabase Realtime Room Setup
  const setupSupabaseRoom = useCallback((code: string, isHost: boolean) => {
    if (!supabase) {
      alert('Supabase client is not configured. Switching to offline or custom Socket.io mode.');
      return;
    }

    if (supabaseChannelRef.current) {
      supabase.removeChannel(supabaseChannelRef.current);
    }

    const channel = supabase.channel(`electio-room-${code}`, {
      config: {
        broadcast: { ack: false, self: false },
        presence: { key: Math.random().toString(36).substring(7) },
      },
    });

    channel
      .on('broadcast', { event: 'ROOM_STATE_SYNC' }, ({ payload }) => {
        if (payload?.options) setOptions(payload.options);
        if (payload?.chips) setChips(payload.chips);
      })
      .on('broadcast', { event: 'SPIN_EVENT' }, ({ payload }) => {
        if (payload) {
          executeSpinAnimationRef.current(payload.selectedWinner, payload.winnerIndex, payload.weightedOptions);
        }
      })
      .on('broadcast', { event: 'REQUEST_ROOM_SYNC' }, () => {
        // Only host sends back current state
        if (isHost) {
          channel.send({
            type: 'broadcast',
            event: 'ROOM_STATE_SYNC',
            payload: { options: optionsRef.current, chips: chipsRef.current },
          });
        }
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        setPeerCount(count || 1);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          channel.track({ online_at: new Date().toISOString() });
          setRoomCode(code);
          setIsConnected(true);
          setShowRoomModal(false);

          if (!isHost) {
            // Ask host for current state
            channel.send({
              type: 'broadcast',
              event: 'REQUEST_ROOM_SYNC',
              payload: {},
            });
          }
        }
      });

    supabaseChannelRef.current = channel;
  }, []);

  // Socket.io Room Setup
  const setupSocketRoom = useCallback((url: string, code: string, isHost: boolean) => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const socket = io(url || undefined);
    socketRef.current = socket;

    socket.on('connect', () => {
      if (isHost) {
        socket.emit(
          'CREATE_ROOM',
          { roomCode: code, name: roomNameInput.trim() || `Group Room #${code}`, options: optionsRef.current, chips: chipsRef.current },
          (res: { success: boolean; roomCode?: string }) => {
            if (res?.success) {
              setRoomCode(res.roomCode || code);
              setIsConnected(true);
              setPeerCount(1);
              setShowRoomModal(false);
            }
          }
        );
      } else {
        socket.emit('JOIN_ROOM', { roomCode: code }, (res: { success: boolean; options?: OptionItem[]; chips?: Record<number, boolean>; isSpinning?: boolean; error?: string }) => {
          if (res?.success) {
            setRoomCode(code);
            setIsConnected(true);
            if (res.options) setOptions(res.options);
            if (res.chips) setChips(res.chips);
            if (res.isSpinning) setIsSpinning(true);
            setShowRoomModal(false);
          } else {
            alert(res?.error || `Could not find room with code #${code}`);
          }
        });
      }
    });

    socket.on('ROOM_STATE_SYNC', ({ options: newOpts, chips: newChips }) => {
      if (newOpts) setOptions(newOpts);
      if (newChips) setChips(newChips);
    });

    socket.on('PLAYER_COUNT_UPDATE', (count: number) => {
      setPeerCount(count);
    });

    socket.on('SPIN_EVENT', ({ selectedWinner, winnerIndex, weightedOptions }) => {
      executeSpinAnimationRef.current(selectedWinner, winnerIndex, weightedOptions);
    });

    socket.on('SPIN_FINISHED', () => {
      setIsSpinning(false);
      isSpinningRef.current = false;
    });
  }, [roomNameInput]);

  const hostRoom = () => {
    const code = generateRoomCode();
    if (connectionType === 'supabase') {
      setupSupabaseRoom(code, true);
    } else {
      setupSocketRoom(customSocketUrl.trim(), code, true);
    }
  };

  const joinRoom = (codeToJoin?: string) => {
    const code = codeToJoin || joinInputCode.trim();
    if (!code || code.length !== 4) {
      alert('Please enter a valid 4-digit room code.');
      return;
    }
    if (connectionType === 'supabase') {
      setupSupabaseRoom(code, false);
    } else {
      setupSocketRoom(customSocketUrl.trim(), code, false);
    }
  };

  const leaveRoom = () => {
    if (supabaseChannelRef.current) {
      supabase?.removeChannel(supabaseChannelRef.current);
      supabaseChannelRef.current = null;
    }
    if (socketRef.current) {
      if (roomCode) {
        socketRef.current.emit('LEAVE_ROOM', { roomCode });
      }
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsConnected(false);
    setRoomCode('');
    setPeerCount(1);
  };

  const copyInviteLink = () => {
    if (typeof window === 'undefined' || !roomCode) return;
    const shareUrl = `${window.location.origin}/electio?room=${roomCode}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
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
      } else if (socketRef.current) {
        socketRef.current.emit('TRIGGER_SPIN', {
          roomCode,
          selectedWinner,
          winnerIndex,
          weightedOptions,
        });
      }
      // Also execute locally for host
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
              <button className={styles.roomBadgeBtn} onClick={() => setShowRoomModal(true)}>
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  {isConnected ? `Room #${roomCode} (${peerCount})` : 'Host / Join'}
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
              🔒 Active Confidential Session &bull; Room <strong>#{roomCode}</strong> &bull; {peerCount} connected
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

      {/* MULTIPLAYER LOBBY MODAL */}
      {showRoomModal && (
        <div className={styles.modalOverlay} onClick={() => setShowRoomModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeModalBtn} onClick={() => setShowRoomModal(false)}>
              &times;
            </button>
            <h2>Multiplayer Lobby</h2>
            <p className={styles.modalSub}>Confidential, in-memory live room synchronization</p>

            {/* Protocol selector */}
            <div className={styles.modeToggle}>
              <button
                type="button"
                className={`${styles.modeBtn} ${connectionType === 'supabase' ? styles.modeBtnActive : ''}`}
                onClick={() => setConnectionType('supabase')}
              >
                Supabase Edge Broadcast
              </button>
              <button
                type="button"
                className={`${styles.modeBtn} ${connectionType === 'socket' ? styles.modeBtnActive : ''}`}
                onClick={() => setConnectionType('socket')}
              >
                Custom Socket.io (IONOS / LAN)
              </button>
            </div>

            {connectionType === 'socket' && (
              <input
                type="text"
                placeholder="Socket Server URL (e.g. http://192.168.1.50:3000)"
                value={customSocketUrl}
                onChange={(e) => setCustomSocketUrl(e.target.value)}
                className={styles.socketUrlInput}
              />
            )}

            {isConnected ? (
              <div className={styles.roomActiveInfo}>
                <div className={styles.codeDisplay}>
                  PIN / Passcode: <span>{roomCode}</span>
                </div>
                <p>
                  Players Connected: <strong>{peerCount}</strong>
                </p>

                <button type="button" className={styles.copyLinkBtn} onClick={copyInviteLink}>
                  <span className="flex items-center gap-1.5 justify-center">
                    <Share2 className="w-4 h-4" />
                    {copiedLink ? '✓ Invite Link Copied!' : 'Copy Invite Link'}
                  </span>
                </button>

                <button type="button" className={styles.leaveBtn} onClick={leaveRoom}>
                  Leave Room (Solo Mode)
                </button>
              </div>
            ) : (
              <div className={styles.modalActions}>
                <div className={styles.createBox}>
                  <input
                    type="text"
                    placeholder="Room Name (e.g. Lunch Squad)"
                    value={roomNameInput}
                    onChange={(e) => setRoomNameInput(e.target.value)}
                  />
                  <button type="button" className={styles.hostActionBtn} onClick={hostRoom}>
                    🎲 Create Room
                  </button>
                </div>

                <div className={styles.divider}>OR ENTER 4-DIGIT PIN DIRECTLY</div>

                <div className={styles.joinBox}>
                  <input
                    type="text"
                    placeholder="1234"
                    maxLength={4}
                    value={joinInputCode}
                    onChange={(e) => setJoinInputCode(e.target.value)}
                  />
                  <button
                    type="button"
                    className={styles.joinActionBtn}
                    onClick={() => joinRoom()}
                    disabled={joinInputCode.length !== 4}
                  >
                    Join
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
