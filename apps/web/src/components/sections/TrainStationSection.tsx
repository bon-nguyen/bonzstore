'use client';

import React from 'react';
import { ShoppingBag, Train } from 'lucide-react';
import { formatVnd, StorefrontProduct } from '../../lib/storefront-data';
import { useCart } from '../../providers/cart-provider';
import { ProductImageSwap } from '../commerce/ProductImageSwap';

interface TrainStationSectionProps {
  products: StorefrontProduct[];
  selectedSeries: string | null;
  onClearSeries: () => void;
}

function SpinningTrainWheel() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-[#4A3E3D] bg-[#334155] shadow-kw-hard-sm">
      <svg
        viewBox="0 0 40 40"
        className="kw-train-wheel-svg h-8 w-8 text-[#FFF3B0]"
      >
        <circle
          cx="20"
          cy="20"
          r="15"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
        <line
          x1="20"
          y1="5"
          x2="20"
          y2="35"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <line
          x1="5"
          y1="20"
          x2="35"
          y2="20"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <line
          x1="9.5"
          y1="9.5"
          x2="30.5"
          y2="30.5"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line
          x1="30.5"
          y1="9.5"
          x2="9.5"
          y2="30.5"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle
          cx="20"
          cy="20"
          r="4.5"
          fill="#FF8DA1"
          stroke="#4A3E3D"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

export function TrainStationSection({
  products,
  selectedSeries,
  onClearSeries,
}: TrainStationSectionProps) {
  const { addItem, setQuickViewProduct } = useCart();

  const filtered = selectedSeries
    ? products.filter((p) =>
        p.series.toLowerCase().includes(selectedSeries.toLowerCase()),
      )
    : products;

  const displayProducts = (filtered.length > 0 ? filtered : products).slice(0, 4);

  return (
    <section
      id="section-train-station"
      data-testid="train-station-section"
      className="relative z-10 mx-auto max-w-7xl px-4 py-12 md:px-6"
    >
      {/* Electronic Departure Station Board */}
      <div className="mb-8 flex flex-col justify-between gap-4 rounded-[28px] border-[3px] border-[#4A3E3D] bg-[#1E293B] p-5 text-white shadow-[6px_6px_0px_#4A3E3D] md:flex-row md:items-center">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-[#4A3E3D] bg-[#FFF3B0] text-[#4A3E3D] shadow-[3px_3px_0px_#0F172A]">
            <Train className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-[#10B981] px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-slate-950">
                CHƯƠNG 3 · PLATFORM 9¾
              </span>
              <span className="font-mono text-xs text-[#FDE047]">
                ● TÀU ĐANG ĐỖ TẠI GA · GIAO NHANH 2H
              </span>
            </div>
            <h2 className="mt-1 font-display text-2xl font-bold text-white md:text-3xl">
              Ga Tàu Tốc Hành Bonz Express — Hàng Sẵn Lên Toa
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {selectedSeries && (
            <button
              type="button"
              onClick={onClearSeries}
              className="rounded-full border-2 border-white bg-[#FFB5C2] px-3.5 py-1.5 font-display text-xs font-bold text-[#4A3E3D]"
            >
              Đang lọc: {selectedSeries} (Xem tất cả)
            </button>
          )}
          <div className="rounded-2xl border-2 border-[#475569] bg-[#0F172A] px-4 py-2 font-mono text-xs text-[#38BDF8]">
            NEXT DEPARTURE: <strong className="text-[#FDE047]">NOW BOARDING</strong>
          </div>
        </div>
      </div>

      {/* Train Cars Grid */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {displayProducts.map((product, index) => (
          <article
            key={product.id}
            data-testid={`train-car-card-${product.code}`}
            className="kw-train-car-card flex flex-col justify-between p-4 pb-6"
          >
            <div>
              <div className="mb-3 flex items-center justify-between border-b-2 border-dashed border-kw-border/25 pb-2">
                <span className="status-badge bg-[#A2D2FF] font-mono text-[11px]">
                  <span className="h-2 w-2 rounded-full bg-[#FF5E7E]" />
                  {product.trainCarNo || `CAR-0${index + 1}`}
                </span>
                <span className="font-mono text-[11px] font-bold text-kw-secondary">
                  Còn {product.stock} suất
                </span>
              </div>

              <ProductImageSwap
                product={product}
                badgeText={product.badge}
                badgeColor="#FFF3B0"
              />

              <div className="mt-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="rounded-md bg-[#FFE5EC] px-2 py-0.5 font-display font-bold text-[#4A3E3D]">
                    {product.series}
                  </span>
                  <span className="font-mono text-[11px] font-bold text-[#F59E0B]">
                    ★ {product.rating.toFixed(1)} ({product.soldCount})
                  </span>
                </div>

                <h3
                  onClick={() => setQuickViewProduct(product)}
                  className="mt-2 line-clamp-2 cursor-pointer font-display text-sm font-bold leading-snug text-kw-primary hover:text-[#E11D48]"
                >
                  {product.name}
                </h3>
              </div>
            </div>

            <div className="mt-4 border-t-2 border-kw-border/15 pt-3">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="priority-high text-base">
                    {formatVnd(product.price)}
                  </span>
                  {product.originalPrice &&
                    product.originalPrice > product.price && (
                      <span className="ml-1.5 font-mono text-xs text-kw-secondary line-through">
                        {formatVnd(product.originalPrice)}
                      </span>
                    )}
                </div>
                {product.discountPercent && (
                  <span className="rounded-md border border-[#4A3E3D] bg-[#FFB5C2] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#4A3E3D]">
                    -{product.discountPercent}%
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => addItem(product)}
                className="action-btn-secondary mt-3 w-full py-2.5 text-xs"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Đưa Lên Toa Giỏ Hàng</span>
              </button>
            </div>

            <div
              className="pointer-events-none absolute -bottom-5 left-6 right-6 flex items-center justify-between"
              aria-hidden="true"
            >
              <SpinningTrainWheel />
              <SpinningTrainWheel />
            </div>
          </article>
        ))}
      </div>

      <div
        aria-hidden="true"
        className="mt-7 h-4 w-full rounded-full border-2 border-[#4A3E3D] bg-[repeating-linear-gradient(90deg,#78350F_0px,#78350F_18px,#D97706_18px,#D97706_36px)] shadow-[0_3px_0_#4A3E3D]"
      />
    </section>
  );
}

