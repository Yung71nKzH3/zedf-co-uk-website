import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Clarity | Infinite Node & Debate Canvas',
  description:
    'A freeform, local-first & real-time multiplayer node playground for mapping arguments, debates, flowcharts, and connected notes.',
  keywords: [
    'Clarity',
    'Debate Map',
    'Argument Mapping',
    'Infinite Canvas',
    'Flowchart Maker',
    'Mind Map',
    'Multiplayer Whiteboard',
    'ZEDF',
  ],
  alternates: {
    canonical: '/clarity',
  },
  openGraph: {
    title: 'Clarity - Infinite Node & Debate Canvas | ZEDF',
    description:
      'Keep track of every point, counterpoint, side tangent, and flowchart connection on an infinite local-first & multiplayer canvas.',
    url: 'https://www.zedf.co.uk/clarity',
    type: 'website',
  },
  manifest: '/manifests/clarity.webmanifest',
  icons: {
    icon: '/icons/clarity.svg',
    apple: '/icons/clarity.svg',
  },
};

export default function ClarityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
