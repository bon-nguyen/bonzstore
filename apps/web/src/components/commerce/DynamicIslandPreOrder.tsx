'use client';

import React, { useEffect, useState } from 'react';
import { ChevronUp, Clock, Sparkles, Ticket } from 'lucide-react';
import { formatVnd, StorefrontProduct } from '../../lib/storefront-data';
import { useCart } from '../../providers/cart-provider';

interface DynamicIslandPreOrderProps {
  preOrderProduct?: StorefrontProduct;
}

export function DynamicIslandPreOrder({
  preOrderProduct,
}: DynamicIslandPreOrderProps) {
  const { addItem } = useCart();
  const [expanded, setExpanded] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(2 * 3600 + 14 * 60 + 45);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 3600));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!preOrderProduct) return null;

  const hh = String(Math.floor(secondsLeft / 3600)).padStart(2, '0');
  const mm = String(Math.floor((secondsLeft % 3600) / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div
      id="nkc-di"
      data-testid="dynamic-island-preorder"
      className="fixed bottom-16 left-4 z-40 md:bottom-5 md:left-6"
    >
      {!expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex items-center gap-2.5 rounded-full border-[2.5px] border-[#4A3E3D] bg-[#1E293B] px-4 py-2 text-xs font-bold text-white shadow-[4px_4px_0px_#4A3E3D] transition-transform hover:scale-105"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF8DA1] opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#FF5E7E]" />
          </span>
          <span className="font-display text-[#FFF3B0]">Pre-Order sắp đóng:</span>
          <span className="font-mono text-[#B8F2E6]">
            {hh}:{mm}:{ss}
          </span>
          <ChevronUp className="h-3.5 w-3.5 text-[#FFB5C2]" />
        </button>
      ) : (
        <div className="w-80 rounded-[24px] border-[3px] border-[#4A3E3D] bg-[#1E293B] p-4 text-white shadow-[6px_6px_0px_#4A3E3D]">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-[#FDE047]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>DYNAMIC ISLAND · PRE-ORDER</span>
            </span>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300 hover:bg-slate-700"
            >
              Thu gọn
            </button>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <img
              src={preOrderProduct.images[0]}
              alt={preOrderProduct.name}
              className="h-14 w-14 shrink-0 rounded-xl border-2 border-[#FFF3B0] object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 font-display text-xs font-bold text-white">
                {preOrderProduct.name}
              </p>
              <p className="mt-0.5 font-mono text-xs font-bold text-[#FFB5C2]">
                Cọc giữ suất: {formatVnd(preOrderProduct.depositAmount || 500000)}
              </p>
              <div className="mt-1 flex items-center gap-1 font-mono text-[11px] text-[#B8F2E6]">
                <Clock className="h-3 w-3" />
                <span>
                  Đóng sổ sau: {hh}:{mm}:{ss}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <a
              href="#section-preorder-diary"
              onClick={() => setExpanded(false)}
              className="flex-1 rounded-xl border border-slate-600 bg-slate-800 py-1.5 text-center font-display text-xs font-bold text-slate-200 hover:bg-slate-700"
            >
              Xem sổ tay
            </a>
            <button
              type="button"
              onClick={() => {
                addItem(preOrderProduct, preOrderProduct.skus[0]);
                setExpanded(false);
              }}
              className="flex flex-1 items-center justify-center gap-1 rounded-xl border-2 border-[#4A3E3D] bg-[#FFB5C2] py-1.5 font-display text-xs font-bold text-[#4A3E3D]"
            >
              <Ticket className="h-3.5 w-3.5" />
              <span>Giữ Vé Ngay</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

