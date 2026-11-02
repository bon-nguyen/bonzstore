import type { MetadataRoute } from 'next';
import {
  FALLBACK_CATEGORIES,
  FALLBACK_PRODUCTS,
  SITE_URL,
} from '../lib/storefront-data';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/llms.txt`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/llms-full.txt`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = FALLBACK_CATEGORIES.map(
    (cat) => ({
      url: `${SITE_URL}/?series=${encodeURIComponent(cat.slug)}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.85,
    }),
  );

  const productRoutes: MetadataRoute.Sitemap = FALLBACK_PRODUCTS.map(
    (prod) => ({
      url: `${SITE_URL}/?product=${encodeURIComponent(prod.code)}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    }),
  );

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}

