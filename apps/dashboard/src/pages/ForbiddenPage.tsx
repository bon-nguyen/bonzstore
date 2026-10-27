import { ShieldOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../features/i18n/I18nContext';

export function ForbiddenPage() {
  const { t } = useI18n();
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-4 text-center">
      <div className="stat-card max-w-md space-y-4 p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/15 text-rose-500 dark:text-rose-400">
          <ShieldOff className="h-6 w-6" />
        </div>
        <h1 className="font-display text-xl font-bold">{t('forbidden.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('forbidden.desc')}</p>
        <Link to="/" className="action-btn-primary inline-flex">
          {t('forbidden.back')}
        </Link>
      </div>
    </div>
  );
}
