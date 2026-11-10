import { useMemo } from 'react';
import { cn } from '../../lib/utils';
import { suggestPrices } from '../imports/components/ImportFormTypes';

export interface PriceSuggestionsBarProps {
  baseValue: number | number[];
  selectedValue?: number;
  onSelectPrice: (price: number) => void;
  fallbackBaseValue?: number;
  className?: string;
}

export function PriceSuggestionsBar({
  baseValue,
  selectedValue,
  onSelectPrice,
  fallbackBaseValue = 100000,
  className,
}: PriceSuggestionsBarProps) {
  const suggestions = useMemo(() => {
    const resolvedBase = Array.isArray(baseValue)
      ? baseValue.length > 0
        ? baseValue
        : fallbackBaseValue
      : baseValue > 0
        ? baseValue
        : fallbackBaseValue;
    return suggestPrices(resolvedBase).filter((p) => p > 0);
  }, [baseValue, fallbackBaseValue]);

  if (suggestions.length === 0) return null;

  return (
    <div className={cn('mt-2 flex flex-wrap items-center gap-1.5', className)}>
      {suggestions.map((suggestedAmount) => {
        const isSelected = selectedValue === suggestedAmount;
        return (
          <button
            key={suggestedAmount}
            type="button"
            onClick={() => onSelectPrice(suggestedAmount)}
            className={cn(
              'rounded-md border px-2 py-1 font-mono text-[11px] font-bold transition',
              isSelected
                ? 'border-emerald-600 bg-emerald-600 text-white shadow-2xs'
                : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-emerald-500/50 hover:bg-emerald-50 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-emerald-950/50',
            )}
          >
            {suggestedAmount.toLocaleString('vi-VN')} ₫
          </button>
        );
      })}
    </div>
  );
}
