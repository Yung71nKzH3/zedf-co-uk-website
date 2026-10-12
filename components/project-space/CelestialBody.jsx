'use client';

import React from 'react';
import { motion } from 'motion/react';

export const CelestialBody = ({ star, onClick, index, totalStars = 7 }) => {
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    const updatePosition = () => {
      const width = typeof window !== 'undefined' ? window.innerWidth : 1200;
      const height = typeof window !== 'undefined' ? window.innerHeight : 800;

      // Safe boundaries reserving space for header search, dashboard back-button, and margins
      const isMobile = width < 768;
      const paddingX = isMobile ? 48 : 96;
      const paddingY = isMobile ? 80 : 120;

      const maxRx = Math.max(70, width / 2 - paddingX);
      const maxRy = Math.max(70, height / 2 - paddingY);

      // Consistent distributed angle per star based on index + unique hash jitter
      const count = Math.max(totalStars, 1);
      const baseAngle = (index / count) * Math.PI * 2 - Math.PI / 2;
      
      const charHash = star.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const angleJitter = ((charHash % 20) - 10) / 100; // ±0.1 rad
      const angle = baseAngle + angleJitter;

      // Tiered orbit radii (alternating inner/outer rings) to avoid clumping
      const ring = (index % 2 === 0) ? (isMobile ? 0.55 : 0.60) : (isMobile ? 0.88 : 0.90);
      const radiusJitter = ((charHash % 10) - 5) / 100; // ±0.05
      const factor = Math.min(0.95, Math.max(0.40, ring + radiusJitter));

      setPosition({
        x: Math.cos(angle) * (maxRx * factor),
        y: Math.sin(angle) * (maxRy * factor)
      });
      setIsMounted(true);
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [star.id, index, totalStars]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
      animate={{ 
        opacity: isMounted ? 1 : 0, 
        scale: isMounted ? 1 : 0,
        x: position.x,
        y: position.y,
      }}
      transition={{ 
        type: "spring", 
        stiffness: 40, 
        damping: 15, 
        delay: index * 0.1 // Creates a "Big Bang" staggered effect
      }}
      whileHover={{ scale: 1.1, zIndex: 10 }}
      onClick={() => onClick(star)}
      className="absolute cursor-pointer group p-8 -m-8 flex flex-col items-center justify-center" // Added padding/negative margin for larger hit area
      style={{ left: '50%', top: '50%' }}
    >
      {/* Star Glow */}
      <div 
        className="absolute inset-0 blur-xl opacity-20 group-hover:opacity-60 transition-opacity duration-500"
        style={{ backgroundColor: star.color }}
      />
      
      {/* Star Core */}
      <div 
        className="relative w-4 h-4 rounded-full border border-white/20 shadow-lg"
        style={{ backgroundColor: star.color }}
      />

      {/* Star Label (Appears on hover) */}
      <div className="absolute top-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <span className="text-[10px] font-display uppercase tracking-widest text-white/60 whitespace-nowrap bg-black/40 px-2 py-1 rounded-full border border-white/10 backdrop-blur-sm">
          {star.title}
        </span>
      </div>
    </motion.div>
  );
};
