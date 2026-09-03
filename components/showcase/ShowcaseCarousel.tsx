'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WallpaperItem } from '@/lib/showcase/types';
import { WallpaperCard } from './WallpaperCard';
import { ShowcaseControls } from './ShowcaseControls';
import { FullscreenViewer } from './FullscreenViewer';
import { Sparkles, ExternalLink, Eye } from 'lucide-react';

interface ShowcaseCarouselProps {
  initialWallpapers: WallpaperItem[];
}

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const ShowcaseCarousel: React.FC<ShowcaseCarouselProps> = ({
  initialWallpapers,
}) => {
  const [wallpapers, setWallpapers] = useState<WallpaperItem[]>(initialWallpapers);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreenWallpaper, setFullscreenWallpaper] = useState<WallpaperItem | null>(null);

  // Shuffle on initial client mount
  useEffect(() => {
    if (initialWallpapers.length > 0) {
      setWallpapers(shuffleArray(initialWallpapers));
    }
  }, [initialWallpapers]);

  const total = wallpapers.length;

  const handleNext = useCallback(() => {
    if (total === 0) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    if (total === 0) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const handleShuffle = useCallback(() => {
    if (total === 0) return;
    setWallpapers(shuffleArray(wallpapers));
    setCurrentIndex(0);
  }, [wallpapers, total]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (fullscreenWallpaper) return; // Fullscreen handles its own keys
      if (e.key === 'ArrowRight' || e.key === 'KeyD') {
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'KeyA') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, fullscreenWallpaper]);

  if (total === 0) return null;

  // Compute 3 items around center: prev (-1), active (0), next (+1)
  const getIndex = (offset: number) => {
    return (currentIndex + offset + total) % total;
  };

  const prevItem = wallpapers[getIndex(-1)];
  const activeItem = wallpapers[currentIndex];
  const nextItem = wallpapers[getIndex(1)];

  return (
    <div className="relative w-full flex flex-col items-center justify-center py-2 select-none">
      {/* 3D Perspective Stage */}
      <div 
        className="relative w-full max-w-7xl h-[340px] sm:h-[420px] md:h-[490px] lg:h-[530px] flex items-center justify-center"
        style={{ perspective: '1400px' }}
      >
        {/* LEFT CARD (Previous) */}
        <motion.div
          key={`prev-${prevItem.id}`}
          onClick={handlePrev}
          initial={{ opacity: 0, x: '-35%', scale: 0.8 }}
          animate={{ 
            opacity: 0.72, 
            x: '-46%', 
            scale: 0.85, 
            rotateY: 14, 
            zIndex: 15 
          }}
          whileHover={{ 
            opacity: 0.95, 
            scale: 0.88, 
            rotateY: 8,
            transition: { duration: 0.2 } 
          }}
          transition={{ type: 'spring', stiffness: 280, damping: 30 }}
          className="absolute cursor-pointer hidden md:block max-w-[560px] w-[50%] pointer-events-auto group"
        >
          <div className="relative">
            <WallpaperCard
              wallpaper={prevItem}
              isActive={false}
              onOpenFullscreen={() => {}}
            />
            {/* Click to Switch pill badge */}
            <div className="absolute inset-0 bg-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/80 border border-cyan-500/50 text-cyan-300 text-xs font-mono backdrop-blur-md shadow-2xl">
                <Eye className="w-3.5 h-3.5" />
                <span>Switch to this</span>
              </span>
            </div>
          </div>
        </motion.div>

        {/* ACTIVE CENTER CARD */}
        <motion.div
          key={`active-${activeItem.id}`}
          layout
          initial={{ scale: 0.92, opacity: 0.85, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0, zIndex: 30 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="relative w-full max-w-[760px] px-4 md:px-0 z-30 pointer-events-auto"
        >
          <WallpaperCard
            wallpaper={activeItem}
            isActive={true}
            onOpenFullscreen={setFullscreenWallpaper}
          />
        </motion.div>

        {/* RIGHT CARD (Next) */}
        <motion.div
          key={`next-${nextItem.id}`}
          onClick={handleNext}
          initial={{ opacity: 0, x: '35%', scale: 0.8 }}
          animate={{ 
            opacity: 0.72, 
            x: '46%', 
            scale: 0.85, 
            rotateY: -14, 
            zIndex: 15 
          }}
          whileHover={{ 
            opacity: 0.95, 
            scale: 0.88, 
            rotateY: -8,
            transition: { duration: 0.2 } 
          }}
          transition={{ type: 'spring', stiffness: 280, damping: 30 }}
          className="absolute cursor-pointer hidden md:block max-w-[560px] w-[50%] pointer-events-auto group"
        >
          <div className="relative">
            <WallpaperCard
              wallpaper={nextItem}
              isActive={false}
              onOpenFullscreen={() => {}}
            />
            {/* Click to Switch pill badge */}
            <div className="absolute inset-0 bg-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-950/80 border border-cyan-500/50 text-cyan-300 text-xs font-mono backdrop-blur-md shadow-2xl">
                <Eye className="w-3.5 h-3.5" />
                <span>Switch to this</span>
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Navigation Controls Bar */}
      <div className="w-full mt-2">
        <ShowcaseControls
          currentIndex={currentIndex}
          totalCount={total}
          onPrev={handlePrev}
          onNext={handleNext}
          onShuffle={handleShuffle}
        />
      </div>

      {/* Active Wallpaper Details Panel */}
      <motion.div
        key={`details-${activeItem.id}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-4xl px-6 py-4 mt-3 rounded-2xl bg-gradient-to-r from-[#0d1627]/90 via-[#0c1422]/95 to-[#0d1627]/90 border border-white/10 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xl font-bold font-display text-white">
              {activeItem.title}
            </span>
            <span className="text-xs text-cyan-400 font-mono px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30">
              {activeItem.resolution}
            </span>
          </div>

          <p className="text-slate-300 text-xs md:text-sm max-w-xl leading-relaxed">
            {activeItem.description}
          </p>

          {/* Tags & Features */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            {activeItem.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-slate-300 text-[11px] font-mono"
              >
                #{tag}
              </span>
            ))}
            {activeItem.features?.map((feat) => (
              <span
                key={feat}
                className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[11px] font-mono flex items-center gap-1"
              >
                <Sparkles className="w-2.5 h-2.5" />
                {feat}
              </span>
            ))}
          </div>
        </div>

        {/* Subscribe / Link Button */}
        {activeItem.steamWorkshopUrl && (
          <a
            href={activeItem.steamWorkshopUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs tracking-wide uppercase transition-all duration-200 shadow-lg hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98]"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Subscribe on Steam</span>
          </a>
        )}
      </motion.div>

      {/* Fullscreen Modal View */}
      <FullscreenViewer
        wallpaper={fullscreenWallpaper}
        onClose={() => setFullscreenWallpaper(null)}
      />
    </div>
  );
};
