import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { QueryProvider } from '../providers/QueryProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'BonzStore — Cửa hàng trực tuyến',
  description: 'Next.js Storefront tích hợp NestJS API & React Query',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}

