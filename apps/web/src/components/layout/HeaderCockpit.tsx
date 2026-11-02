'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  CalendarClock,
  ChevronDown,
  Compass,
  Flame,
  Heart,
  LayoutGrid,
  Menu,
  Search,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
  Train,
  Trophy,
  X,
} from 'lucide-react';
import { StorefrontCategory } from '../../lib/storefront-data';
import { useCart } from '../../providers/cart-provider';
import { useTimeMode } from '../../providers/time-mode-provider';
import { useWishlist } from '../../providers/wishlist-provider';
import { TimeModeSwitcher } from '../ui';

interface HeaderCockpitProps {
  categories: StorefrontCategory[];
  activeCategory: string;
  onSelectCategory: (slug: string) => void;
  onOpenSearch: () => void;
  onOpenMap: () => void;
  onOpenCart: () => void;
  onOpenPreOrder: () => void;
}

interface QuickTaskItem {
  id: string;
  label: string;
  href?: string;
  badge?: string;
  badgeColor?: string;
  icon: React.ReactNode;
  action?: 'map' | 'preorder';
}

const FEATURED_QUICK_TASKS: QuickTaskItem[] = [
  {
    id: 'flash-sale',
    label: 'Flash Sale Lễ Hội',
    href: '#flash-sale-stall',
    badge: '-45%',
    badgeColor: 'bg-rose-500 text-white',
    icon: <Flame className="h-3.5 w-3.5 text-rose-500" />,
  },
  {
    id: 'preorder',
    label: 'Đặt Trước Pre-Order',
    href: '#preorder-diary',
    badge: 'Cọc 30%',
    badgeColor: 'bg-violet-500 text-white',
    icon: <CalendarClock className="h-3.5 w-3.5 text-violet-500" />,
    action: 'preorder',
  },
  {
    id: 'instock-express',
    label: 'Hàng Sẵn Giao 2H',
    href: '#train-station',
    badge: '2H',
    badgeColor: 'bg-emerald-500 text-white',
    icon: <Train className="h-3.5 w-3.5 text-emerald-500" />,
  },
  {
    id: 'detective-case',
    label: 'Hồ Sơ Bí Ẩn #4869',
    href: '#detective-spotlight',
    icon: <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />,
  },
  {
    id: 'best-sellers',
    label: 'Tủ Kính Best-Seller',
    href: '#glass-showcase',
    icon: <Trophy className="h-3.5 w-3.5 text-sky-500" />,
  },
];

