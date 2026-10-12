import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Setup',
  description: 'Interactive 3D WebGL cyber desk setup and battlestation showcase with dynamic lighting and themes.',
  keywords: ['Setup', 'Desk Setup', '3D WebGL', 'Three.js', 'Battlestation', 'Cyberpunk', 'ZEDF'],
  alternates: {
    canonical: '/setup',
  },
  openGraph: {
    title: '3D Cyber Desk Setup | ZEDF',
    description: 'Interactive 3D WebGL cyber desk setup and battlestation showcase with dynamic lighting and themes.',
    url: 'https://www.zedf.co.uk/setup',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: '3D Cyber Desk Setup | ZEDF',
    description: 'Interactive 3D WebGL cyber desk setup and battlestation showcase.',
  },
};

export default function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
