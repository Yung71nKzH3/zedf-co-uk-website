import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Characteristica Universalis | 45-Coordinate Philosophical Engine',
  description:
    'A 45-coordinate Leibnizian philosophical sentence engine modeling human ontology across 3 Acts (Born, Live, Die), 4 Concentric Rings, and 8 Archetypes.',
  keywords: [
    'Characteristica Universalis',
    'Philosophy Quiz',
    'Ontology',
    'Leibniz',
    'Philosophical Archetypes',
    'Stoicism',
    'Astrolabe',
    'ZEDF',
  ],
  alternates: {
    canonical: '/characteristica',
  },
  openGraph: {
    title: 'Characteristica Universalis — The Philosophical Sentence Engine | ZEDF',
    description:
      'Discover your exact philosophical definition, 8-archetype spider constellation, and living axioms.',
    url: 'https://www.zedf.co.uk/characteristica',
    type: 'website',
  },
};

export default function CharacteristicaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
