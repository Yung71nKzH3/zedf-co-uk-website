import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Directory | Accessible Site Tree',
  description: 'Minimalist, keyboard-navigable directory and folder structure of all tools, games, academic portals, and feeds on zedf.co.uk.',
  alternates: {
    canonical: '/directory',
  },
  openGraph: {
    title: 'ZEDF | Site Directory',
    description: 'Accessible minimalist folder structure and site traversal for zedf.co.uk.',
    url: 'https://www.zedf.co.uk/directory',
  },
};

export default function DirectoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
