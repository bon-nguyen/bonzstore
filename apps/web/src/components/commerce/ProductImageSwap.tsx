'use client';

import React, { useRef, useState } from 'react';
import { Eye } from 'lucide-react';
import { StorefrontProduct } from '../../lib/storefront-data';
import { useCart } from '../../providers/cart-provider';
import { WishlistHeartButton } from '../ui/WishlistHeartButton';

interface ProductImageSwapProps {
  product: StorefrontProduct;
  aspectClassName?: string;
  badgeText?: string;
  badgeColor?: string;
}

export function ProductImageSwap({
  product,
  aspectClassName = 'aspect-square',
  badgeText,
  badgeColor = '#FFB5C2',
}: ProductImageSwapProps) {
  const { setQuickViewProduct } = useCart();
  const images =
    product.images && product.images.length > 0
      ? product.images
      : [
          'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=700&q=80',
        ];
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (images.length <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = Math.max(0, Math.min(0.999, (e.clientX - rect.left) / rect.width));
    const idx = Math.floor(relX * images.length);
    if (idx !== activeIndex) {
      setActiveIndex(idx);
    }
  };

  const handleMouseLeave = () => {
    setActiveIndex(0);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null || images.length <= 1) return;
    const deltaX = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current;
    if (Math.abs(deltaX) > 30) {
      if (deltaX < 0) {
        setActiveIndex((prev) => (prev + 1) % images.length);
      } else {
        setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
      }
    }
    touchStartX.current = null;
  };

  return (
    <div
      data-testid={`product-image-swap-${product.code}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`group/img relative w-full overflow-hidden rounded-2xl border-2 border-[#4A3E3D] bg-white select-none ${aspectClassName}`}
    >
      <img
        src={images[activeIndex]}
        alt={`${product.name} - góc ${activeIndex + 1}`}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-300 group-hover/img:scale-105"
      />

      {(badgeText || product.badge) && (
        <span
          style={{ backgroundColor: badgeColor }}
          className="status-badge absolute left-2.5 top-2.5 z-10 text-[11px] uppercase"
        >
          {badgeText || product.badge}
        </span>
      )}

      <div className="absolute right-2.5 top-2.5 z-10">
        <WishlistHeartButton productId={product.id} />
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1.5 rounded-full border-2 border-[#4A3E3D] bg-white/95 px-2.5 py-0.5 font-mono text-[11px] font-bold text-[#4A3E3D] shadow-kw-hard-sm">
          <span>
            {activeIndex + 1}/{images.length}
          </span>
          <span className="flex gap-1">
            {images.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 w-1.5 rounded-full border border-[#4A3E3D] transition-all ${
                  idx === activeIndex ? 'w-3 bg-[#FF8DA1]' : 'bg-white'
                }`}
              />
            ))}
          </span>
        </div>
      )}

      <button
        type="button"
        data-testid={`quick-view-btn-${product.code}`}
        onClick={(e) => {
          e.stopPropagation();
          setQuickViewProduct(product);
        }}
        className="status-badge status-maintenance absolute bottom-2.5 right-2.5 z-10 py-1 transition-transform hover:scale-105 active:scale-95"
        title="Xem nhanh & Chọn phiên bản SKU"
      >
        <Eye className="h-3.5 w-3.5" />
        <span>Xem nhanh</span>
      </button>
    </div>
  );
}

