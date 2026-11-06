'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Compass, ExternalLink, Sparkles } from 'lucide-react';

export default function CharacteristicaPage() {
  return (
    <div className="relative w-full h-screen bg-[#07090e] flex flex-col overflow-hidden">
      {/* Top Bar with Personal Space & Dashboard Navigation */}
      <header className="h-12 bg-[#0f131d]/90 border-b border-[#e5b869]/20 backdrop-blur-md px-4 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-2.5">
          <Link
            href="/project-space"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 text-xs font-mono transition-all"
            title="Return to Personal Space (The Nebula)"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Personal Space</span>
          </Link>

          <Link
            href="/"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white text-xs font-mono transition-all"
          >
            <span>Home</span>
          </Link>

          <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

          <div className="flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-[#e5b869]" />
            <span className="text-xs font-serif font-bold text-white tracking-tight hidden md:inline">
              Characteristica Universalis
            </span>
            <span className="text-[10px] font-mono text-[#e5b869]/80 hidden lg:inline">
              · 45-Coordinate Leibnizian Engine
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <Sparkles className="w-3 h-3" />
            100% Offline Single-File
          </span>

          <a
            href="/characteristica/index.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e5b869]/15 border border-[#e5b869]/30 text-[#e5b869] hover:bg-[#e5b869]/25 text-xs font-mono transition-all"
            title="Launch in standalone distraction-free window"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Open Standalone</span>
          </a>
        </div>
      </header>

      {/* Embedded 45-Coordinate Astrolabe & Quiz Engine */}
      <div className="flex-1 w-full h-[calc(100vh-3rem)]">
        <iframe
          src="/characteristica/index.html"
          className="w-full h-full border-0"
          title="Characteristica Universalis Philosophical Engine"
          allow="clipboard-write"
        />
      </div>
    </div>
  );
}
