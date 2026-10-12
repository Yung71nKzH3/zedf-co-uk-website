import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

const GAMES = [
  'sudoku',
  'wordle',
  'slide',
  'maze',
  'blackjack',
  'craps',
  'snake',
  'tetris',
  'pong',
  '2048',
  'minesweeper',
  'asteroids',
  'memory',
  'typer',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.zedf.co.uk';
  const lastModified = new Date();

  const coreRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/play`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/showcase`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/calc67`,
      lastModified,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/wote`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/project-space`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/setup`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/uni`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/uni/map`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/quotes`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  const gameRoutes: MetadataRoute.Sitemap = GAMES.map((game) => ({
    url: `${baseUrl}/play/${game}`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...coreRoutes, ...gameRoutes];
}
