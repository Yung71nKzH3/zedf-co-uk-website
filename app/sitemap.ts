import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://www.zedf.co.uk';
  const lastModified = new Date();

  const staticRoutes = [
    '',
    '/uni',
    '/quotes',
    '/wote',
    '/calc67',
    '/project-space',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return [...staticRoutes];
}
