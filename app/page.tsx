'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ParticleCanvas from './components/ParticleCanvas';
import { 
  PackageOpen, UserCircle, GraduationCap, Quote, Server, Calendar, Brain, 
  Gamepad2, Image as ImageIcon, Gamepad, Gift, Video, Clipboard, Calculator, 
  ShoppingCart, MapPin, Youtube, Music, BarChart, Film, Mountain, Github, 
  Instagram, MessageCircle, Tv, MessageSquare, Keyboard, Laptop, Code, Rocket
} from 'lucide-react';
import Link from 'next/link';

const STUFF_LINKS = [
  { href: '/uni', icon: GraduationCap, title: 'Uni Dash', desc: 'Helpful Shortcuts' },
  { href: '/quotes', icon: Quote, title: 'Fav Quotes', desc: 'Just the Hits' },
  { href: 'https://falixnodes.net/startserver', icon: Server, title: 'Minecraft Server', desc: 'ip=zfgaming', external: true },
  { href: 'https://youtube.com/playlist?list=PLmDAk0SfywoVrnnN4JBR4tLcjPqfDA5N4&si=TBfZ-AnuuMInpFTM', icon: Calendar, title: 'College CS Project', desc: 'Timetable Scheduler', external: true },
  { href: 'https://docs.google.com/document/d/1hdCehlL4bRm4cgJa2KhzUSMKTOEiEcjmxxgih3togmM/edit?usp=sharing', icon: Brain, title: 'EPQ', desc: 'AI, Humans best friend?', external: true },
  { href: 'https://steamcommunity.com/id/zfw1ll0w/myworkshopfiles/', icon: Gamepad2, title: 'Wallpaper Engine', desc: 'My work', external: true },
  { href: 'https://steamcommunity.com/groups/0fukkes', icon: Gamepad2, title: 'Steam Group', desc: 'Faze Up', external: true },
  { href: 'https://steamcommunity.com/sharedfiles/filedetails/?id=3323426346', icon: ImageIcon, title: 'Steam Artwork', desc: 'Like and Sub', external: true },
  { href: 'https://mynickname.com/gamingamer', icon: Gamepad, title: 'w1ll0w', desc: 'Peep it', external: true },
  { href: 'https://youtu.be/ItC8GV4BJuw', icon: Gift, title: 'Christmas Album', desc: 'Ho Ho Ho', external: true },
  { href: 'https://steamcommunity.com/broadcast/watch/76561198151099217/', icon: Video, title: 'Steam Stream', desc: 'wassup', external: true },
  { href: '/wote', icon: Clipboard, title: 'Wote', desc: 'take note' },
  { href: '/calc67', icon: Calculator, title: 'Calc67', desc: 'daily' },
  { href: '/project-space', icon: Rocket, title: 'Personal Space', desc: 'The Nebula' },
  { href: 'https://themes.vivaldi.net/users/W1ll0w', icon: ImageIcon, title: 'Vivaldi Themes', desc: 'Lotta Style', external: true },
];

const SOCIAL_LINKS = [
  { href: 'https://www.amazon.co.uk/gp/profile/amzn1.account.AFZV5OZGH35QG65NFVT623ERKCJA/ref=cm_cr_dp_d_gw_tr?ie=UTF8', icon: ShoppingCart, title: 'Amazon', desc: 'bought&thought', external: true },
  { href: 'https://www.google.com/maps/contrib/109714089787548110234/reviews', icon: MapPin, title: 'Maps', desc: 'reviews', external: true },
  { href: 'https://www.youtube.com/@w1ll0w62', icon: Youtube, title: 'YouTube', desc: 'bits&bobs', external: true },
  { href: 'https://open.spotify.com/user/vleonardo2006', icon: Music, title: 'Spotify', desc: 'connoisseur', external: true },
  { href: 'https://stats.fm/wi110w', icon: BarChart, title: 'Stats.fm', desc: 'OG', external: true },
  { href: 'https://letterboxd.com/w1ll0ww/', icon: Film, title: 'Letterboxd', desc: 'fanatic', external: true },
  { href: 'https://www.alltrails.com/en-gb/members/w1ll0w-user?ref=header', icon: Mountain, title: 'AllTrails', desc: 'checkit', external: true },
  { href: 'https://github.com/Yung71nKzH3', icon: Github, title: 'GitHub', desc: 'damn SSH', external: true },
  { href: 'https://www.instagram.com/w1ll0_w/', icon: Instagram, title: 'Instagram', desc: 'reposts fire', external: true },
  { href: 'https://www.threads.net/@w1ll0_w', icon: MessageCircle, title: 'Threads', desc: 'don\' look', external: true },
  { href: 'https://steamcommunity.com/id/zfw1ll0w/', icon: Gamepad2, title: 'Steam', desc: 'goated', external: true },
  { href: 'https://anilist.co/user/w1ll0wW/', icon: Tv, title: 'AniList', desc: 'Violet bro', external: true },
  { href: 'https://social.vivaldi.net/@W1ll0w', icon: MessageSquare, title: 'Vivaldi Social', desc: 'wut is ts?', external: true },
  { href: 'https://www.keybr.com/profile/b57ds5l', icon: Keyboard, title: 'Keybr', desc: 'type', external: true },
  { href: 'https://monkeytype.com/profile/w1LL0w', icon: Laptop, title: 'MonkeyType', desc: 'yurr', external: true },
  { href: 'https://leetcode.com/u/yung71nkzh3/', icon: Code, title: 'LeetCode', desc: 'grind', external: true },
  { href: 'https://atkjink.github.io/', icon: Github, title: 'Atkjink', desc: 'bruther', external: true },
];

