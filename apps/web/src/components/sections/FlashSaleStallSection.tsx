'use client';

import React, { useEffect, useState } from 'react';
import { Flame, ShoppingBag, Timer } from 'lucide-react';
import { formatVnd, StorefrontProduct } from '../../lib/storefront-data';
import { useCart } from '../../providers/cart-provider';
import { ProductImageSwap } from '../commerce/ProductImageSwap';

interface FlashSaleStallSectionProps {
  products: StorefrontProduct[];
}

export function FlashSaleStallSection({
  products,
}: FlashSaleStallSectionProps) {
  const { addItem, setQuickViewProduct } = useCart();
  const [secondsLeft, setSecondsLeft] = useState(4 * 3600 + 38 * 60 + 19);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 4 * 3600));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const hours = String(Math.floor(secondsLeft / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');

  const saleItems = products.slice(0, 4);

  return (
    <section
      id="section-flash-sale"
      data-testid="flash-sale-section"
      className="relative z-10 mx-auto max-w-7xl px-4 py-12 md:px-6"
    >
      <div className="filter-panel overflow-hidden p-0">
        {/* Red & White Striped Festival Canopy */}
        <div
          aria-hidden="true"
          className="h-10 w-full border-b-[3px] border-[#4A3E3D] bg-[repeating-linear-gradient(90deg,#FF6B8B_0px,#FF6B8B_36px,#FFFDF9_36px,#FFFDF9_72px)]"
        />

        <div className="p-5 sm:p-8">
          <div className="mb-8 flex flex-col justify-between gap-4 border-b-2 border-dashed border-kw-border/25 pb-6 lg:flex-row lg:items-center">
            <div>
              <span className="page-subtitle bg-[#FFB5C2]">
                <Flame className="h-4 w-4 text-[#E11D48]" />
                <span>CHƯƠNG 5 · QUẦY XỔ SỐ LỄ HỘI TRÊN MÂY</span>
              </span>
              <h2 className="page-title">
                Flash Sale Vé Số Khuyết Lỗ — Giảm Tới 35% Hôm Nay
              </h2>
            </div>

            <div className="flex items-center gap-3 self-start rounded-2xl border-[2.5px] border-[#4A3E3D] bg-[#FFF3B0] px-4 py-2.5 text-[#4A3E3D] shadow-kw-hard-sm">
              <Timer className="h-5 w-5 text-[#E11D48]" />
              <span className="font-display text-xs font-bold uppercase">
                Kết thúc sau:
              </span>
              <div className="flex items-center gap-1.5 font-mono text-base font-bold">
                <span className="rounded-lg border-2 border-[#4A3E3D] bg-white px-2 py-1">
                  {hours}
                </span>
                <span>:</span>
                <span className="rounded-lg border-2 border-[#4A3E3D] bg-white px-2 py-1">
                  {minutes}
                </span>
                <span>:</span>
                <span className="rounded-lg border-2 border-[#4A3E3D] bg-[#FFB5C2] px-2 py-1">
                  {seconds}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {saleItems.map((item, idx) => {
              const soldPercent = Math.min(92, 58 + idx * 11);
              return (
                <article
                  key={item.id}
                  className="neko-sale-card flex flex-col justify-between p-4"
                >
                  <div>
                    <div className="mb-2.5 flex items-center justify-between font-mono text-[11px] font-bold text-kw-secondary">
                      <span>TICKET #{8801 + idx}</span>
                      <span className="rounded-full border border-[#4A3E3D] bg-[#FFE4E6] px-2 py-0.5 text-[#E11D48]">
                        -{item.discountPercent || 25}%
                      </span>
                    </div>

                    <ProductImageSwap
                      product={item}
                      badgeText={`GIẢM ${item.discountPercent || 25}%`}
                      badgeColor="#FFB5C2"
                    />

                    <h3
                      onClick={() => setQuickViewProduct(item)}
                      className="mt-3 line-clamp-2 cursor-pointer font-display text-sm font-bold text-kw-primary hover:text-[#E11D48]"
                    >
                      {item.name}
                    </h3>
                  </div>

                  <div className="my-3 border-t-2 border-dashed border-kw-border/35" />

                  <div>
                    <div className="flex items-baseline justify-between">
                      <span className="priority-high text-lg">
                        {formatVnd(item.price)}
                      </span>
                      {item.originalPrice && (
                        <span className="font-mono text-xs text-kw-secondary line-through">
                          {formatVnd(item.originalPrice)}
                        </span>
                      )}
                    </div>

                    <div className="mt-2">
                      <div className="mb-1 flex justify-between font-mono text-[10px] font-bold text-kw-secondary">
                        <span>🔥 Đã rút {soldPercent}% vé</span>
                        <span>Còn {item.stock}</span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full border-[1.5px] border-[#4A3E3D] bg-[#FFF3B0]">
                        <div
                          style={{ width: `${soldPercent}%` }}
                          className="h-full bg-gradient-to-r from-[#FF8DA1] to-[#E11D48]"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => addItem(item)}
                      className="kw-btn-pop mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#FFF3B0] py-2.5 text-xs text-[#4A3E3D] hover:bg-[#FFB5C2]"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      <span>Xé Vé Mua Ngay</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

