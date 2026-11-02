'use client';

import React from 'react';
import { Award, ShoppingBag, Sparkles } from 'lucide-react';
import { formatVnd, StorefrontProduct } from '../../lib/storefront-data';
import { useCart } from '../../providers/cart-provider';
import { ProductImageSwap } from '../commerce/ProductImageSwap';

interface GlassShowcaseSectionProps {
  products: StorefrontProduct[];
}

export function GlassShowcaseSection({ products }: GlassShowcaseSectionProps) {
  const { addItem, setQuickViewProduct } = useCart();
  const topBestSellers = [...products]
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, 4);

  return (
    <section
      id="section-evidence-hot"
      data-testid="glass-showcase-section"
      className="relative z-10 mx-auto max-w-7xl px-4 py-12 md:px-6"
    >
      <div className="relative overflow-hidden rounded-[34px] border-[4px] border-[#78350F] bg-gradient-to-b from-[#292524] via-[#1C1917] to-[#292524] p-6 text-white shadow-[10px_10px_0px_#4A3E3D] sm:p-8">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b-2 border-[#D97706]/40 pb-5 md:flex-row md:items-center">
          <div>
            <span className="page-subtitle bg-[#FDE047]">
              <Award className="h-4 w-4" />
              <span>CHƯƠNG 8 · TỦ KÍNH TRƯNG BÀY BẢO TÀNG</span>
            </span>
            <h2 className="mt-2.5 font-display text-2xl font-bold text-[#FEF3C7] md:text-3xl">
              Top Best-Sellers Đặt Trên Bệ Gỗ Dưới Ánh Đèn Spotlight
            </h2>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-2xl border-2 border-[#F59E0B] bg-[#451A03] px-4 py-2 font-mono text-xs font-bold text-[#FDE68A]">
            <Sparkles className="h-4 w-4 text-[#FBBF24]" />
            <span>MUSEUM GRADE · CHỐNG TIA UV 99%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {topBestSellers.map((item, idx) => (
            <article key={item.id} className="group relative flex flex-col">
              <div
                aria-hidden="true"
                className="pointer-events-none mx-auto h-4 w-24 rounded-t-full bg-gradient-to-b from-[#FDE047]/60 to-transparent blur-[2px]"
              />

              <div className="flex flex-1 flex-col justify-between rounded-t-[26px] border-[2.5px] border-[#FDE68A]/55 bg-white/95 p-4 text-[#4A3E3D] shadow-[inset_0_0_25px_rgba(254,240,138,0.25)]">
                <div>
                  <div className="mb-2.5 flex items-center justify-between">
                    <span className="rounded-full border border-[#4A3E3D] bg-[#FFF3B0] px-2.5 py-0.5 font-mono text-[11px] font-bold">
                      TOP #{idx + 1}
                    </span>
                    <span className="font-mono text-[11px] font-bold text-[#059669]">
                      Đã bán {item.soldCount}
                    </span>
                  </div>

                  <ProductImageSwap
                    product={item}
                    badgeText={item.brand}
                    badgeColor="#B8F2E6"
                  />

                  <h3
                    onClick={() => setQuickViewProduct(item)}
                    className="mt-3 line-clamp-2 cursor-pointer font-display text-sm font-bold text-[#4A3E3D] hover:text-[#E11D48]"
                  >
                    {item.name}
                  </h3>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[#4A3E3D]/15 pt-3">
                  <span className="font-mono text-base font-bold text-[#E11D48]">
                    {formatVnd(item.price)}
                  </span>
                  <button
                    type="button"
                    onClick={() => addItem(item)}
                    className="kw-btn-pop flex items-center gap-1 rounded-xl bg-[#FFB5C2] px-3 py-1.5 text-xs text-[#4A3E3D]"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span>Thỉnh Về</span>
                  </button>
                </div>
              </div>

              <div className="h-5 w-full rounded-b-xl border-[2.5px] border-t-0 border-[#4A3E3D] bg-gradient-to-r from-[#78350F] via-[#B45309] to-[#78350F] shadow-[0_5px_0_#1C1917]" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

