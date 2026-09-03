'use client';

import React from 'react';

interface MonitorFrameProps {
  children: React.ReactNode;
  aspectRatio?: '16:9' | '21:9' | '16:10' | '32:9';
  accentColor?: string;
  isActive?: boolean;
}

export const MonitorFrame: React.FC<MonitorFrameProps> = ({
  children,
  aspectRatio = '16:9',
  accentColor = '#06b6d4',
  isActive = true,
}) => {
  const getAspectClass = () => {
    switch (aspectRatio) {
      case '21:9':
        return 'aspect-[21/9]';
      case '16:10':
        return 'aspect-[16/10]';
      case '32:9':
        return 'aspect-[32/9]';
      case '16:9':
      default:
        return 'aspect-video';
    }
  };

  return (
    <div className="relative group w-full flex flex-col items-center select-none">
      {/* Dynamic Ambient Backlight Glow */}
      <div
        className="absolute -inset-4 md:-inset-8 rounded-[36px] opacity-40 blur-2xl transition-all duration-700 pointer-events-none"
        style={{
          background: isActive
            ? `radial-gradient(circle, ${accentColor} 0%, rgba(6,182,212,0.15) 50%, transparent 80%)`
            : 'transparent',
          filter: isActive ? 'blur(35px)' : 'none',
        }}
      />

      {/* Monitor Outer Chassis */}
      <div
        className={`relative w-full ${getAspectClass()} rounded-2xl md:rounded-3xl p-2.5 md:p-3.5 bg-gradient-to-b from-[#1c2538] via-[#0d1424] to-[#080d1a] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.15)] transition-all duration-500`}
        style={{
          boxShadow: isActive
            ? `0 15px 40px -10px rgba(0,0,0,0.9), 0 0 30px -5px ${accentColor}40`
            : '0 10px 25px rgba(0,0,0,0.7)',
        }}
      >
        {/* Top Bezel Webcam Dot & Ambient Sensor */}
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 opacity-40">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-700 border border-slate-600" />
        </div>

        {/* Display Screen Viewport */}
        <div className="relative w-full h-full rounded-xl md:rounded-2xl overflow-hidden bg-black shadow-inner">
          {children}
        </div>

        {/* Bottom Bezel Brand / LED Accent */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-60">
          <div
            className="w-8 h-[2px] rounded-full transition-all duration-300"
            style={{
              backgroundColor: isActive ? accentColor : '#334155',
              boxShadow: isActive ? `0 0 8px ${accentColor}` : 'none',
            }}
          />
        </div>
      </div>

      {/* Sleek Minimalist Monitor Stand Foot */}
      <div className="hidden sm:flex flex-col items-center -mt-0.5 opacity-80">
        <div className="w-10 h-3 bg-gradient-to-b from-[#131b2e] to-[#0c1220] border-x border-white/5 shadow-inner" />
        <div className="w-28 md:w-36 h-1.5 bg-gradient-to-r from-transparent via-[#202d47] to-transparent rounded-full shadow-md" />
      </div>
    </div>
  );
};
