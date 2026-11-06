import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gaben.tv Reborn - Steam Deals, Miracle Loop & Listen Hours',
  description: 'The return of gaben.tv! Praise Lord Gabe Newell with seamless video looping, live community listen hours, interactive discount rain, and real-time Steam freebies & deals.',
  keywords: ['Gaben.tv', 'Gabe Newell', 'Steam Sales', 'Steam Deals', 'Free Games', 'Listen Hours', 'ZEDF'],
  alternates: {
    canonical: '/gaben',
  },
  openGraph: {
    title: 'Gaben.tv Reborn | Praise Lord GabeN',
    description: 'Listen to the miracle loop, track global listen hours, shower in Steam discounts, and discover free Steam games.',
    url: 'https://www.zedf.co.uk/gaben',
    type: 'website',
  },
  icons: {
    icon: '/images/favicon.png',
  },
};

export default function GabenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
