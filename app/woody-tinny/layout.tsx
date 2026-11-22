import type { Metadata } from 'next';

const TITLE = 'Woody or Tinny? — Monty Python English Dictionary Word Classifier & Voting';
const DESCRIPTION =
  'Inspired by Monty Python’s "Woody and Tinny Words" sketch: explore and vote on all 370,105 English words classified as Woody (Gorn, Caribou, Sausage) or Tinny (Newspaper, Litterbin, Simpkins).';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    'woody and tinny words',
    'monty python woody or tinny',
    'woody vs tinny words',
    'woody words list',
    'tinny words list',
    'gorn caribou litterbin',
    'english dictionary classifier',
    'phonetic word voting',
    'ZEDF',
  ],
  alternates: {
    canonical: '/woody-tinny',
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: 'https://www.zedf.co.uk/woody-tinny',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Woody or Tinny? English Dictionary Classifier',
  url: 'https://www.zedf.co.uk/woody-tinny',
  applicationCategory: 'EntertainmentApplication',
  operatingSystem: 'Any',
  description: DESCRIPTION,
  isBasedOn: 'https://youtu.be/M3-51DhOzHE',
};

export default function WoodyTinnyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
