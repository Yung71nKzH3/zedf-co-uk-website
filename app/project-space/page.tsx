'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Starfield } from '@/components/project-space/Starfield';
import { CelestialBody } from '@/components/project-space/CelestialBody';
import { SearchTelescope } from '@/components/project-space/SearchTelescope';
import { Calculator } from '@/components/project-space/Calculator';
import { stars } from '@/lib/project-space/stars-data';
import { X, Tag, ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function ProjectSpacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStar, setSelectedStar] = useState<any>(null);

  const filteredStars = useMemo(() => {
    if (!searchQuery) return stars;
    const lowerQuery = searchQuery.toLowerCase();
    return stars.filter(s => 
      s.title.toLowerCase().includes(lowerQuery) || 
      s.tags.some(t => t.toLowerCase().includes(lowerQuery))
    );
  }, [searchQuery]);

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-black">
      <Starfield />

      {/* Back to Dashboard Link */}
      <div className="fixed top-6 left-6 z-[60]">
        <Link 
          href="/" 
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-sm font-display uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Dashboard</span>
        </Link>
      </div>

      {/* Header / Search Area */}
      <div className="fixed top-12 z-50 flex flex-col items-center gap-4">
        <SearchTelescope onSearch={setSearchQuery} />
      </div>

      {/* The Nebula (Star Field) */}
      <div 
        className="relative w-full h-full flex items-center justify-center"
      >
        <AnimatePresence mode="popLayout">
          {filteredStars.map((star, index) => (
            <CelestialBody 
              key={star.id} 
              star={star} 
              index={index} 
              onClick={setSelectedStar} 
            />
          ))}
        </AnimatePresence>
        
        {filteredStars.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-white/20 font-display uppercase tracking-widest text-sm"
          >
            No stars found in this sector
          </motion.div>
        )}
      </div>

      {/* Star Detail Modal */}
      <AnimatePresence>
        {selectedStar && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStar(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-zinc-900/90 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              {/* Modal Header Decor */}
              <div 
                className="h-1 w-full" 
                style={{ backgroundColor: selectedStar.color }} 
              />
              
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] font-display uppercase tracking-widest text-white/40 mb-1 block">
                      {selectedStar.category}
                    </span>
                    <h2 className="text-3xl font-display font-bold text-white tracking-tight">
                      {selectedStar.title}
                    </h2>
                  </div>
                  <button 
                    onClick={() => setSelectedStar(null)}
                    className="p-2 hover:bg-white/5 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-white/40" />
                  </button>
                </div>

                <p className="text-zinc-400 mb-8 leading-relaxed">
                  {selectedStar.description}
                </p>

                {selectedStar.id === 'calculator' ? (
                  <div className="mb-8 flex justify-center">
                    <Calculator />
                  </div>
                ) : selectedStar.id === 'links' ? (
                  <div className="bg-black/40 rounded-2xl p-4 mb-8 border border-white/5 flex flex-col gap-3">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-semibold mb-1 block">
                      Explore Links
                    </span>
                    {selectedStar.links?.map((link: any) => (
                      <Link
                        key={link.name}
                        href={link.url}
                        className="group flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all duration-300"
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-display font-bold text-white group-hover:text-cyan-300 transition-colors">
                              {link.name}
                            </span>
                            {link.tag && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                                {link.tag}
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-zinc-400 mt-1">
                            {link.description}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white/5 text-white/40 group-hover:text-cyan-300 group-hover:bg-cyan-500/20 transition-all">
                          <ExternalLink className="w-4 h-4" />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="bg-black/40 rounded-2xl p-6 mb-8 border border-white/5">
                    <pre className="text-sm font-mono text-indigo-300 whitespace-pre-wrap">
                      {selectedStar.content}
                    </pre>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {selectedStar.tags.map((tag: any) => (
                    <span 
                      key={tag}
                      className="flex items-center px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-display uppercase tracking-wider text-white/60"
                    >
                      <Tag className="w-3 h-3 mr-1.5 opacity-40" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
