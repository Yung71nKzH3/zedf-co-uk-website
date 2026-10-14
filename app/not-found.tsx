'use client';

import Link from 'next/link';
import { Home, Compass, ArrowLeft } from 'lucide-react';
import ParticleCanvas from './components/ParticleCanvas';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#0c1422] text-slate-100 overflow-x-hidden relative font-sans flex flex-col items-center justify-center px-4">
      {/* Animated Background Gradient matching homepage */}
      <div 
        className="fixed inset-0 z-0 opacity-50 pointer-events-none"
        style={{
          background: 'linear-gradient(120deg, #0c1422 0%, #152033 50%, #0c1422 100%)',
          backgroundSize: '200% 200%',
          animation: 'moveGradient 15s ease infinite alternate'
        }}
        aria-hidden="true"
      />

      {/* Interactive geometric particle canvas assembled to form '404' on hover */}
      <ParticleCanvas 
        text="404" 
        textSizeDesktop={140}
        textSizeMobile={90}
        yFactorDesktop={0.32}
        yFactorMobile={0.28}
      />

      {/* Content Container */}
      <div className="relative z-20 flex flex-col items-center text-center max-w-lg mt-[180px] md:mt-[220px]">
        {/* Screen-reader accessible heading */}
        <h1 className="sr-only">404 - Page Not Found</h1>

        {/* Visual status badge */}
        <div 
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono uppercase tracking-widest shadow-[0_0_12px_rgba(6,182,212,0.2)] mb-4"
          aria-hidden="true"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          HTTP 404 / Lost In Space
        </div>

        {/* Clear, accessible text explaining the situation */}
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-100 font-display">
          Resource Not Found
        </h2>

        <p className="mt-3 text-sm md:text-base text-slate-400 leading-relaxed">
          The link you followed may be broken, or the page may have been moved or removed. 
          Hover around above to assemble the particles, or head back to safety!
        </p>

        {/* Navigation Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-medium text-sm transition-all duration-200 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-cyan-300"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>

          <Link
            href="/project-space"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#172033]/80 hover:bg-[#1f2b45] text-slate-200 border border-slate-700/60 hover:border-cyan-500/50 font-medium text-sm transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            Explore Projects
          </Link>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes moveGradient {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
      `}} />
    </main>
  );
}