export default function Home() {
  const [activePanel, setActivePanel] = useState<'stuff' | 'links' | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Use a mousemove listener on the document to track global mouse movement
  // for the particle canvas, which is handled inside ParticleCanvas.tsx

  const togglePanel = (panel: 'stuff' | 'links') => {
    setActivePanel(prev => prev === panel ? null : panel);
  };

  const renderLinks = (links: typeof STUFF_LINKS) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {links.map((link, idx) => {
        const Icon = link.icon;
        const content = (
          <div className="bg-[#0c1422] rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.5),inset_0_0_10px_rgba(0,0,0,0.3)] p-4 flex flex-col items-center justify-center text-center min-h-[120px] transition-all duration-200 hover:scale-105 hover:bg-[#172033] hover:shadow-[0_4px_10px_rgba(0,0,0,0.4),0_0_15px_#06b6d4]">
            <Icon className="w-10 h-10 text-cyan-400 mb-2" />
            <h3 className="text-slate-100 font-bold">{link.title}</h3>
            <p className="text-slate-400 text-xs mt-1">{link.desc}</p>
          </div>
        );

        return link.external ? (
          <a key={idx} href={link.href} target="_blank" rel="noopener noreferrer" className="block">
            {content}
          </a>
        ) : (
          <Link key={idx} href={link.href} className="block">
            {content}
          </Link>
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

      {/* Main Content Area */}
      <div className="relative z-20 flex flex-col items-center justify-start md:justify-center min-h-screen pt-[300px] md:pt-0">
        
        {/* Title Bio */}
        <div className="absolute top-[250px] md:top-[calc(50%-200px)] left-1/2 -translate-x-1/2 w-[90%] md:w-[650px] text-center z-50">
          <p className="text-lg md:text-xl font-light text-slate-300">
            UK-based Undergrad Data Science Student
          </p>
        </div>

        {/* Desktop Layout Container */}
        <div className="relative w-[90%] md:w-[650px] flex flex-row gap-2 md:gap-12 items-center justify-center mt-4 md:mt-0 z-50">
          
          {/* Stuff Panel Button */}
          <motion.button
            onClick={() => togglePanel('stuff')}
            animate={{
              scale: activePanel === 'stuff' ? 1.02 : 1,
              borderColor: activePanel === 'stuff' ? '#06b6d4' : 'transparent',
              boxShadow: activePanel === 'stuff' ? '0 0 25px rgba(6, 182, 212, 0.5)' : '0 15px 30px rgba(0, 0, 0, 0.4)'
            }}
            whileHover={{ scale: 1.02, borderColor: '#06b6d4', boxShadow: '0 0 25px rgba(6, 182, 212, 0.5)' }}
            className="w-[44vw] h-[44vw] md:w-[300px] md:h-[300px] bg-[#172033] rounded-2xl border-[3px] border-transparent flex flex-col items-center justify-center text-center transition-colors"
          >
            <PackageOpen className={`w-[clamp(30px,8vw,70px)] h-[clamp(30px,8vw,70px)] mb-2 md:mb-4 transition-colors ${activePanel === 'stuff' ? 'text-cyan-400' : 'text-cyan-500'}`} />
            <h2 className="text-[clamp(18px,4vw,24px)] font-bold mb-1">Stuff</h2>
            <p className="text-slate-400 text-[clamp(10px,2vw,14px)] px-2">Projects, Experiments & Code.</p>
          </motion.button>

          {/* Links Panel Button */}
          <motion.button
            onClick={() => togglePanel('links')}
            animate={{
              scale: activePanel === 'links' ? 1.02 : 1,
              borderColor: activePanel === 'links' ? '#06b6d4' : 'transparent',
              boxShadow: activePanel === 'links' ? '0 0 25px rgba(6, 182, 212, 0.5)' : '0 15px 30px rgba(0, 0, 0, 0.4)'
            }}
            whileHover={{ scale: 1.02, borderColor: '#06b6d4', boxShadow: '0 0 25px rgba(6, 182, 212, 0.5)' }}
            className="w-[44vw] h-[44vw] md:w-[300px] md:h-[300px] bg-[#172033] rounded-2xl border-[3px] border-transparent flex flex-col items-center justify-center text-center transition-colors"
          >
            <UserCircle className={`w-[clamp(30px,8vw,70px)] h-[clamp(30px,8vw,70px)] mb-2 md:mb-4 transition-colors ${activePanel === 'links' ? 'text-cyan-400' : 'text-cyan-500'}`} />
            <h2 className="text-[clamp(18px,4vw,24px)] font-bold mb-1">Socials</h2>
            <p className="text-slate-400 text-[clamp(10px,2vw,14px)] px-2">View all my links & contact info.</p>
          </motion.button>
        </div>

        {/* Mobile Content Pane */}
        {isMobile && (
          <AnimatePresence>
            {activePanel && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="w-[90%] bg-[#172033] rounded-2xl shadow-[0_8px_15px_rgba(0,0,0,0.4)] mt-4 mb-8 overflow-hidden z-40"
              >
                <div className="p-4">
                  <h1 className="text-2xl font-extrabold text-cyan-400 mb-4 text-center">
                    {activePanel === 'stuff' ? 'Stuff (Projects & Tools)' : 'Links & Contact'}
                  </h1>
                  {activePanel === 'stuff' ? renderLinks(STUFF_LINKS) : renderLinks(SOCIAL_LINKS)}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Desktop Sidebars */}
      {!isMobile && (
        <>
          {/* Stuff Sidebar */}
          <motion.div
            initial={{ left: '25%', x: '-50%', y: '-50%', scale: 0.95, opacity: 0 }}
            animate={{
              left: activePanel === 'stuff' ? 'calc(50% - 325px - 225px - 3rem)' : '25%',
              scale: activePanel === 'stuff' ? 1 : 0.95,
              opacity: activePanel === 'stuff' ? 1 : 0,
              pointerEvents: activePanel === 'stuff' ? 'auto' : 'none'
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-1/2 w-[450px] h-[85vh] bg-[#172033] rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.6)] p-8 overflow-y-auto z-50 custom-scrollbar"
          >
            <h1 className="text-3xl font-extrabold text-cyan-400 mb-8 text-center tracking-tight">
              Stuff (Projects & Tools)
            </h1>
            {renderLinks(STUFF_LINKS)}
          </motion.div>

          {/* Links Sidebar */}
          <motion.div
            initial={{ left: '75%', x: '-50%', y: '-50%', scale: 0.95, opacity: 0 }}
            animate={{
              left: activePanel === 'links' ? 'calc(50% + 325px + 225px + 3rem)' : '75%',
              scale: activePanel === 'links' ? 1 : 0.95,
              opacity: activePanel === 'links' ? 1 : 0,
              pointerEvents: activePanel === 'links' ? 'auto' : 'none'
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-1/2 w-[450px] h-[85vh] bg-[#172033] rounded-2xl shadow-[0_15px_30px_rgba(0,0,0,0.6)] p-8 overflow-y-auto z-50 custom-scrollbar"
          >
            <h1 className="text-3xl font-extrabold text-cyan-400 mb-8 text-center tracking-tight">
              Links & Contact
            </h1>
            {renderLinks(SOCIAL_LINKS)}
          </motion.div>
        </>
      )}

      {/* Torn Banner */}
      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex justify-center items-center px-4 w-auto pointer-events-auto">
        <motion.img 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          onClick={() => window.open('https://www.torn.com/4197113')} 
          style={{ cursor: 'pointer' }} 
          src="https://banners.torn.com/static_728x90_torncity.jpg?v=1528808940574" 
          alt="Torn City"
          className="max-w-[90vw] md:max-w-[728px] h-auto rounded-xl shadow-2xl border border-white/5 hover:border-cyan-500/30 transition-all active:scale-95"
          title="Join me in Torn City!"
        />
      </footer>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes moveGradient {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #06b6d4; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.1); }
      `}} />
    </div>
  );
}
