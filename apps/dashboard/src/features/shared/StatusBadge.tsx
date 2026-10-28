import { cn } from '../../lib/utils';
import { TranslationKey, useI18n } from '../i18n/I18nContext';

export interface StatusBadgeProps {
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

const STATUS_TRANSLATION_KEY: Record<string, TranslationKey> = {
  ACTIVE: 'status.ACTIVE',
  INACTIVE: 'status.INACTIVE',
  LOCKED: 'status.LOCKED',
  DRAFT: 'status.DRAFT',
  FREEZE: 'status.FREEZE',
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const { t } = useI18n();
  const normalized = status?.toUpperCase() || 'INACTIVE';
  const className = STATUS_STYLE[normalized] || 'status-inactive';
  const translationKey = STATUS_TRANSLATION_KEY[normalized];
  const translated = translationKey ? t(translationKey) : status;

  return (
    <span className={cn('status-badge', className)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label || translated}
    </span>
  );
}
