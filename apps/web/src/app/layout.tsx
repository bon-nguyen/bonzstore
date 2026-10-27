import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { QueryProvider } from '../providers/QueryProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'BonzStore Anime — Figure, Manga & Cosplay Store',
  description: 'Next.js Anime Storefront tích hợp NestJS API & React Query',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Chakra+Petch:ital,wght@0,500;0,600;0,700;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
