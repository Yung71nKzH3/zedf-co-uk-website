'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ThemeProvider } from '@/context/setup/ThemeContext';
import { OverlayUI } from '@/components/setup/ui/OverlayUI';

const SceneCanvas = dynamic(() => import('@/components/setup/canvas/SceneCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-black flex flex-col items-center justify-center font-mono text-cyan-400 gap-4">
      <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      <div className="text-sm tracking-widest uppercase animate-pulse">Initializing 3D Cyber Engine...</div>
    </div>
  ),
});

export default function SetupPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-screen h-screen bg-black flex flex-col items-center justify-center font-mono text-cyan-400 gap-4">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <div className="text-sm tracking-widest uppercase animate-pulse">Loading 3D Setup Showcase...</div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <main className="w-screen h-screen relative overflow-hidden bg-black">
        {/* 3D WebGL Canvas Layer */}
        <SceneCanvas />

        {/* Floating Tailwind UI HUD Layer */}
        <OverlayUI />
      </main>
    </ThemeProvider>
  );
}
