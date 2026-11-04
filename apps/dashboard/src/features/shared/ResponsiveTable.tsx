import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { ReactNode, useMemo } from 'react';
import { LoadingState } from '../../components/ui/empty-state';
import {
  AntdEmptyBoxIcon,
  Table,
  TableBody,
  TableCell,
  TableColumnAlign,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { cn } from '../../lib/utils';
import { useI18n } from '../i18n/I18nContext';

export interface Column<T> {
  key: string;
  header: ReactNode;
  mobileHeader?: string;
  sortKey?: string;
  align?: TableColumnAlign;
  width?: string | number;
  className?: string;
  headClassName?: string;
  cellClassName?: string;
  render: (item: T, index: number) => ReactNode;
  skeletonRender?: () => ReactNode;
  mobileRender?: (item: T, index: number) => ReactNode;
  showOnMobile?: boolean;
  isPrimary?: boolean;
  isSecondary?: boolean;
}

export interface ResponsiveTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  emptyMessage?: string;
  emptyDescription?: string;
  emptyIcon?: ReactNode;
  isLoading?: boolean;
  isFetching?: boolean;
  skeletonRows?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSortChange?: (sortKey: string) => void;
  embedded?: boolean;
  bordered?: boolean;
  rowClassName?: (item: T, index: number) => string | undefined;
  onRowClick?: (item: T, index: number) => void;
}

