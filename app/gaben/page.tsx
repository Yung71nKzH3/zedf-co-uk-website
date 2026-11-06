'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { 
  Volume2, VolumeX, 
  Users, Clock, 
  ExternalLink, ArrowLeft, RefreshCw,
  DollarSign, Eye, EyeOff, Ship, BellOff, Bell
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ==========================================
// Hardcoded YouTube Video:
// https://www.youtube.com/watch?v=zUR1WT1An1w
// ==========================================
const HARDCODED_YOUTUBE_ID = 'zUR1WT1An1w';

const DISCOUNT_TAGS = ['-50%', '-66%', '-75%', '-80%', '-85%', '-90%', '-95%', '-99%'];

// Particle interfaces for zero-re-render Canvas GPU engine
interface CanvasDiscountParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vRot: number;
  tag: string;
  scale: number;
  opacity: number;
  colorBg: string;
}

interface CanvasTrailParticle {
  x: number;
  y: number;
  tag: string;
  opacity: number;
}

// Ultra-reliable Web Audio synthesizer with clean oscillator disconnects
class GabenSoundSystem {
  private ctx: AudioContext | null = null;
  private sfxMuted: boolean = false;

  public init() {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  setSfxMuted(muted: boolean) {
    this.sfxMuted = muted;
  }

  getSfxMuted() {
    return this.sfxMuted;
  }

  playClick() {
    if (this.sfxMuted) return;
    try {
      const ctx = this.init();
      if (!ctx) return;
      const t = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const baseFreq = 950 + (Math.random() * 250 - 125);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.6, t + 0.045);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.055);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + 0.055);

      setTimeout(() => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {}
      }, 70);
    } catch {
      // Audio fallback
    }
  }

  playSacrificeChime() {
    if (this.sfxMuted) return;
    try {
      const ctx = this.init();
      if (!ctx) return;
      const t = ctx.currentTime;

      [1318.51, 1975.53, 2637.02].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.04);
        gain.gain.setValueAtTime(0.2, t + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t + idx * 0.04);
        osc.stop(t + 0.5);

        setTimeout(() => {
          try {
            osc.disconnect();
            gain.disconnect();
          } catch {}
        }, 600);
      });
    } catch {}
  }
}

let globalSoundSystem: GabenSoundSystem | null = null;
function getSoundSystem(): GabenSoundSystem {
  if (!globalSoundSystem) {
    globalSoundSystem = new GabenSoundSystem();
  }
  return globalSoundSystem;
}

function formatPraiseHours(totalSeconds: number) {
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  parts.push(`${hours.toString().padStart(2, '0')}h`);
  parts.push(`${minutes.toString().padStart(2, '0')}m`);
  parts.push(`${seconds.toString().padStart(2, '0')}s`);
  return parts.join(' : ');
}

