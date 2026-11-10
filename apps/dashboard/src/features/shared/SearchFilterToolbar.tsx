import {
  Loader2,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { ReactNode } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { cn } from '../../lib/utils';

export interface ActiveFilterTag {
  id: string;
  label: string;
  icon?: ReactNode;
  variant?: 'emerald' | 'blue' | 'amber' | 'rose';
  onRemove: () => void;
}

export interface SearchFilterToolbarProps {
  searchValue: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  isBusy?: boolean;
  activeFilterCount?: number;
  activeFilterTags?: ActiveFilterTag[];
  filterButtonLabel?: string;
  resetButtonLabel?: string;
  onOpenFilterDrawer: () => void;
  onResetAllFilters: () => void;
  rightActions?: ReactNode;
}

const TAG_VARIANT_CLASSES: Record<
  NonNullable<ActiveFilterTag['variant']>,
  string
> = {
  emerald:
    'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
  blue: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300',
  rose: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300',
};

export function SearchFilterToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Tìm kiếm...',
  isBusy = false,
  activeFilterCount = 0,
  activeFilterTags = [],
  filterButtonLabel = 'Bộ lọc',
  resetButtonLabel = 'Đặt lại',
  onOpenFilterDrawer,
  onResetAllFilters,
  rightActions,
}: SearchFilterToolbarProps) {
  return (
    <div className="space-y-2.5 rounded-xl border border-slate-200 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="flex-1">
            <Input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              leftIcon={
                isBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                ) : (
                  <Search className="h-4 w-4 text-slate-400" />
                )
              }
              rightAddon={
                searchValue ? (
                  <button
                    type="button"
                    onClick={() => onSearchChange('')}
                    className="mr-1 rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null
              }
            />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={onOpenFilterDrawer}
            className={cn(
              'h-9 gap-2 px-3.5 text-xs font-semibold',
              activeFilterCount > 0 &&
                'border-emerald-600 bg-emerald-50/70 text-emerald-800 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-300',
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-600" />
            <span>{filterButtonLabel}</span>
            {activeFilterCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1.5 font-mono text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {activeFilterCount > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onResetAllFilters}
              className="h-9 gap-1 text-xs text-slate-600"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {resetButtonLabel}
            </Button>
          )}
        </div>

        {rightActions ? (
          <div className="flex items-center gap-2">{rightActions}</div>
        ) : null}
      </div>

      {activeFilterTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-400">
            Đang lọc theo:
          </span>
          {activeFilterTags.map((tag) => (
            <span
              key={tag.id}
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                TAG_VARIANT_CLASSES[tag.variant || 'emerald'],
              )}
            >
              {tag.icon}
              <span>{tag.label}</span>
              <button
                type="button"
                onClick={tag.onRemove}
                className="ml-0.5 opacity-80 hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
