import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calc67',
  description: 'Reach 67 using daily numbers and operations in this daily math puzzle game with global leaderboards.',
  keywords: ['Calc67', 'Math Puzzle', 'Calculator Game', 'Daily Puzzle', 'Numbers Game', 'ZEDF'],
  alternates: {
    canonical: '/calc67',
  },
  openGraph: {
    title: 'Calc67 - Daily Math Puzzle | ZEDF',
    description: 'Reach 67 using daily numbers and operations in this daily math puzzle game with global leaderboards.',
    url: 'https://www.zedf.co.uk/calc67',
    type: 'website',
  },
  manifest: '/manifests/calc67.webmanifest',
  icons: {
    icon: '/icons/calc67.svg',
    apple: '/icons/calc67-192.png',
  },
};

export default function Calc67Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
