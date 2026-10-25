import { ReactNode } from 'react';

interface PageHeaderProps {
  subtitle?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({
  subtitle,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="page-header">
      <div>
        {subtitle ? <p className="page-subtitle mb-1">{subtitle}</p> : null}
        <h1 className="page-title">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2.5">{actions}</div> : null}
    </div>
  );
}

