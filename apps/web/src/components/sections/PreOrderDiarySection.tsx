'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, CalendarClock, Feather, TicketCheck } from 'lucide-react';
import { formatVnd, StorefrontProduct } from '../../lib/storefront-data';
import { useCart } from '../../providers/cart-provider';
import { ProductImageSwap } from '../commerce/ProductImageSwap';

interface PreOrderDiarySectionProps {
  products: StorefrontProduct[];
}

const STORY_CARDS = [
  {
    step: 'Ký Ức 01 · Buổi Sáng',
    title: 'Đặt Cọc Nhẹ Nhàng Chỉ Từ 400K',
    desc: 'Giữ chắc suất Figure giới hạn ngay khi xưởng Nhật vừa mở cổng đăng ký mà không lo hết slot.',
    bg: '#FFF3B0',
  },
  {
    step: 'Ký Ức 02 · Buổi Trưa',
    title: 'Cập Nhật Tiến Độ Qua Thư Hàng Không',
    desc: 'Mỗi giai đoạn sơn mẫu, đóng kiện và lên máy bay về Việt Nam đều được ghi chép trong sổ tay.',
    bg: '#B8F2E6',
  },
  {
    step: 'Ký Ức 03 · Buổi Tối',
    title: 'Đảm Bảo Giá Tốt Nhất & Bảo Hiểm Hộp',
    desc: 'Cam kết không tăng giá khi hàng về và tặng kèm gói bọc chống sốc tiêu chuẩn sưu tầm gia.',
    bg: '#FFB5C2',
  },
];

export function PreOrderDiarySection({ products }: PreOrderDiarySectionProps) {
  const { addItem, setQuickViewProduct } = useCart();
  const penRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = penRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const preOrderItems = products.filter((p) => p.isPreOrder);
  const displayList =
    preOrderItems.length >= 3 ? preOrderItems : products.slice(4, 8);

  return (
    <section
      id="section-preorder-diary"
      data-testid="preorder-diary-section"
      className="relative z-10 mx-auto max-w-7xl px-4 py-12 md:px-6"
    >
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {STORY_CARDS.map((card) => (
          <div
            key={card.step}
            style={{ backgroundColor: card.bg }}
            className="rounded-2xl border-[2.5px] border-[#4A3E3D] p-4 text-[#4A3E3D] shadow-kw-hard-sm"
          >
            <span className="font-mono text-xs font-bold uppercase tracking-wider">
              {card.step}
            </span>
            <h3 className="mt-1 font-display text-base font-bold">
              {card.title}
            </h3>
            <p className="mt-1 text-xs font-semibold leading-relaxed text-[#4A3E3D]/85">
              {card.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="kw-diary-book relative p-6 sm:p-8 md:pl-12">
        <div
          aria-hidden="true"
          className="absolute -top-2 right-10 h-16 w-7 border-2 border-[#4A3E3D] bg-[#E11D48] shadow-md [clip-path:polygon(0_0,100%_0,100%_100%,50%_80%,0_100%)]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-8 left-2.5 top-8 hidden flex-col justify-between md:flex"
        >
          {Array.from({ length: 10 }).map((_, idx) => (
            <span
              key={idx}
              className="h-4 w-5 rounded-full border-2 border-[#4A3E3D] bg-[#CBD5E1] shadow-inner"
            />
          ))}
        </div>

        <div
          ref={penRef}
          className="mb-8 flex flex-col justify-between gap-4 border-b-2 border-kw-border/20 pb-5 lg:flex-row lg:items-center"
        >
          <div>
            <span className="page-subtitle bg-[#DCD3FF]">
              <BookOpen className="h-3.5 w-3.5" />
              <span>CHƯƠNG 6 · CUỐN NHẬT KÝ PRE-ORDER & BÚT MÁY TỰ VIẾT</span>
            </span>
            <h2 className="mt-2.5 font-storybook text-2xl font-bold italic text-kw-primary md:text-3xl">
              “Mỗi đơn đặt trước là một lời hẹn ước từ bầu trời Tokyo...”
            </h2>
          </div>

          <div className="flex items-center gap-3 self-start rounded-2xl border-2 border-[#4A3E3D] bg-white/95 px-4 py-2.5 text-[#4A3E3D] shadow-kw-hard-sm">
            <svg
              width="210"
              height="48"
              viewBox="0 0 210 48"
              fill="none"
              className="overflow-visible"
            >
              <path
                className={
                  isVisible
                    ? 'animate-diary-write [stroke-dasharray:320]'
                    : '[stroke-dasharray:320] [stroke-dashoffset:320]'
                }
                d="M10 34 C 35 12, 55 42, 82 24 C 105 10, 125 38, 152 22 C 168 14, 180 28, 192 24"
                stroke="#4A3E3D"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
              <g className={isVisible ? 'animate-diary-pen' : ''}>
                <path
                  d="M188 24 L204 8 L210 14 L194 30 Z"
                  fill="#FFB5C2"
                  stroke="#4A3E3D"
                  strokeWidth="2"
                />
                <polygon
                  points="184,28 188,24 192,28"
                  fill="#FBBF24"
                  stroke="#4A3E3D"
                  strokeWidth="1.5"
                />
              </g>
            </svg>
            <Feather className="h-5 w-5 text-[#FF8DA1]" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {displayList.slice(0, 3).map((item) => (
            <article
              key={item.id}
              className="kw-preorder-ticket flex flex-col justify-between p-4"
            >
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="status-badge bg-[#DCD3FF] font-mono text-[11px]">
                    <CalendarClock className="h-3.5 w-3.5" />
                    <span>{item.releaseWindow || 'Quý 4 / 2026'}</span>
                  </span>
                  <span className="priority-high text-xs">
                    Cọc: {formatVnd(item.depositAmount || 500000)}
                  </span>
                </div>

                <ProductImageSwap
                  product={item}
                  badgeText={item.badge || 'PRE-ORDER'}
                  badgeColor="#DCD3FF"
                />

                <h3
                  onClick={() => setQuickViewProduct(item)}
                  className="mt-3 line-clamp-2 cursor-pointer font-display text-sm font-bold text-kw-primary hover:text-[#E11D48]"
                >
                  {item.name}
                </h3>
              </div>

              <div className="mt-4 border-t-2 border-dashed border-kw-border/30 pt-3">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="block text-[11px] font-bold text-kw-secondary">
                      Giá trọn bộ dự kiến:
                    </span>
                    <span className="font-mono text-lg font-bold text-kw-primary">
                      {formatVnd(item.price)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => addItem(item, item.skus[0])}
                    className="action-btn-primary px-3.5 py-2 text-xs"
                  >
                    <TicketCheck className="h-4 w-4" />
                    <span>Giữ Vé Cọc</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

