import { useI18n } from '../i18n/I18nContext';
import { cn } from '../../lib/utils';

interface StatusBadgeProps {
  status: string;
  label?: string;
}

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: 'status-active',
  MAINTENANCE: 'status-maintenance',
  DRAFT: 'status-maintenance',
  INACTIVE: 'status-inactive',
  LOCKED: 'status-inactive',
  FREEZE: 'status-inactive',
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const { t } = useI18n();
  const normalized = status?.toUpperCase() || 'INACTIVE';
  const className = STATUS_STYLE[normalized] || 'status-inactive';
  const translated =
    t(`status.${normalized}` as any) !== `status.${normalized}`
      ? t(`status.${normalized}` as any)
      : status;

  return (
    <span className={cn('status-badge', className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label || translated}
    </span>
  );
}
