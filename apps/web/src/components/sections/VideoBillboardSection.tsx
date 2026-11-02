'use client';

import React, { useState } from 'react';
import { Film, Play, Sparkles, X } from 'lucide-react';
import {
  FALLBACK_VIDEO_REVIEWS,
  formatVnd,
  VideoReviewItem,
} from '../../lib/storefront-data';

export function VideoBillboardSection() {
  const [activeVideo, setActiveVideo] = useState<VideoReviewItem | null>(null);

  return (
    <section
      id="section-video-billboard"
      data-testid="video-billboard-section"
      className="kw-video-section relative z-10 mx-auto max-w-7xl px-4 py-12 md:px-6"
    >
      <div className="kw-wood-board p-6 text-white sm:p-8">
        <div className="mb-6 flex flex-col justify-between gap-3 border-b-2 border-dashed border-[#FFF3B0]/40 pb-4 md:flex-row md:items-center">
          <div>
            <span className="page-subtitle bg-[#FFF3B0]">
              <Film className="h-3.5 w-3.5" />
              <span>CHƯƠNG 7 · BẢNG GỖ QUẢNG CÁO TRÊN MÂY</span>
            </span>
            <h2 className="mt-2 font-display text-2xl font-bold text-[#FFFDF9] drop-shadow-[2px_2px_0px_#4A3E3D] md:text-3xl">
              Cuộn Phim 35mm Unbox Thực Tế Từ Phi Hành Đoàn
            </h2>
          </div>

          <span className="status-badge status-active self-start py-1.5 font-mono">
            <Sparkles className="h-3.5 w-3.5" />
            <span>QUAY TRỰC TIẾP TẠI STUDIO BONZSTORE</span>
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {FALLBACK_VIDEO_REVIEWS.map((vid) => (
            <article
              key={vid.id}
              className="group overflow-hidden rounded-2xl border-[3px] border-[#4A3E3D] bg-[#1E1B18] text-white shadow-kw-hard-md transition-transform hover:-translate-y-1.5"
            >
              <div className="flex items-center justify-between border-b-2 border-[#4A3E3D] bg-[#0F172A] px-3 py-1.5">
                <div className="flex gap-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className="h-2.5 w-3.5 rounded-[2px] border border-slate-600 bg-[#FFFDF9]/85"
                    />
                  ))}
                </div>
                <span className="font-mono text-[10px] font-bold text-[#FDE047]">
                  {vid.reelCode}
                </span>
              </div>

              <div className="relative aspect-video overflow-hidden">
                <img
                  src={vid.thumbnail}
                  alt={vid.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/25 transition-opacity group-hover:bg-black/40" />

                <button
                  type="button"
                  onClick={() => setActiveVideo(vid)}
                  aria-label={`Xem video ${vid.title}`}
                  className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[2.5px] border-[#4A3E3D] bg-[#FFB5C2] text-[#4A3E3D] shadow-[3px_3px_0px_#4A3E3D] transition-transform group-hover:scale-110"
                >
                  <Play className="h-6 w-6 fill-current" />
                </button>

                <span className="absolute bottom-2.5 right-2.5 rounded-md border border-[#4A3E3D] bg-black/80 px-2 py-0.5 font-mono text-xs font-bold text-white">
                  {vid.duration}
                </span>
              </div>

              <div className="bg-[#FFFDF9] p-4 text-[#4A3E3D]">
                <div className="flex items-center justify-between text-xs font-bold text-[#7A6A68]">
                  <span>{vid.reviewer}</span>
                  <span>{vid.views}</span>
                </div>
                <h3 className="mt-1 line-clamp-2 font-display text-sm font-bold text-[#4A3E3D]">
                  {vid.title}
                </h3>
                <div className="mt-3 flex items-center justify-between border-t border-dashed border-[#4A3E3D]/25 pt-2.5">
                  <span className="truncate text-xs font-bold text-[#7A6A68]">
                    {vid.productName}
                  </span>
                  <span className="font-mono text-xs font-bold text-[#E11D48]">
                    {formatVnd(vid.productPrice)}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {activeVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="w-full max-w-xl overflow-hidden rounded-[28px] border-[3px] border-[#4A3E3D] bg-[#FFFDF9] text-[#4A3E3D] shadow-kw-hard-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b-2 border-[#4A3E3D] bg-[#FFF3B0] px-5 py-3">
              <span className="font-mono text-xs font-bold">
                🎞️ {activeVideo.reelCode} · {activeVideo.reviewer}
              </span>
              <button
                type="button"
                onClick={() => setActiveVideo(null)}
                className="rounded-full border-2 border-[#4A3E3D] bg-[#FFB5C2] p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="relative aspect-video bg-slate-950">
              <img
                src={activeVideo.thumbnail}
                alt={activeVideo.title}
                className="h-full w-full object-cover opacity-85"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 p-6 text-center text-white">
                <span className="rounded-full border-2 border-white bg-[#FF5E7E] px-4 py-1.5 font-display text-xs font-bold">
                  ĐANG PHÁT CUỘN PHIM 35MM ({activeVideo.duration})
                </span>
                <p className="mt-3 max-w-md font-display text-lg font-bold">
                  {activeVideo.title}
                </p>
                <p className="mt-1 text-xs text-slate-200">
                  Sản phẩm trong video: {activeVideo.productName} —{' '}
                  {formatVnd(activeVideo.productPrice)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

