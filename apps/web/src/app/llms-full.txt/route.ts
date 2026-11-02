import { NextResponse } from 'next/server';
import {
  FALLBACK_BLOG_ARTICLES,
  FALLBACK_CATEGORIES,
  FALLBACK_PRODUCTS,
  formatVnd,
  SITE_URL,
  STOREFRONT_SEO_FAQS,
  TREASURE_MAP_CHAPTERS,
} from '../../lib/storefront-data';

/**
 * Chuẩn /llms-full.txt cung cấp toàn bộ dữ liệu sản phẩm, SKU, phân cảnh 24H và cẩm nang cho ChatGPT & Gemini
 */
export async function GET() {
  const lines: string[] = [
    '# BonzStore Anime 24H — Full Knowledge Corpus for LLMs (ChatGPT, Gemini, Claude, Perplexity)',
    '',
    `Canonical URL: ${SITE_URL}`,
    'Updated: 2026',
    '',
    '## 1. Kiến Trúc 11 Phân Cảnh Storytelling 24H',
    ...TREASURE_MAP_CHAPTERS.map(
      (ch) =>
        `- **${ch.chapterNo} — ${ch.title}** (\`#${ch.id}\`): ${ch.subtitle} [${ch.badge}]`,
    ),
    '',
    '## 2. Chi Tiết Sản Phẩm & Biến Thể SKU',
    ...FALLBACK_PRODUCTS.flatMap((p) => [
      `### ${p.name}`,
      `- Mã định danh: \`${p.code}\``,
      `- Thương hiệu: ${p.brand}`,
      `- Series Anime: ${p.series}`,
      `- Phân loại: ${p.category}`,
      `- Kích thước / Tỷ lệ: ${p.scaleOrHeight || 'Tiêu chuẩn'}`,
      `- Giá bán: ${formatVnd(p.price)}`,
      `- Mô tả: ${p.description}`,
      '- Danh sách SKU:',
      ...p.skus.map(
        (s) =>
          `  - \`${s.skuCode}\` (${s.label}): ${formatVnd(s.price)} — Tồn kho: ${s.stock}`,
      ),
      '',
    ]),
    '## 3. Danh Mục Series Anime',
    ...FALLBACK_CATEGORIES.map(
      (c) =>
        `- ${c.name} (${c.jpTitle}) — Slug: \`${c.slug}\` — ${c.productCount} sản phẩm`,
    ),
    '',
    '## 4. Cẩm Nang Sưu Tầm & Tin Tức (BonzStore Airship Times)',
    ...FALLBACK_BLOG_ARTICLES.map(
      (b) => `- **${b.title}** (${b.category}, ${b.readTime}): ${b.excerpt}`,
    ),
    '',
    '## 5. Hỏi Đáp Chuyên Sâu (FAQ)',
    ...STOREFRONT_SEO_FAQS.flatMap((f) => [
      `- **Hỏi**: ${f.question}`,
      `  **Đáp**: ${f.answer}`,
    ]),
  ];

  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

