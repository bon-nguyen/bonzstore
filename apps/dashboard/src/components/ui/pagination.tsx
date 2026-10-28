import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';

export interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (nextPage: number) => void;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  className,
}: PaginationProps) {
  const safeTotalPages = Math.max(totalPages, 1);
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  const pageNumbers = Array.from({ length: safeTotalPages }, (_, i) => i + 1);

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 text-xs sm:flex-row',
        className,
      )}
    >
      <div className="text-muted-foreground">
        Hiển thị{' '}
        <span className="font-semibold text-foreground">{startItem}</span>–
        <span className="font-semibold text-foreground">{endItem}</span> trên
        tổng số <span className="font-semibold text-foreground">{total}</span>{' '}
        bản ghi (Tối đa{' '}
        <span className="font-mono font-semibold text-foreground dark:text-primary">
          {limit}
        </span>{' '}
        / trang)
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="h-8 px-2.5 text-xs"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Trước</span>
        </Button>

        {pageNumbers.map((num) => (
          <Button
            key={num}
            type="button"
            variant={num === page ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPageChange(num)}
            className="h-8 w-8 p-0 font-display text-xs"
          >
            {num}
          </Button>
        ))}

        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={page >= safeTotalPages}
          onClick={() => onPageChange(page + 1)}
          className="h-8 px-2.5 text-xs"
        >
          <span>Sau</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

