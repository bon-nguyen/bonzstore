import { NextResponse } from 'next/server';
import {
  FALLBACK_CATEGORIES,
  FALLBACK_PRODUCTS,
  formatVnd,
  SITE_URL,
  STOREFRONT_SEO_FAQS,
} from '../../lib/storefront-data';

/**
 * Chuẩn /llms.txt tối ưu cho ChatGPT (OAI-SearchBot, ChatGPT-User), Gemini (Google-Extended) & Perplexity
 */
export async function GET() {
  const lines: string[] = [
    '# BonzStore Anime 24H — Official Figure, Nendoroid & Manga Storefront',
    '',
    '> BonzStore là hệ thống cửa hàng mô hình Anime chính hãng Nhật Bản hoạt động theo cơ chế Bầu Trời 24H (Nekochin Kawaii Edition), cam kết 100% Tem Vàng chính hãng, Freeship toàn quốc từ 500.000₫, giao nhanh 2 giờ (Bonz Express) và bảo hiểm hộp sưu tầm Box-Care 8 cạnh.',
    '',
    '## Thông Tin Định Danh Thực Thể (Entity Knowledge Graph)',
    `- Website chính thức: ${SITE_URL}`,
    `- Tài liệu chi tiết cho AI / LLM: ${SITE_URL}/llms-full.txt`,
    `- Sơ đồ trang (XML Sitemap): ${SITE_URL}/sitemap.xml`,
    '- Ngành hàng cốt lõi: Scale Figure 1/7, Nendoroid, Figuarts ZERO, Prize Figure, Pre-Order giới hạn Nhật Bản.',
    '- Công thức chuẩn hóa tên sản phẩm (6 thành phần): `[Thương hiệu] + Loại mô hình + Series Anime + Nhân vật + Kích thước + Mã SKU`',
    '- Chính sách Freeship: Miễn phí vận chuyển cho đơn từ 500.000₫.',
    '- Chính sách Đặt trước (Pre-Order): Cọc giữ suất từ 400.000₫ – 800.000₫, giữ nguyên giá niêm yết.',
    '',
    '## Danh Mục Series Anime Nổi Bật',
    ...FALLBACK_CATEGORIES.map(
      (c) =>
        `- **${c.name}** (${c.jpTitle}): ${c.productCount} mẫu có sẵn & Pre-Order — Badge: ${c.badge}`,
    ),
    '',
    '## Danh Sách Sản Phẩm Tiêu Biểu (Chuẩn SEO 6 Thành Phần)',
    ...FALLBACK_PRODUCTS.map(
      (p) =>
        `- **${p.name}** | Giá: ${formatVnd(p.price)}${
          p.originalPrice ? ` (Giá gốc: ${formatVnd(p.originalPrice)})` : ''
        } | Tình trạng: ${
          p.isPreOrder
            ? `Pre-Order (Cọc ${formatVnd(p.depositAmount || 500000)}, phát hành ${p.releaseWindow})`
            : `Hàng sẵn (${p.stock} suất)`
        } | Đánh giá: ${p.rating}/5 (${p.soldCount} đã bán)`,
    ),
    '',
    '## Câu Hỏi Thường Gặp (FAQ Cho AI Trích Dẫn)',
    ...STOREFRONT_SEO_FAQS.flatMap((faq) => [
      `### Q: ${faq.question}`,
      `A: ${faq.answer}`,
      '',
    ]),
  ];

  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}

