import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portsmouth Campus Map',
  description: 'Interactive map and building locator for the University of Portsmouth campus with building codes and walking directions.',
  keywords: ['University of Portsmouth Map', 'Campus Map', 'Portsmouth Buildings', 'UoP Navigation', 'ZEDF'],
  alternates: {
    canonical: '/uni/map',
  },
  openGraph: {
    title: 'Portsmouth Campus Map | ZEDF',
    description: 'Interactive map and building locator for the University of Portsmouth campus with building codes and walking directions.',
    url: 'https://www.zedf.co.uk/uni/map',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Portsmouth Campus Map | ZEDF',
    description: 'Interactive map and building locator for the University of Portsmouth campus.',
  },
};

export default function UniMapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
