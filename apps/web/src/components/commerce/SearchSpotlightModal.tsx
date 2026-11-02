'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Sparkles, ShoppingBag, X, ArrowUpRight } from 'lucide-react';
import {
  formatVnd,
  POPULAR_SEARCH_KEYWORDS,
  StorefrontProduct,
} from '../../lib/storefront-data';
import { useCart } from '../../providers/cart-provider';

interface SearchSpotlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: StorefrontProduct[];
  initialQuery?: string;
}

export function SearchSpotlightModal({
  isOpen,
  onClose,
  products,
  initialQuery = '',
}: SearchSpotlightModalProps) {
  const [rawQuery, setRawQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { addItem, setQuickViewProduct } = useCart();

  useEffect(() => {
    setRawQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(rawQuery.trim());
    }, 220);
    return () => window.clearTimeout(timer);
  }, [rawQuery]);

  useEffect(() => {
    if (isOpen) {
      window.setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const filteredProducts = useMemo(() => {
    if (!debouncedQuery) return products.slice(0, 6);
    const q = debouncedQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.series.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q),
    );
  }, [debouncedQuery, products]);

  if (!isOpen) return null;

  return (
    <div
      data-testid="search-spotlight-modal"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/55 px-4 pt-16 backdrop-blur-sm md:pt-24"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Live Search Spotlight"
    >
      <div
        className="w-full max-w-3xl overflow-hidden rounded-[28px] border-[3px] border-[#4A3E3D] bg-[#FFFDF9] text-[#4A3E3D] shadow-kw-hard-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b-[2.5px] border-[#4A3E3D] bg-[#FFF3B0] px-5 py-4">
          <div className="stat-card-icon h-10 w-10 rounded-full">
            <Search className="h-5 w-5 text-[#4A3E3D]" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={rawQuery}
            onChange={(e) => setRawQuery(e.target.value)}
            placeholder="Tìm Figure, Nendoroid, Series (VD: Blue Lock, Conan #4869, Gojo)..."
            className="w-full bg-transparent font-display text-base font-bold text-[#4A3E3D] placeholder:text-[#7A6A68] focus:outline-none md:text-lg"
          />
          {rawQuery && (
            <button
              type="button"
              onClick={() => setRawQuery('')}
              className="rounded-full border-2 border-[#4A3E3D] bg-white px-2.5 py-1 text-xs font-bold hover:bg-[#FFB5C2]"
            >
              Xóa
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng tìm kiếm"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#4A3E3D] bg-[#FFB5C2] shadow-kw-hard-sm hover:scale-105"
          >
            <X className="h-4 w-4 text-[#4A3E3D]" />
          </button>
        </div>

        <div className="border-b-2 border-dashed border-[#4A3E3D]/25 bg-[#FFF9F0] px-5 py-3">
          <div className="mb-2 flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wider text-[#7A6A68]">
            <Sparkles className="h-3.5 w-3.5 text-[#FF8DA1]" />
            <span>Từ khóa Radar phổ biến (Debounce 220ms):</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {POPULAR_SEARCH_KEYWORDS.map((kw) => (
              <button
                key={kw}
                type="button"
                onClick={() => setRawQuery(kw)}
                className={`rounded-full border-2 border-[#4A3E3D] px-3 py-1 font-display text-xs font-bold transition-transform hover:-translate-y-0.5 ${
                  rawQuery.toLowerCase() === kw.toLowerCase()
                    ? 'bg-[#FFB5C2] shadow-kw-hard-sm'
                    : 'bg-white hover:bg-[#B8F2E6]'
                }`}
              >
                #{kw}
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-display text-xs font-bold uppercase tracking-wider text-[#7A6A68]">
              {debouncedQuery
                ? `Kết quả cho "${debouncedQuery}" (${filteredProducts.length})`
                : 'Đề xuất khoang hạng nhất hôm nay'}
            </span>
            <span className="font-mono text-xs font-bold text-[#4A3E3D]">
              ESC để đóng
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-[#4A3E3D]/40 bg-[#FFF9F0] p-8 text-center">
              <p className="font-display text-base font-bold">
                Không tìm thấy kiện hàng trùng khớp trên radar 🛸
              </p>
              <p className="mt-1 text-sm text-[#7A6A68]">
                Thử chọn một từ khóa gợi ý phía trên như Blue Lock, Gojo hoặc Conan.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 rounded-2xl border-2 border-[#4A3E3D] bg-white p-3 shadow-[3px_3px_0px_#4A3E3D] transition-transform hover:-translate-y-0.5"
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="h-16 w-16 shrink-0 rounded-xl border-2 border-[#4A3E3D] object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-md bg-[#A2D2FF] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#4A3E3D]">
                        {product.series}
                      </span>
                      <span className="font-mono text-[10px] text-[#7A6A68]">
                        {product.code}
                      </span>
                    </div>
                    <h4 className="mt-1 line-clamp-1 font-display text-xs font-bold text-[#4A3E3D]">
                      {product.name}
                    </h4>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-[#E11D48]">
                        {formatVnd(product.price)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setQuickViewProduct(product);
                            onClose();
                          }}
                          className="table-action-btn h-7 w-7 bg-[#FFF3B0]"
                          title="Xem chi tiết"
                        >
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            addItem(product);
                            onClose();
                          }}
                          className="flex items-center gap-1 rounded-lg border-[1.5px] border-[#4A3E3D] bg-[#B8F2E6] px-2 py-1 font-display text-xs font-bold hover:bg-[#FFB5C2]"
                        >
                          <ShoppingBag className="h-3 w-3" />
                          <span>+Giỏ</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

