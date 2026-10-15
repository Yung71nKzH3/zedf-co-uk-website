import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  themeColor: '#181d14',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Wote — Minimalist Outliner',
  description: 'A distraction-free, privacy-focused tree-structured outliner notes workspace with offline persistence.',
  keywords: ['Notes', 'Notepad', 'Outliner', 'Minimalist', 'Productivity', 'Wote', 'ZEDF', 'PWA', 'Offline'],
  manifest: '/wote-manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Wote',
  },
  icons: {
    icon: [
      { url: '/icons/wote-icon.svg', type: 'image/svg+xml' },
      { url: '/icons/wote-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/wote-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/wote-192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  alternates: {
    canonical: '/wote',
  },
  openGraph: {
    title: 'Wote — Minimalist Outliner | ZEDF',
    description: 'A distraction-free, privacy-focused tree-structured outliner notes workspace with offline persistence.',
    url: 'https://www.zedf.co.uk/wote',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wote — Minimalist Outliner | ZEDF',
    description: 'Distraction-free tree-structured outliner workspace with offline persistence.',
  },
};

export default function WoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
