'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const SearchTelescope = ({ onSearch, stars, onSelectStar }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onSearch(val);
  };

  const handleSelect = (star) => {
    if (onSelectStar) {
      onSelectStar(star);
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const allStars = stars || [];
  const displayStars = query.trim()
    ? allStars.filter(s =>
        s.title.toLowerCase().includes(query.toLowerCase()) ||
        s.description.toLowerCase().includes(query.toLowerCase()) ||
        s.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
      )
    : allStars;

  return (
    <div ref={containerRef} className="relative z-50 flex flex-col items-center">
      <motion.div 
        animate={{ 
          width: isOpen ? 320 : 220,
          scale: isOpen ? 1.02 : 1
        }}
        className="relative group"
      >
        <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div 
          onClick={() => setIsOpen(true)}
          className="relative flex items-center bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 transition-all hover:border-white/20 shadow-lg"
        >
          <Search className="w-4 h-4 text-white/40 mr-2 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => setIsOpen(true)}
            placeholder="Search the nebula..."
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-white/30 text-white"
          />
          {query ? (
            <button 
              type="button" 
              onClick={(e) => { e.stopPropagation(); handleClear(); }} 
              className="p-1 hover:text-white text-white/40 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest pl-1">
              {allStars.length}★
            </span>
          )}
        </div>
      </motion.div>

      {/* Scrollable Drop-down of all possible stars */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 w-[320px] max-w-[90vw] bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-50"
          >
            <div className="px-3.5 py-2 border-b border-white/5 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-white/40">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                {query ? 'Matching Stars' : 'All Stars in Nebula'}
              </span>
              <span>{displayStars.length} found</span>
            </div>

            <div className="max-h-[280px] overflow-y-auto divide-y divide-white/5 p-1 scrollbar-thin scrollbar-thumb-white/10">
              {displayStars.map((star) => (
                <button
                  key={star.id}
                  type="button"
                  onClick={() => handleSelect(star)}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-white/5 transition-all flex items-start gap-3 group"
                >
                  {/* Star preview orb */}
                  <div 
                    className="w-3 h-3 rounded-full shrink-0 mt-1 shadow-sm transition-transform group-hover:scale-125"
                    style={{ 
                      backgroundColor: star.color,
                      boxShadow: `0 0 10px ${star.color}` 
                    }}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors truncate">
                        {star.title}
                      </span>
                      <span className="text-[9px] font-mono uppercase tracking-wider text-white/40 shrink-0">
                        {star.category}
                      </span>
                    </div>
                    <p className="text-xs text-white/50 truncate mt-0.5">
                      {star.description}
                    </p>
                  </div>
                </button>
              ))}

              {displayStars.length === 0 && (
                <div className="p-6 text-center text-xs text-white/40 font-mono">
                  No celestial bodies matched "{query}"
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
