'use client';

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ExternalLink,
  ArrowUpRight,
  Compass,
  Move,
  MousePointerClick,
} from 'lucide-react';
import { SITE_TREE, type SiteItem, type SiteSubfolder, type SiteWing } from '@/lib/site-tree';

interface Camera {
  x: number;
  y: number;
  zoom: number;
}

interface SubfolderLayout {
  wing: SiteWing;
  subfolder: SiteSubfolder;
  x: number;
  y: number;
  width: number;
  height: number;
  items: {
    item: SiteItem;
    localX: number;
    localY: number;
    worldX: number;
    worldY: number;
    width: number;
    height: number;
  }[];
}

interface WingLayout {
  wing: SiteWing;
  x: number;
  y: number;
  badgeY: number;
}

const SUBFOLDER_POSITIONS: Record<string, { x: number; y: number }> = {
  // Stuff (left wing)
  'apps-experiments': { x: -1340, y: -380 },
  'arcade-suite': { x: -580, y: -380 },
  'academic-resources': { x: -1340, y: 320 },
  'extras-media': { x: -580, y: 320 },
  // Socials (right wing)
  'dev-code': { x: 580, y: -380 },
  'media-taste': { x: 1340, y: -380 },
  'social-irl': { x: 960, y: 320 },
  // System (bottom wing)
  'meta-routes': { x: 0, y: 920 },
};

const WING_POSITIONS: Record<SiteWing['id'], { x: number; y: number; badgeY: number; zoom: number }> = {
  stuff: { x: -960, y: -30, badgeY: -790, zoom: 0.52 },
  socials: { x: 960, y: -30, badgeY: -790, zoom: 0.52 },
  system: { x: 0, y: 860, badgeY: 575, zoom: 0.78 },
};

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 2.4;
const OVERVIEW_CAMERA: Camera = { x: 0, y: 80, zoom: 0.35 };

const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));

