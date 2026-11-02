'use client';

import React from 'react';
import { Bot, FileText, HelpCircle, Sparkles } from 'lucide-react';
import { STOREFRONT_SEO_FAQS } from '../../lib/storefront-data';

export function SeoKnowledgeFaqSection() {
  return (
    <section
      id="section-seo-knowledge"
      data-testid="seo-knowledge-faq-section"
      aria-labelledby="seo-faq-heading"
      className="relative z-10 mx-auto max-w-7xl px-4 py-12 md:px-6"
    >
      <div className="filter-panel">
        <div className="page-header border-b-2 border-dashed border-kw-border/25 pb-5">
          <div>
            <span className="page-subtitle bg-kw-mint">
              <Bot className="h-3.5 w-3.5" />
              <span>AI KNOWLEDGE BASE · GOOGLE · CHATGPT · GEMINI</span>
            </span>
            <h2 id="seo-faq-heading" className="page-title">
              Cẩm Nang Kiểm Định Chính Hãng & Câu Hỏi Thường Gặp
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href="/llms.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="action-btn-secondary py-2 text-xs"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>/llms.txt (ChatGPT & Gemini)</span>
            </a>
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="status-badge status-maintenance py-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>/sitemap.xml (Googlebot)</span>
            </a>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {STOREFRONT_SEO_FAQS.map((item, idx) => (
            <div key={idx} className="stat-card">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="status-badge status-active">
                  {item.category}
                </span>
                <span className="priority-medium text-xs">FAQ #{idx + 1}</span>
              </div>

              <dt className="flex items-start gap-2 font-display text-base font-bold text-kw-primary">
                <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#E11D48] dark:text-[#FDA4AF]" />
                <span>{item.question}</span>
              </dt>

              <dd className="mt-2 text-xs font-semibold leading-relaxed text-kw-secondary sm:text-sm">
                {item.answer}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

