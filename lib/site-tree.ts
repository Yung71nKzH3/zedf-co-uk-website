import {
  PackageOpen,
  UserCircle,
  GraduationCap,
  Quote,
  Calendar,
  Brain,
  Gamepad2,
  Image as ImageIcon,
  Gamepad,
  Gift,
  Video,
  Clipboard,
  Calculator,
  ShoppingCart,
  MapPin,
  Youtube,
  Music,
  BarChart,
  Film,
  Mountain,
  Github,
  Instagram,
  MessageCircle,
  Tv,
  MessageSquare,
  Keyboard,
  Laptop,
  Code,
  Rocket,
  Dices,
  Network,
  Compass,
  Database,
  FolderTree,
  Monitor,
  Sparkles,
  FileCode,
  Globe,
  Rss,
  Bot,
  Smartphone,
  type LucideIcon,
} from 'lucide-react';

export interface SiteItem {
  id: string;
  title: string;
  desc: string;
  href: string;
  icon: LucideIcon;
  external?: boolean;
  badge?: string;
  tags?: string[];
}

export interface SiteSubfolder {
  id: string;
  title: string;
  desc: string;
  icon: LucideIcon;
  accent: string;
  items: SiteItem[];
}

export interface SiteWing {
  id: 'stuff' | 'socials' | 'system';
  title: string;
  subtitle: string;
  icon: LucideIcon;
  accent: string;
  subfolders: SiteSubfolder[];
}

