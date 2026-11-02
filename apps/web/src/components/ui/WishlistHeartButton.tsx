'use client';

import React from 'react';
import { useWishlist } from '../../providers/wishlist-provider';

interface WishlistHeartButtonProps {
  productId: string;
  className?: string;
}

export function WishlistHeartButton({
  productId,
  className = '',
}: WishlistHeartButtonProps) {
  const { isLiked, toggleWishlist } = useWishlist();
  const liked = isLiked(productId);

  return (
    <button
      type="button"
      data-testid={`wishlist-btn-${productId}`}
      onClick={(e) => {
        e.stopPropagation();
        toggleWishlist(productId);
      }}
      aria-label={liked ? 'Bỏ yêu thích sản phẩm' : 'Thêm vào danh sách yêu thích'}
      aria-pressed={liked}
      className={`like-btn group relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#4A3E3D] bg-white/95 shadow-kw-hard-sm transition-transform hover:scale-110 active:scale-95 ${
        liked ? 'is-active bg-[#FFF0F3]' : ''
      } ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        className={`h-6 w-6 overflow-visible ${liked ? 'animate-heart-burst' : ''}`}
      >
        <g
          className={`transition-all duration-300 ${
            liked ? 'scale-105 opacity-100' : 'scale-50 opacity-0'
          }`}
          stroke="#FF5E7E"
          strokeWidth="4"
          strokeLinecap="round"
        >
          <line x1="50" y1="6" x2="50" y2="16" />
          <line x1="50" y1="84" x2="50" y2="94" />
          <line x1="6" y1="50" x2="16" y2="50" />
          <line x1="84" y1="50" x2="94" y2="50" />
          <line x1="18" y1="18" x2="26" y2="26" />
          <line x1="74" y1="74" x2="82" y2="82" />
          <line x1="82" y1="18" x2="74" y2="26" />
          <line x1="26" y1="74" x2="18" y2="82" />
        </g>
        <path
          fill="#FF5E7E"
          className={`origin-center transition-all duration-200 ${
            liked ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
          }`}
          d="M50 82C50 82 16 60 16 36C16 24 25 16 36 16C43 16 48 20 50 25C52 20 57 16 64 16C75 16 84 24 84 36C84 60 50 82 50 82Z"
        />
        <path
          fill="none"
          stroke="#4A3E3D"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M50 82C50 82 16 60 16 36C16 24 25 16 36 16C43 16 48 20 50 25C52 20 57 16 64 16C75 16 84 24 84 36C84 60 50 82 50 82Z"
        />
      </svg>
    </button>
  );
}

