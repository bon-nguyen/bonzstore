'use client';

import React, { useEffect, useRef } from 'react';
import { Compass, MapPin, X } from 'lucide-react';
import { TREASURE_MAP_CHAPTERS } from '../../lib/storefront-data';

interface SkyTreasureMapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SkyTreasureMapModal({
  isOpen,
  onClose,
}: SkyTreasureMapModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  const handleJump = (sectionId: string) => {
    onClose();
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <dialog
      ref={dialogRef}
      data-testid="sky-treasure-map-modal"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
      className="
        m-auto w-[94vw] max-w-4xl rounded-[30px] border-[3.5px] border-[#4A3E3D]
        bg-[#FFF9F0] p-0 text-[#4A3E3D] shadow-[10px_10px_0px_#4A3E3D]
        backdrop:bg-black/60 backdrop:backdrop-blur-sm
      "
    >
      <div className="flex items-center justify-between border-b-[3px] border-[#4A3E3D] bg-gradient-to-r from-[#A2D2FF] via-[#FFE5EC] to-[#FFF3B0] px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="stat-card-icon text-xl">🗺️</span>
          <div>
            <span className="rounded-full border border-[#4A3E3D] bg-[#FFF3B0] px-2.5 py-0.5 font-mono text-[11px] font-bold">
              SKY TREASURE MAP · 11 TRẠM BAY
            </span>
            <h2 className="font-display text-xl font-bold text-[#4A3E3D] md:text-2xl">
              Bản Đồ Kho Báu Bầu Trời BonzStore 24H
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#4A3E3D] bg-[#FFB5C2] shadow-kw-hard-sm transition-transform hover:scale-105"
          aria-label="Đóng bản đồ kho báu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="max-h-[75vh] overflow-y-auto p-6">
        <p className="mb-5 flex items-center gap-2 rounded-2xl border-2 border-dashed border-[#4A3E3D]/40 bg-white/85 px-4 py-2.5 text-sm font-semibold text-[#7A6A68]">
          <Compass className="h-4 w-4 shrink-0 text-[#FF8DA1]" />
          <span>
            Chọn bất kỳ phân cảnh nào dưới đây để phi thuyền dịch chuyển tức thì đến trạm đó!
          </span>
        </p>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {TREASURE_MAP_CHAPTERS.map((chap) => (
            <button
              key={chap.id}
              type="button"
              onClick={() => handleJump(chap.id)}
              className="group flex flex-col justify-between rounded-2xl border-[2.5px] border-[#4A3E3D] bg-white p-4 text-left shadow-[4px_4px_0px_#4A3E3D] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_#4A3E3D]"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-[#7A6A68]">
                    {chap.chapterNo}
                  </span>
                  <span
                    style={{ backgroundColor: chap.color }}
                    className="rounded-full border-[1.5px] border-[#4A3E3D] px-2.5 py-0.5 font-display text-[11px] font-bold text-[#4A3E3D]"
                  >
                    {chap.badge}
                  </span>
                </div>

                <div className="mt-2.5 flex items-start gap-2.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-[#4A3E3D] bg-[#FFF9F0] text-xl shadow-kw-hard-sm">
                    {chap.icon}
                  </span>
                  <div>
                    <h3 className="font-display text-sm font-bold text-[#4A3E3D] group-hover:text-[#E11D48]">
                      {chap.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-[#7A6A68]">
                      {chap.subtitle}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-end gap-1 font-display text-xs font-bold text-[#4A3E3D] transition-transform group-hover:translate-x-1">
                <MapPin className="h-3.5 w-3.5 text-[#FF8DA1]" />
                <span>Bay tới trạm →</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </dialog>
  );
}

