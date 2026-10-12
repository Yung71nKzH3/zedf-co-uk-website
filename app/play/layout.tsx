import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Arcade',
  description: 'A curated collection of 14 retro browser games, puzzles, and casino classics. Zero ads, instant play, and local high score tracking.',
  keywords: ['Arcade', 'Retro Games', 'Browser Games', 'Sudoku', 'Tetris', 'Snake', '2048', 'Minesweeper', 'ZEDF'],
  alternates: {
    canonical: '/play',
  },
  openGraph: {
    title: 'Arcade Games Hub | ZEDF',
    description: 'Play 14 classic retro and puzzle browser games including Snake, Tetris, Sudoku, 2048, and Minesweeper.',
    url: 'https://www.zedf.co.uk/play',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Arcade Games Hub | ZEDF',
    description: 'Play 14 classic retro and puzzle browser games with local high score tracking.',
  },
};

export default function PlayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
