import { ArrowDownLeft, ArrowUpRight, Pencil, Wallet } from 'lucide-react';
import { CashbookSummaryReport } from '../../../api/types/cashbook.types';
import { useI18n } from '../../i18n/I18nContext';

interface CashbookSummaryCardsProps {
  summary: CashbookSummaryReport;
  canManage: boolean;
  onEditOpeningBalance: () => void;
}

function formatVND(val: number): string {
  return `${Math.round(val || 0).toLocaleString('vi-VN')}₫`;
}

export function CashbookSummaryCards({
  summary,
  canManage,
  onEditOpeningBalance,
}: CashbookSummaryCardsProps) {
  const { t } = useI18n();

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      {/* 1. ĐẦU KỲ */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-500/15 text-slate-600 dark:text-slate-300">
              <Wallet className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t('cashbook.openingBalanceTitle')}
              </p>
              <p className="font-mono text-lg font-bold text-foreground">
                {formatVND(summary.openingBalance.total)}
              </p>
            </div>
          </div>
          {canManage && (
            <button
              type="button"
              onClick={onEditOpeningBalance}
              className="rounded-lg border border-border px-2 py-1 text-[10px] font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title={t('cashbook.editOpeningBalanceBtn')}
            >
              <Pencil className="mr-1 inline h-3 w-3" />
              {t('cashbook.openingBalanceBadge')}
            </button>
          )}
        </div>
        <div className="mt-3 space-y-1 border-t border-border/60 pt-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              {t('cashbook.channelCash')}
            </span>
            <span className="font-mono font-semibold text-foreground">
              {formatVND(summary.openingBalance.cash)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              {t('cashbook.channelCard')}
            </span>
            <span className="font-mono font-semibold text-foreground">
              {formatVND(summary.openingBalance.card)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              {t('cashbook.channelTransfer')}
            </span>
            <span className="font-mono font-semibold text-foreground">
              {formatVND(summary.openingBalance.transfer)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. TỔNG THU */}
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                {t('cashbook.totalIncomeTitle', {
                  count: summary.voucherCounts.incomeCount,
                })}
              </p>
              <p className="font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400">
                +{formatVND(summary.totalIncome.total)}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
            {t('cashbook.totalIncomeBadge')}
          </span>
        </div>
        <div className="mt-3 space-y-1 border-t border-emerald-500/20 pt-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              {t('cashbook.channelPlusCash')}
            </span>
            <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
              +{formatVND(summary.totalIncome.cash)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              {t('cashbook.channelPlusCard')}
            </span>
            <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
              +{formatVND(summary.totalIncome.card)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              {t('cashbook.channelPlusTransfer')}
            </span>
            <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
              +{formatVND(summary.totalIncome.transfer)}
            </span>
          </div>
        </div>
      </div>

      {/* 3. TỔNG CHI */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <ArrowUpRight className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                {t('cashbook.totalExpenseTitle', {
                  count: summary.voucherCounts.expenseCount,
                })}
              </p>
              <p className="font-mono text-lg font-bold text-amber-600 dark:text-amber-400">
                -{formatVND(summary.totalExpense.total)}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
            {t('cashbook.totalExpenseBadge')}
          </span>
        </div>
        <div className="mt-3 space-y-1 border-t border-amber-500/20 pt-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              {t('cashbook.channelPlusCash')}
            </span>
            <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
              {formatVND(summary.totalExpense.cash)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              {t('cashbook.channelPlusCard')}
            </span>
            <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
              {formatVND(summary.totalExpense.card)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              {t('cashbook.channelPlusTransfer')}
            </span>
            <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
              {formatVND(summary.totalExpense.transfer)}
            </span>
          </div>
        </div>
      </div>

      {/* 4. CUỐI KỲ */}
      <div className="rounded-xl border border-primary/40 bg-primary/10 p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/25 text-foreground dark:text-primary">
              <Wallet className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t('cashbook.closingBalanceTitle')}
              </p>
              <p className="font-mono text-lg font-bold text-foreground dark:text-primary">
                {formatVND(summary.closingBalance.total)}
              </p>
            </div>
          </div>
          <span className="rounded-full bg-primary/25 px-2 py-0.5 text-[10px] font-bold text-foreground dark:text-primary">
            {t('cashbook.closingBalanceBadge')}
          </span>
        </div>
        <div className="mt-3 space-y-1 border-t border-primary/25 pt-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              {t('cashbook.channelCash')}
            </span>
            <span className="font-mono font-semibold text-foreground">
              {formatVND(summary.closingBalance.cash)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              {t('cashbook.channelCard')}
            </span>
            <span className="font-mono font-semibold text-foreground">
              {formatVND(summary.closingBalance.card)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              {t('cashbook.channelTransfer')}
            </span>
            <span className="font-mono font-semibold text-foreground">
              {formatVND(summary.closingBalance.transfer)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

