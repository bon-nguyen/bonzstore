import type { MetadataRoute } from 'next';
import { SITE_URL } from '../lib/storefront-data';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Google Search, Google Shopping, ChatGPT Search & Gemini AI Overviews
        userAgent: [
          '*',
          'Googlebot',
          'Googlebot-Image',
          'Storebot-Google',
          'Google-Extended',
          'GoogleOther',
          'OAI-SearchBot',
          'ChatGPT-User',
          'GPTBot',
          'PerplexityBot',
          'ClaudeBot',
        ],
        allow: ['/', '/llms.txt', '/llms-full.txt'],
        disallow: ['/api/private/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

