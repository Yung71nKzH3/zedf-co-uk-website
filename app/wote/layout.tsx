import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Wote',
  description: 'A distraction-free, privacy-focused note-taking workspace with markdown formatting, syntax highlighting, and local persistence.',
  keywords: ['Notes', 'Notepad', 'Markdown', 'Minimalist', 'Productivity', 'Wote', 'ZEDF'],
  alternates: {
    canonical: '/wote',
  },
  openGraph: {
    title: 'Wote - Minimalist Notes | ZEDF',
    description: 'A distraction-free, privacy-focused note-taking workspace with markdown formatting, syntax highlighting, and local persistence.',
    url: 'https://www.zedf.co.uk/wote',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wote - Minimalist Notes | ZEDF',
    description: 'Distraction-free note-taking workspace with markdown support and code syntax highlighting.',
  },
};

export default function WoteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
