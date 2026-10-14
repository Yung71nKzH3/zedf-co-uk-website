import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Uni Dashboard | Portsmouth',
  description: 'Quick student portal links, timetables, Moodle, IT services, and interactive campus map for the University of Portsmouth.',
  keywords: ['University of Portsmouth', 'Student Portal', 'MyPort', 'Moodle', 'Uni Dashboard', 'ZEDF'],
  alternates: {
    canonical: '/uni',
  },
  openGraph: {
    title: 'Uni Dashboard | ZEDF',
    description: 'Quick student portal links, timetables, Moodle, email shortcuts, and IT service resources for the University of Portsmouth.',
    url: 'https://www.zedf.co.uk/uni',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Uni Dashboard | ZEDF',
    description: 'Quick student portal links and academic shortcuts for the University of Portsmouth.',
  },
  manifest: '/manifests/uni.webmanifest',
  icons: {
    icon: '/icons/uni.svg',
    apple: '/icons/uni-192.png',
  },
};

export default function UniLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
