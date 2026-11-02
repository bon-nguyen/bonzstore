'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';
import { StorefrontCategory } from '../../lib/storefront-data';
import { useTimeMode } from '../../providers/time-mode-provider';
import { SectionHeader } from '../ui';

interface MagicChalkboardSectionProps {
  categories: StorefrontCategory[];
  selectedSeries: string | null;
  onSelectSeries: (seriesName: string | null) => void;
}

const CHALK_DUST = [
  { id: 1, top: '14%', left: '8%', delay: '0s' },
  { id: 2, top: '26%', left: '88%', delay: '0.8s' },
  { id: 3, top: '68%', left: '12%', delay: '1.5s' },
  { id: 4, top: '75%', left: '82%', delay: '0.4s' },
  { id: 5, top: '42%', left: '50%', delay: '1.1s' },
];

export function MagicChalkboardSection({
  categories,
  selectedSeries,
  onSelectSeries,
}: MagicChalkboardSectionProps) {
  const { period, meta } = useTimeMode();

  return (
    <section
      id="section-magic-chalkboard"
      data-testid="chalkboard-section"
      className="relative z-10 mx-auto max-w-7xl px-4 py-12 md:px-6"
    >
      <SectionHeader
        chapterCode="🏫 CHƯƠNG 2 · LỚP HỌC PHÉP THUẬT 24H"
        title="Bảng Phấn Danh Mục Nhân Vật & Series Yêu Thích"
        subtitle="Bảng phấn tự động đổi sắc độ xanh lá sáng, xanh rừng trưa và xanh đêm sao theo khung giờ."
        badgeColor="#B8F2E6"
        rightSlot={
          selectedSeries ? (
            <button
              type="button"
              onClick={() => onSelectSeries(null)}
              className="kw-btn-pop rounded-full bg-[#FFF3B0] px-4 py-1.5 text-xs text-[#4A3E3D]"
            >
              ✕ Bỏ lọc Series: {selectedSeries}
            </button>
          ) : undefined
        }
      />

      {/* Wooden Framed 24H Chalkboard */}
      <div className="kw-chalkboard-frame overflow-hidden p-5 sm:p-8">
        {/* Floating Chalk Dust Particles */}
        {CHALK_DUST.map((dust) => (
          <span
            key={dust.id}
            style={{
              top: dust.top,
              left: dust.left,
              animationDelay: dust.delay,
            }}
            className="animate-dust-float pointer-events-none absolute h-2.5 w-2.5 rounded-full bg-white/40 blur-[0.5px]"
            aria-hidden="true"
          />
        ))}

        {/* Original BonzStore 24H Chalk Doodle & Celestial Sketch */}
        <svg
          viewBox="0 0 180 72"
          aria-hidden="true"
          className="pointer-events-none absolute right-5 top-4 hidden h-14 w-auto opacity-45 md:block"
        >
          <g
            fill="none"
            stroke="#FFF3B0"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="4 4"
          >
            <path d="M12 52 Q 48 14, 92 38 T 164 20" />
            <polygon points="164,20 152,18 158,30" fill="#FFF3B0" />
            <circle cx="44" cy="24" r="10" />
            <path d="M118 14 L121 22 L129 25 L121 28 L118 36 L115 28 L107 25 L115 22 Z" />
          </g>
        </svg>

        {/* Top Chalk Handwritten Header */}
        <div className="relative z-10 mb-6 flex flex-wrap items-center justify-between gap-3 border-b-2 border-dashed border-white/25 pb-4 text-[#F8FAFC]">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-5 w-5 text-[#FFF3B0]" />
            <span className="font-display text-sm font-bold tracking-wide text-[#FFF3B0] sm:text-base">
              {period === 'morning' && '☀ BÀI GIẢNG BUỔI SÁNG: CHỌN SERIES ĐỂ LỌC TOA TÀU EXPRESS!'}
              {period === 'afternoon' && '🌅 BÀI GIẢNG BUỔI TRƯA: HÔM NAY BẠN MUỐN GHÉ THẾ GIỚI NÀO?'}
              {period === 'night' && '★ LỚP HỌC ĐÊM SAO: KHÁM PHÁ KHO TÀNG NHÂN VẬT YÊU THÍCH!'}
            </span>
          </div>
          <span className="rounded-full border border-dashed border-white/40 px-3 py-0.5 font-mono text-xs text-white/90">
            {meta.badgeText}
          </span>
        </div>

        {/* Polaroid Series Cards Taped to Chalkboard */}
        <div className="relative z-10 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {categories.map((cat) => {
            const isActive =
              selectedSeries?.toLowerCase() === cat.name.toLowerCase();
            return (
              <button
                key={cat.id}
                type="button"
                data-testid={`category-card-${cat.slug}`}
                onClick={() => {
                  const next = isActive ? null : cat.name;
                  onSelectSeries(next);
                  const trainSection = document.getElementById(
                    'section-train-station',
                  );
                  if (trainSection && next) {
                    trainSection.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                    });
                  }
                }}
                style={{ transform: `rotate(${cat.tapeAngle})` }}
                className={`group relative rounded-2xl border-[2.5px] border-[#4A3E3D] bg-[#FFFDF9] p-3 text-left text-[#4A3E3D] shadow-[5px_5px_0px_#12241B] transition-all hover:z-20 hover:scale-105 ${
                  isActive ? 'ring-4 ring-[#FFF3B0]' : ''
                }`}
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-2.5 left-1/2 h-4 w-16 -translate-x-1/2 rotate-2 border border-[#4A3E3D]/25 bg-[#FFF3B0]/80"
                />

                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border-2 border-[#4A3E3D]">
                  <img
                    src={cat.coverImage}
                    alt={cat.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <span
                    style={{ backgroundColor: cat.accentColor }}
                    className="absolute left-2 top-2 rounded-full border-[1.5px] border-[#4A3E3D] px-2 py-0.5 font-mono text-[10px] font-bold text-[#4A3E3D]"
                  >
                    {cat.badge}
                  </span>
                </div>

                <div className="mt-2.5 flex items-baseline justify-between gap-1">
                  <div>
                    <p className="font-mono text-[10px] font-bold text-[#7A6A68]">
                      {cat.jpTitle}
                    </p>
                    <h3 className="font-display text-sm font-bold text-[#4A3E3D] sm:text-base">
                      {cat.name}
                    </h3>
                  </div>
                  <span className="shrink-0 rounded-full border border-[#4A3E3D] bg-[#FFF3B0] px-2 py-0.5 font-mono text-[11px] font-bold">
                    {cat.productCount} mẫu
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Bottom Chalk Tray: Wooden Eraser + Colored Chalk Sticks */}
        <div className="relative z-10 mt-8 flex flex-wrap items-center justify-between gap-4 border-t-4 border-[#5C3A1B] pt-4 text-xs text-white/85">
          <div className="flex items-center gap-3">
            <div className="flex items-center overflow-hidden rounded-lg border-2 border-[#3E2723] shadow-md">
              <span className="bg-[#D7CCC8] px-3 py-1 font-mono text-[10px] font-bold text-[#3E2723]">
                FELT
              </span>
              <span className="bg-[#8D6E63] px-3 py-1 font-display text-[10px] font-bold text-white">
                TẨY BẢNG GỖ
              </span>
            </div>

            <div className="flex items-center gap-2" aria-hidden="true">
              <span className="h-2.5 w-8 rounded-full bg-white shadow-sm" />
              <span className="h-2.5 w-7 rounded-full bg-[#FFB5C2] shadow-sm" />
              <span className="h-2.5 w-7 rounded-full bg-[#FFF3B0] shadow-sm" />
              <span className="h-2.5 w-6 rounded-full bg-[#A2D2FF] shadow-sm" />
            </div>
          </div>

          <span className="font-display text-xs text-[#B8F2E6]">
            💡 Nhấp vào tấm ảnh Polaroid bất kỳ để lọc sản phẩm theo bộ Anime!
          </span>
        </div>
      </div>
    </section>
  );
}

