import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BonzStore Anime 24H — Figure, Nendoroid & Manga Chính Hãng Nhật Bản',
    short_name: 'BonzStore 24H',
    description:
      'Storefront Anime/Kawaii 24H chuyên Figure PVC, Scale 1/7, Nendoroid, Diorama và Pre-Order chính hãng Nhật Bản.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFDF9',
    theme_color: '#FFB5C2',
    lang: 'vi',
    categories: ['shopping', 'entertainment', 'lifestyle'],
  };
}

