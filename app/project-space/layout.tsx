import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Personal Space',
  description: 'An interactive nebula and constellation of creative projects, experiments, and developer tools.',
  keywords: ['Project Space', 'Portfolio', 'Interactive Starfield', 'Data Science', 'Projects', 'ZEDF'],
  alternates: {
    canonical: '/project-space',
  },
  openGraph: {
    title: 'Personal Space - Project Nebula | ZEDF',
    description: 'An interactive nebula and constellation of creative projects, experiments, and developer tools.',
    url: 'https://www.zedf.co.uk/project-space',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Personal Space - Project Nebula | ZEDF',
    description: 'Interactive nebula and constellation of creative projects and experiments.',
  },
};

export default function ProjectSpaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