export function HeaderCockpit({
  categories,
  activeCategory,
  onSelectCategory,
  onOpenSearch,
  onOpenMap,
  onOpenCart,
  onOpenPreOrder,
}: HeaderCockpitProps) {
  const { period, meta } = useTimeMode();
  const { totalItems } = useCart();
  const { count: wishlistCount } = useWishlist();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const selectedCategoryObj = categories.find((c) => c.slug === activeCategory);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setCategoryMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      data-testid="header-cockpit"
      className="sticky top-0 z-40 transition-colors duration-500"
    >
      {/* Top Sky Status Bar */}
      <div
        className={`border-b-2 border-[#1E1E2E] px-3 py-1.5 text-xs font-bold transition-colors duration-500 ${
          period === 'morning'
            ? 'bg-gradient-to-r from-[#0284C7] via-[#38BDF8] to-[#EC4899] text-white'
            : period === 'afternoon'
              ? 'bg-gradient-to-r from-[#D97706] via-[#F97316] to-[#E11D48] text-white'
              : 'bg-gradient-to-r from-[#1E1B4B] via-[#4C1D95] to-[#9D174D] text-amber-100'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-2 truncate">
            <span className="inline-flex items-center gap-1 rounded-full bg-black/25 px-2.5 py-0.5 text-[11px] font-black tracking-wide">
              {meta.badgeText}
            </span>
            <span className="hidden sm:inline truncate">{meta.greeting}</span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <span className="hidden lg:inline-flex items-center gap-1 text-[11px] font-semibold opacity-90">
              🎁 Freeship toàn quốc đơn từ 500.000₫
            </span>
            <button
              type="button"
              onClick={onOpenMap}
              data-testid="header-treasure-map-trigger"
              className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-extrabold hover:bg-white/30 transition"
            >
              <Compass className="h-3 w-3" />
              <span>Bản đồ 5 Đảo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main BonzStore Cockpit Bar */}
      <div className="border-b-2 border-[#1E1E2E] bg-[var(--surface-glass)] backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          {/* Official BONZSTORE Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#1E1E2E] bg-[var(--surface-card)] text-[var(--text-primary)] shadow-kawaii-sm lg:hidden"
              aria-label="Mở menu danh mục"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            <a
              href="#top"
              data-testid="bonzstore-logo"
              className="group flex items-center gap-3 focus:outline-none"
            >
              {/* Custom BonzStore SVG Emblem */}
              <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-[#1E1E2E] bg-gradient-to-br from-[#FF6B9D] via-[#8B5CF6] to-[#38BDF8] shadow-kawaii-sm transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
                <svg
                  viewBox="0 0 40 40"
                  className="h-7 w-7 drop-shadow"
                  aria-hidden="true"
                >
                  {/* Shield / Hexagon Core */}
                  <polygon
                    points="20,3 35,11 35,29 20,37 5,29 5,11"
                    fill="#1E1E2E"
                    stroke="#FEF08A"
                    strokeWidth="2"
                  />
                  {/* Stylized 'B' + Lightning Bolt */}
                  <path
                    d="M14 11H22.5C25.5 11 27.5 12.8 27.5 15.2C27.5 17.1 26.2 18.6 24.3 19.2C26.7 19.8 28.2 21.5 28.2 23.8C28.2 26.8 25.8 29 22.2 29H14V11ZM18 14.5V18H21.5C22.8 18 23.7 17.2 23.7 16.2C23.7 15.2 22.8 14.5 21.5 14.5H18ZM18 21.5V25.5H22C23.4 25.5 24.4 24.7 24.4 23.5C24.4 22.3 23.4 21.5 22 21.5H18Z"
                    fill="#FFFFFF"
                  />
                  {/* Sparkle Star */}
                  <path
                    d="M31 6L32.2 9.2L35.5 10.5L32.2 11.8L31 15L29.8 11.8L26.5 10.5L29.8 9.2Z"
                    fill="#FDE047"
                  />
                </svg>
                <span className="absolute -bottom-1 -right-1 flex h-4 items-center justify-center rounded-full border border-[#1E1E2E] bg-amber-300 px-1 text-[8px] font-black text-[#1E1E2E]">
                  JP
                </span>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-display text-xl font-black tracking-tight text-[var(--text-primary)]">
                    BONZ<span className="text-[#FF6B9D]">STORE</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center rounded-md border border-[#1E1E2E] bg-amber-300 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#1E1E2E]">
                    OFFICIAL
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-[var(--text-secondary)]">
                  Figure • Nendoroid • Blindbox Chính Hãng
                </p>
              </div>
            </a>
          </div>

          {/* Search Pill Trigger (Ctrl+K) */}
          <button
            type="button"
            onClick={onOpenSearch}
            data-testid="header-search-trigger"
            className="hidden md:flex flex-1 max-w-md items-center justify-between gap-3 rounded-full border-2 border-[#1E1E2E] bg-[var(--surface-card)] px-4 py-2 text-left text-xs font-semibold text-[var(--text-secondary)] shadow-kawaii-sm transition hover:-translate-y-0.5 hover:border-[#FF6B9D]"
          >
            <span className="flex items-center gap-2 truncate">
              <Search className="h-4 w-4 text-[#FF6B9D] shrink-0" />
              <span className="truncate">
                Tìm tại BonzStore: Nendoroid, Scale Figure, Blindbox...
              </span>
            </span>
            <kbd className="rounded-md border border-[#1E1E2E]/30 bg-[var(--surface-elevated)] px-2 py-0.5 text-[10px] font-black text-[var(--text-primary)]">
              Ctrl K
            </kbd>
          </button>

          {/* Right Controls: 24H Mode Switcher (Sáng / Trưa / Tối / Tự động) + Cart */}
          <div className="flex items-center gap-2">
            <div className="hidden xl:block">
              <TimeModeSwitcher variant="full" />
            </div>
            <div className="xl:hidden">
              <TimeModeSwitcher variant="compact" />
            </div>

            <button
              type="button"
              onClick={onOpenSearch}
              aria-label="Tìm kiếm"
              className="inline-flex md:hidden h-10 w-10 items-center justify-center rounded-full border-2 border-[#1E1E2E] bg-[var(--surface-card)] text-[var(--text-primary)] shadow-kawaii-sm"
            >
              <Search className="h-4 w-4" />
            </button>

            <a
              href="#glass-showcase"
              aria-label="Danh sách yêu thích"
              className="relative hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#1E1E2E] bg-[var(--surface-card)] text-[var(--text-primary)] shadow-kawaii-sm transition hover:-translate-y-0.5"
            >
              <Heart className="h-4 w-4 text-[#FF6B9D]" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-[#1E1E2E] bg-[#FF6B9D] px-1 text-[10px] font-black text-white">
                  {wishlistCount}
                </span>
              )}
            </a>

            <button
              type="button"
              onClick={onOpenCart}
              data-testid="header-cart-trigger"
              className="relative inline-flex items-center gap-2 rounded-full border-2 border-[#1E1E2E] bg-[#FF6B9D] px-3.5 py-2 text-xs font-black text-white shadow-kawaii-sm transition hover:-translate-y-0.5"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Giỏ Hàng</span>
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full border border-[#1E1E2E] bg-amber-300 px-1 text-[11px] font-black text-[#1E1E2E]">
                {totalItems}
              </span>
            </button>
          </div>
        </div>

        {/* Upgraded Secondary Bar: Danh Mục Dropdown + Featured Quick Tasks */}
        <div className="border-t border-[#1E1E2E]/15 bg-[var(--surface-elevated)]/80">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2">
            {/* Left: Danh Mục Sản Phẩm Mega Dropdown + Active Filter Chip */}
            <div ref={dropdownRef} className="relative flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCategoryMenuOpen((prev) => !prev)}
                data-testid="header-category-dropdown-trigger"
                aria-expanded={categoryMenuOpen}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-[#1E1E2E] bg-[#1E1E2E] px-3.5 py-1.5 text-xs font-black text-white shadow-kawaii-sm transition hover:bg-[#FF6B9D]"
              >
                <LayoutGrid className="h-3.5 w-3.5 text-amber-300" />
                <span>Danh Mục</span>
                <span className="rounded-md bg-white/15 px-1.5 py-0.2 text-[10px] text-amber-200">
                  {categories.length}
                </span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${
                    categoryMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Show currently active category filter chip if filtered */}
              {selectedCategoryObj && (
                <div className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#1E1E2E] bg-amber-300 px-2.5 py-1 text-xs font-black text-[#1E1E2E] shadow-kawaii-sm">
                  <span>{selectedCategoryObj.name}</span>
                  <button
                    type="button"
                    onClick={() => onSelectCategory('all')}
                    aria-label="Xóa lọc danh mục"
                    className="rounded-full bg-black/15 p-0.5 hover:bg-black/25"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {/* Mega Dropdown Popover for Danh Mục */}
              {categoryMenuOpen && (
                <div
                  data-testid="header-category-dropdown-panel"
                  className="absolute left-0 top-full mt-2 w-[22rem] sm:w-[32rem] rounded-2xl border-3 border-[#1E1E2E] bg-[var(--surface-card)] p-4 shadow-kawaii-lg z-50"
                >
                  <div className="mb-3 flex items-center justify-between border-b border-[#1E1E2E]/15 pb-2.5">
                    <div>
                      <h3 className="font-display text-sm font-black text-[var(--text-primary)]">
                        Danh Mục Sản Phẩm BonzStore
                      </h3>
                      <p className="text-[11px] font-semibold text-[var(--text-secondary)]">
                        Chọn dòng sản phẩm hoặc Series Anime để lọc nhanh
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectCategory('all');
                        setCategoryMenuOpen(false);
                      }}
                      className={`rounded-lg border-2 px-2.5 py-1 text-[11px] font-black transition ${
                        activeCategory === 'all'
                          ? 'border-[#1E1E2E] bg-[#FF6B9D] text-white'
                          : 'border-[#1E1E2E]/30 bg-[var(--surface-elevated)] text-[var(--text-primary)] hover:border-[#1E1E2E]'
                      }`}
                    >
                      Xem tất cả
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {categories.map((cat) => {
                      const isSelected = activeCategory === cat.slug;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            onSelectCategory(cat.slug);
                            setCategoryMenuOpen(false);
                          }}
                          className={`group flex items-center justify-between gap-2 rounded-xl border-2 p-2.5 text-left transition ${
                            isSelected
                              ? 'border-[#1E1E2E] bg-[#FF6B9D]/15 shadow-kawaii-sm'
                              : 'border-[#1E1E2E]/20 bg-[var(--surface-elevated)] hover:border-[#1E1E2E] hover:-translate-y-0.5'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="rounded bg-[#1E1E2E] px-1.5 py-0.2 text-[9px] font-black text-amber-300">
                                {cat.badge}
                              </span>
                              <span className="truncate text-xs font-extrabold text-[var(--text-primary)]">
                                {cat.name}
                              </span>
                            </div>
                            <p className="mt-0.5 truncate text-[10px] font-semibold text-[var(--text-secondary)]">
                              {cat.jpTitle}
                            </p>
                          </div>
                          <span className="shrink-0 rounded-full border border-[#1E1E2E]/25 bg-[var(--surface-card)] px-2 py-0.5 text-[10px] font-black text-[var(--text-primary)]">
                            {cat.productCount} SP
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-3 flex items-center justify-between rounded-xl bg-[var(--surface-elevated)] px-3 py-2 text-[11px] font-bold text-[var(--text-secondary)]">
                    <a
                      href="#magic-chalkboard"
                      onClick={() => setCategoryMenuOpen(false)}
                      className="text-[#FF6B9D] hover:underline"
                    >
                      🎨 Mở Bảng Phấn Lớp Học Series →
                    </a>
                    <a
                      href="#train-station"
                      onClick={() => setCategoryMenuOpen(false)}
                      className="hover:text-[var(--text-primary)]"
                    >
                      🚄 Tới Ga Tàu Express
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Center & Right: Featured Quick Tasks (Các Task Nổi Trội Liên Quan) */}
            <nav
              aria-label="Các tác vụ nổi bật"
              className="flex items-center gap-1.5 overflow-x-auto no-scrollbar"
            >
              {FEATURED_QUICK_TASKS.map((task) => {
                if (task.action === 'preorder') {
                  return (
                    <button
                      key={task.id}
                      type="button"
                      onClick={onOpenPreOrder}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border-2 border-[#1E1E2E]/25 bg-[var(--surface-card)] px-3 py-1 text-xs font-extrabold text-[var(--text-primary)] transition hover:-translate-y-0.5 hover:border-[#1E1E2E] hover:shadow-kawaii-sm"
                    >
                      {task.icon}
                      <span>{task.label}</span>
                      {task.badge && (
                        <span
                          className={`rounded-full px-1.5 py-0.2 text-[9px] font-black ${task.badgeColor}`}
                        >
                          {task.badge}
                        </span>
                      )}
                    </button>
                  );
                }

                return (
                  <a
                    key={task.id}
                    href={task.href}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border-2 border-[#1E1E2E]/25 bg-[var(--surface-card)] px-3 py-1 text-xs font-extrabold text-[var(--text-primary)] transition hover:-translate-y-0.5 hover:border-[#1E1E2E] hover:shadow-kawaii-sm"
                  >
                    {task.icon}
                    <span>{task.label}</span>
                    {task.badge && (
                      <span
                        className={`rounded-full px-1.5 py-0.2 text-[9px] font-black ${task.badgeColor}`}
                      >
                        {task.badge}
                      </span>
                    )}
                  </a>
                );
              })}

              <button
                type="button"
                onClick={onOpenMap}
                className="hidden lg:inline-flex shrink-0 items-center gap-1.5 rounded-xl border-2 border-[#1E1E2E] bg-amber-300 px-3 py-1 text-xs font-black text-[#1E1E2E] shadow-kawaii-sm transition hover:-translate-y-0.5"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Khám Phá 5 Đảo</span>
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-b-3 border-[#1E1E2E] bg-[var(--surface-card)] p-4 shadow-kawaii-lg lg:hidden">
          <div className="mb-3 flex flex-col gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-[var(--text-secondary)]">
              Chế độ bầu trời 24H BonzStore (Sáng / Trưa / Tối)
            </span>
            <TimeModeSwitcher variant="full" />
          </div>

          <div className="mb-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-[var(--text-secondary)]">
              Tác vụ nhanh nổi bật
            </span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {FEATURED_QUICK_TASKS.map((task) => (
                <a
                  key={task.id}
                  href={task.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#1E1E2E] bg-[var(--surface-elevated)] px-2.5 py-1.5 text-xs font-extrabold text-[var(--text-primary)]"
                >
                  {task.icon}
                  <span>{task.label}</span>
                </a>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-[var(--text-secondary)]">
              Danh mục sản phẩm ({categories.length})
            </span>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    onSelectCategory(cat.slug);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-between gap-2 rounded-xl border-2 border-[#1E1E2E] bg-[var(--surface-elevated)] p-2.5 text-left text-xs font-extrabold text-[var(--text-primary)] shadow-kawaii-sm"
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="rounded bg-[#1E1E2E] px-1.5 py-0.5 text-[9px] font-black text-amber-300">
                    {cat.productCount}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
