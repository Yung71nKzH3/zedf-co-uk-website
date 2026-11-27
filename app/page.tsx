'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ParticleCanvas from './components/ParticleCanvas';
import { PackageOpen, UserCircle, Compass, Layers } from 'lucide-react';
import Link from 'next/link';
import { SPONSORS } from './data/sponsors';
import { SITE_TREE, type SiteSubfolder } from '@/lib/site-tree';
import ZuiCanvas from '@/components/ZuiCanvas';

const STUFF_SUBFOLDERS = SITE_TREE.find((w) => w.id === 'stuff')?.subfolders ?? [];
const SOCIAL_SUBFOLDERS = SITE_TREE.find((w) => w.id === 'socials')?.subfolders ?? [];

export default function Home() {
  const [activePanel, setActivePanel] = useState<'stuff' | 'links' | null>(null);
  const [isZuiMode, setIsZuiMode] = useState(false);
  const [screenWidth, setScreenWidth] = useState(1280);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isWideDesktop = screenWidth >= 1024;
  const isLargeDesktop = screenWidth >= 1280;

  const buttonsWidth = isWideDesktop ? (isLargeDesktop ? 650 : 500) : 650;
  const buttonWidth = isWideDesktop ? (isLargeDesktop ? 300 : 230) : undefined;
  const sidebarWidth = isLargeDesktop ? 450 : 380;
  const gap = isLargeDesktop ? 48 : 24;

  let buttonsShift = 0;
  if (isWideDesktop) {
    if (activePanel === 'stuff') {
      buttonsShift = (sidebarWidth + gap) / 2;
    } else if (activePanel === 'links') {
      buttonsShift = -(sidebarWidth + gap) / 2;
    }
  }

  const togglePanel = (panel: 'stuff' | 'links') => {
    setActivePanel(prev => prev === panel ? null : panel);
  };

  const renderSubfolders = (subfolders: SiteSubfolder[]) => (
    <div className="space-y-6">
      {subfolders.map((folder) => {
        const FolderIcon = folder.icon;
        return (
          <section key={folder.id} className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-700/70 pb-1.5">
              <div className="flex items-center gap-2">
                <FolderIcon className="w-4 h-4" style={{ color: folder.accent }} />
                <h2 className="text-xs font-mono uppercase tracking-wider text-slate-200 font-bold">
                  {folder.title}
                </h2>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {folder.items.length}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {folder.items.map((link) => {
                const Icon = link.icon;
                const content = (
                  <div className="bg-[#0c1422] rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),inset_0_0_10px_rgba(0,0,0,0.3)] p-3.5 flex flex-col items-center justify-center text-center min-h-[112px] transition-all duration-200 hover:scale-105 hover:bg-[#172033] hover:shadow-[0_4px_10px_rgba(0,0,0,0.4),0_0_15px_#06b6d4]">
                    <Icon className="w-8 h-8 text-cyan-400 mb-2" />
                    <h3 className="text-slate-100 font-bold text-sm">{link.title}</h3>
                    <p className="text-slate-400 text-xs mt-1 line-clamp-2">{link.desc}</p>
                  </div>
                );

                return link.external ? (
                  <a key={link.id} href={link.href} target="_blank" rel="noopener noreferrer" className="block focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded-xl">
                    {content}
                  </a>
                ) : (
                  <Link key={link.id} href={link.href} className="block focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded-xl">
                    {content}
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0c1422] text-slate-100 overflow-x-hidden relative font-sans">
      {/* Animated Background Gradient */}
      <div 
        className="fixed inset-0 z-0 opacity-50 pointer-events-none"
        style={{
          background: 'linear-gradient(120deg, #0c1422 0%, #152033 50%, #0c1422 100%)',
          backgroundSize: '200% 200%',
          animation: 'moveGradient 15s ease infinite alternate'
        }}
      />
      
      <ParticleCanvas />

      {/* Top-Right Subtle ZUI Mode Toggle (Off by default) */}
      <button
        type="button"
        onClick={() => {
          setIsZuiMode((prev) => {
            if (!prev) setActivePanel(null);
            return !prev;
          });
        }}
        aria-pressed={isZuiMode}
        title={isZuiMode ? 'Switch back to Classic Binary View' : 'Enter Spatial ZUI Mode'}
        className={`fixed top-4 right-4 z-[60] inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono transition-all cursor-pointer backdrop-blur-md ${
          isZuiMode
            ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-bold shadow-[0_0_20px_rgba(6,182,212,0.5)]'
            : 'bg-[#111b2e]/70 text-slate-400 border-slate-700/70 hover:text-cyan-300 hover:border-cyan-500/50'
        }`}
      >
        {isZuiMode ? <Layers className="w-3.5 h-3.5" /> : <Compass className="w-3.5 h-3.5" />}
        <span>{isZuiMode ? 'Classic' : 'ZUI'}</span>
      </button>

      {isZuiMode && <ZuiCanvas />}

      {/* Main Hero Screen - Full Viewport Height */}
      <main id="main-content" className="relative z-20 flex flex-col items-center justify-start md:justify-center min-h-screen pt-[300px] md:pt-0">
        
        {/* Title Bio */}
        <div className="absolute top-[250px] md:top-[calc(50%-200px)] left-1/2 -translate-x-1/2 w-[90%] md:w-[650px] text-center z-50">
          <p className="text-lg md:text-xl font-light text-slate-300">
            UK-based Undergrad Data Science Student
          </p>
        </div>

        {/* Layout Container */}
        <motion.div 
          animate={{
            x: buttonsShift,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{ 
            width: isWideDesktop ? `${buttonsWidth}px` : undefined, 
            gap: isWideDesktop ? `${gap}px` : undefined 
          }}
          className="relative w-[90%] md:w-[650px] flex flex-row gap-4 md:gap-12 items-center justify-center mt-4 md:mt-0 z-50"
        >
          
          {/* Stuff Panel Button */}
          <motion.button
            onClick={() => togglePanel('stuff')}
            aria-label="Toggle Stuff Projects Panel"
            animate={{
              scale: activePanel === 'stuff' ? 1.02 : 1,
              borderColor: activePanel === 'stuff' ? '#06b6d4' : 'transparent',
              boxShadow: activePanel === 'stuff' ? '0 0 25px rgba(6, 182, 212, 0.5)' : '0 15px 30px rgba(0, 0, 0, 0.4)'
            }}
            whileHover={{ scale: 1.02, borderColor: '#06b6d4', boxShadow: '0 0 25px rgba(6, 182, 212, 0.5)' }}
            style={{
              width: buttonWidth ? `${buttonWidth}px` : undefined,
              height: buttonWidth ? `${buttonWidth}px` : undefined
            }}
            className="w-[44vw] h-[44vw] max-w-[280px] max-h-[280px] md:w-[300px] md:h-[300px] bg-[#172033] rounded-2xl border-[3px] border-transparent flex flex-col items-center justify-center text-center transition-colors cursor-pointer"
          >
            <PackageOpen className={`w-[clamp(30px,8vw,70px)] h-[clamp(30px,8vw,70px)] mb-2 md:mb-4 transition-colors ${activePanel === 'stuff' ? 'text-cyan-400' : 'text-cyan-500'}`} />
            <h2 className="text-[clamp(18px,4vw,24px)] font-bold mb-1">Stuff</h2>
            <p className="text-slate-400 text-[clamp(10px,2vw,14px)] px-2">Projects, Experiments & Arcade.</p>
          </motion.button>

          {/* Links Panel Button */}
          <motion.button
            onClick={() => togglePanel('links')}
            aria-label="Toggle Social Links Panel"
            animate={{
              scale: activePanel === 'links' ? 1.02 : 1,
              borderColor: activePanel === 'links' ? '#06b6d4' : 'transparent',
              boxShadow: activePanel === 'links' ? '0 0 25px rgba(6, 182, 212, 0.5)' : '0 15px 30px rgba(0, 0, 0, 0.4)'
            }}
            whileHover={{ scale: 1.02, borderColor: '#06b6d4', boxShadow: '0 0 25px rgba(6, 182, 212, 0.5)' }}
            style={{
              width: buttonWidth ? `${buttonWidth}px` : undefined,
              height: buttonWidth ? `${buttonWidth}px` : undefined
            }}
            className="w-[44vw] h-[44vw] max-w-[280px] max-h-[280px] md:w-[300px] md:h-[300px] bg-[#172033] rounded-2xl border-[3px] border-transparent flex flex-col items-center justify-center text-center transition-colors cursor-pointer"
          >
            <UserCircle className={`w-[clamp(30px,8vw,70px)] h-[clamp(30px,8vw,70px)] mb-2 md:mb-4 transition-colors ${activePanel === 'links' ? 'text-cyan-400' : 'text-cyan-500'}`} />
            <h2 className="text-[clamp(18px,4vw,24px)] font-bold mb-1">Socials</h2>
            <p className="text-slate-400 text-[clamp(10px,2vw,14px)] px-2">View all my links & contact info.</p>
          </motion.button>
        </motion.div>

        {/* Mobile & Tablet Drawer Modal (< 1024px width) */}
        {!isWideDesktop && (
          <AnimatePresence>
            {activePanel && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
                onClick={() => setActivePanel(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  onClick={e => e.stopPropagation()}
                  className="relative w-full max-w-xl max-h-[85vh] bg-[#172033] rounded-3xl border-2 border-cyan-500/30 p-6 shadow-[0_0_40px_rgba(6,182,212,0.3)] overflow-y-auto custom-scrollbar"
                >
                  <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-700">
                    <h1 className="text-2xl font-extrabold text-cyan-400">
                      {activePanel === 'stuff' ? 'Stuff (Projects & Tools)' : 'Links & Contact'}
                    </h1>
                    <button
                      onClick={() => setActivePanel(null)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-500 text-slate-300 hover:text-white transition-all text-xs font-bold"
                    >
                      Close
                    </button>
                  </div>
                  {activePanel === 'stuff' ? renderSubfolders(STUFF_SUBFOLDERS) : renderSubfolders(SOCIAL_SUBFOLDERS)}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Torn Banner - Instantly visible on the initial screen without scrolling! */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 flex justify-center items-center px-4 w-auto pointer-events-auto">
          <a
            href="https://www.torn.com/4197113"
            target="_blank"
            rel="noopener noreferrer"
            title="Join me in Torn City!"
            className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          >
            <motion.img
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              src="https://banners.torn.com/static_728x90_torncity.jpg?v=1528808940574"
              alt="Join me in Torn City"
              width={728}
              height={90}
              fetchPriority="high"
              className="max-w-[90vw] md:max-w-[728px] h-auto rounded-xl shadow-2xl border border-white/5 hover:border-cyan-500/30 transition-all active:scale-95"
            />
          </a>
        </div>

      </main>

      {/* Desktop Floating Sidebars (>= 1024px width) */}
      {isWideDesktop && (
        <>
          {/* Stuff Sidebar */}
          <motion.div
            initial={{ left: '25%', x: '-50%', y: '-50%', scale: 0.95, opacity: 0 }}
            animate={{
              left: activePanel === 'stuff' ? `calc(50% - ${(buttonsWidth + gap) / 2}px)` : '25%',
              scale: activePanel === 'stuff' ? 1 : 0.95,
              opacity: activePanel === 'stuff' ? 1 : 0,
              pointerEvents: activePanel === 'stuff' ? 'auto' : 'none'
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ width: `${sidebarWidth}px` }}
            className="fixed top-1/2 h-[85vh] bg-[#172033] rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.6)] p-8 overflow-y-auto z-50 custom-scrollbar"
          >
            <h1 className="text-3xl font-extrabold text-cyan-400 mb-8 text-center tracking-tight">
              Stuff (Projects & Tools)
            </h1>
            {renderSubfolders(STUFF_SUBFOLDERS)}
          </motion.div>

          {/* Links Sidebar */}
          <motion.div
            initial={{ left: '75%', x: '-50%', y: '-50%', scale: 0.95, opacity: 0 }}
            animate={{
              left: activePanel === 'links' ? `calc(50% + ${(buttonsWidth + gap) / 2}px)` : '75%',
              scale: activePanel === 'links' ? 1 : 0.95,
              opacity: activePanel === 'links' ? 1 : 0,
              pointerEvents: activePanel === 'links' ? 'auto' : 'none'
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{ width: `${sidebarWidth}px` }}
            className="fixed top-1/2 h-[85vh] bg-[#172033] rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.6)] p-8 overflow-y-auto z-50 custom-scrollbar"
          >
            <h1 className="text-3xl font-extrabold text-cyan-400 mb-8 text-center tracking-tight">
              Links & Contact
            </h1>
            {renderSubfolders(SOCIAL_SUBFOLDERS)}
          </motion.div>
        </>
      )}

      {/* Secret Sponsors Footer Area: Revealed Only When Scrolling Down */}
      <footer className="relative z-20 w-full pt-28 pb-24 px-4 sm:px-8 flex flex-col items-center justify-center text-center">

        {/* Section Header */}
        <div className="mb-12 flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono tracking-widest uppercase mb-3 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Unofficial Official Sponsors</span>
          </div>
          <p className="text-slate-400 text-xs font-mono tracking-wide">
            Not sponsored • Just obsessed
          </p>
        </div>

        {/* Unboxed Spanning Logo Strip */}
        <div className="w-full max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-7 sm:gap-10 md:gap-12 py-4">
          {SPONSORS.map((sponsor, idx) => (
            <a
              key={idx}
              href={sponsor.url}
              target="_blank"
              rel="noopener noreferrer"
              title={sponsor.name === 'Google' ? 'Google (Dino Game) — Unofficial Official Sponsor' : `${sponsor.name} — Unofficial Official Sponsor`}
              className="group flex flex-col items-center gap-2.5 transition-all duration-300 hover:-translate-y-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg p-1"
            >
              <div 
                className="transition-all duration-300 transform group-hover:scale-115 flex items-center justify-center"
                style={{
                  color: sponsor.color,
                  filter: `drop-shadow(0 0 12px ${sponsor.glow})`
                }}
              >
                {sponsor.svg}
              </div>
              <span className="text-xs font-mono font-medium text-slate-400 group-hover:text-white transition-colors">
                {sponsor.name}
              </span>
            </a>
          ))}
        </div>

        {/* Footer Tag */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs font-mono text-slate-400 tracking-wider mt-16">
          <a
            href="mailto:contact@zedf.co.uk"
            className="text-cyan-400 hover:text-cyan-300 transition-colors underline decoration-cyan-500/30 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded px-1"
            title="Email w1ll0w at contact@zedf.co.uk"
          >
            contact@zedf.co.uk
          </a>
          <span className="text-slate-600 hidden sm:inline" aria-hidden="true">•</span>
          <span className="text-slate-300 font-medium">w1ll0w</span>
          <span className="text-slate-600 hidden sm:inline" aria-hidden="true">•</span>
          <Link
            href="/directory"
            className="text-slate-400 hover:text-cyan-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded px-1"
            title="Accessible Simplified Site Directory"
          >
            site directory
          </Link>
        </div>

      </footer>
    </div>
  );
}
