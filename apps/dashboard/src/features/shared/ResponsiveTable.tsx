import { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  mobileRender?: (item: T) => ReactNode;
  showOnMobile?: boolean;
  isPrimary?: boolean;
  isSecondary?: boolean;
}

interface ResponsiveTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  isLoading?: boolean;
}

export function ResponsiveTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'Không có dữ liệu phù hợp',
  isLoading = false,
}: ResponsiveTableProps<T>) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Đang tải dữ liệu...
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden overflow-hidden rounded-xl border border-border bg-card shadow-sm md:block">
        <table className="w-full border-collapse text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="table-header-cell">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={keyExtractor(item)} className="table-row-interactive">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3.5 align-middle">
                    {col.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Stack */}
      <div className="space-y-3 md:hidden">
        {data.map((item) => (
          <div
            key={keyExtractor(item)}
            className="stat-card space-y-2.5 p-4"
          >
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
                    {col.mobileRender ? col.mobileRender(item) : col.render(item)}
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </>
  );
}

