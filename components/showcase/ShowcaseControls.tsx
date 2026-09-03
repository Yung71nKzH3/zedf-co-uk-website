'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Shuffle, Sparkles } from 'lucide-react';

interface ShowcaseControlsProps {
  currentIndex: number;
  totalCount: number;
  onPrev: () => void;
  onNext: () => void;
  onShuffle: () => void;
}

export const ShowcaseControls: React.FC<ShowcaseControlsProps> = ({
  currentIndex,
  totalCount,
  onPrev,
  onNext,
  onShuffle,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 z-40 select-none">
      {/* Keyboard Hint / Shuffle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onShuffle}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-cyan-950 border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 text-xs font-mono transition-all duration-200 cursor-pointer shadow-lg hover:shadow-cyan-500/20 active:scale-95"
          title="Reshuffle playlist for a fresh order"
        >
          <Shuffle className="w-3.5 h-3.5 text-cyan-400" />
          <span>Shuffle Showcase</span>
        </button>

        <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-500">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">←</kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">→</kbd>
          <span>to navigate</span>
        </span>
      </div>

      {/* Main Navigation Controls */}
      <div className="flex items-center gap-4">
        {/* Prev Arrow */}
        <button
          onClick={onPrev}
          aria-label="Previous Wallpaper"
          className="p-3 rounded-full bg-slate-900/90 hover:bg-cyan-500 hover:text-slate-950 border border-white/10 text-slate-200 backdrop-blur-md transition-all duration-200 cursor-pointer shadow-xl hover:shadow-cyan-500/30 hover:scale-105 active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Counter Pill */}
        <div className="px-4 py-1.5 rounded-full bg-slate-900/80 border border-white/10 backdrop-blur-md flex items-center gap-1.5 font-mono text-xs shadow-inner">
          <span className="text-cyan-400 font-bold">
            {String(currentIndex + 1).padStart(2, '0')}
          </span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400">
            {String(totalCount).padStart(2, '0')}
          </span>
        </div>

        {/* Next Arrow */}
        <button
          onClick={onNext}
          aria-label="Next Wallpaper"
          className="p-3 rounded-full bg-slate-900/90 hover:bg-cyan-500 hover:text-slate-950 border border-white/10 text-slate-200 backdrop-blur-md transition-all duration-200 cursor-pointer shadow-xl hover:shadow-cyan-500/30 hover:scale-105 active:scale-95"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Interactive status badge */}
      <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-cyan-400/80 bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-500/20">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
        <span>3D Stage Active</span>
      </div>
    </div>
  );
};
