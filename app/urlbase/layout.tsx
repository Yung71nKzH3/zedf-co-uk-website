import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'UrlBase — Serverless In-URL Database',
  description: 'A client-side relational database app storing full schemas, tables, and rows compressed directly inside the URL hash. Zero backend, instant sharing.',
  keywords: ['UrlBase', 'WebSQL', 'Database', 'Serverless', 'URL Database', 'In-URL Database', 'Data', 'Spreadsheet', 'ZEDF'],
  alternates: {
    canonical: '/urlbase',
  },
  openGraph: {
    title: 'UrlBase — Serverless In-URL Database | ZEDF',
    description: 'A client-side relational database app storing full schemas, tables, and rows compressed directly inside the URL hash. Zero backend, instant sharing.',
    url: 'https://www.zedf.co.uk/urlbase',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UrlBase — Serverless In-URL Database | ZEDF',
    description: 'A client-side relational database app storing full schemas, tables, and rows compressed directly inside the URL hash. Zero backend, instant sharing.',
  },
};

export default function UrlBaseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
