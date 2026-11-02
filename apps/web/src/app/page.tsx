import React from 'react';
import { StorefrontShell } from '../components/layout';
import { StorefrontJsonLd } from '../components/seo';

/**
 * Trang chủ Storefront (Next.js Server Component)
 * - Xuất trực tiếp Schema.org JSON-LD (@graph) từ Server cho Googlebot, OAI-SearchBot (ChatGPT) và Google-Extended (Gemini).
 * - Kết xuất giao diện 11 phân cảnh 24H (Sáng / Trưa / Tối) thông qua StorefrontShell.
 */
export default function HomePage() {
  return (
    <>
      <StorefrontJsonLd />
      <StorefrontShell />
    </>
  );
}
