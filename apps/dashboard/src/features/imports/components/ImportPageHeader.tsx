import { FileClock, Package, RotateCcw, X } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { useI18n } from '../../i18n/I18nContext';
import { ImportsActiveTab } from './ImportFormTypes';

export interface ImportPageHeaderProps {
  activeTab: ImportsActiveTab;
  catalogProductsCount: number;
  editingDraftId: string | null;
  receiptNumber: string;
  onResetForm: () => void;
}

export function ImportPageHeader({
  activeTab,
  catalogProductsCount,
  editingDraftId,
  receiptNumber,
  onResetForm,
}: ImportPageHeaderProps) {
  const { t } = useI18n();

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="stat-card-icon flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="page-title text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {activeTab === 'CREATE'
                  ? t('importsForm.pageTitle')
                  : t('nav.importsHistory')}
              </h1>
              <span className="status-badge status-active rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/60 dark:text-emerald-300">
                {t('importsForm.syncedProductsBadge', {
                  count: catalogProductsCount,
                })}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('importsForm.pageSubtitle')}
            </p>
          </div>
        </div>

        {activeTab === 'CREATE' && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onResetForm}
            className="h-8 gap-1.5 px-3 text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {t('importsForm.resetFormBtn')}
          </Button>
        )}
      </div>

      {/* Banner thông báo khi đang mở 1 bản lưu tạm */}
      {activeTab === 'CREATE' && editingDraftId && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <FileClock className="h-4 w-4 text-amber-600" />
            <span>
              {t('importsForm.editingDraftBanner', {
                code: receiptNumber,
              })}
            </span>
          </div>
          <button
            type="button"
            onClick={onResetForm}
            className="inline-flex items-center gap-1 rounded bg-white/80 px-2 py-0.5 text-[11px] font-semibold text-amber-800 hover:bg-white dark:bg-slate-800 dark:text-amber-300"
          >
            <X className="h-3 w-3" />
            {t('importsForm.exitDraftEditBtn')}
          </button>
        </div>
      )}
    </div>
  );
}
