'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Check, ShoppingBag, Sparkles, X } from 'lucide-react';
import { formatVnd, StorefrontSku } from '../../lib/storefront-data';
import { useCart } from '../../providers/cart-provider';
import { WishlistHeartButton } from '../ui/WishlistHeartButton';

export function QuickViewDialog() {
  const { quickViewProduct, setQuickViewProduct, addItem } = useCart();
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [selectedSku, setSelectedSku] = useState<StorefrontSku | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (quickViewProduct) {
      setSelectedSku(quickViewProduct.skus[0] || null);
      setActiveImageIdx(0);
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [quickViewProduct]);

  if (!quickViewProduct) {
    return <dialog ref={dialogRef} className="hidden" />;
  }

  const currentPrice = selectedSku?.price || quickViewProduct.price;
  const currentOriginal =
    selectedSku?.originalPrice || quickViewProduct.originalPrice;

  return (
    <dialog
      id="nkc-quick-dialog"
      data-testid="quick-view-dialog"
      ref={dialogRef}
      onClose={() => setQuickViewProduct(null)}
      onClick={(e) => {
        if (e.target === dialogRef.current) setQuickViewProduct(null);
      }}
      className="
        m-auto w-[94vw] max-w-3xl rounded-[30px] border-[3.5px] border-[#4A3E3D]
        bg-[#FFFDF9] p-0 text-[#4A3E3D] shadow-[10px_10px_0px_#4A3E3D]
        backdrop:bg-black/60 backdrop:backdrop-blur-sm
      "
    >
      <div className="flex items-center justify-between border-b-[2.5px] border-[#4A3E3D] bg-[#FFF3B0] px-6 py-3.5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#FF8DA1]" />
          <span className="font-mono text-xs font-bold uppercase">
            QUICK VIEW · MÃ SP: {quickViewProduct.code}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setQuickViewProduct(null)}
          className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#4A3E3D] bg-[#FFB5C2] shadow-kw-hard-sm"
          aria-label="Đóng xem nhanh"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-12">
        <div className="md:col-span-6">
          <div className="relative aspect-square overflow-hidden rounded-2xl border-[2.5px] border-[#4A3E3D] bg-white">
            <img
              src={
                quickViewProduct.images[activeImageIdx] ||
                quickViewProduct.images[0]
              }
              alt={quickViewProduct.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute right-3 top-3">
              <WishlistHeartButton productId={quickViewProduct.id} />
            </div>
            <span className="status-badge absolute bottom-3 left-3 bg-white/95 font-mono">
              Góc {activeImageIdx + 1}/{quickViewProduct.images.length}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-2">
            {quickViewProduct.images.map((imgUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImageIdx(idx)}
                className={`aspect-square overflow-hidden rounded-xl border-2 border-[#4A3E3D] ${
                  activeImageIdx === idx
                    ? 'ring-2 ring-[#FF5E7E]'
                    : 'opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={imgUrl}
                  alt={`Góc ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between md:col-span-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="status-badge bg-[#A2D2FF]">
                {quickViewProduct.series}
              </span>
              <span className="font-mono text-xs font-bold text-[#7A6A68]">
                Hãng: {quickViewProduct.brand}
              </span>
            </div>

            <h2 className="mt-2 font-display text-lg font-bold leading-snug text-[#4A3E3D]">
              {quickViewProduct.name}
            </h2>

            <p className="mt-2 text-xs font-semibold leading-relaxed text-[#7A6A68]">
              {quickViewProduct.description}
            </p>

            <div className="mt-4 rounded-2xl border-2 border-[#4A3E3D] bg-[#FFF9F0] p-3.5">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-2xl font-bold text-[#E11D48]">
                  {formatVnd(currentPrice)}
                </span>
                {currentOriginal && currentOriginal > currentPrice && (
                  <span className="font-mono text-sm text-[#7A6A68] line-through">
                    {formatVnd(currentOriginal)}
                  </span>
                )}
              </div>
              <p className="mt-1 font-mono text-[11px] font-bold text-[#059669]">
                ✓ Đủ điều kiện Freeship 500K · Tặng hộp bảo vệ Box-Care
              </p>
            </div>

            <div className="mt-4">
              <span className="block font-display text-xs font-bold uppercase text-[#7A6A68]">
                Chọn phiên bản SKU ({quickViewProduct.skus.length}):
              </span>
              <div className="mt-2 space-y-2">
                {quickViewProduct.skus.map((sku) => {
                  const active = selectedSku?.id === sku.id;
                  return (
                    <button
                      key={sku.id}
                      type="button"
                      onClick={() => setSelectedSku(sku)}
                      className={`flex w-full items-center justify-between rounded-xl border-2 border-[#4A3E3D] px-3.5 py-2 text-left text-xs font-bold transition-all ${
                        active
                          ? 'bg-[#FFB5C2] shadow-kw-hard-sm'
                          : 'bg-white hover:bg-[#FFF3B0]/50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {active && <Check className="h-3.5 w-3.5" />}
                        <span>{sku.label}</span>
                      </span>
                      <span className="font-mono">{formatVnd(sku.price)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              addItem(quickViewProduct, selectedSku || undefined, 1);
              setQuickViewProduct(null);
            }}
            className="action-btn-secondary mt-6 w-full py-3.5"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Thêm Phiên Bản Này Vào Khoang Giỏ</span>
          </button>
        </div>
      </div>
    </dialog>
  );
}

