export type WallpaperType = 'html' | 'video' | 'scene';

export interface WallpaperItem {
  id: string;
  title: string;
  type: WallpaperType;
  description: string;
  steamWorkshopId?: string;
  steamWorkshopUrl?: string;
  resolution: string; // e.g. '4K (3840x2160)', 'Ultrawide (3440x1440)', '1080p (1920x1080)'
  aspectRatio: '16:9' | '21:9' | '16:10' | '32:9';
  src: string; // Path to HTML folder index or video file (e.g. '/wallpapers/interactive-matrix/index.html' or video mp4/webm)
  posterUrl?: string; // Thumbnail preview image
  tags: string[];
  features?: string[]; // e.g. ['Interactive', 'Audio Reactive', 'Custom Clock', 'Mouse Parallax']
  accentColor?: string; // Neon hex code for ambient glow, e.g. '#06b6d4'
  author?: string;
}
