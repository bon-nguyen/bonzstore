import * as React from 'react';
import { cn } from '../../lib/utils';

export type TableColumnAlign = 'left' | 'center' | 'right';

const alignClassMap: Record<TableColumnAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  bordered?: boolean;
  wrapperClassName?: string;
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, bordered = false, wrapperClassName, ...props }, ref) => (
    <div className={cn('ant-tw-table-wrapper', wrapperClassName)}>
      <table
        ref={ref}
        className={cn(
          'w-full border-collapse caption-bottom text-sm',
          bordered &&
            '[&_td]:border-r [&_td]:border-border [&_td:last-child]:border-r-0',
          className,
        )}
        {...props}
      />
    </div>
  ),
);
Table.displayName = 'Table';

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('ant-tw-thead', className)} {...props} />
));
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn(
      'divide-y divide-border [&_tr:last-child]:border-0',
      className,
    )}
    {...props}
  />
));
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      'border-t border-border bg-muted/40 font-medium [&>tr]:last:border-b-0',
      className,
    )}
    {...props}
  />
));
TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn('table-row-interactive', className)}
    {...props}
  />
));
TableRow.displayName = 'TableRow';

export interface TableHeadProps
  extends React.ThHTMLAttributes<HTMLTableCellElement> {
  align?: TableColumnAlign;
  sortable?: boolean;
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, align = 'left', sortable = false, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'table-header-cell',
        alignClassMap[align],
        sortable && 'ant-tw-th-sortable',
        className,
      )}
      {...props}
    />
  ),
);
TableHead.displayName = 'TableHead';

export interface TableCellProps
  extends React.TdHTMLAttributes<HTMLTableCellElement> {
  align?: TableColumnAlign;
}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, align = 'left', ...props }, ref) => (
    <td
      ref={ref}
      className={cn('ant-tw-td', alignClassMap[align], className)}
      {...props}
    />
  ),
);
TableCell.displayName = 'TableCell';

/**
 * Ant Design Empty Box SVG Icon cho trạng thái bảng trống (.ant-empty-image)
 */
export function AntdEmptyBoxIcon({ className }: { className?: string }) {
  return (
    <svg
      width="64"
      height="41"
      viewBox="0 0 64 41"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('mx-auto text-muted-foreground/45', className)}
    >
      <g transform="translate(0 1)" fill="none" fillRule="evenodd">
        <ellipse
          fill="currentColor"
          fillOpacity="0.12"
          cx="32"
          cy="33"
          rx="32"
          ry="7"
        />
        <g fillRule="nonzero" stroke="currentColor" strokeWidth="1.2">
          <path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z" />
          <path
            d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z"
            fill="currentColor"
            fillOpacity="0.06"
          />
        </g>
      </g>
    </svg>
  );
}

export {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
};