export default function GabenPage() {
  // Video and Media States (YouTube Hardcoded)
  const [hasStarted, setHasStarted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [sfxMuted, setSfxMuted] = useState(false);
  const [uiVisible, setUiVisible] = useState(true);

  // Fresh Community & Supabase Stats (Zero baseline!)
  const [globalSeconds, setGlobalSeconds] = useState<number>(0);
  const [personalSeconds, setPersonalSeconds] = useState<number>(0);
  const [walletsSacrificed, setWalletsSacrificed] = useState<number>(0);
  const [onlineUsers, setOnlineUsers] = useState<number>(1);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Interactivity States
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [cursorTag, setCursorTag] = useState('-90%');
  const [buttonShockwave, setButtonShockwave] = useState(false);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const particlesRef = useRef<CanvasDiscountParticle[]>([]);
  const trailRef = useRef<CanvasTrailParticle[]>([]);
  const lastTrailDropTime = useRef(0);
  const supabaseChannelRef = useRef<RealtimeChannel | null>(null);
  const accumulatedUnsavedSeconds = useRef(0);

  // Yacht Fleet Math:
  // Starts fresh at 0, 1 superyacht funded every 300 wallets sacrificed
  const totalYachts = Math.floor(walletsSacrificed / 300);
  const nextYachtProgress = Math.round(((walletsSacrificed % 300) / 300) * 100);

  // 1. Initial Load of Personal Stats & Touch Detection + Global Mouse Tracking
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isTouch = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
      setIsTouchDevice(isTouch);

      const savedPersonal = localStorage.getItem('gaben_personal_seconds');
      if (savedPersonal) {
        setPersonalSeconds(parseInt(savedPersonal, 10) || 0);
      }
      const savedSacrifices = localStorage.getItem('gaben_wallets_sacrificed');
      if (savedSacrifices) {
        setWalletsSacrificed(parseInt(savedSacrifices, 10) || 0);
      }

      // Track mouse globally right from the beginning so cursor never disappears!
      const handleGlobalMouseMove = (e: MouseEvent) => {
        setMousePos({ x: e.clientX, y: e.clientY });
      };
      window.addEventListener('mousemove', handleGlobalMouseMove);
      return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
    }
  }, []);

  // 2. Disable YouTube Captions via postMessage API
  const disableCaptions = useCallback(() => {
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;
    try {
      const cw = iframeRef.current.contentWindow;
      const commands = [
        { event: 'command', func: 'unloadModule', args: ['captions'] },
        { event: 'command', func: 'unloadModule', args: ['cc'] },
        { event: 'command', func: 'setOption', args: ['captions', 'track', {}] },
        { event: 'command', func: 'setOption', args: ['cc', 'track', {}] },
        { event: 'command', func: 'setOption', args: ['captions', 'reload', false] },
      ];
      commands.forEach(cmd => {
        cw.postMessage(JSON.stringify(cmd), '*');
      });
    } catch {}
  }, []);

  useEffect(() => {
    if (!hasStarted) return;
    disableCaptions();
    const t1 = setTimeout(disableCaptions, 500);
    const t2 = setTimeout(disableCaptions, 1200);
    const t3 = setTimeout(disableCaptions, 2500);
    const t4 = setTimeout(disableCaptions, 4500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [hasStarted, disableCaptions]);

  // 3. High-Performance GPU Canvas Physics Loop (ZERO React re-renders during animation!)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number;
    let lastTime = performance.now();

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const drawPill = (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      text: string,
      rot: number,
      scale: number,
      opacity: number,
      bgColor = '#a4d007'
    ) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, opacity));
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.scale(scale, scale);

      const pillWidth = 46;
      const pillHeight = 22;
      const radius = 4;

      ctx.fillStyle = bgColor;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(-pillWidth / 2, -pillHeight / 2, pillWidth, pillHeight, radius);
      } else {
        ctx.rect(-pillWidth / 2, -pillHeight / 2, pillWidth, pillHeight);
      }
      ctx.fill();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 11px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 0, 1);

      ctx.restore();
    };

    const renderLoop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 1. Draw and update mouse trail
        const trails = trailRef.current;
        for (let i = trails.length - 1; i >= 0; i--) {
          const t = trails[i];
          t.opacity -= 2.0 * dt;
          if (t.opacity <= 0) {
            trails.splice(i, 1);
            continue;
          }
          drawPill(ctx, t.x, t.y, t.tag, 0, 0.75, t.opacity, '#4c6b22');
        }

        // 2. Draw and update physics discount fireworks
        const particles = particlesRef.current;
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx * dt * 60;
          p.y += p.vy * dt * 60;
          p.vy += 0.38 * dt * 60; // Gravity
          p.rot += p.vRot * dt * 60;
          p.opacity -= 0.65 * dt; // Fade over ~1.4s

          if (p.opacity <= 0 || p.y > canvas.height + 60) {
            particles.splice(i, 1);
            continue;
          }

          drawPill(ctx, p.x, p.y, p.tag, p.rot, p.scale, p.opacity, p.colorBg);
        }
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // 4. Supabase Integration: Presence & Listen Hours Sync
  useEffect(() => {
    if (!supabase) {
      setOnlineUsers(1);
      return;
    }

    const client = supabase;
    let isSubscribed = true;

    const fetchGlobalStats = async () => {
      try {
        const { data, error } = await client
          .from('gaben_global_stats')
          .select('total_seconds, wallets_sacrificed')
          .eq('id', 'primary')
          .single();

        if (data && !error && isSubscribed) {
          setGlobalSeconds(data.total_seconds || 0);
          setWalletsSacrificed(data.wallets_sacrificed || 0);
        }
      } catch {
        // Table might not exist yet
      }
    };

    fetchGlobalStats();

    const channel = client.channel('gaben_communion', {
      config: {
        presence: { key: 'user_' + Math.random().toString(36).slice(2, 8) },
      },
    });

    supabaseChannelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const userCount = Object.keys(state).length;
        if (isSubscribed) {
          setOnlineUsers(Math.max(1, userCount));
        }
      })
      .on('broadcast', { event: 'sacrifice_wallet' }, () => {
        setWalletsSacrificed(prev => prev + 1);
        spawnSacrificeEffects(false);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      isSubscribed = false;
      if (supabaseChannelRef.current) {
        client.removeChannel(supabaseChannelRef.current);
        supabaseChannelRef.current = null;
      }
    };
  }, []);

  // 5. Heartbeat: Praise Time Accumulation
  useEffect(() => {
    if (!hasStarted) return;

    const interval = setInterval(() => {
      setPersonalSeconds(p => {
        const updated = p + 1;
        if (typeof window !== 'undefined') {
          localStorage.setItem('gaben_personal_seconds', updated.toString());
        }
        return updated;
      });

      setGlobalSeconds(g => g + 1);
      accumulatedUnsavedSeconds.current += 1;

      if (accumulatedUnsavedSeconds.current >= 15) {
        const delta = accumulatedUnsavedSeconds.current;
        accumulatedUnsavedSeconds.current = 0;
        syncSecondsToSupabase(delta);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [hasStarted]);

  const syncSecondsToSupabase = async (delta: number) => {
    if (!supabase) return;
    const client = supabase;
    try {
      setIsSyncing(true);
      const { error } = await client.rpc('increment_gaben_time', { delta_seconds: delta });
      if (error) {
        await client
          .from('gaben_global_stats')
          .update({
            total_seconds: globalSeconds + delta,
            updated_at: new Date().toISOString(),
          })
          .eq('id', 'primary');
      }
    } catch {
      // Graceful fallback
    } finally {
      setIsSyncing(false);
    }
  };

  // 6. Mouse & Touch handlers
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });

    const now = performance.now();
    if (now - lastTrailDropTime.current > 40) {
      lastTrailDropTime.current = now;
      const randomTag = DISCOUNT_TAGS[Math.floor(Math.random() * DISCOUNT_TAGS.length)];
      trailRef.current.push({ x: e.clientX, y: e.clientY, tag: randomTag, opacity: 0.9 });
      if (trailRef.current.length > 30) {
        trailRef.current.shift();
      }
    }
  };

  const spawnDiscountConfetti = (originX: number, originY: number, count = 24) => {
    const colors = ['#a4d007', '#a4d007', '#ffd700', '#66c0f4'];
    const p = particlesRef.current;

    if (p.length > 180) {
      p.splice(0, count);
    }

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.4 - 0.2);
      const speed = 4 + Math.random() * 8;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - (Math.random() * 4 + 2);
      const rot = (Math.random() * 360 * Math.PI) / 180;
      const vRot = (Math.random() - 0.5) * 0.2;
      const tag = DISCOUNT_TAGS[Math.floor(Math.random() * DISCOUNT_TAGS.length)];
      const colorBg = colors[Math.floor(Math.random() * colors.length)];

      p.push({
        x: originX,
        y: originY,
        vx,
        vy,
        rot,
        vRot,
        tag,
        scale: 0.8 + Math.random() * 0.35,
        opacity: 1,
        colorBg,
      });
    }
  };

  const handleTriggerAction = (clientX: number, clientY: number, target: HTMLElement) => {
    if (target.closest('button') || target.closest('input') || target.closest('a') || target.closest('.interactive-panel')) {
      return;
    }

    if (!hasStarted) return;

    getSoundSystem().playClick();

    const nextTag = DISCOUNT_TAGS[Math.floor(Math.random() * DISCOUNT_TAGS.length)];
    setCursorTag(nextTag);

    spawnDiscountConfetti(clientX, clientY, 24);
  };

  const handleScreenClick = (e: React.MouseEvent) => {
    handleTriggerAction(e.clientX, e.clientY, e.target as HTMLElement);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      handleTriggerAction(touch.clientX, touch.clientY, e.target as HTMLElement);
    }
  };

  const spawnSacrificeEffects = (broadcast = true) => {
    getSoundSystem().playSacrificeChime();

    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        const randX = Math.random() * window.innerWidth;
        spawnDiscountConfetti(randX, window.innerHeight * 0.2, 18);
      }, i * 110);
    }

    if (broadcast && supabaseChannelRef.current) {
      supabaseChannelRef.current.send({
        type: 'broadcast',
        event: 'sacrifice_wallet',
        payload: { timestamp: Date.now() },
      });
    }
  };

  // SACRIFICE WALLET BUTTON: Reactive shockwave + discount shower + opens Steam Store!
  const handleSacrificeWallet = (e: React.MouseEvent) => {
    e.stopPropagation();

    setButtonShockwave(true);
    setTimeout(() => setButtonShockwave(false), 700);

    setWalletsSacrificed(w => {
      const next = w + 1;
      if (typeof window !== 'undefined') {
        localStorage.setItem('gaben_wallets_sacrificed', next.toString());
      }
      return next;
    });

    if (supabase) {
      const client = supabase;
      void client
        .rpc('increment_gaben_wallet')
        .then(({ error }) => {
          if (error) {
            void client
              .from('gaben_global_stats')
              .update({ wallets_sacrificed: walletsSacrificed + 1 })
              .eq('id', 'primary');
          }
        });
    }

    spawnSacrificeEffects(true);
    window.open('https://store.steampowered.com/', '_blank');
  };

  // 7. Initiation Screen
  const startExperience = () => {
    getSoundSystem().init();
    getSoundSystem().playSacrificeChime();

    setHasStarted(true);
    setIsMuted(false);
    getSoundSystem().setSfxMuted(false);
    setSfxMuted(false);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  const toggleSfx = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !sfxMuted;
    setSfxMuted(next);
    getSoundSystem().setSfxMuted(next);
    if (!next) {
      getSoundSystem().playClick();
    }
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onClick={handleScreenClick}
      onTouchStart={handleTouchStart}
      className={`relative w-screen h-screen overflow-hidden bg-black select-none text-white font-sans ${
        isTouchDevice ? 'cursor-default' : 'cursor-none'
      }`}
    >
      {/* 
        1. CUSTOM CURSOR IS THE DISCOUNT TAG:
        Using z-[9999] so it is ALWAYS on top of everything, including the black initiation screen & buttons!
      */}
      {!isTouchDevice && mousePos.x >= 0 && (
        <div
          className="pointer-events-none fixed z-[9999] transition-transform duration-75 ease-out"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <span className="inline-flex items-center px-2.5 py-1 rounded font-black text-xs bg-[#a4d007] text-[#1b2838] shadow-[0_0_20px_rgba(164,208,7,1)] border border-[#86aa05] tracking-wider scale-110">
            {cursorTag}
          </span>
        </div>
      )}

      {/* 2. Hardware-Accelerated 60/120 FPS GPU Canvas (Zero DOM Lag!) */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-40 w-full h-full"
      />

      {/* Background YouTube Video Loop with Captions Forced OFF */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-[#0a0f18] flex items-center justify-center">
        {hasStarted && (
          <iframe
            ref={iframeRef}
            className="w-[125vw] h-[125vh] min-w-full min-h-full pointer-events-none"
            src={`https://www.youtube-nocookie.com/embed/${HARDCODED_YOUTUBE_ID}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${HARDCODED_YOUTUBE_ID}&controls=0&showinfo=0&rel=0&iv_load_policy=3&disablekb=1&enablejsapi=1&cc_load_policy=0&cc_lang_pref=off&hl=en`}
            allow="autoplay; encrypted-media"
            title="Gaben Miracle Loop"
            onLoad={disableCaptions}
          />
        )}

        {/* Ambient CRT & Holy Glow Overlay */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/80 pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30" />
      </div>

      {/* BAREBONES INITIATION SCREEN (YES or YES) */}
      {!hasStarted && (
        <div className="absolute inset-0 z-50 flex flex-col justify-between p-6 sm:p-10 bg-black text-white">
          <div className="flex justify-start">
            <Link
              href="/project-space"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 text-slate-300 hover:text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back Home</span>
            </Link>
          </div>

          <div className="flex flex-col items-center justify-center text-center my-auto">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-widest text-white uppercase mb-10 select-none">
              ARE YOU READY FOR A MIRACLE?
            </h1>

            <div className="flex items-center justify-center gap-6 sm:gap-10">
              <button
                onClick={startExperience}
                className="px-10 sm:px-14 py-4 sm:py-5 rounded-2xl bg-white text-black font-black text-xl sm:text-2xl tracking-widest uppercase hover:bg-zinc-200 active:scale-95 transition-all shadow-[0_0_35px_rgba(255,255,255,0.4)] cursor-pointer"
              >
                YES
              </button>

              <button
                onClick={startExperience}
                className="px-10 sm:px-14 py-4 sm:py-5 rounded-2xl bg-white text-black font-black text-xl sm:text-2xl tracking-widest uppercase hover:bg-zinc-200 active:scale-95 transition-all shadow-[0_0_35px_rgba(255,255,255,0.4)] cursor-pointer"
              >
                YES
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-zinc-600 font-mono tracking-wider">
            GABEN.TV // AUDIO LOOPS CONTINUOUSLY
          </div>
        </div>
      )}

      {/* Top Header Navigation (Fixed Top-Left / Top-Right) */}
      <header
        className={`absolute top-0 left-0 right-0 z-30 p-4 md:p-6 flex items-center justify-between transition-opacity duration-300 ${
          uiVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/project-space"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 hover:border-cyan-400 text-slate-200 hover:text-cyan-400 text-xs sm:text-sm font-semibold transition-all hover:bg-black/80 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Personal Space</span>
          </Link>

          <div className="px-3 py-1.5 rounded-xl bg-[#171a21]/80 backdrop-blur-md border border-[#a4d007]/40 flex items-center gap-2 shadow-[0_0_15px_rgba(164,208,7,0.25)]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#a4d007] animate-ping" />
            <span className="text-xs uppercase tracking-widest font-black text-[#a4d007]">
              GABEN.TV
            </span>
          </div>
        </div>

        {/* Live Faithful Counter & UI Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-xs font-semibold text-slate-300">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>{onlineUsers} {onlineUsers === 1 ? 'Worshipper' : 'Faithful'} Online</span>
          </div>

          <button
            onClick={() => setUiVisible(!uiVisible)}
            title="Toggle UI visibility"
            className="p-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 hover:border-white/30 text-slate-300 transition-colors cursor-pointer"
          >
            {uiVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* LEFT-SIDE HUD DOCK (Clean, unobstructed view for Lord Gaben!) */}
      <div
        className={`absolute top-16 sm:top-20 left-4 sm:left-6 z-20 flex flex-col gap-3.5 w-80 sm:w-96 max-w-[calc(100vw-2rem)] transition-all duration-300 ${
          uiVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Sleek Praise Panel */}
        <div className="interactive-panel p-5 rounded-3xl bg-black/75 backdrop-blur-xl border border-white/15 shadow-[0_12px_40px_rgba(0,0,0,0.85)] flex flex-col">
          <div className="flex items-center justify-between text-xs font-black tracking-widest text-[#a4d007] uppercase mb-1">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>GLOBAL PRAISE HOURS</span>
            </div>
            {isSyncing && <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />}
          </div>

          <div className="font-mono text-2xl sm:text-3xl font-black tracking-wider text-white drop-shadow-[0_2px_12px_rgba(164,208,7,0.5)]">
            {formatPraiseHours(globalSeconds)}
          </div>

          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400">Your Praise Time</span>
              <span className="font-mono font-bold text-cyan-400">{formatPraiseHours(personalSeconds)}</span>
            </div>
            <div className="flex flex-col text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400">Wallets Sacrificed</span>
              <span className="font-mono font-bold text-[#a4d007]">{walletsSacrificed.toLocaleString()}</span>
            </div>
          </div>

          {/* Gabe's Yacht Fleet Tracker */}
          <div className="mt-3 pt-3 border-t border-white/10 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                <Ship className="w-3.5 h-3.5 text-amber-400" />
                <span>Gabe&apos;s Fleet: {totalYachts} Yachts</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Next: {nextYachtProgress}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-[#a4d007] transition-all duration-300"
                style={{ width: `${nextYachtProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* PURE, ULTRA-REACTIVE SACRIFICE WALLET BUTTON */}
        <div className="relative group">
          {buttonShockwave && (
            <span className="absolute inset-0 rounded-2xl bg-[#a4d007] opacity-60 animate-ping pointer-events-none" />
          )}

          <button
            onClick={handleSacrificeWallet}
            className="w-full relative px-6 py-4 rounded-2xl bg-gradient-to-r from-[#a4d007] via-emerald-400 to-[#b8e50a] text-black font-black text-sm sm:text-base tracking-widest uppercase shadow-[0_0_35px_rgba(164,208,7,0.7)] hover:shadow-[0_0_55px_rgba(164,208,7,1)] hover:scale-[1.03] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 border-2 border-yellow-200 overflow-hidden"
          >
            <span className="absolute -inset-x-12 -inset-y-12 bg-white/20 transform -rotate-45 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700 pointer-events-none" />

            <DollarSign className="w-5 h-5 stroke-[3]" />
            <span>SACRIFICE WALLET</span>
            <ExternalLink className="w-4 h-4 ml-1 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* Bottom Controls Bar (Audio controls only, no settings button!) */}
      <footer
        className={`absolute bottom-0 left-0 right-0 z-30 p-4 md:p-6 flex items-center justify-start transition-opacity duration-300 bg-gradient-to-t from-black/90 via-black/40 to-transparent ${
          uiVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleMute}
            className={`p-3 rounded-xl backdrop-blur-md border transition-all hover:scale-105 cursor-pointer ${
              isMuted
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
            }`}
            title={isMuted ? 'Unmute Hymn' : 'Mute Hymn'}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          <button
            onClick={toggleSfx}
            className={`p-3 rounded-xl backdrop-blur-md border transition-all hover:scale-105 cursor-pointer ${
              sfxMuted
                ? 'bg-slate-700/40 border-white/10 text-slate-400'
                : 'bg-white/10 hover:bg-white/20 border-white/10 text-cyan-300'
            }`}
            title={sfxMuted ? 'Turn SFX Clicks ON' : 'Mute SFX Clicks'}
          >
            {sfxMuted ? <BellOff className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
          </button>
        </div>
      </footer>
    </div>
  );
}
