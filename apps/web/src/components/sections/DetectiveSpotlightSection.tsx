'use client';

import React from 'react';
import { FileSearch, ShieldAlert, ShoppingBag } from 'lucide-react';
import { formatVnd, StorefrontProduct } from '../../lib/storefront-data';
import { useCart } from '../../providers/cart-provider';
import { ProductImageSwap } from '../commerce/ProductImageSwap';

interface DetectiveSpotlightSectionProps {
  products: StorefrontProduct[];
}

export function DetectiveSpotlightSection({
  products,
}: DetectiveSpotlightSectionProps) {
  const { addItem, setQuickViewProduct } = useCart();
  const evidenceItems = products.slice(0, 3);

  return (
    <section
      id="section-conan-spotlight"
      data-testid="detective-spotlight-section"
      className="relative z-10 mx-auto max-w-7xl px-4 py-12 md:px-6"
    >
      <div className="relative overflow-hidden rounded-[32px] border-[3.5px] border-[#4A3E3D] bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E1B4B] p-6 text-white shadow-kw-hard-lg md:p-8">
        <span className="absolute left-4 top-4 h-3.5 w-3.5 rounded-full border-2 border-[#4A3E3D] bg-[#FBBF24]" />
        <span className="absolute right-4 top-4 h-3.5 w-3.5 rounded-full border-2 border-[#4A3E3D] bg-[#FBBF24]" />
        <span className="absolute bottom-4 left-4 h-3.5 w-3.5 rounded-full border-2 border-[#4A3E3D] bg-[#FBBF24]" />
        <span className="absolute bottom-4 right-4 h-3.5 w-3.5 rounded-full border-2 border-[#4A3E3D] bg-[#FBBF24]" />

        <div className="grid grid-cols-1 items-center gap-6 border-b-2 border-dashed border-slate-600 pb-6 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-[#FBBF24] bg-[#78350F]/80 px-3.5 py-1 font-mono text-xs font-bold text-[#FEF08A]">
              <ShieldAlert className="h-4 w-4 text-[#FBBF24]" />
              <span>CHƯƠNG 4 · CASE FILE #NK-4869 · TOP SECRET</span>
            </div>

            <h2 className="mt-3 font-display text-2xl font-bold text-white md:text-4xl">
              Hồ Sơ Thám Tử Tuyệt Mật — Tang Vật Giới Hạn Đã Khóa Mục Tiêu
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-300 md:text-base">
              Radar thám tử vừa phát hiện 3 kiện hàng hiếm có dấu niêm phong đỏ{' '}
              <strong className="font-mono text-[#FDA4AF]">CONFIDENTIAL</strong>.
              Mỗi kiện hàng đều kèm thẻ chứng nhận xuất xứ Nhật Bản.
            </p>
          </div>

          <div className="flex items-center justify-center lg:col-span-4">
            <div className="neko-clue-radar flex h-36 w-36 items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.28)]">
              <div
                aria-hidden="true"
                className="animate-radar-sweep pointer-events-none absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,rgba(52,211,153,0.45)_0deg,transparent_75deg,transparent_360deg)]"
              />
              <span className="absolute left-8 top-9 h-2.5 w-2.5 animate-ping rounded-full bg-emerald-400" />
              <span className="absolute bottom-8 right-10 h-2 w-2 rounded-full bg-rose-400" />
              <div className="relative z-10 rounded-full border border-emerald-400/60 bg-slate-950/90 px-3 py-1 font-mono text-[11px] font-bold text-emerald-300">
                RADAR 4869
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {evidenceItems.map((item, idx) => (
            <article
              key={item.id}
              className="neko-evidence-card flex flex-col justify-between p-4"
            >
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#7A6A68]">
                    EVIDENCE #{idx + 1} · {item.code}
                  </span>
                  <span className="rotate-[-4deg] rounded border-2 border-[#E11D48] bg-[#FFE4E6] px-2 py-0.5 font-mono text-[10px] font-extrabold uppercase tracking-wider text-[#E11D48]">
                    {item.evidenceStamp || 'CONFIDENTIAL'}
                  </span>
                </div>

                <ProductImageSwap
                  product={item}
                  badgeText={item.series}
                  badgeColor="#FFF3B0"
                />

                <h3
                  onClick={() => setQuickViewProduct(item)}
                  className="mt-3 line-clamp-2 cursor-pointer font-display text-sm font-bold text-[#3B302E] hover:text-[#E11D48]"
                >
                  {item.name}
                </h3>

                <p className="mt-1 line-clamp-2 text-xs text-[#7A6A68]">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t-2 border-dashed border-[#4A3E3D]/25 pt-3">
                <div>
                  <span className="block font-mono text-[10px] uppercase text-[#7A6A68]">
                    Giá niêm phong
                  </span>
                  <span className="font-mono text-lg font-bold text-[#E11D48]">
                    {formatVnd(item.price)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickViewProduct(item)}
                    className="table-action-btn h-9 w-9 bg-[#FFF3B0]"
                    title="Soi hồ sơ tang vật"
                  >
                    <FileSearch className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => addItem(item)}
                    className="action-btn-primary px-3.5 py-2 text-xs"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>Thu Giữ Ngay</span>
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

