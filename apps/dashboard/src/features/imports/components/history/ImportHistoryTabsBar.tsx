import { Calendar, FileCheck2, FileClock } from 'lucide-react';
import { cn } from '../../../../lib/utils';

export interface ImportHistoryTabsBarProps {
  mode: 'HISTORY' | 'DRAFTS';
  completedCount: number;
  draftCount: number;
  activeTimeLabel: string;
  onModeChange: (nextMode: 'HISTORY' | 'DRAFTS') => void;
}

export function ImportHistoryTabsBar({
  mode,
  completedCount,
  draftCount,
  activeTimeLabel,
  onModeChange,
}: ImportHistoryTabsBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onModeChange('HISTORY')}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition',
            mode === 'HISTORY'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300',
          )}
        >
          <FileCheck2 className="h-4 w-4" />
          <span>Lịch sử nhập hàng</span>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 font-mono text-[11px]',
              mode === 'HISTORY'
                ? 'bg-white/20 text-white'
                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
            )}
          >
            {completedCount.toLocaleString('vi-VN')}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onModeChange('DRAFTS')}
          className={cn(
            'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition',
            mode === 'DRAFTS'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300',
          )}
        >
          <FileClock className="h-4 w-4" />
          <span>Lưu tạm</span>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 font-mono text-[11px]',
              mode === 'DRAFTS'
                ? 'bg-white/20 text-white'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
            )}
          >
            {draftCount.toLocaleString('vi-VN')}
          </span>
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Calendar className="h-3.5 w-3.5 text-emerald-600" />
        <span>Mốc thời gian tổng hợp:</span>
        <strong className="font-semibold text-emerald-700 dark:text-emerald-400">
          {activeTimeLabel}
        </strong>
      </div>
    </div>
  );
}