export function ResponsiveTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage,
  emptyDescription,
  emptyIcon,
  isLoading = false,
  isFetching = false,
  skeletonRows = 4,
  sortBy,
  sortOrder = 'asc',
  onSortChange,
  embedded = false,
  bordered = false,
  rowClassName,
  onRowClick,
}: ResponsiveTableProps<T>) {
  const { t } = useI18n();
  const showLoading = isLoading || isFetching;
  const resolvedEmptyMessage = emptyMessage || t('app.empty');

  const renderSortIcon = (colSortKey?: string) => {
    if (!colSortKey || !onSortChange) return null;
    if (sortBy !== colSortKey) {
      return <ArrowUpDown className="h-3.5 w-3.5 shrink-0 opacity-45" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 shrink-0 text-foreground dark:text-primary" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 shrink-0 text-foreground dark:text-primary" />
    );
  };

  // Tích hợp @tanstack/react-table (TanStack Table v8) kết hợp Ant Design Table UX
  const tanstackColumns = useMemo<ColumnDef<T>[]>(
    () =>
      columns.map((col) => ({
        id: col.key,
        header: () => {
          const isSortable = Boolean(col.sortKey && onSortChange);
          const isActiveSort = col.sortKey && sortBy === col.sortKey;
          if (!isSortable) {
            return col.header;
          }
          return (
            <button
              type="button"
              onClick={() => onSortChange?.(col.sortKey!)}
              className={cn(
                'inline-flex w-full items-center gap-1.5 font-display text-xs font-semibold transition-colors hover:text-foreground',
                col.align === 'right' && 'justify-end',
                col.align === 'center' && 'justify-center',
                isActiveSort
                  ? 'text-foreground dark:text-primary'
                  : 'text-foreground/85 dark:text-foreground/90',
              )}
            >
              <span>{col.header}</span>
              {renderSortIcon(col.sortKey)}
            </button>
          );
        },
        cell: ({ row }) => col.render(row.original, row.index),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columns, sortBy, sortOrder, onSortChange],
  );

  const table = useReactTable({
    data,
    columns: tanstackColumns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (originalRow, index) => keyExtractor(originalRow, index),
  });

  const renderDefaultSkeletonCell = (col: Column<T>) => {
    if (col.skeletonRender) {
      return col.skeletonRender();
    }
    if (col.align === 'center') {
      return <div className="mx-auto h-5 w-12 rounded-md bg-muted" />;
    }
    if (col.align === 'right') {
      return <div className="ml-auto h-5 w-20 rounded-md bg-muted" />;
    }
    if (col.isPrimary) {
      return (
        <div className="space-y-1.5">
          <div className="h-4 w-40 rounded bg-muted" />
          <div className="h-3 w-24 rounded bg-muted/70" />
        </div>
      );
    }
    return <div className="h-4 w-28 rounded bg-muted" />;
  };

  const skeletonRowCount = Math.max(
    Math.min(data.length || skeletonRows, 8),
    3,
  );

  return (
    <>
      {/* Desktop Table (Ant Design Table inspired Tailwind + @tanstack/react-table) */}
      <div
        className={cn(
          'relative hidden overflow-hidden bg-card md:block',
          !embedded && 'rounded-xl border border-border shadow-sm',
        )}
      >
        <Table bordered={bordered}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header, idx) => {
                  const col = columns[idx];
                  const isSortable = Boolean(col?.sortKey && onSortChange);
                  return (
                    <TableHead
                      key={header.id}
                      align={col?.align}
                      sortable={isSortable}
                      style={
                        col?.width !== undefined
                          ? { width: col.width }
                          : undefined
                      }
                      className={cn(col?.className, col?.headClassName)}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </tr>
            ))}
          </TableHeader>

          <TableBody>
            {showLoading ? (
              Array.from({ length: skeletonRowCount }).map((_, rIdx) => (
                <tr key={`skeleton-row-${rIdx}`} className="animate-pulse">
                  {columns.map((col) => (
                    <TableCell
                      key={`skeleton-cell-${rIdx}-${col.key}`}
                      align={col.align}
                      className={cn(col.className, col.cellClassName)}
                    >
                      {renderDefaultSkeletonCell(col)}
                    </TableCell>
                  ))}
                </tr>
              ))
            ) : !table.getRowModel().rows.length ? (
              <tr>
                <TableCell
                  colSpan={columns.length}
                  align="center"
                  className="py-12"
                >
                  <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-2 text-center">
                    {emptyIcon || <AntdEmptyBoxIcon />}
                    <p className="font-display text-sm font-bold text-foreground">
                      {resolvedEmptyMessage}
                    </p>
                    {emptyDescription ? (
                      <p className="text-xs text-muted-foreground">
                        {emptyDescription}
                      </p>
                    ) : null}
                  </div>
                </TableCell>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => {
                const item = row.original;
                const rIndex = row.index;
                const customRowCls = rowClassName?.(item, rIndex);
                return (
                  <TableRow
                    key={row.id}
                    onClick={
                      onRowClick ? () => onRowClick(item, rIndex) : undefined
                    }
                    className={cn(
                      onRowClick && 'cursor-pointer',
                      customRowCls,
                    )}
                  >
                    {row.getVisibleCells().map((cell, cIdx) => {
                      const col = columns[cIdx];
                      return (
                        <TableCell
                          key={cell.id}
                          align={col?.align}
                          className={cn(col?.className, col?.cellClassName)}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card Stack */}
      <div className={cn('space-y-3 md:hidden', embedded && 'p-4')}>
        {showLoading ? (
          <LoadingState />
        ) : !data.length ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            {emptyIcon || <AntdEmptyBoxIcon />}
            <p className="mt-2 font-display text-sm font-bold text-foreground">
              {resolvedEmptyMessage}
            </p>
            {emptyDescription ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {emptyDescription}
              </p>
            ) : null}
          </div>
        ) : (
          data.map((item, idx) => (
            <div
              key={keyExtractor(item, idx)}
              onClick={onRowClick ? () => onRowClick(item, idx) : undefined}
              className={cn(
                'stat-card space-y-2.5 p-4',
                onRowClick && 'cursor-pointer',
                rowClassName?.(item, idx),
              )}
            >
              {columns
                .filter((col) => col.showOnMobile !== false)
                .map((col) => (
                  <div
                    key={col.key}
                    className="flex items-center justify-between gap-2 text-sm"
                  >
                    <span className="text-xs font-semibold text-muted-foreground">
                      {col.mobileHeader || col.header}
                    </span>
                    <div className="text-right">
                      {col.mobileRender
                        ? col.mobileRender(item, idx)
                        : col.render(item, idx)}
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
