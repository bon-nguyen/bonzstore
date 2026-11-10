import { Calendar } from 'lucide-react';
import { cn } from '../../lib/utils';

export type DatePresetType =
  | 'ALL'
  | 'TODAY'
  | 'LAST_7_DAYS'
  | 'THIS_MONTH'
  | 'CUSTOM';

export function toLocalDateStr(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatVnDateShort(isoDate: string): string {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export function computeDatePresetRange(
  preset: DatePresetType,
  referenceDate: Date = new Date('2026-11-10T12:00:00'),
): { startDate: string; endDate: string } {
  const todayStr = toLocalDateStr(referenceDate);

  if (preset === 'ALL') {
    return { startDate: '', endDate: '' };
  }
  if (preset === 'TODAY') {
    return { startDate: todayStr, endDate: todayStr };
  }
  if (preset === 'LAST_7_DAYS') {
    const d7 = new Date(referenceDate);
    d7.setDate(referenceDate.getDate() - 6);
    return { startDate: toLocalDateStr(d7), endDate: todayStr };
  }
  if (preset === 'THIS_MONTH') {
    const firstDay = new Date(
      referenceDate.getFullYear(),
      referenceDate.getMonth(),
      1,
    );
    return { startDate: toLocalDateStr(firstDay), endDate: todayStr };
  }
  return { startDate: '', endDate: '' };
}

export function formatActiveDateRangeLabel(
  startDate: string,
  endDate: string,
  allTimeLabel = 'Tất cả thời gian',
): string {
  if (!startDate && !endDate) return allTimeLabel;
  if (startDate && endDate && startDate === endDate) {
    return `Ngày ${formatVnDateShort(startDate)}`;
  }
  return `${startDate ? formatVnDateShort(startDate) : '...'} → ${endDate ? formatVnDateShort(endDate) : '...'}`;
}

export interface DateRangeFilterSectionProps {
  title?: string;
  datePreset: DatePresetType;
  startDate: string;
  endDate: string;
  onSelectPreset: (preset: DatePresetType) => void;
  onChangeStartDate: (val: string) => void;
  onChangeEndDate: (val: string) => void;
}

export function DateRangeFilterSection({
  title = 'Khoảng thời gian',
  datePreset,
  startDate,
  endDate,
  onSelectPreset,
  onChangeStartDate,
  onChangeEndDate,
}: DateRangeFilterSectionProps) {
  return (
    <div className="space-y-2.5">
      <label className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-foreground uppercase">
        <Calendar className="h-3.5 w-3.5 text-emerald-600" />
        <span>{title}</span>
      </label>

      <div className="grid grid-cols-2 gap-2">
        {(
          [
            { key: 'ALL', label: 'Tất cả thời gian' },
            { key: 'TODAY', label: 'Hôm nay' },
            { key: 'LAST_7_DAYS', label: '7 ngày qua' },
            { key: 'THIS_MONTH', label: 'Tháng này' },
          ] as const
        ).map((preset) => (
          <button
            key={preset.key}
            type="button"
            onClick={() => onSelectPreset(preset.key)}
            className={cn(
              'rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors',
              datePreset === preset.key
                ? 'border-emerald-600 bg-emerald-50 font-semibold text-emerald-800 dark:border-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-300'
                : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
        <div className="space-y-1">
          <span className="text-[11px] font-medium text-muted-foreground">
            Từ ngày
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onChangeStartDate(e.target.value)}
            className="h-9 w-full rounded-lg border border-slate-300 bg-background px-3 font-mono text-xs text-foreground focus:border-emerald-600 focus:outline-none dark:border-zinc-700"
          />
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-medium text-muted-foreground">
            Đến ngày
          </span>
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => onChangeEndDate(e.target.value)}
            className="h-9 w-full rounded-lg border border-slate-300 bg-background px-3 font-mono text-xs text-foreground focus:border-emerald-600 focus:outline-none dark:border-zinc-700"
          />
        </div>
      </div>
    </div>
  );
}
