import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface PageSectionContainerProps {
  title: string;
  subBadge?: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  headerRight?: ReactNode;
  toolbar?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  bodyClassName?: string;
  noBodyPadding?: boolean;
  className?: string;
}

/**
 * Container chuẩn đồng bộ từ giao diện /products/create sang toàn bộ các trang quản trị:
 * - Header phân vùng rõ ràng (bg-muted/30, border-b, tiêu đề + badge tiếng Anh + trạng thái bên phải)
 * - Thanh công cụ tìm kiếm / bộ lọc nằm gọn bên trong container
 * - Nội dung chính (bảng dữ liệu hoặc form/cards)
 * - Chân trang (Pagination) gắn liền mạch ở đáy container
 */
export function PageSectionContainer({
  title,
  subBadge,
  description,
  icon: Icon,
  headerRight,
  toolbar,
  footer,
  children,
  bodyClassName,
  noBodyPadding = false,
  className,
}: PageSectionContainerProps) {
  return (
    <section className={cn('section-container', className)}>
      {/* 1. Section Header Bar (Giống hệt /products/create) */}
      <div className="section-container-header">
        <div className="min-w-0">
          <h2 className="text-base font-bold flex flex-wrap items-center gap-2 text-foreground">
            {Icon ? (
              <Icon className="h-4 w-4 text-foreground dark:text-primary shrink-0" />
            ) : null}
            <span>{title}</span>
            {subBadge ? (
              <span className="rounded border border-border bg-background/80 px-1.5 py-0.5 text-[10px] font-normal text-muted-foreground">
                {subBadge}
              </span>
            ) : null}
          </h2>
          {description ? (
            <p className="text-xs text-muted-foreground mt-0.5">
              {description}
            </p>
          ) : null}
        </div>

        {headerRight ? (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {headerRight}
          </div>
        ) : null}
      </div>

      {/* 2. Optional Search & Filter Toolbar */}
      {toolbar ? <div className="section-container-toolbar">{toolbar}</div> : null}

      {/* 3. Main Content Body */}
      <div className={cn(!noBodyPadding && 'p-6', bodyClassName)}>
        {children}
      </div>

      {/* 4. Optional Footer (Pagination) */}
      {footer ? <div className="section-container-footer">{footer}</div> : null}
    </section>
  );
}

