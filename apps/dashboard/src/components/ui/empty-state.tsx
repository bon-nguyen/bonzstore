import { Inbox, Loader2 } from 'lucide-react';
import { ReactNode } from 'react';
import { useI18n } from '../../features/i18n/I18nContext';
import { cn } from '../../lib/utils';

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message, className }: LoadingStateProps) {
  const { t } = useI18n();
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground',
        className,
      )}
    >
      <Loader2 className="h-5 w-5 animate-spin text-foreground dark:text-primary" />
      <span>{message || t('app.loading')}</span>
    </div>
  );
}

export interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const { t } = useI18n();
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card p-8 text-center',
        className,
      )}
    >
      <div className="stat-card-icon h-10 w-10">
        <Inbox className="h-5 w-5" />
      </div>
      <p className="text-sm font-medium text-foreground">
        {title || t('app.empty')}
      </p>
      {description ? (
        <p className="max-w-sm text-xs text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
