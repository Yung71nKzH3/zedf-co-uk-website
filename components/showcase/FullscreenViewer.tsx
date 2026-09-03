'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WallpaperItem } from '@/lib/showcase/types';
import { X, ExternalLink, Monitor, Clock, Sparkles } from 'lucide-react';

interface FullscreenViewerProps {
  wallpaper: WallpaperItem | null;
  onClose: () => void;
}

export const FullscreenViewer: React.FC<FullscreenViewerProps> = ({
  wallpaper,
  onClose,
}) => {
  const [showDesktopHUD, setShowDesktopHUD] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setCurrentDate(now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!wallpaper) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden select-none"
      >
        {/* Fullscreen Wallpaper Viewport */}
        <div className="absolute inset-0 w-full h-full">
          {wallpaper.type === 'html' ? (
            <iframe
              src={wallpaper.src}
              title={wallpaper.title}
              className="w-full h-full border-0 pointer-events-auto"
              sandbox="allow-scripts allow-same-origin"
            />
          ) : wallpaper.src.endsWith('.webm') || wallpaper.src.endsWith('.mp4') ? (
            <video
              src={wallpaper.src}
              poster={wallpaper.posterUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={wallpaper.posterUrl}
              alt={wallpaper.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Floating Top Header Controls */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-50 pointer-events-none">
          {/* Info pill */}
          <div className="pointer-events-auto flex items-center gap-3 px-4 py-2 rounded-full bg-black/60 backdrop-blur-xl border border-white/15 text-white shadow-2xl">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-bold font-display">{wallpaper.title}</span>
            <span className="hidden sm:inline text-xs text-slate-400 border-l border-white/20 pl-3">
              {wallpaper.resolution}
            </span>
          </div>

          {/* Action buttons */}
          <div className="pointer-events-auto flex items-center gap-3">
            <button
              onClick={() => setShowDesktopHUD(!showDesktopHUD)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold backdrop-blur-xl transition-all cursor-pointer shadow-lg ${
                showDesktopHUD
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-cyan-500/30'
                  : 'bg-black/60 text-white border-white/15 hover:bg-white/10'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span className="hidden sm:inline">Desktop HUD</span>
            </button>

            {wallpaper.steamWorkshopUrl && (
              <a
                href={wallpaper.steamWorkshopUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-600 hover:bg-cyan-400 text-slate-950 font-bold text-xs backdrop-blur-xl transition-all shadow-lg hover:shadow-cyan-500/40 cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Steam Workshop</span>
              </a>
            )}

            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-black/60 hover:bg-rose-500 hover:text-white border border-white/15 text-slate-300 backdrop-blur-xl transition-all cursor-pointer shadow-lg"
              title="Exit Fullscreen (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Optional Desktop HUD Simulator Overlay */}
        {showDesktopHUD && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute inset-0 pointer-events-none flex flex-col justify-between p-12"
          >
            {/* Center Clock Widget */}
            <div className="flex flex-col items-center justify-center mt-20 text-center drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
              <div className="text-7xl md:text-9xl font-extrabold font-display tracking-tight text-white/90">
                {currentTime}
              </div>
              <div className="text-lg md:text-2xl font-medium tracking-widest uppercase text-cyan-300/80 mt-1">
                {currentDate}
              </div>
            </div>

            {/* Fake Desktop Taskbar */}
            <div className="w-full flex justify-center">
              <div className="px-6 py-2.5 rounded-2xl bg-black/50 backdrop-blur-2xl border border-white/15 flex items-center gap-6 shadow-[0_20px_50px_rgba(0,0,0,0.7)]">
                <div className="w-5 h-5 rounded-md bg-cyan-500/80 shadow-md" />
                <div className="w-5 h-5 rounded-md bg-white/20" />
                <div className="w-5 h-5 rounded-md bg-white/20" />
                <div className="w-5 h-5 rounded-md bg-white/20" />
                <div className="w-[1px] h-4 bg-white/20" />
                <div className="text-xs text-white/70 font-mono">{currentTime}</div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
