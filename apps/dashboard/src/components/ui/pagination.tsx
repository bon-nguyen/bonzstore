import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useI18n } from '../../features/i18n/I18nContext';
import { cn } from '../../lib/utils';
import { Select } from './select';

export const DEFAULT_PAGINATION_LIMIT_OPTIONS = [10, 20, 50] as const;

export interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (nextPage: number) => void;
  onLimitChange?: (nextLimit: number) => void;
  limitOptions?: readonly number[];
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
  limitOptions = DEFAULT_PAGINATION_LIMIT_OPTIONS,
  className,
}: PaginationProps) {
  const { t } = useI18n();
  const safeTotalPages = Math.max(totalPages, 1);
  const pageNumbers = Array.from({ length: safeTotalPages }, (_, i) => i + 1);

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-xs shadow-sm',
        className,
      )}
    >
      <span className="font-medium text-muted-foreground">
        {t('products.totalRows', { total })}
      </span>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label={t('app.prev')}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {pageNumbers.map((num) => {
            const active = num === page;
            return (
              <button
                key={num}
                type="button"
                onClick={() => onPageChange(num)}
                className={cn(
                  'inline-flex h-8 min-w-[32px] items-center justify-center rounded-md border px-2 font-mono text-xs font-bold transition',
                  active
                    ? 'border-foreground bg-primary text-primary-foreground'
                    : 'border-border bg-background text-foreground hover:bg-muted',
                )}
              >
                {num}
              </button>
            );
          })}

          <button
            type="button"
            disabled={page >= safeTotalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label={t('app.next')}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {onLimitChange ? (
          <Select
            value={String(limit)}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            options={limitOptions.map((opt) => ({
              value: String(opt),
              label: t('products.perPage', { limit: opt }),
            }))}
            className="h-8 w-28 text-xs"
          />
        ) : null}
      </div>
    </div>
  );
}
