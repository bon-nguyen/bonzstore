import { ArrowDown, ArrowUp, ArrowUpDown, Loader2 } from 'lucide-react';
import { ReactNode } from 'react';
import { EmptyState, LoadingState } from '../../components/ui/empty-state';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { cn } from '../../lib/utils';
import { useI18n } from '../i18n/I18nContext';

export interface Column<T> {
  key: string;
  header: string;
  sortKey?: string;
  render: (item: T) => ReactNode;
  mobileRender?: (item: T) => ReactNode;
  showOnMobile?: boolean;
  isPrimary?: boolean;
  isSecondary?: boolean;
}

export interface ResponsiveTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  isLoading?: boolean;
  isFetching?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (sortKey: string) => void;
}

export function ResponsiveTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage,
  isLoading = false,
  isFetching = false,
  sortBy,
  sortOrder = 'asc',
  onSortChange,
}: ResponsiveTableProps<T>) {
  const { t } = useI18n();
  const showLoading = isLoading || isFetching;
  const resolvedEmptyMessage = emptyMessage || t('app.empty');

  const renderSortIcon = (colSortKey?: string) => {
    if (!colSortKey || !onSortChange) return null;
    if (sortBy !== colSortKey) {
      return <ArrowUpDown className="h-3.5 w-3.5 opacity-50" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 text-foreground dark:text-primary" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-foreground dark:text-primary" />
    );
  };

  return (
    <>
      {/* Desktop Table (Shadcn/UI Table) */}
      <div className="relative hidden overflow-hidden rounded-xl border border-border bg-card shadow-sm md:block">
        <Table>
          <TableHeader>
            <tr>
              {columns.map((col) => {
                const isSortable = Boolean(col.sortKey && onSortChange);
                const isActiveSort = col.sortKey && sortBy === col.sortKey;
                return (
                  <TableHead key={col.key}>
                    {isSortable ? (
                      <button
                        type="button"
                        onClick={() => onSortChange?.(col.sortKey!)}
                        className={cn(
                          'inline-flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-wider transition-colors hover:text-foreground',
                          isActiveSort
                            ? 'text-foreground dark:text-primary'
                            : 'text-muted-foreground',
                        )}
                      >
                        <span>{col.header}</span>
                        {renderSortIcon(col.sortKey)}
                      </button>
                    ) : (
                      col.header
                    )}
                  </TableHead>
                );
              })}
            </tr>
          </TableHeader>
          <TableBody>
            {showLoading ? (
              <tr>
                <TableCell colSpan={columns.length} className="h-48 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin text-foreground dark:text-primary" />
                    <span>{t('app.loading')}</span>
                  </div>
                </TableCell>
              </tr>
            ) : !data.length ? (
              <tr>
                <TableCell colSpan={columns.length} className="p-6">
                  <EmptyState
                    title={resolvedEmptyMessage}
                    className="border-none bg-transparent p-4"
                  />
                </TableCell>
              </tr>
            ) : (
              data.map((item) => (
                <TableRow key={keyExtractor(item)}>
                  {columns.map((col) => (
                    <TableCell key={col.key}>{col.render(item)}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card Stack */}
      <div className="space-y-3 md:hidden">
        {showLoading ? (
          <LoadingState />
        ) : !data.length ? (
          <EmptyState title={resolvedEmptyMessage} />
        ) : (
          data.map((item) => (
            <div key={keyExtractor(item)} className="stat-card space-y-2.5 p-4">
              {columns
                .filter((col) => col.showOnMobile !== false)
                .map((col) => (
                  <div
                    key={col.key}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="text-xs font-medium uppercase text-muted-foreground">
                      {col.header}
                    </span>
                    <div className="text-right">
                      {col.mobileRender
                        ? col.mobileRender(item)
                        : col.render(item)}
                    </div>
                  </div>
                ))}
            </div>
          ))
        )}
      </div>
    </>
  );
}
