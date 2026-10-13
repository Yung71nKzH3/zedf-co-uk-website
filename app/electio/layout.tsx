import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Electio | High-Tech Decision Roulette',
  description: 'A stylish, interactive multiplayer decision roulette with synchronized live spinning, risk chips, sound synthesizers, and presets.',
  keywords: ['Electio', 'Decision Roulette', 'Wheel of Fortune', 'Random Choice Picker', 'Multiplayer Roulette', 'ZEDF'],
  alternates: {
    canonical: '/electio',
  },
  openGraph: {
    title: 'Electio - High-Tech Decision Roulette | ZEDF',
    description: 'A stylish, interactive multiplayer decision roulette with synchronized live spinning, risk chips, and sound synthesizers.',
    url: 'https://www.zedf.co.uk/electio',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Electio - High-Tech Decision Roulette | ZEDF',
    description: 'A stylish, interactive multiplayer decision roulette with synchronized live spinning, risk chips, and sound synthesizers.',
  },
};

export default function ElectioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
