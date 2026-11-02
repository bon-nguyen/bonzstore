import type { Metadata, Viewport } from 'next';
import { ReactNode } from 'react';
import { SITE_URL } from '../lib/storefront-data';
import { QueryProvider } from '../providers/QueryProvider';
import { TimeModeProvider } from '../providers/time-mode-provider';
import { WishlistProvider } from '../providers/wishlist-provider';
import { CartProvider } from '../providers/cart-provider';
import './globals.css';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFDF9' },
    { media: '(prefers-color-scheme: dark)', color: '#0E1126' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      'BonzStore Anime 24H — Mô Hình Figure, Nendoroid & Manga Chính Hãng Nhật Bản',
    template: '%s | BonzStore Anime 24H',
  },
  description:
    'Cửa hàng Figure Anime, Nendoroid, Scale Figure 1/7 & Goods chính hãng Nhật Bản (Good Smile Company, Kotobukiya, Bandai). Trải nghiệm bầu trời 24H, Freeship từ 500.000₫, giao nhanh 2H Bonz Express & bảo hiểm hộp Box-Care.',
  applicationName: 'BonzStore Anime 24H',
  authors: [{ name: 'BonzStore Editorial & Collector Lab', url: SITE_URL }],
  generator: 'Next.js 14 App Router',
  keywords: [
    'figure anime chính hãng',
    'nendoroid good smile company',
    'scale figure 1/7',
    'mô hình blue lock isagi',
    'mô hình gojo satoru shibuya',
    'mô hình thám tử lừng danh conan',
    'mô hình frieren',
    'pre-order figure nhật bản',
    'bonzstore anime 24h',
  ],
  alternates: {
    canonical: '/',
    languages: {
      'vi-VN': '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: SITE_URL,
    siteName: 'BonzStore Anime 24H',
    title:
      'BonzStore Anime 24H — Mô Hình Figure, Nendoroid & Manga Chính Hãng Nhật Bản',
    description:
      'Chuyến bay Anime/Kawaii 24H tích hợp 11 phân cảnh: Ga Tàu Bonz Express giao nhanh 2H, Hồ Sơ Thám Tử #4869, Quầy Xổ Số Flash Sale & Sổ Tay Pre-Order.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'BonzStore Anime 24H — Figure & Nendoroid Chính Hãng Nhật Bản',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title:
      'BonzStore Anime 24H — Mô Hình Figure, Nendoroid & Manga Chính Hãng',
    description:
      'Săn Figure PVC, Scale 1/7 & Nendoroid chính hãng Tem Vàng Nhật Bản. Freeship từ 500K & Bảo hiểm hộp Box-Care 8 cạnh.',
    images: [
      'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
    ],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    // AI / LLM Discovery Hints cho ChatGPT (OAI-SearchBot) & Gemini (Google-Extended)
    'ai-content-declaration': 'human-curated-verified-catalog',
    'llms-txt': `${SITE_URL}/llms.txt`,
    'llms-full-txt': `${SITE_URL}/llms-full.txt`,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi" className="is-morning" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Mali:wght@500;600;700&family=Mulish:wght@600;700;800;900&family=Nunito:wght@600;700;800;900&family=Space+Grotesk:wght@500;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="alternate"
          type="text/plain"
          title="LLMs Knowledge Summary (ChatGPT & Gemini)"
          href="/llms.txt"
        />
      </head>
      <body className="is-morning min-h-screen antialiased">
        <QueryProvider>
          <TimeModeProvider>
            <WishlistProvider>
              <CartProvider>{children}</CartProvider>
            </WishlistProvider>
          </TimeModeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
