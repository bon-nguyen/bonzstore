'use client';

import React from 'react';
import {
  TimeModePreference,
  useTimeMode,
} from '../../providers/time-mode-provider';

interface TimeModeSwitcherProps {
  variant?: 'full' | 'compact' | 'floating';
  className?: string;
}

const TIME_OPTIONS: Array<{
  id: TimeModePreference;
  icon: string;
  label: string;
  timeHint: string;
  activeBg: string;
}> = [
  {
    id: 'morning',
    icon: '☀️',
    label: 'Sáng',
    timeHint: '06:00 – 11:00',
    activeBg: 'bg-[#BCE5ED]',
  },
  {
    id: 'afternoon',
    icon: '🌅',
    label: 'Trưa',
    timeHint: '11:00 – 18:00',
    activeBg: 'bg-[#FDE68A]',
  },
  {
    id: 'night',
    icon: '🌙',
    label: 'Tối',
    timeHint: '18:00 – 06:00',
    activeBg: 'bg-[#C4B5FD]',
  },
  {
    id: 'auto',
    icon: '🧸',
    label: 'Tự động',
    timeHint: 'Theo giờ thực',
    activeBg: 'bg-[#FFB5C2]',
  },
];

export function TimeModeSwitcher({
  variant = 'full',
  className = '',
}: TimeModeSwitcherProps) {
  const { mode, period, setMode } = useTimeMode();

  if (variant === 'compact') {
    return (
      <div
        role="group"
        aria-label="Chọn khung giờ Sáng, Trưa, Tối"
        data-testid="time-mode-switcher-compact"
        className={`inline-flex items-center gap-1 rounded-full border-2 border-[#4A3E3D] bg-white/95 p-1 text-[#4A3E3D] shadow-kw-hard-sm ${className}`}
      >
        {TIME_OPTIONS.slice(0, 3).map((opt) => {
          const isCurrent =
            mode === opt.id || (mode === 'auto' && period === opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              data-testid={`time-btn-${opt.id}`}
              onClick={() => setMode(opt.id)}
              title={`Chế độ ${opt.label} (${opt.timeHint})`}
              className={`flex items-center gap-1 rounded-full px-2 py-0.5 font-display text-[11px] font-bold transition-all ${
                isCurrent
                  ? `${opt.activeBg} border border-[#4A3E3D] text-[#4A3E3D] shadow-[1px_1px_0px_#4A3E3D]`
                  : 'text-[#64748B] hover:bg-slate-100'
              }`}
            >
              <span>{opt.icon}</span>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label="Bộ chuyển màu sắc Sáng, Trưa, Tối (24H)"
      data-testid="time-mode-switcher"
      className={`inline-flex flex-wrap items-center gap-1 rounded-full border-[2.5px] border-[#4A3E3D] bg-white/95 p-1 text-[#4A3E3D] shadow-[3px_3px_0px_#4A3E3D] ${className}`}
    >
      {TIME_OPTIONS.map((opt) => {
        const isActive =
          mode === opt.id ||
          (mode === 'auto' && opt.id === 'auto');
        const isResolvedPeriod = mode === 'auto' && period === opt.id;

        return (
          <button
            key={opt.id}
            type="button"
            data-testid={`time-btn-${opt.id}`}
            onClick={() => setMode(opt.id)}
            title={`${opt.label} (${opt.timeHint})`}
            aria-pressed={isActive}
            className={`relative flex items-center gap-1.5 rounded-full px-3 py-1 font-display text-xs font-bold transition-all ${
              isActive
                ? `${opt.activeBg} border-[1.5px] border-[#4A3E3D] text-[#4A3E3D] shadow-[1.5px_1.5px_0px_#4A3E3D]`
                : isResolvedPeriod
                  ? 'border border-dashed border-[#4A3E3D]/60 bg-slate-100 text-[#4A3E3D]'
                  : 'text-[#64748B] hover:bg-[#FFF3B0]/50 hover:text-[#4A3E3D]'
            }`}
          >
            <span>{opt.icon}</span>
            <span>{opt.label}</span>
            {variant === 'floating' && opt.id !== 'auto' && (
              <span className="hidden font-mono text-[10px] opacity-75 sm:inline">
                ({opt.timeHint})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

