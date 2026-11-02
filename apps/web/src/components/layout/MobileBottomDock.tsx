'use client';

import React from 'react';
import { Compass, Home, Search, ShoppingBag, Sparkles } from 'lucide-react';
import { useCart } from '../../providers/cart-provider';
import { useTimeMode } from '../../providers/time-mode-provider';

interface MobileBottomDockProps {
  onOpenSearch: () => void;
  onOpenMap: () => void;
  onOpenCart: () => void;
  onOpenPreOrder: () => void;
}

export function MobileBottomDock({
  onOpenSearch,
  onOpenMap,
  onOpenCart,
  onOpenPreOrder,
}: MobileBottomDockProps) {
  const { totalItems } = useCart();
  const { cycleMode, meta } = useTimeMode();

  return (
    <nav
      data-testid="mobile-bottom-dock"
      aria-label="Thanh điều hướng di động"
      className="fixed bottom-3 left-3 right-3 z-40 flex items-center justify-around rounded-2xl border-3 border-[#1E1E2E] bg-[var(--surface-card)]/95 px-2 py-2 shadow-kawaii-lg backdrop-blur-md lg:hidden"
    >
      <a
        href="#top"
        className="flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-extrabold text-[var(--text-primary)]"
      >
        <Home className="h-4 w-4 text-[#FF6B9D]" />
        <span>Trạm Mây</span>
      </a>

      <button
        type="button"
        onClick={onOpenSearch}
        className="flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-extrabold text-[var(--text-primary)]"
      >
        <Search className="h-4 w-4 text-sky-500" />
        <span>Tìm kiếm</span>
      </button>

      {/* Center Action: Cycle 24H Mode or Open Pre-Order */}
      <button
        type="button"
        onClick={cycleMode}
        className="relative -mt-6 flex h-12 w-12 flex-col items-center justify-center rounded-2xl border-3 border-[#1E1E2E] bg-gradient-to-br from-[#FF6B9D] via-[#A78BFA] to-[#38BDF8] text-white shadow-kawaii"
        title="Đổi chế độ Sáng / Trưa / Tối"
      >
        <Sparkles className="h-5 w-5" />
        <span className="text-[8px] font-black uppercase">{meta.shortName}</span>
      </button>

      <button
        type="button"
        onClick={onOpenMap}
        className="flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-extrabold text-[var(--text-primary)]"
      >
        <Compass className="h-4 w-4 text-amber-500" />
        <span>5 Đảo</span>
      </button>

      <button
        type="button"
        onClick={onOpenCart}
        className="relative flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] font-extrabold text-[var(--text-primary)]"
      >
        <ShoppingBag className="h-4 w-4 text-emerald-500" />
        <span>Giỏ ({totalItems})</span>
      </button>
    </nav>
  );
}

