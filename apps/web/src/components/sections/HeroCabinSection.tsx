'use client';

import React from 'react';
import { Compass, ShieldCheck, ShoppingBag, Sparkles, Ticket } from 'lucide-react';
import { formatVnd, StorefrontProduct } from '../../lib/storefront-data';
import { useTimeMode } from '../../providers/time-mode-provider';
import { useCart } from '../../providers/cart-provider';
import { TimeModeSwitcher, WishlistHeartButton } from '../ui';

interface HeroCabinSectionProps {
  featuredProducts: StorefrontProduct[];
  onOpenMap: () => void;
}

export function HeroCabinSection({
  featuredProducts,
  onOpenMap,
}: HeroCabinSectionProps) {
  const { period, meta, greeting, subGreeting } = useTimeMode();
  const { addItem, setQuickViewProduct } = useCart();

  const polaroidOne = featuredProducts[0];
  const polaroidTwo = featuredProducts[1] || featuredProducts[0];

  return (
    <section
      id="nk-hero-24h"
      data-testid="hero-section"
      data-time-mode={`is-${period}`}
      className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-6 md:px-6 md:pb-16 md:pt-10"
    >
      <div className="filter-panel p-6 sm:p-8 lg:p-10">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
          {/* Left Column: 24H Greeting + Quick Time Switcher + Boarding Ticket CTA */}
          <div className="lg:col-span-7">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="status-badge status-maintenance">
                <span>✈️ CHUYẾN BAY NEKO-24H</span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#4A3E3D]" />
                <span className="font-mono">{meta.badgeText}</span>
              </span>
            </div>

            <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-kw-primary sm:text-4xl md:text-5xl">
              {greeting}
            </h1>

            <p className="mt-3 max-w-2xl text-base font-semibold leading-relaxed text-kw-secondary md:text-lg">
              {subGreeting}
            </p>

            {/* Interactive 24H Mode Preview Strip (Sáng / Trưa / Tối / Tự động) */}
            <div className="mt-5 flex flex-wrap items-center gap-3 rounded-2xl border-2 border-dashed border-kw-border/40 bg-kw-surface/70 p-3">
              <span className="font-display text-xs font-bold uppercase tracking-wide text-kw-primary">
                🎨 Trải nghiệm bầu trời 24H:
              </span>
              <TimeModeSwitcher variant="floating" />
            </div>

            {/* Boarding Ticket CTAs */}
            <div className="mt-6 flex flex-wrap items-center gap-3.5">
              <a
                href="#section-train-station"
                className="action-btn-primary px-6 py-3.5 text-sm md:text-base"
              >
                <Ticket className="h-5 w-5" />
                <span>Lên Ga Tàu Săn Figure Ngay</span>
              </a>

              <button
                type="button"
                onClick={onOpenMap}
                className="action-btn-secondary px-5 py-3.5 text-sm md:text-base"
              >
                <Compass className="h-5 w-5" />
                <span>Mở Bản Đồ 11 Phân Cảnh</span>
              </button>
            </div>

            {/* Social Proof Stats Bar using .stat-card */}
            <div className="mt-8 grid grid-cols-3 gap-3 sm:max-w-xl">
              <div className="stat-card">
                <div className="priority-high text-xl md:text-2xl">15.000+</div>
                <div className="mt-0.5 text-xs font-bold text-kw-secondary">
                  Đơn hàng hạ cánh
                </div>
              </div>

              <div className="stat-card">
                <div className="priority-medium text-xl md:text-2xl">
                  100% JP
                </div>
                <div className="mt-0.5 text-xs font-bold text-kw-secondary">
                  Tem Vàng Nhật Bản
                </div>
              </div>

              <div className="stat-card">
                <div className="priority-low text-xl md:text-2xl">4.98 ★</div>
                <div className="mt-0.5 text-xs font-bold text-kw-secondary">
                  Bảo hiểm hộp 8 cạnh
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-bold text-kw-secondary">
              <span className="inline-flex items-center gap-1">
                <ShieldCheck className="h-4 w-4 text-[#10B981]" />
                Bảo hiểm hộp (Box-Care) miễn phí
              </span>
              <span className="inline-flex items-center gap-1">
                <Sparkles className="h-4 w-4 text-[#FF8DA1]" />
                Tự động đổi màu Sáng (06-11h) · Trưa (11-18h) · Tối (18-06h)
              </span>
            </div>
          </div>

          {/* Right Column: Original BonzStore Airplane Cabin Window + 2 Taped Polaroid Cards */}
          <div className="relative lg:col-span-5">
            <div
              style={{
                borderColor: 'var(--cabin-rim)',
                background:
                  'linear-gradient(180deg, var(--cabin-sky-top) 0%, var(--cabin-sky-bottom) 100%)',
                boxShadow:
                  '0 0 0 3px #4A3E3D, inset 0 8px 16px rgba(0,0,0,0.16), 8px 10px 0px #4A3E3D',
              }}
              className="relative mx-auto max-w-md overflow-hidden rounded-b-[24px] rounded-t-[42px] border-[10px] p-5 transition-all duration-500"
            >
              {/* Inner Cabin Rim Border */}
              <div className="pointer-events-none absolute inset-2 rounded-b-[14px] rounded-t-[30px] border border-white/50" />

              {/* Cabin Top Window Label */}
              <div className="relative z-10 mb-3 flex items-center justify-between border-b border-dashed border-[#4A3E3D]/30 pb-2">
                <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-[#4A3E3D] dark:text-[#F7DEB1]">
                  BONZSTORE · KHOANG TÀU BÁU VẬT
                </span>
                <span className="status-badge bg-white/90 text-[10px]">
                  {period === 'morning'
                    ? '☀️ BÌNH MINH'
                    : period === 'afternoon'
                      ? '🌅 NẮNG TRƯA'
                      : '🌙 ĐÊM SAO'}
                </span>
              </div>

              {/* Cabin Sky Window Viewport with Custom BonzStore 24H Vector Scene */}
              <div className="relative mx-auto flex h-44 w-full flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-white/60 bg-white/15 backdrop-blur-[1px]">
                <svg
                  viewBox="0 0 120 120"
                  className="h-20 w-20 drop-shadow-md transition-transform duration-500 hover:scale-110"
                  aria-hidden="true"
                >
                  {period === 'morning' && (
                    <>
                      <circle
                        cx="60"
                        cy="60"
                        r="42"
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                      />
                      <circle cx="60" cy="60" r="28" fill="#FDE047" />
                      <path
                        d="M20 82 Q 42 70, 64 80 T 104 78"
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="6"
                        strokeLinecap="round"
                      />
                    </>
                  )}
                  {period === 'afternoon' && (
                    <>
                      <circle
                        cx="60"
                        cy="60"
                        r="44"
                        fill="none"
                        stroke="#FEF08A"
                        strokeWidth="2"
                        strokeDasharray="6 4"
                      />
                      <circle cx="60" cy="60" r="32" fill="#F97316" />
                      <line x1="24" y1="68" x2="96" y2="68" stroke="#FFF7ED" strokeWidth="3" />
                      <line x1="28" y1="78" x2="92" y2="78" stroke="#FFF7ED" strokeWidth="4" />
                    </>
                  )}
                  {period === 'night' && (
                    <>
                      <circle
                        cx="60"
                        cy="60"
                        r="44"
                        fill="none"
                        stroke="#A78BFA"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                      />
                      <path
                        d="M72 28C54 31 41 47 41 66C41 86 57 102 77 102C83 102 89 100 94 97C83 105 69 108 56 104C35 98 23 76 29 55C34 38 50 26 67 26C69 26 71 27 72 28Z"
                        fill="#FEF08A"
                      />
                      <circle cx="84" cy="44" r="3" fill="#38BDF8" />
                      <circle cx="38" cy="40" r="2" fill="#F472B6" />
                    </>
                  )}
                </svg>
                <span className="mt-2 rounded-full border border-[#4A3E3D] bg-white/90 px-3 py-0.5 font-display text-xs font-bold text-[#4A3E3D] shadow-sm">
                  {meta.sceneTitle} ({meta.timeRange})
                </span>
              </div>

              {/* 2 Polaroid Treasure Cards Taped Inside Cabin Window */}
              <div className="relative z-10 mt-5 grid grid-cols-2 gap-3.5">
                {[polaroidOne, polaroidTwo].map((prod, idx) =>
                  prod ? (
                    <div
                      key={`${prod.id}-${idx}`}
                      className={`group relative rounded-xl border-2 border-[#D6B67D] bg-[#FFF4DB] p-2.5 text-[#4A3E3D] shadow-[0_5px_0_rgba(133,99,48,0.25)] transition-transform hover:z-20 hover:scale-105 ${
                        idx === 0 ? '-rotate-2' : 'rotate-2'
                      }`}
                    >
                      {/* Masking Tape Strip */}
                      <div
                        className="pointer-events-none absolute -top-2.5 left-1/2 h-3.5 w-12 -translate-x-1/2 -rotate-3 border border-dashed border-[#B59057] bg-[#E9CC92]"
                        aria-hidden="true"
                      />

                      <div className="relative aspect-square overflow-hidden rounded-lg border border-[#4A3E3D]/30 bg-white">
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute right-1.5 top-1.5 scale-90">
                          <WishlistHeartButton productId={prod.id} />
                        </div>
                      </div>

                      <div className="mt-2">
                        <span className="font-mono text-[10px] font-bold uppercase text-[#7A6A68]">
                          {prod.series}
                        </span>
                        <h3
                          onClick={() => setQuickViewProduct(prod)}
                          className="line-clamp-1 cursor-pointer font-display text-xs font-bold text-[#4A3E3D] hover:text-[#E11D48]"
                        >
                          {prod.name}
                        </h3>
                        <div className="mt-1.5 flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-[#E11D48]">
                            {formatVnd(prod.price)}
                          </span>
                          <button
                            type="button"
                            onClick={() => addItem(prod)}
                            className="table-action-btn h-7 w-7 bg-[#FFB5C2]"
                            title="Thêm vào giỏ"
                          >
                            <ShoppingBag className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : null,
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