export default function ZuiCanvas() {
  const router = useRouter();
  const viewportRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);

  // Camera state stored in refs for 60/120fps rAF updates without React re-renders
  const currentCam = useRef<Camera>({ x: 0, y: 80, zoom: 0.2 });
  const targetCam = useRef<Camera>({ ...OVERVIEW_CAMERA });
  const isDragging = useRef(false);
  const dragMoved = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });
  const velocity = useRef({ vx: 0, vy: 0 });
  const pinchDist = useRef<number | null>(null);

  const [hudZoom, setHudZoom] = useState(35);
  const [lod, setLod] = useState<'macro' | 'meso' | 'micro'>('macro');
  const [activeLabel, setActiveLabel] = useState<string>('Overview');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [historyStack, setHistoryStack] = useState<{ label: string; cam: Camera }[]>([]);

  // Precompute deterministic spatial coordinates for every wing, subfolder, and item
  const { wingLayouts, subfolderLayouts } = useMemo(() => {
    const wings: WingLayout[] = [];
    const subfolders: SubfolderLayout[] = [];

    for (const wing of SITE_TREE) {
      const wp = WING_POSITIONS[wing.id];
      wings.push({ wing, x: wp.x, y: wp.y, badgeY: wp.badgeY });

      for (const sf of wing.subfolders) {
        const pos = SUBFOLDER_POSITIONS[sf.id] ?? { x: 0, y: 0 };
        const cols = 2;
        const cardW = 290;
        const cardH = 112;
        const gapX = 20;
        const gapY = 18;
        const padX = 28;
        const headerH = 92;
        const padBottom = 26;

        const rows = Math.ceil(sf.items.length / cols);
        const width = padX * 2 + cols * cardW + (cols - 1) * gapX;
        const height = headerH + rows * cardH + Math.max(0, rows - 1) * gapY + padBottom;

        const items = sf.items.map((item, idx) => {
          const col = idx % cols;
          const row = Math.floor(idx / cols);
          const localX = -width / 2 + padX + col * (cardW + gapX) + cardW / 2;
          const localY = -height / 2 + headerH + row * (cardH + gapY) + cardH / 2;
          return {
            item,
            localX,
            localY,
            worldX: pos.x + localX,
            worldY: pos.y + localY,
            width: cardW,
            height: cardH,
          };
        });

        subfolders.push({
          wing,
          subfolder: sf,
          x: pos.x,
          y: pos.y,
          width,
          height,
          items,
        });
      }
    }

    return { wingLayouts: wings, subfolderLayouts: subfolders };
  }, []);

  const flyTo = useCallback((next: Camera, label: string, pushHistory = true) => {
    if (pushHistory) {
      setHistoryStack((prev) => [
        ...prev.slice(-6),
        { label: activeLabel, cam: { ...targetCam.current } },
      ]);
    }
    targetCam.current = {
      x: next.x,
      y: next.y,
      zoom: clamp(next.zoom, MIN_ZOOM, MAX_ZOOM),
    };
    setActiveLabel(label);
  }, [activeLabel]);

  const resetView = useCallback(() => {
    setSelectedItemId(null);
    setHistoryStack([]);
    targetCam.current = { ...OVERVIEW_CAMERA };
    setActiveLabel('Overview');
  }, []);

  const stepOut = useCallback(() => {
    setSelectedItemId(null);
    setHistoryStack((prev) => {
      if (prev.length === 0) {
        targetCam.current = { ...OVERVIEW_CAMERA };
        setActiveLabel('Overview');
        return prev;
      }
      const last = prev[prev.length - 1];
      targetCam.current = { ...last.cam };
      setActiveLabel(last.label);
      return prev.slice(0, -1);
    });
  }, []);

  // 60fps camera animation loop
  useEffect(() => {
    let rafId = 0;
    let lastHudSync = 0;

    const tick = (now: number) => {
      // Apply inertia when not dragging
      if (!isDragging.current && (Math.abs(velocity.current.vx) > 0.05 || Math.abs(velocity.current.vy) > 0.05)) {
        targetCam.current.x -= velocity.current.vx / targetCam.current.zoom;
        targetCam.current.y -= velocity.current.vy / targetCam.current.zoom;
        velocity.current.vx *= 0.9;
        velocity.current.vy *= 0.9;
      }

      const lerp = isDragging.current ? 0.45 : 0.16;
      const cur = currentCam.current;
      const tgt = targetCam.current;

      cur.x += (tgt.x - cur.x) * lerp;
      cur.y += (tgt.y - cur.y) * lerp;
      cur.zoom += (tgt.zoom - cur.zoom) * lerp;

      if (worldRef.current && viewportRef.current) {
        const vw = viewportRef.current.clientWidth;
        const vh = viewportRef.current.clientHeight;
        const tx = vw / 2 - cur.x * cur.zoom;
        const ty = vh / 2 - cur.y * cur.zoom;
        worldRef.current.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${cur.zoom})`;
      }

      if (now - lastHudSync > 80) {
        lastHudSync = now;
        const pct = Math.round(cur.zoom * 100);
        setHudZoom((prev) => (prev === pct ? prev : pct));

        const nextLod: 'macro' | 'meso' | 'micro' =
          cur.zoom < 0.52 ? 'macro' : cur.zoom < 1.18 ? 'meso' : 'micro';
        setLod((prev) => (prev === nextLod ? prev : nextLod));
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Wheel zoom anchored to cursor
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const tgt = targetCam.current;
      const wx = (mx - rect.width / 2) / tgt.zoom + tgt.x;
      const wy = (my - rect.height / 2) / tgt.zoom + tgt.y;

      const factor = Math.exp(-e.deltaY * 0.0015);
      const nextZoom = clamp(tgt.zoom * factor, MIN_ZOOM, MAX_ZOOM);

      targetCam.current = {
        x: wx - (mx - rect.width / 2) / nextZoom,
        y: wy - (my - rect.height / 2) / nextZoom,
        zoom: nextZoom,
      };
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Backspace') {
        e.preventDefault();
        stepOut();
      } else if (e.key === '0' || e.key.toLowerCase() === 'r') {
        resetView();
      } else if (e.key === '=' || e.key === '+') {
        targetCam.current.zoom = clamp(targetCam.current.zoom * 1.25, MIN_ZOOM, MAX_ZOOM);
      } else if (e.key === '-') {
        targetCam.current.zoom = clamp(targetCam.current.zoom / 1.25, MIN_ZOOM, MAX_ZOOM);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [resetView, stepOut]);

  // Pointer drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    isDragging.current = true;
    dragMoved.current = false;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    velocity.current = { vx: 0, vy: 0 };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      dragMoved.current = true;
    }
    lastPointer.current = { x: e.clientX, y: e.clientY };
    velocity.current = { vx: dx, vy: dy };

    targetCam.current.x -= dx / targetCam.current.zoom;
    targetCam.current.y -= dy / targetCam.current.zoom;
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  // Touch pinch-to-zoom
  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length !== 2 || !viewportRef.current) {
      pinchDist.current = null;
      return;
    }
    const t1 = e.touches[0];
    const t2 = e.touches[1];
    const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
    if (pinchDist.current !== null && dist > 0) {
      const ratio = dist / pinchDist.current;
      const rect = viewportRef.current.getBoundingClientRect();
      const mx = (t1.clientX + t2.clientX) / 2 - rect.left;
      const my = (t1.clientY + t2.clientY) / 2 - rect.top;
      const tgt = targetCam.current;
      const wx = (mx - rect.width / 2) / tgt.zoom + tgt.x;
      const wy = (my - rect.height / 2) / tgt.zoom + tgt.y;
      const nextZoom = clamp(tgt.zoom * ratio, MIN_ZOOM, MAX_ZOOM);
      targetCam.current = {
        x: wx - (mx - rect.width / 2) / nextZoom,
        y: wy - (my - rect.height / 2) / nextZoom,
        zoom: nextZoom,
      };
    }
    pinchDist.current = dist;
  };

  const handleTouchEnd = () => {
    pinchDist.current = null;
  };

  const openItem = (item: SiteItem) => {
    if (item.external) {
      window.open(item.href, '_blank', 'noopener,noreferrer');
    } else {
      router.push(item.href);
    }
  };

  const handleItemClick = (
    e: React.MouseEvent,
    item: SiteItem,
    worldX: number,
    worldY: number,
  ) => {
    e.stopPropagation();
    if (dragMoved.current) return;

    if (currentCam.current.zoom < 1.15 || selectedItemId !== item.id) {
      setSelectedItemId(item.id);
      flyTo({ x: worldX, y: worldY, zoom: 1.55 }, item.title);
    } else {
      openItem(item);
    }
  };

  return (
    <div
      ref={viewportRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 z-30 overflow-hidden select-none cursor-grab active:cursor-grabbing touch-none bg-[#080e1a]/90 backdrop-blur-sm"
    >
      {/* Subtle spatial grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(34, 211, 238, 0.35) 1px, transparent 0)',
          backgroundSize: '36px 36px',
        }}
      />

      {/* World Transform Container */}
      <div
        ref={worldRef}
        className="absolute top-0 left-0 origin-top-left will-change-transform"
      >
        {/* Connector lines from ZEDF Core to Wing Hubs */}
        <svg
          className="pointer-events-none absolute overflow-visible"
          style={{ left: 0, top: 0, width: 1, height: 1 }}
        >
          {wingLayouts.map(({ wing, x, badgeY }) => (
            <line
              key={wing.id}
              x1={0}
              y1={0}
              x2={x}
              y2={badgeY + 40}
              stroke={wing.accent}
              strokeOpacity={0.28}
              strokeWidth={3}
              strokeDasharray="10 10"
            />
          ))}
        </svg>

        {/* ZEDF Core Origin Node */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (!dragMoved.current) resetView();
          }}
          style={{
            left: 0,
            top: 0,
            transform: 'translate(-50%, -50%)',
          }}
          className="absolute w-[320px] rounded-3xl bg-[#111b2e]/95 border-2 border-cyan-400/50 p-6 text-center shadow-[0_0_60px_rgba(6,182,212,0.25)] cursor-pointer hover:border-cyan-300 transition-colors"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 text-xs font-mono uppercase tracking-widest mb-3">
            <Compass className="w-3.5 h-3.5" />
            <span>ZEDF Spatial Map</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">w1ll0w</h1>
          <p className="text-slate-300 text-sm mt-1.5">
            UK-based Undergrad Data Science Student
          </p>
          <p className="text-cyan-400/80 text-xs font-mono mt-3">
            Scroll to zoom • Click any cluster
          </p>
        </div>

        {/* Wing Headers (Macro Landmarks) */}
        {wingLayouts.map(({ wing, x, badgeY }) => {
          const WingIcon = wing.icon;
          const wp = WING_POSITIONS[wing.id];
          return (
            <button
              key={wing.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!dragMoved.current) {
                  flyTo({ x: wp.x, y: wp.y, zoom: wp.zoom }, wing.title);
                }
              }}
              style={{
                left: x,
                top: badgeY,
                transform: 'translate(-50%, -50%)',
                borderColor: `${wing.accent}66`,
              }}
              className="absolute px-8 py-4 rounded-2xl bg-[#131d31]/95 border-2 flex items-center gap-4 shadow-2xl hover:scale-105 transition-transform cursor-pointer"
            >
              <WingIcon className="w-9 h-9 shrink-0" style={{ color: wing.accent }} />
              <div className="text-left">
                <div className="text-2xl font-extrabold text-white tracking-tight">
                  {wing.title}
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {wing.subtitle}
                </div>
              </div>
            </button>
          );
        })}

        {/* Subfolder Clusters & Item Cards */}
        {subfolderLayouts.map(({ subfolder, x, y, width, height, items }) => {
          const SfIcon = subfolder.icon;
          return (
            <div
              key={subfolder.id}
              onClick={(e) => {
                e.stopPropagation();
                if (!dragMoved.current) {
                  flyTo({ x, y, zoom: 1.05 }, subfolder.title);
                }
              }}
              style={{
                left: x,
                top: y,
                width,
                height,
                transform: 'translate(-50%, -50%)',
                borderColor: `${subfolder.accent}44`,
              }}
              className="absolute rounded-3xl bg-[#11192b]/90 border-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-pointer hover:border-cyan-400/70 transition-colors"
            >
              {/* Subfolder Header */}
              <div className="px-7 pt-5 pb-3 flex items-center justify-between border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${subfolder.accent}20` }}
                  >
                    <SfIcon className="w-5 h-5" style={{ color: subfolder.accent }} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white leading-tight">
                      {subfolder.title}
                    </h2>
                    {lod !== 'macro' && (
                      <p className="text-xs text-slate-400 mt-0.5">{subfolder.desc}</p>
                    )}
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-slate-800/90 text-slate-300 text-xs font-mono">
                  {items.length}
                </span>
              </div>

              {/* Items Grid inside Subfolder */}
              {items.map(({ item, localX, localY, worldX, worldY, width: cw, height: ch }) => {
                const ItemIcon = item.icon;
                const isSelected = selectedItemId === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={(e) => handleItemClick(e, item, worldX, worldY)}
                    style={{
                      left: width / 2 + localX,
                      top: height / 2 + localY,
                      width: cw,
                      height: ch,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className={`absolute rounded-2xl p-3.5 flex flex-col justify-between transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#1a2742] border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.4)] scale-[1.03]'
                        : 'bg-[#0b1220]/95 border-slate-800 hover:border-cyan-400/60 hover:bg-[#152036]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <ItemIcon className="w-6 h-6 text-cyan-400 shrink-0" />
                        <span className="font-bold text-slate-100 text-sm truncate">
                          {item.title}
                        </span>
                      </div>
                      {item.badge && (
                        <span className="px-2 py-0.5 rounded-md bg-cyan-500/15 text-cyan-300 text-[10px] font-mono shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </div>

                    {lod === 'macro' ? (
                      <div className="text-[11px] font-mono text-slate-500 truncate">
                        {item.href}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 line-clamp-2 leading-snug">
                        {item.desc}
                      </p>
                    )}

                    {lod === 'micro' && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                        <span className="text-[10px] font-mono text-slate-500 truncate max-w-[160px]">
                          {item.href}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openItem(item);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          <span>Open</span>
                          {item.external ? (
                            <ExternalLink className="w-3 h-3" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Top-Left HUD: Location & Zoom Level */}
      <div
        onPointerDown={(e) => e.stopPropagation()}
        className="fixed top-4 left-4 z-50 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#111b2e]/90 border border-slate-700/80 backdrop-blur-md shadow-lg text-xs font-mono"
      >
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span className="text-slate-200 font-semibold">{activeLabel}</span>
        <span className="text-slate-600">|</span>
        <span className="text-cyan-400">{hudZoom}%</span>
        {historyStack.length > 0 && (
          <>
            <span className="text-slate-600">|</span>
            <button
              type="button"
              onClick={stepOut}
              className="text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              Esc ↩
            </button>
          </>
        )}
      </div>

      {/* Bottom-Center HUD: Quick Jump & Zoom Controls */}
      <div
        onPointerDown={(e) => e.stopPropagation()}
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex flex-wrap items-center justify-center gap-2 px-3 py-2 rounded-2xl bg-[#111b2e]/90 border border-slate-700/80 backdrop-blur-md shadow-2xl max-w-[94vw]"
      >
        <div className="flex items-center gap-1 pr-2 border-r border-slate-700/80">
          <button
            type="button"
            onClick={resetView}
            className="px-2.5 py-1 rounded-lg text-xs font-mono text-slate-200 hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors cursor-pointer"
          >
            Overview
          </button>
          {SITE_TREE.map((wing) => (
            <button
              key={wing.id}
              type="button"
              onClick={() => {
                const wp = WING_POSITIONS[wing.id];
                flyTo({ x: wp.x, y: wp.y, zoom: wp.zoom }, wing.title);
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-mono text-slate-300 hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              {wing.title}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Zoom out"
            onClick={() => {
              targetCam.current.zoom = clamp(targetCam.current.zoom / 1.3, MIN_ZOOM, MAX_ZOOM);
            }}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-cyan-300 transition-colors cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Reset camera"
            onClick={resetView}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-cyan-300 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            aria-label="Zoom in"
            onClick={() => {
              targetCam.current.zoom = clamp(targetCam.current.zoom * 1.3, MIN_ZOOM, MAX_ZOOM);
            }}
            className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-cyan-300 transition-colors cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        <div className="hidden md:flex items-center gap-3 pl-2 border-l border-slate-700/80 text-[11px] font-mono text-slate-400">
          <span className="inline-flex items-center gap-1">
            <Move className="w-3 h-3 text-cyan-400" /> Drag
          </span>
          <span className="inline-flex items-center gap-1">
            <MousePointerClick className="w-3 h-3 text-cyan-400" /> Click to zoom
          </span>
        </div>
      </div>
    </div>
  );
}