export const SITE_TREE: SiteWing[] = [
  {
    id: 'stuff',
    title: 'Stuff',
    subtitle: 'Projects, Experiments & Arcade',
    icon: PackageOpen,
    accent: '#06b6d4',
    subfolders: [
      {
        id: 'apps-experiments',
        title: 'Apps & Experiments',
        desc: 'Interactive utilities, realtime canvases, and web tools',
        icon: Sparkles,
        accent: '#06b6d4',
        items: [
          { id: 'clarity', href: '/clarity', icon: Network, title: 'Clarity', desc: 'Realtime node & debate canvas via Durable Objects', badge: 'WebSockets', tags: ['canvas', 'collab'] },
          { id: 'electio', href: '/electio', icon: Dices, title: 'Electio', desc: 'Multiplayer decision roulette with live sync', badge: 'WebSockets', tags: ['roulette', 'multiplayer'] },
          { id: 'wote', href: '/wote', icon: Clipboard, title: 'Wote', desc: 'Local-first distraction-free markdown notebook', badge: 'PWA', tags: ['notes', 'markdown'] },
          { id: 'urlbase', href: '/urlbase', icon: Database, title: 'UrlBase', desc: 'Zero-backend database compressed inside URLs', badge: 'Zero-Cloud', tags: ['database', 'kanban'] },
          { id: 'calc67', href: '/calc67', icon: Calculator, title: 'Calc67', desc: 'Daily target math puzzle with D1 leaderboard', badge: 'D1 + PWA', tags: ['math', 'daily'] },
          { id: 'characteristica', href: '/characteristica', icon: Compass, title: 'Characteristica', desc: '45-coordinate philosophical alignment compass', badge: 'Quiz', tags: ['philosophy', 'quiz'] },
          { id: 'project-space', href: '/project-space', icon: Rocket, title: 'Personal Space', desc: 'Interactive 3D particle nebula universe', badge: 'Three.js', tags: ['3d', 'space'] },
          { id: 'gaben', href: '/gaben', icon: Gamepad2, title: 'Gaben.tv', desc: 'Wallet sacrifice praise simulator & global counter', badge: 'Realtime', tags: ['meme', 'steam'] },
        ],
      },
      {
        id: 'arcade-suite',
        title: 'Arcade Suite',
        desc: '15+ retro, casino, and logic mini-games under /play',
        icon: Gamepad2,
        accent: '#a855f7',
        items: [
          { id: 'play-hub', href: '/play', icon: Gamepad2, title: 'Arcade Hub', desc: 'Central launcher for all retro & puzzle games', badge: 'Hub', tags: ['games', 'arcade'] },
          { id: 'play-target24', href: '/play/target24', icon: Calculator, title: 'Target 24', desc: 'Combine 4 cards to reach 24', badge: 'Math' },
          { id: 'play-tetris', href: '/play/tetris', icon: Gamepad, title: 'Neon Tetris', desc: 'Classic block-stacking arcade action', badge: 'Arcade' },
          { id: 'play-2048', href: '/play/2048', icon: Dices, title: '2048', desc: 'Slide & merge tiles to reach 2048', badge: 'Puzzle' },
          { id: 'play-wordle', href: '/play/wordle', icon: Keyboard, title: 'Wordle', desc: 'Tech-themed 5-letter word puzzle', badge: 'Word' },
          { id: 'play-minesweeper', href: '/play/minesweeper', icon: Compass, title: 'Minesweeper', desc: 'Classic grid sweeper with safe first click', badge: 'Classic' },
        ],
      },
      {
        id: 'academic-resources',
        title: 'Academic & Curation',
        desc: 'University tools, hardware setup, wallpapers, and writing',
        icon: GraduationCap,
        accent: '#10b981',
        items: [
          { id: 'uni', href: '/uni', icon: GraduationCap, title: 'University Hub', desc: 'Timetable, portal & Portsmouth coursework', badge: 'UoP' },
          { id: 'uni-map', href: '/uni/map', icon: MapPin, title: 'Campus Map', desc: 'Interactive Leaflet campus building map', badge: 'Leaflet' },
          { id: 'setup', href: '/setup', icon: Monitor, title: 'Desk & Tech Setup', desc: '3D workstation, monitors & peripherals', badge: 'Three.js' },
          { id: 'showcase', href: '/showcase', icon: ImageIcon, title: 'Wallpapers', desc: 'Curated high-res wallpapers & themes', badge: 'Gallery' },
          { id: 'quotes', href: '/quotes', icon: Quote, title: 'Favorite Quotes', desc: 'Philosophical, literary & technical quotes', badge: 'Curated' },
          { id: 'cs-project', href: 'https://youtube.com/playlist?list=PLmDAk0SfywoVrnnN4JBR4tLcjPqfDA5N4&si=TBfZ-AnuuMInpFTM', icon: Calendar, title: 'College CS Project', desc: 'Timetable Scheduler demo playlist', external: true, badge: 'Video' },
          { id: 'epq', href: 'https://docs.google.com/document/d/1hdCehlL4bRm4cgJa2KhzUSMKTOEiEcjmxxgih3togmM/edit?usp=sharing', icon: Brain, title: 'EPQ Essay', desc: 'AI, Humans best friend?', external: true, badge: 'Doc' },
        ],
      },
      {
        id: 'extras-media',
        title: 'Extras & Community',
        desc: 'Steam creations, themes, and side drops',
        icon: Gift,
        accent: '#f59e0b',
        items: [
          { id: 'directory-link', href: '/directory', icon: FolderTree, title: 'Directory', desc: 'Minimalist searchable file-tree view', badge: 'Index' },
          { id: 'vivaldi-themes', href: 'https://themes.vivaldi.net/users/W1ll0w', icon: ImageIcon, title: 'Vivaldi Themes', desc: 'Custom browser themes — Lotta Style', external: true },
          { id: 'steam-group', href: 'https://steamcommunity.com/groups/0fukkes', icon: Gamepad2, title: 'Steam Group', desc: 'Faze Up', external: true },
          { id: 'steam-artwork', href: 'https://steamcommunity.com/sharedfiles/filedetails/?id=3323426346', icon: ImageIcon, title: 'Steam Artwork', desc: 'Like and Sub', external: true },
          { id: 'mynickname', href: 'https://mynickname.com/gamingamer', icon: Gamepad, title: 'w1ll0w', desc: 'Peep it', external: true },
          { id: 'christmas-album', href: 'https://youtu.be/ItC8GV4BJuw', icon: Gift, title: 'Christmas Album', desc: 'Ho Ho Ho', external: true },
          { id: 'steam-stream', href: 'https://steamcommunity.com/broadcast/watch/76561198151099217/', icon: Video, title: 'Steam Stream', desc: 'wassup', external: true },
        ],
      },
    ],
  },
  {
    id: 'socials',
    title: 'Socials',
    subtitle: 'Profiles, Code, Media & Contact',
    icon: UserCircle,
    accent: '#38bdf8',
    subfolders: [
      {
        id: 'dev-code',
        title: 'Dev & Typing',
        desc: 'Repositories, algorithms, and typing speed',
        icon: Code,
        accent: '#38bdf8',
        items: [
          { id: 'github', href: 'https://github.com/Yung71nKzH3', icon: Github, title: 'GitHub', desc: 'damn SSH', external: true, badge: 'Code' },
          { id: 'leetcode', href: 'https://leetcode.com/u/yung71nkzh3/', icon: Code, title: 'LeetCode', desc: 'grind', external: true, badge: 'DSA' },
          { id: 'monkeytype', href: 'https://monkeytype.com/profile/w1LL0w', icon: Laptop, title: 'MonkeyType', desc: 'yurr', external: true, badge: 'WPM' },
          { id: 'keybr', href: 'https://www.keybr.com/profile/b57ds5l', icon: Keyboard, title: 'Keybr', desc: 'type', external: true },
          { id: 'atkjink', href: 'https://atkjink.github.io/', icon: Github, title: 'Atkjink', desc: 'bruther', external: true },
        ],
      },
      {
        id: 'media-taste',
        title: 'Media & Taste',
        desc: 'Music, cinema, anime, and video',
        icon: Music,
        accent: '#ec4899',
        items: [
          { id: 'spotify', href: 'https://open.spotify.com/user/vleonardo2006', icon: Music, title: 'Spotify', desc: 'connoisseur', external: true, badge: 'Music' },
          { id: 'statsfm', href: 'https://stats.fm/wi110w', icon: BarChart, title: 'Stats.fm', desc: 'OG', external: true, badge: 'Stats' },
          { id: 'letterboxd', href: 'https://letterboxd.com/w1ll0ww/', icon: Film, title: 'Letterboxd', desc: 'fanatic', external: true, badge: 'Film' },
          { id: 'anilist', href: 'https://anilist.co/user/w1ll0wW/', icon: Tv, title: 'AniList', desc: 'Violet bro', external: true, badge: 'Anime' },
          { id: 'youtube', href: 'https://www.youtube.com/@w1ll0w62', icon: Youtube, title: 'YouTube', desc: 'bits&bobs', external: true, badge: 'Video' },
        ],
      },
      {
        id: 'social-irl',
        title: 'Social & IRL',
        desc: 'Feeds, reviews, trails, and gaming profiles',
        icon: Globe,
        accent: '#22d3ee',
        items: [
          { id: 'steam', href: 'https://steamcommunity.com/id/zfw1ll0w/', icon: Gamepad2, title: 'Steam', desc: 'goated', external: true, badge: 'Gaming' },
          { id: 'instagram', href: 'https://www.instagram.com/w1ll0_w/', icon: Instagram, title: 'Instagram', desc: 'reposts fire', external: true },
          { id: 'threads', href: 'https://www.threads.net/@w1ll0_w', icon: MessageCircle, title: 'Threads', desc: "don' look", external: true },
          { id: 'vivaldi-social', href: 'https://social.vivaldi.net/@W1ll0w', icon: MessageSquare, title: 'Vivaldi Social', desc: 'wut is ts?', external: true },
          { id: 'alltrails', href: 'https://www.alltrails.com/en-gb/members/w1ll0w-user?ref=header', icon: Mountain, title: 'AllTrails', desc: 'checkit', external: true },
          { id: 'maps', href: 'https://www.google.com/maps/contrib/109714089787548110234/reviews', icon: MapPin, title: 'Maps', desc: 'reviews', external: true },
          { id: 'amazon', href: 'https://www.amazon.co.uk/gp/profile/amzn1.account.AFZV5OZGH35QG65NFVT623ERKCJA/ref=cm_cr_dp_d_gw_tr?ie=UTF8', icon: ShoppingCart, title: 'Amazon', desc: 'bought&thought', external: true },
        ],
      },
    ],
  },
  {
    id: 'system',
    title: 'System & Meta',
    subtitle: 'Directory, Feeds & Machine Endpoints',
    icon: FileCode,
    accent: '#64748b',
    subfolders: [
      {
        id: 'meta-routes',
        title: 'Site Endpoints',
        desc: 'Accessible directory, sitemaps, RSS, and LLM context',
        icon: FolderTree,
        accent: '#94a3b8',
        items: [
          { id: 'sys-directory', href: '/directory', icon: FolderTree, title: 'Site Directory', desc: 'Minimalist searchable folder tree', badge: 'UI' },
          { id: 'sys-sitemap', href: '/sitemap.xml', icon: Globe, title: 'Sitemap XML', desc: 'Search engine route index', badge: 'XML', external: true },
          { id: 'sys-feed', href: '/feed.xml', icon: Rss, title: 'RSS Feed', desc: 'Site updates & project feed', badge: 'RSS', external: true },
          { id: 'sys-llms', href: '/llms.txt', icon: Bot, title: 'LLMs Context', desc: 'Structured site context for AI', badge: 'TXT', external: true },
          { id: 'sys-manifest', href: '/manifest.webmanifest', icon: Smartphone, title: 'PWA Manifest', desc: 'Web app install metadata', badge: 'PWA', external: true },
        ],
      },
    ],
  },
];
