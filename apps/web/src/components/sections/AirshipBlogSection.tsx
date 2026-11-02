'use client';

import React from 'react';
import { BookOpen, Clock, Newspaper } from 'lucide-react';
import { FALLBACK_BLOG_ARTICLES } from '../../lib/storefront-data';

export function AirshipBlogSection() {
  const featured = FALLBACK_BLOG_ARTICLES[0];
  const briefs = FALLBACK_BLOG_ARTICLES.slice(1);

  return (
    <section
      id="section-home-blog"
      data-testid="airship-blog-section"
      className="relative z-10 mx-auto max-w-7xl px-4 py-12 md:px-6"
    >
      <div className="filter-panel p-6 sm:p-8">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 border-b-[3px] border-double border-kw-border pb-5 md:flex-row md:items-center">
          <div className="flex items-center gap-3.5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-[#4A3E3D] bg-[#A2D2FF] shadow-kw-hard-sm">
              <svg viewBox="0 0 64 48" className="h-10 w-10">
                <ellipse
                  cx="32"
                  cy="20"
                  rx="24"
                  ry="12"
                  fill="#FFB5C2"
                  stroke="#4A3E3D"
                  strokeWidth="3"
                />
                <path
                  d="M18 10 C 26 26, 38 26, 46 10"
                  stroke="#FFF3B0"
                  strokeWidth="3"
                  fill="none"
                />
                <rect
                  x="25"
                  y="34"
                  width="14"
                  height="8"
                  rx="2"
                  fill="#FFF3B0"
                  stroke="#4A3E3D"
                  strokeWidth="2.5"
                />
                <line
                  x1="27"
                  y1="31"
                  x2="27"
                  y2="34"
                  stroke="#4A3E3D"
                  strokeWidth="2"
                />
                <line
                  x1="37"
                  y1="31"
                  x2="37"
                  y2="34"
                  stroke="#4A3E3D"
                  strokeWidth="2"
                />
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="status-badge status-maintenance font-mono text-[10px]">
                  CHƯƠNG 10 · BONZSTORE AIRSHIP TIMES
                </span>
                <span className="font-mono text-xs text-kw-secondary">
                  ẤN PHẨM SỐ #24H
                </span>
              </div>
              <h2 className="page-title mt-1">
                Tạp Chí Khinh Khí Cầu — Cẩm Nang & Tin Tức Sưu Tầm
              </h2>
            </div>
          </div>

          <span className="status-badge status-active py-1.5">
            <Newspaper className="h-4 w-4" />
            <span>Phát hành mỗi sáng từ Khoang Báo</span>
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {featured && (
            <article className="stat-card flex flex-col justify-between p-4 lg:col-span-7">
              <div>
                <div className="relative aspect-[16/9] overflow-hidden rounded-xl border-2 border-[#4A3E3D]">
                  <img
                    src={featured.coverImage}
                    alt={featured.title}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  <span className="status-badge status-inactive absolute left-3 top-3 font-mono">
                    {featured.category}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-3 font-mono text-xs text-kw-secondary">
                  <span>{featured.publishedAt}</span>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {featured.readTime}
                  </span>
                </div>

                <h3 className="mt-2 font-display text-lg font-bold leading-snug text-kw-primary md:text-xl">
                  {featured.title}
                </h3>
                <p className="mt-2 text-sm text-kw-secondary">
                  {featured.excerpt}
                </p>
              </div>

              <div className="mt-4 border-t border-dashed border-kw-border/30 pt-3">
                <span className="inline-flex items-center gap-1.5 font-display text-xs font-bold text-[#E11D48] dark:text-[#FDA4AF]">
                  <BookOpen className="h-4 w-4" />
                  <span>Đọc toàn bộ chuyên đề phân biệt tem thật/giả →</span>
                </span>
              </div>
            </article>
          )}

          <div className="flex flex-col justify-between gap-4 lg:col-span-5">
            {briefs.map((item) => (
              <article
                key={item.id}
                className="stat-card flex flex-col gap-3 p-4 sm:flex-row"
              >
                <img
                  src={item.coverImage}
                  alt={item.title}
                  loading="lazy"
                  className="h-28 w-full shrink-0 rounded-xl border-2 border-[#4A3E3D] object-cover sm:w-28"
                />
                <div className="flex flex-col justify-between">
                  <div>
                    <span className="rounded-md bg-[#FFF3B0] px-2 py-0.5 font-mono text-[10px] font-bold text-[#4A3E3D]">
                      {item.category}
                    </span>
                    <h4 className="mt-1.5 line-clamp-2 font-display text-sm font-bold text-kw-primary">
                      {item.title}
                    </h4>
                    <p className="mt-1 line-clamp-2 text-xs text-kw-secondary">
                      {item.excerpt}
                    </p>
                  </div>
                  <span className="mt-2 font-mono text-[11px] font-bold text-kw-secondary">
                    {item.publishedAt} · {item.readTime}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

