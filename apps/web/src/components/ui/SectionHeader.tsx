'use client';

import React from 'react';
import { useTimeMode } from '../../providers/time-mode-provider';

interface SectionHeaderProps {
  id?: string;
  chapterCode: string;
  title: string;
  subtitle?: string;
  badgeColor?: string;
  icon?: React.ReactNode;
  rightSlot?: React.ReactNode;
}

export function SectionHeader({
  id,
  chapterCode,
  title,
  subtitle,
  badgeColor = '#B8F2E6',
  icon,
  rightSlot,
}: SectionHeaderProps) {
  const { meta } = useTimeMode();

  return (
    <div className="page-header">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            style={{ backgroundColor: badgeColor }}
            className="page-subtitle"
          >
            {icon}
            <span>{chapterCode}</span>
          </span>
          <span className="status-badge bg-white/90 font-mono text-[11px] text-[#4A3E3D]">
            {meta.badgeText}
          </span>
        </div>
        <h2 id={id} className="page-title">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 max-w-2xl text-sm font-semibold text-kw-secondary">
            {subtitle}
          </p>
        )}
      </div>
      {rightSlot && <div className="shrink-0">{rightSlot}</div>}
    </div>
  );
}

