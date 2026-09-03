'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { WallpaperItem } from '@/lib/showcase/types';
import { MonitorFrame } from './MonitorFrame';
import { Maximize2, ExternalLink, Sparkles, Layers, Video, Code, Check } from 'lucide-react';

interface WallpaperCardProps {
  wallpaper: WallpaperItem;
  isActive: boolean;
  onOpenFullscreen: (wallpaper: WallpaperItem) => void;
}

export const WallpaperCard: React.FC<WallpaperCardProps> = ({
  wallpaper,
  isActive,
  onOpenFullscreen,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [copiedSteam, setCopiedSteam] = useState(false);

  const getTypeIcon = () => {
    switch (wallpaper.type) {
      case 'html':
        return <Code className="w-3.5 h-3.5 text-cyan-400" />;
      case 'video':
        return <Video className="w-3.5 h-3.5 text-blue-400" />;
      case 'scene':
      default:
        return <Layers className="w-3.5 h-3.5 text-pink-400" />;
    }
  };

  const handleSteamLaunch = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (wallpaper.steamWorkshopId) {
      // Try steam:// protocol first
      window.location.href = `steam://url/CommunityFilePage/${wallpaper.steamWorkshopId}`;
    } else if (wallpaper.steamWorkshopUrl) {
      window.open(wallpaper.steamWorkshopUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div 
      className="relative w-full max-w-[820px] transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <MonitorFrame
        aspectRatio={wallpaper.aspectRatio}
        accentColor={wallpaper.accentColor || '#06b6d4'}
        isActive={isActive}
      >
        {/* Screen Content */}
        <div className="relative w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden">
          {wallpaper.type === 'html' && isActive ? (
            /* Live Interactive HTML Wallpaper IFrame */
            <iframe
              src={wallpaper.src}
              title={wallpaper.title}
              className="w-full h-full border-0 pointer-events-auto"
              sandbox="allow-scripts allow-same-origin"
              loading="lazy"
            />
          ) : wallpaper.type === 'video' && isActive && wallpaper.src.endsWith('.webm') || wallpaper.src.endsWith('.mp4') ? (
            /* Looping Video Wallpaper */
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
            /* Scene / Inactive Preview Display */
            <div className="relative w-full h-full">
              {wallpaper.posterUrl ? (
                <img
                  src={wallpaper.posterUrl}
                  alt={wallpaper.title}
                  className="w-full h-full object-cover brightness-90 group-hover:brightness-100 transition-all duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-slate-900 via-[#0c1422] to-slate-950 flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-cyan-500/40 animate-pulse" />
                </div>
              )}
              
              {/* If HTML preview but inactive, show poster overlay with prompt */}
              {wallpaper.type === 'html' && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                  <span className="px-3 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono tracking-wide">
                    Live HTML Wallpaper
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Type & Resolution Badges (Top Overlays) */}
          <div className="absolute top-3 left-3 flex items-center gap-2 z-20 pointer-events-none">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-white text-[11px] font-mono uppercase tracking-wider shadow-md">
              {getTypeIcon()}
              <span>{wallpaper.type}</span>
            </span>
            <span className="hidden sm:inline-block px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-slate-300 text-[11px] font-mono tracking-wider shadow-md">
              {wallpaper.resolution}
            </span>
          </div>

          {/* Quick Hover Overlay Actions for Active Center Card */}
          {isActive && (
            <div 
              className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 transition-opacity duration-300 flex flex-col justify-between p-4 z-20 pointer-events-none ${
                isHovered ? 'opacity-100' : 'opacity-0 md:opacity-100 md:from-black/60 md:to-transparent'
              }`}
            >
              {/* Top Right Quick Buttons */}
              <div className="flex items-center justify-end gap-2 pointer-events-auto">
                <button
                  onClick={() => onOpenFullscreen(wallpaper)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/70 hover:bg-cyan-500 hover:text-black border border-white/15 text-white text-xs font-semibold backdrop-blur-md transition-all shadow-lg cursor-pointer"
                  title="Fullscreen Live View"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Fullscreen</span>
                </button>

                {(wallpaper.steamWorkshopId || wallpaper.steamWorkshopUrl) && (
                  <button
                    onClick={handleSteamLaunch}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/90 hover:bg-cyan-400 text-slate-950 font-bold text-xs backdrop-blur-md transition-all shadow-lg hover:shadow-cyan-500/40 cursor-pointer"
                    title="Get on Wallpaper Engine / Steam Workshop"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Get on Steam</span>
                  </button>
                )}
              </div>

              {/* Bottom Card Title & Quick Info */}
              <div className="pointer-events-auto">
                <h3 className="text-lg md:text-xl font-bold font-display text-white drop-shadow-md">
                  {wallpaper.title}
                </h3>
                <p className="text-slate-300 text-xs md:text-sm line-clamp-1 max-w-xl mt-0.5 drop-shadow">
                  {wallpaper.description}
                </p>
              </div>
            </div>
          )}
        </div>
      </MonitorFrame>
    </div>
  );
};
