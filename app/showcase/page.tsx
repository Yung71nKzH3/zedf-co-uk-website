import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Gamepad2, Sparkles, ExternalLink } from 'lucide-react';
import ParticleCanvas from '@/app/components/ParticleCanvas';
import { ShowcaseCarousel } from '@/components/showcase/ShowcaseCarousel';
import { WALLPAPERS_DATA } from '@/lib/showcase/wallpapers-data';

export const metadata: Metadata = {
  title: 'Wallpaper Engine Showcase',
  description: 'A curated gallery of live interactive HTML5, Scene, and Video wallpapers by w1ll0w on Wallpaper Engine.',
};

export default function ShowcasePage() {
  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-between bg-[#060a12] text-slate-100 overflow-x-hidden">
      {/* Background Subtle Particle Canvas */}
      <div className="fixed inset-0 pointer-events-none opacity-30 z-0">
        <ParticleCanvas />
      </div>

      {/* Top Ambient Glow Orb */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[220px] bg-gradient-to-b from-cyan-500/15 via-blue-600/5 to-transparent blur-[90px] pointer-events-none z-0" />

      {/* Sleek Top Navbar */}
      <header className="relative w-full max-w-7xl mx-auto px-6 pt-5 pb-2 flex items-center justify-between z-40">
        {/* Back to Dashboard Link */}
        <Link
          href="/"
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md text-slate-300 hover:text-white transition-all text-xs font-display uppercase tracking-widest cursor-pointer shadow-md group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Dashboard</span>
        </Link>

        {/* Center Page Title */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-cyan-950/50 border border-cyan-500/30 backdrop-blur-md shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-mono text-cyan-300 font-semibold tracking-wider uppercase">
              Wallpaper Engine Showcase
            </span>
          </div>
        </div>

        {/* Steam Workshop Profile Link */}
        <a
          href="https://steamcommunity.com/id/zfw1ll0w/myworkshopfiles/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 hover:bg-[#1b2838] border border-white/10 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-all text-xs font-mono shadow-md"
        >
          <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Steam Workshop</span>
          <ExternalLink className="w-3 h-3 opacity-60" />
        </a>
      </header>

      {/* Main 3D Carousel Stage */}
      <section className="relative w-full flex-1 flex flex-col items-center justify-center z-30 px-4">
        <ShowcaseCarousel initialWallpapers={WALLPAPERS_DATA} />
      </section>

      {/* Compact Footer */}
      <footer className="relative w-full max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-xs font-mono z-30 border-t border-white/5 mt-4">
        <div className="flex items-center gap-2">
          <span>Created by w1ll0w</span>
          <span>•</span>
          <span>Wallpaper Engine</span>
        </div>

        <div className="flex items-center gap-4 mt-2 sm:mt-0">
          <Link href="/" className="hover:text-cyan-400 transition-colors">
            zedf.co.uk
          </Link>
          <a
            href="https://steamcommunity.com/id/zfw1ll0w/myworkshopfiles/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-400 transition-colors"
          >
            All 70+ Wallpapers
          </a>
        </div>
      </footer>
    </main>
  );
}
