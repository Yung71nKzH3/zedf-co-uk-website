'use client';

import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const SearchTelescope = ({ onSearch }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState('');

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onSearch(val);
  };

  return (
    <div className="relative z-50 flex flex-col items-center">
      <motion.div 
        animate={{ 
          width: isFocused ? 300 : 200,
          scale: isFocused ? 1.05 : 1
        }}
        className="relative group"
      >
        <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="relative flex items-center bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 transition-all hover:border-white/20">
          <Search className="w-4 h-4 text-white/40 mr-2" />
          <input
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Search the nebula..."
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-white/20"
          />
          {query && (
            <button onClick={() => { setQuery(''); onSearch(''); }}>
              <X className="w-3 h-3 text-white/40 hover:text-white" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
