'use client';

import React from 'react';
import { motion } from 'motion/react';

export const CelestialBody = ({ star, onClick, index }) => {
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    // Generate a consistent (static) random position based on the star's ID
    const generatePosition = () => {
      // Simple hash of the ID to get a seed (from 0 to 1)
      const seed = star.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 100 / 100;
      const angleSeed = star.id.split('').reduce((acc, char) => acc * (char.charCodeAt(0) + 1), 1) % 100 / 100;

      const isMobile = window.innerWidth < 768;
      const minRadius = isMobile ? 100 : 150;
      const maxRadius = isMobile ? 300 : 500;
      
      // Use the seed instead of Math.random() for static positioning
      const radius = minRadius + seed * (maxRadius - minRadius);
      const angle = angleSeed * Math.PI * 2;
      
      setPosition({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius
      });
      setIsMounted(true);
    };

    generatePosition();
  }, [star.id]);

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
