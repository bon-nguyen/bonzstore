import {
  CheckCircle2,
  Edit3,
  FileClock,
  Package,
  Trash2,
  Truck,
  UserCheck,
} from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Skeleton } from '../../../../components/ui/skeleton';
import { AntdEmptyBoxIcon } from '../../../../components/ui/table';
import { cn, formatCurrencyVND } from '../../../../lib/utils';
import { useI18n } from '../../../i18n/I18nContext';
import {
  SavedImportReceiptRecord,
  formatVnDateDisplay,
} from '../ImportFormTypes';
import { ImportHistoryComputedStats } from './ImportHistoryStatsCards';

export interface ImportHistoryTableProps {
  mode: 'HISTORY' | 'DRAFTS';
  records: SavedImportReceiptRecord[];
  stats: ImportHistoryComputedStats;
  activeTimeLabel: string;
  isBusy: boolean;
  onResumeRecord: (record: SavedImportReceiptRecord) => void;
  onFinalizeDraft?: (record: SavedImportReceiptRecord) => void;
  onDeleteRecord: (id: string) => void;
}

export function ImportHistoryTable({
  mode,
  records,
  stats,
  activeTimeLabel,
  isBusy,
  onResumeRecord,
  onFinalizeDraft,
  onDeleteRecord,
}: ImportHistoryTableProps) {
  const { t } = useI18n();

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1150px] border-collapse text-left text-xs">
          <thead>
            <tr
              className={cn(
                'text-white',
                mode === 'DRAFTS' ? 'bg-amber-600' : 'bg-emerald-600',
              )}
            >
              <th className="w-12 border-r border-white/20 px-2.5 py-3 text-center font-semibold">
                STT
              </th>
              <th className="w-40 border-r border-white/20 px-3 py-3 font-semibold">
                {t('importsForm.colReceiptCode')}
              </th>
              <th className="w-32 border-r border-white/20 px-3 py-3 font-semibold">
                {t('importsForm.colImportDate')}
              </th>
              <th className="min-w-[200px] border-r border-white/20 px-3 py-3 font-semibold">
                {t('importsForm.colLogistics')}
              </th>
              <th className="w-44 border-r border-white/20 px-3 py-3 font-semibold">
                {t('importsForm.colStaff')}
              </th>
              <th className="min-w-[240px] border-r border-white/20 px-3 py-3 font-semibold">
                {t('importsForm.colItemsCount')}
              </th>
              <th className="w-32 border-r border-white/20 px-3 py-3 text-right font-semibold">
                {t('importsForm.colExchangeRate')}
              </th>
              <th className="w-40 border-r border-white/20 px-3 py-3 text-right font-semibold">
                {t('importsForm.colTotalPayable')}
              </th>
              <th className="w-44 border-r border-white/20 px-3 py-3 text-right font-semibold">
                {t('importsForm.colPaidAndDebt')}
              </th>
              <th className="w-32 border-r border-white/20 px-3 py-3 text-center font-semibold">
                {t('importsForm.colStatus')}
              </th>
              <th className="w-44 px-3 py-3 text-right font-semibold">#</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {isBusy ? (
              Array.from({ length: 4 }).map((_, sIdx) => (
                <tr key={`skeleton-${sIdx}`}>
                  <td className="border-r border-slate-100 px-2.5 py-3.5 text-center dark:border-slate-800">
                    <Skeleton className="mx-auto h-4 w-5" />
                  </td>
                  <td className="border-r border-slate-100 px-3 py-3.5 dark:border-slate-800">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="mt-1.5 h-3 w-20" />
                  </td>
                  <td className="border-r border-slate-100 px-3 py-3.5 dark:border-slate-800">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="mt-1.5 h-3 w-12" />
                  </td>
                  <td className="border-r border-slate-100 px-3 py-3.5 dark:border-slate-800">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="mt-1.5 h-3 w-44" />
                  </td>
                  <td className="border-r border-slate-100 px-3 py-3.5 dark:border-slate-800">
                    <Skeleton className="h-4 w-32" />
                  </td>
                  <td className="border-r border-slate-100 px-3 py-3.5 dark:border-slate-800">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="mt-1.5 h-3 w-48" />
                  </td>
                  <td className="border-r border-slate-100 px-3 py-3.5 text-right dark:border-slate-800">
                    <Skeleton className="ml-auto h-4 w-16" />
                    <Skeleton className="mt-1.5 ml-auto h-3 w-20" />
                  </td>
                  <td className="border-r border-slate-100 px-3 py-3.5 text-right dark:border-slate-800">
                    <Skeleton className="ml-auto h-4 w-24" />
                    <Skeleton className="mt-1.5 ml-auto h-3 w-16" />
                  </td>
                  <td className="border-r border-slate-100 px-3 py-3.5 text-right dark:border-slate-800">
                    <Skeleton className="ml-auto h-4 w-28" />
                    <Skeleton className="mt-1.5 ml-auto h-3 w-20" />
                  </td>
                  <td className="border-r border-slate-100 px-3 py-3.5 text-center dark:border-slate-800">
                    <Skeleton className="mx-auto h-5 w-20 rounded-full" />
                  </td>
                  <td className="px-3 py-3.5 text-right">
                    <div className="flex justify-end gap-1.5">
                      <Skeleton className="h-7 w-20 rounded" />
                      <Skeleton className="h-7 w-7 rounded" />
                    </div>
                  </td>
                </tr>
              ))
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-6 py-14 text-center">
                  <div className="mx-auto flex max-w-md flex-col items-center justify-center space-y-2.5">
                    <AntdEmptyBoxIcon className="h-14 w-14 opacity-75" />
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {mode === 'DRAFTS'
                        ? t('importsForm.draftEmptyTitle')
                        : t('importsForm.historyEmptyTitle')}
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {mode === 'DRAFTS'
                        ? t('importsForm.draftEmptyDesc')
                        : t('importsForm.historyEmptyDesc')}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              records.map((rec, idx) => {
                const totalQty = rec.items.reduce(
                  (s, i) => s + i.quantity,
                  0,
                );
                const totalCny = rec.items.reduce(
                  (s, i) =>
                    s + (i.isGift ? 0 : i.quantity * (i.cnyUnitPrice || 0)),
                  0,
                );
                const rate = rec.exchangeRateCny || 3790;

                return (
                  <tr
                    key={rec.id}
                    className="table-row-interactive transition hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                  >
                    <td className="border-r border-slate-100 px-2.5 py-3 text-center font-semibold text-slate-500 dark:border-slate-800">
                      {idx + 1}
                    </td>

                    {/* Mã phiếu & Số hóa đơn */}
                    <td className="border-r border-slate-100 px-3 py-3 dark:border-slate-800">
                      <div className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        {rec.receiptNumber}
                      </div>
                      {rec.invoiceNumber && (
                        <div className="mt-0.5 text-[11px] text-slate-500">
                          HĐ: {rec.invoiceNumber}
                        </div>
                      )}
                    </td>

                    {/* Ngày nhập */}
                    <td className="border-r border-slate-100 px-3 py-3 dark:border-slate-800">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {formatVnDateDisplay(rec.importDate)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(
                          rec.updatedAt || rec.createdAt,
                        ).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>

                    {/* Đơn vị Logistics */}
                    <td className="border-r border-slate-100 px-3 py-3 dark:border-slate-800">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100">
                        <Truck className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        <span>{rec.logisticsUnitName}</span>
                      </div>
                      {rec.description && (
                        <div className="mt-0.5 line-clamp-1 text-[11px] text-slate-500">
                          {rec.description}
                        </div>
                      )}
                    </td>

                    {/* Người nhập */}
                    <td className="border-r border-slate-100 px-3 py-3 dark:border-slate-800">
                      <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
                        <UserCheck className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span>{rec.staffName}</span>
                      </div>
                    </td>

                    {/* Mặt hàng / SL */}
                    <td className="border-r border-slate-100 px-3 py-3 dark:border-slate-800">
                      <div className="font-semibold text-slate-800 dark:text-slate-100">
                        {rec.items.length} mặt hàng • Tổng SL:{' '}
                        <span className="font-mono text-emerald-600">
                          {totalQty.toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <div className="mt-1 space-y-0.5">
                        {rec.items.slice(0, 2).map((item) => (
                          <div
                            key={item.lineId}
                            className="flex items-center justify-between gap-2 text-[11px] text-slate-500"
                          >
                            <span className="truncate">
                              • {item.itemName || item.itemCode} (x
                              {item.quantity.toLocaleString('vi-VN')})
                            </span>
                            <span className="shrink-0 font-mono text-[10px] text-amber-600">
                              {(item.cnyUnitPrice || 0) > 0
                                ? `${item.cnyUnitPrice.toLocaleString('vi-VN')} ¥`
                                : formatCurrencyVND(item.unitPrice)}
                            </span>
                          </div>
                        ))}
                        {rec.items.length > 2 && (
                          <div className="text-[10px] italic text-slate-400">
                            + {rec.items.length - 2} mặt hàng khác...
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Tỷ giá */}
                    <td className="border-r border-slate-100 px-3 py-3 text-right font-mono dark:border-slate-800">
                      <div className="font-bold text-amber-700 dark:text-amber-400">
                        {rate.toLocaleString('vi-VN')} ₫/¥
                      </div>
                      {totalCny > 0 && (
                        <div className="text-[10px] text-slate-500">
                          Tổng vốn:{' '}
                          {totalCny.toLocaleString('vi-VN', {
                            maximumFractionDigits: 2,
                          })}{' '}
                          ¥
                        </div>
                      )}
                    </td>

                    {/* Tổng thanh toán */}
                    <td className="border-r border-slate-100 px-3 py-3 text-right dark:border-slate-800">
                      <div className="font-mono text-sm font-bold text-emerald-700 dark:text-emerald-400">
                        {formatCurrencyVND(rec.totalPayable)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {rec.paymentMethod === 'CASH'
                          ? t('importsForm.paymentCash')
                          : t('importsForm.paymentTransfer')}
                      </div>
                    </td>

                    {/* Thực trả / Công nợ */}
                    <td className="border-r border-slate-100 px-3 py-3 text-right dark:border-slate-800">
                      <div className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                        Đã trả: {formatCurrencyVND(rec.amountPaid)}
                      </div>
                      <div
                        className={cn(
                          'mt-0.5 text-[11px] font-bold',
                          rec.debtRemaining > 0
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-emerald-600 dark:text-emerald-400',
                        )}
                      >
                        {rec.debtRemaining > 0
                          ? `Nợ: ${formatCurrencyVND(rec.debtRemaining)}`
                          : t('importsForm.paidInFullValue')}
                      </div>
                    </td>

                    {/* Trạng thái */}
                    <td className="border-r border-slate-100 px-3 py-3 text-center dark:border-slate-800">
                      {rec.status === 'DRAFT' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-950/70 dark:text-amber-300">
                          <FileClock className="h-3 w-3" />
                          {t('importsForm.statusDraft')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" />
                          {t('importsForm.statusCompleted')}
                        </span>
                      )}
                    </td>

                    {/* Thao tác */}
                    <td className="px-3 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => onResumeRecord(rec)}
                          className="h-7 gap-1 px-2 text-[11px] font-semibold"
                        >
                          <Edit3 className="h-3 w-3 text-emerald-600" />
                          {rec.status === 'DRAFT'
                            ? t('importsForm.resumeDraftBtn')
                            : t('importsForm.viewOrEditReceiptBtn')}
                        </Button>

                        {rec.status === 'DRAFT' && onFinalizeDraft && (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => onFinalizeDraft(rec)}
                            className="h-7 gap-1 bg-emerald-600 px-2 text-[11px] font-semibold text-white hover:bg-emerald-700"
                          >
                            <Package className="h-3 w-3" />
                            {t('importsForm.finalizeDraftBtn')}
                          </Button>
                        )}

                        <button
                          type="button"
                          onClick={() => onDeleteRecord(rec.id)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded border border-slate-200 text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-slate-700 dark:hover:bg-red-950/50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Dòng Tổng cộng các cột đi theo đúng mốc thời gian được filter */}
          {records.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-emerald-600/30 bg-emerald-50/70 font-bold text-slate-900 dark:border-emerald-500/30 dark:bg-emerald-950/30 dark:text-slate-100">
                <td
                  colSpan={5}
                  className="border-r border-slate-200 px-3 py-3 text-right text-xs uppercase dark:border-slate-800"
                >
                  Tổng cộng theo bộ lọc ({activeTimeLabel} • {stats.count}{' '}
                  phiếu):
                </td>
                <td className="border-r border-slate-200 px-3 py-3 dark:border-slate-800">
                  {isBusy ? (
                    <Skeleton className="h-4 w-36" />
                  ) : (
                    <span>
                      {stats.totalItemsLines.toLocaleString('vi-VN')} dòng hàng
                      • Tổng SL:{' '}
                      <span className="font-mono text-emerald-700 dark:text-emerald-400">
                        {stats.totalQuantity.toLocaleString('vi-VN')}
                      </span>
                    </span>
                  )}
                </td>
                <td className="border-r border-slate-200 px-3 py-3 text-right font-mono text-amber-700 dark:border-slate-800 dark:text-amber-400">
                  {isBusy ? (
                    <Skeleton className="ml-auto h-4 w-20" />
                  ) : (
                    <span>
                      {stats.totalCny.toLocaleString('vi-VN', {
                        maximumFractionDigits: 2,
                      })}{' '}
                      ¥
                    </span>
                  )}
                </td>
                <td className="border-r border-slate-200 px-3 py-3 text-right font-mono text-sm text-emerald-700 dark:border-slate-800 dark:text-emerald-400">
                  {isBusy ? (
                    <Skeleton className="ml-auto h-4 w-24" />
                  ) : (
                    formatCurrencyVND(stats.totalValue)
                  )}
                </td>
                <td className="border-r border-slate-200 px-3 py-3 text-right font-mono dark:border-slate-800">
                  {isBusy ? (
                    <Skeleton className="ml-auto h-4 w-28" />
                  ) : (
                    <div>
                      <div className="text-blue-700 dark:text-blue-400">
                        Trả: {formatCurrencyVND(stats.totalPaid)}
                      </div>
                      <div className="text-[11px] text-rose-600 dark:text-rose-400">
                        Nợ: {formatCurrencyVND(stats.totalDebt)}
                      </div>
                    </div>
                  )}
                </td>
                <td colSpan={2} className="px-3 py-3" />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
