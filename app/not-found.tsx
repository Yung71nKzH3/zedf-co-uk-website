'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Home, Compass } from 'lucide-react';
import ParticleCanvas from './components/ParticleCanvas';

export default function NotFound() {
  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center bg-[#0c1422] text-slate-100 overflow-hidden select-none">
      {/* Background Gradient Mesh */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-80"
        style={{
          background: 'linear-gradient(135deg, #0c1422 0%, #152033 45%, #0d1a2d 75%, #0c1422 100%)',
          backgroundSize: '200% 200%',
        }}
      />

      {/* Responsive Geometric Particle Canvas forming "404" */}
      <ParticleCanvas 
        targetText="404" 
        color="#06b6d4"
        className="fixed inset-0 w-full h-full z-10 pointer-events-auto cursor-crosshair"
        yFactorMobile={0.32}
        yFactorDesktop={0.34}
      />

      {/* Content overlay */}
      <div className="relative z-30 flex flex-col items-center text-center px-6 max-w-lg mt-32 md:mt-48 pointer-events-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono uppercase tracking-widest mb-4 backdrop-blur-md">
          <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Sector Not Found</span>
        </div>

        <h1 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight mb-2">
          Lost in the Digital Void
        </h1>

        <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-8 max-w-md">
          It looks like this URL doesn&apos;t exist or has drifted away into deep space. Hover or drag across the particles above to disperse the coordinates!
        </p>

        {/* Back to Dashboard Button */}
        <Link 
          href="/"
          className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-[#172033] hover:bg-[#1f2b45] border border-cyan-500/30 hover:border-cyan-400 text-slate-100 hover:text-white shadow-[0_4px_20px_rgba(0,0,0,0.5),0_0_15px_rgba(6,182,212,0.25)] hover:shadow-[0_4px_25px_rgba(0,0,0,0.6),0_0_25px_rgba(6,182,212,0.5)] transition-all duration-300 font-semibold text-sm active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard</span>
          <Home className="w-4 h-4 text-cyan-400/60 group-hover:text-cyan-300 transition-colors ml-1" />
        </Link>
      </div>

      {/* Footer subtle tag */}
      <div className="fixed bottom-6 z-30 text-[11px] font-mono text-slate-500 tracking-widest uppercase pointer-events-none">
        ZEDF • ERROR 404
      </div>
    </main>
  );
}
