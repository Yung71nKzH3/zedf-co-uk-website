'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useThemeContext } from '@/context/setup/ThemeContext';
import {
  RotateCcw,
  Sun,
  Moon,
  Cpu,
  Monitor,
  Headphones,
  Keyboard,
  MousePointer,
  Sliders,
  Flame,
  ChevronRight,
  Sparkles,
  Navigation,
  ArrowLeft,
} from 'lucide-react';

export const OverlayUI: React.FC = () => {
  const {
    themeMode,
    theme,
    setThemeMode,
    activeSpecId,
    activeSpec,
    setActiveSpecId,
    resetView,
  } = useThemeContext();

  const [showInspector, setShowInspector] = useState(true);

  const categories = [
    { id: 'overview', name: 'Overview', icon: Sparkles },
    { id: 'cpu', name: 'Ryzen 5 5600', icon: Cpu },
    { id: 'gpu', name: 'RX 7600 GPU', icon: Cpu },
    { id: 'mobo', name: 'B550-F Mobo', icon: Cpu },
    { id: 'ram', name: '32GB RAM', icon: Cpu },
    { id: 'storage', name: 'SSD Drives', icon: Cpu },
    { id: 'monitor', name: 'AOC CU34G2XP/BK', icon: Monitor },
    { id: 'audio-station', name: 'Fifine AM8 & SC3', icon: Sliders },
    { id: 'headphones', name: '3x Headphones', icon: Headphones },
    { id: 'akai-lpd8', name: 'AKAI LPD8', icon: Sliders },
    { id: 'numpad', name: 'Perixx Numpad', icon: Keyboard },
    { id: 'keyboard', name: 'G413 TKL Keyboard', icon: Keyboard },
    { id: 'mouse', name: 'G502 HERO Mouse', icon: MousePointer },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 z-10 select-none">
      {/* TOP HUD BAR */}
      <header className="flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3">
          <Link
            href="/project-space"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:border-white/30 transition-all duration-200 text-xs font-mono uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>Project Space</span>
          </Link>
          <div
            className="w-3 h-3 rounded-full animate-ping"
            style={{ backgroundColor: theme.accentColor }}
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-wider uppercase text-white font-mono flex items-center gap-2">
              MY <span style={{ color: theme.accentColor }}>SETUP</span>
            </h1>
            <p className="text-xs text-gray-400 font-mono tracking-wide hidden sm:block">
              INTERACTIVE 3D CUSTOM WORKSTATION
            </p>
          </div>
        </div>

        {/* CONTROLS RIGHT */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* RESET ZOOM BUTTON */}
          <button
            onClick={resetView}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono tracking-wider transition-all duration-200 border border-white/10 hover:border-white/30 text-gray-200 hover:text-white bg-black/60 backdrop-blur-md hover:bg-black/80 active:scale-95"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">RESET VIEW</span>
          </button>

          {/* THEME ENGINE TOGGLE */}
          <button
            onClick={() => setThemeMode(themeMode === 'neon-noir' ? 'gamer-rgb' : 'neon-noir')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono tracking-wider transition-all duration-200 border bg-black/60 backdrop-blur-md active:scale-95"
            style={{
              borderColor: `${theme.accentColor}55`,
              color: '#ffffff',
              boxShadow: `0 0 15px ${theme.accentColor}33`,
            }}
          >
            {themeMode === 'neon-noir' ? (
              <>
                <Moon className="w-4 h-4 text-red-500" />
                <span className="font-bold">NEON NIGHT</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-cyan-400" />
                <span className="font-bold">ROYGBIV</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* FLOATING QUICK NAV PILLS */}
      <nav className="pointer-events-auto my-auto max-w-full overflow-x-auto py-2 scrollbar-none">
        <div className="flex items-center gap-2 px-2 bg-black/40 backdrop-blur-lg border border-white/10 rounded-full w-max mx-auto py-1.5 shadow-2xl">
          {categories.map((cat) => {
            const isSelected = activeSpecId === cat.id;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveSpecId(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-all duration-200 whitespace-nowrap ${
                  isSelected
                    ? 'text-white font-bold shadow-lg scale-105'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
                style={{
                  backgroundColor: isSelected ? theme.accentColor : 'transparent',
                  boxShadow: isSelected ? `0 0 12px ${theme.accentColor}aa` : 'none',
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* BOTTOM HUD / HARDWARE SPEC INSPECTOR & 3D CONTROLS GUIDE */}
      <footer className="pointer-events-auto flex flex-col sm:flex-row items-end justify-between gap-4">
        {/* 3D CONTROLS USER GUIDE */}
        <div className="flex flex-col gap-2 bg-black/60 backdrop-blur-md p-3.5 rounded-xl border border-white/10 font-mono text-xs text-gray-300 w-full sm:w-auto shadow-xl">
          <div className="flex items-center gap-2 border-b border-white/10 pb-1.5 font-bold text-white uppercase tracking-wider text-[11px]">
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            <span>3D Controls Guide</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-white/10 font-bold text-cyan-400">Left Click</span>
              <span className="text-gray-400">Rotate View / Focus</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-white/10 font-bold text-pink-400">Right Click</span>
              <span className="text-gray-400">Pan Camera</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-white/10 font-bold text-green-400">Scroll Wheel</span>
              <span className="text-gray-400">Zoom In / Out</span>
            </div>
          </div>
        </div>

        {/* HARDWARE SPEC INSPECTOR CARD */}
        {showInspector && activeSpec && (
          <div
            className="w-full sm:w-96 rounded-2xl p-5 border backdrop-blur-xl transition-all duration-300 shadow-2xl relative overflow-hidden"
            style={{
              backgroundColor: theme.panelBg,
              borderColor: `${theme.accentColor}66`,
              boxShadow: `0 0 30px ${theme.accentColor}25`,
            }}
          >
            {/* Accent Glowing Corner Lines */}
            <div
              className="absolute top-0 left-0 w-16 h-1"
              style={{ backgroundColor: theme.accentColor }}
            />
            <div
              className="absolute top-0 right-0 w-1 h-16"
              style={{ backgroundColor: theme.accentColor }}
            />

            {/* CARD HEADER */}
            <div className="flex items-start justify-between mb-3 border-b border-white/10 pb-2">
              <div>
                <span
                  className="text-[10px] font-mono tracking-widest uppercase font-bold px-2 py-0.5 rounded bg-white/10"
                  style={{ color: theme.accentColor }}
                >
                  {activeSpec.subtitle}
                </span>
                <h2 className="text-xl font-extrabold text-white font-mono mt-1">
                  {activeSpec.name}
                </h2>
              </div>
              {activeSpec.temperature && (
                <div className="flex items-center gap-1 bg-red-950/80 border border-red-500/40 px-2.5 py-1 rounded-md text-xs font-mono text-red-400">
                  <Flame className="w-3.5 h-3.5 animate-pulse text-red-500" />
                  <span>{activeSpec.temperature}</span>
                </div>
              )}
            </div>

            {/* DESCRIPTION */}
            <p className="text-xs text-gray-300 mb-4 leading-relaxed font-sans">
              {activeSpec.description}
            </p>

            {/* SPECS GRID */}
            <div className="grid grid-cols-1 gap-2 text-xs font-mono">
              {activeSpec.specs.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between bg-black/40 px-3 py-1.5 rounded-lg border border-white/5"
                >
                  <span className="text-gray-400">{item.label}</span>
                  <span className="text-white font-semibold text-right">{item.value}</span>
                </div>
              ))}
            </div>

            {/* ACTION FOOTER */}
            <div className="mt-4 pt-2 flex items-center justify-between text-[11px] font-mono text-gray-400">
              <span className="flex items-center gap-1">
                <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                Target ID: {activeSpec.id}
              </span>
              <button
                onClick={() => setActiveSpecId('overview')}
                className="text-xs hover:underline text-gray-300 hover:text-white"
              >
                Back to Overview →
              </button>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
};
