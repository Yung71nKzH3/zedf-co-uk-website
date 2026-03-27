import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.zedf.co.uk'),
  title: {
    default: 'ZEDF | w1ll0w',
    template: '%s | ZEDF',
  },
  description: 'UK-based Undergrad Data Science Student. Digital garden sharing Projects, Experiments, and personal links.',
  keywords: ['Data Science', 'Developer', 'Portfolio', 'Next.js', 'React', 'Tech', 'Student', 'ZEDF', 'w1ll0w'],
  authors: [{ name: 'w1ll0w' }],
  creator: 'w1ll0w',
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://www.zedf.co.uk',
    title: 'ZEDF | w1ll0w',
    description: 'UK-based Undergrad Data Science Student. Explore my digital garden of projects and experiments.',
    siteName: 'ZEDF',
    images: [{
      url: '/images/zedf-banner.jpg',
      width: 1200,
      height: 630,
      alt: 'ZEDF Dashboard Banner',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ZEDF | w1ll0w',
    description: 'UK-based Undergrad Data Science Student. Digital garden sharing Projects, Experiments, and personal links.',
    images: ['/images/zedf-banner.jpg'],
    creator: '@zfw1ll0w',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/images/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans antialiased bg-[#0c1422] text-slate-100" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
