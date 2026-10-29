import { ReactNode } from 'react';

interface PageHeaderProps {
  subtitle?: string;
  title: string;
  description?: string;
  badge?: string;
  actions?: ReactNode;
}

export function PageHeader({
  subtitle,
  title,
  description,
  badge,
  actions,
}: PageHeaderProps) {
  return (
    <div className="page-header">
      <div className="min-w-0 space-y-1">
        {subtitle ? (
          <div>
            <span className="page-subtitle">{subtitle}</span>
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="page-title">{title}</h1>
          {badge ? (
            <span className="rounded-md border border-border bg-muted/50 px-2 py-0.5 font-mono text-[11px] font-medium text-muted-foreground">
              {badge}
            </span>
          ) : null}
        </div>
        {description ? (
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
