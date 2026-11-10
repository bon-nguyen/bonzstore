import {
  AlertCircle,
  Coins,
  FileCheck2,
  FileClock,
  Wallet,
} from 'lucide-react';
import { Skeleton } from '../../../../components/ui/skeleton';
import { formatCurrencyVND } from '../../../../lib/utils';
import { useI18n } from '../../../i18n/I18nContext';

export interface ImportHistoryComputedStats {
  count: number;
  totalValue: number;
  totalPaid: number;
  totalDebt: number;
  totalQuantity: number;
  totalItemsLines: number;
  totalCny: number;
}

export interface ImportHistoryStatsCardsProps {
  mode: 'HISTORY' | 'DRAFTS';
  stats: ImportHistoryComputedStats;
  activeTimeLabel: string;
  isBusy: boolean;
}

export function ImportHistoryStatsCards({
  mode,
  stats,
  activeTimeLabel,
  isBusy,
}: ImportHistoryStatsCardsProps) {
  const { t } = useI18n();

  if (mode === 'HISTORY') {
    return (
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="stat-card rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {t('importsForm.statTotalReceipts')}
            </span>
            <FileCheck2 className="h-4 w-4 text-emerald-600" />
          </div>
          {isBusy ? (
            <div className="mt-2 space-y-1.5">
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-28" />
            </div>
          ) : (
            <>
              <div className="mt-2 font-mono text-2xl font-extrabold text-slate-900 dark:text-slate-100">
                {stats.count.toLocaleString('vi-VN')}
              </div>
              <div className="mt-0.5 text-[11px] text-slate-400">
                Tổng SL: {stats.totalQuantity.toLocaleString('vi-VN')} SP •{' '}
                {activeTimeLabel}
              </div>
            </>
          )}
        </div>

        <div className="stat-card rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {t('importsForm.statTotalImportValue')}
            </span>
            <Coins className="h-4 w-4 text-amber-500" />
          </div>
          {isBusy ? (
            <div className="mt-2 space-y-1.5">
              <Skeleton className="h-7 w-36" />
              <Skeleton className="h-3 w-24" />
            </div>
          ) : (
            <>
              <div className="mt-2 font-mono text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {formatCurrencyVND(stats.totalValue)}
              </div>
              <div className="mt-0.5 font-mono text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                ≈{' '}
                {stats.totalCny.toLocaleString('vi-VN', {
                  maximumFractionDigits: 2,
                })}{' '}
                ¥ (Tệ)
              </div>
            </>
          )}
        </div>

        <div className="stat-card rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {t('importsForm.statTotalPaid')}
            </span>
            <Wallet className="h-4 w-4 text-blue-600" />
          </div>
          {isBusy ? (
            <div className="mt-2 space-y-1.5">
              <Skeleton className="h-7 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          ) : (
            <>
              <div className="mt-2 font-mono text-xl font-extrabold text-blue-600 dark:text-blue-400">
                {formatCurrencyVND(stats.totalPaid)}
              </div>
              <div className="mt-0.5 text-[11px] text-slate-400">
                Theo mốc: {activeTimeLabel}
              </div>
            </>
          )}
        </div>

        <div className="stat-card rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {t('importsForm.statTotalDebt')}
            </span>
            <AlertCircle className="h-4 w-4 text-rose-500" />
          </div>
          {isBusy ? (
            <div className="mt-2 space-y-1.5">
              <Skeleton className="h-7 w-28" />
              <Skeleton className="h-3 w-24" />
            </div>
          ) : (
            <>
              <div className="mt-2 font-mono text-xl font-extrabold text-rose-600 dark:text-rose-400">
                {formatCurrencyVND(stats.totalDebt)}
              </div>
              <div className="mt-0.5 text-[11px] text-slate-400">
                Theo mốc: {activeTimeLabel}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="stat-card rounded-xl border border-amber-200 bg-amber-50/40 p-4 shadow-xs dark:border-amber-900/50 dark:bg-amber-950/20">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
            {t('importsForm.statTotalDrafts')}
          </span>
          <FileClock className="h-4 w-4 text-amber-600" />
        </div>
        {isBusy ? (
          <div className="mt-2 space-y-1.5">
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-3 w-28" />
          </div>
        ) : (
          <>
            <div className="mt-2 font-mono text-2xl font-extrabold text-amber-900 dark:text-amber-200">
              {stats.count.toLocaleString('vi-VN')}
            </div>
            <div className="mt-0.5 text-[11px] text-amber-700/80 dark:text-amber-300/80">
              Tổng SL: {stats.totalQuantity.toLocaleString('vi-VN')} SP •{' '}
              {activeTimeLabel}
            </div>
          </>
        )}
      </div>

      <div className="stat-card rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">
            {t('importsForm.statTotalDraftValue')}
          </span>
          <Coins className="h-4 w-4 text-emerald-600" />
        </div>
        {isBusy ? (
          <div className="mt-2 space-y-1.5">
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
        ) : (
          <>
            <div className="mt-2 font-mono text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {formatCurrencyVND(stats.totalValue)}
            </div>
            <div className="mt-0.5 font-mono text-[11px] font-semibold text-amber-600">
              ≈{' '}
              {stats.totalCny.toLocaleString('vi-VN', {
                maximumFractionDigits: 2,
              })}{' '}
              ¥ (Tệ)
            </div>
          </>
        )}
      </div>

      <div className="stat-card rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">
            Dự kiến công nợ khi nhập kho
          </span>
          <AlertCircle className="h-4 w-4 text-rose-500" />
        </div>
        {isBusy ? (
          <div className="mt-2 space-y-1.5">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        ) : (
          <>
            <div className="mt-2 font-mono text-xl font-extrabold text-rose-600 dark:text-rose-400">
              {formatCurrencyVND(stats.totalDebt)}
            </div>
            <div className="mt-0.5 text-[11px] text-slate-400">
              Theo mốc: {activeTimeLabel}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
