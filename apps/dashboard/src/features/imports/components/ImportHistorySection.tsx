import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Coins,
  Edit3,
  FileCheck2,
  FileClock,
  Package,
  Plus,
  Search,
  Trash2,
  Truck,
  UserCheck,
  Wallet,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { AntdEmptyBoxIcon } from '../../../components/ui/table';
import { cn, formatCurrencyVND } from '../../../lib/utils';
import { useI18n } from '../../i18n/I18nContext';
import {
  SavedImportReceiptRecord,
  formatVnDateDisplay,
} from './ImportFormTypes';

export interface ImportHistorySectionProps {
  mode: 'HISTORY' | 'DRAFTS';
  records: SavedImportReceiptRecord[];
  completedCount?: number;
  draftCount?: number;
  onModeChange?: (nextMode: 'HISTORY' | 'DRAFTS') => void;
  onSwitchToCreate: () => void;
  onResumeRecord: (record: SavedImportReceiptRecord) => void;
  onFinalizeDraft?: (record: SavedImportReceiptRecord) => void;
  onDeleteRecord: (id: string) => void;
}

export function ImportHistorySection({
  mode,
  records,
  completedCount = 0,
  draftCount = 0,
  onModeChange,
  onSwitchToCreate,
  onResumeRecord,
  onFinalizeDraft,
  onDeleteRecord,
}: ImportHistorySectionProps) {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const filteredRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return records.filter((rec) => {
      if (dateFilter && rec.importDate !== dateFilter) return false;
      if (!q) return true;
      const inHeader =
        rec.receiptNumber.toLowerCase().includes(q) ||
        rec.logisticsUnitName.toLowerCase().includes(q) ||
        rec.invoiceNumber.toLowerCase().includes(q) ||
        rec.staffName.toLowerCase().includes(q) ||
        rec.description.toLowerCase().includes(q);
      if (inHeader) return true;
      return rec.items.some(
        (item) =>
          item.itemName.toLowerCase().includes(q) ||
          item.itemCode.toLowerCase().includes(q),
      );
    });
  }, [records, searchQuery, dateFilter]);

  const stats = useMemo(() => {
    const totalValue = filteredRecords.reduce((s, r) => s + r.totalPayable, 0);
    const totalPaid = filteredRecords.reduce((s, r) => s + r.amountPaid, 0);
    const totalDebt = filteredRecords.reduce((s, r) => s + r.debtRemaining, 0);
    const totalCny = filteredRecords.reduce(
      (s, r) =>
        s +
        r.items.reduce(
          (lineSum, item) =>
            lineSum +
            (item.isGift ? 0 : item.quantity * (item.cnyUnitPrice || 0)),
          0,
        ),
      0,
    );
    return {
      count: filteredRecords.length,
      totalValue,
      totalPaid,
      totalDebt,
      totalCny,
    };
  }, [filteredRecords]);

  return (
    <div className="space-y-4">
      {/* Thanh chuyển đổi 2 Tab trong Trang Lịch sử nhập hàng: Đã nhập kho | Tab Lưu tạm */}
      {onModeChange && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onModeChange('HISTORY')}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition',
                mode === 'HISTORY'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300',
              )}
            >
              <FileCheck2 className="h-4 w-4" />
              <span>Phiếu đã nhập kho</span>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 font-mono text-[11px]',
                  mode === 'HISTORY'
                    ? 'bg-white/20 text-white'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
                )}
              >
                {completedCount.toLocaleString('vi-VN')}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onModeChange('DRAFTS')}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition',
                mode === 'DRAFTS'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300',
              )}
            >
              <FileClock className="h-4 w-4" />
              <span>Tab Lưu tạm (Nháp)</span>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 font-mono text-[11px]',
                  mode === 'DRAFTS'
                    ? 'bg-white/20 text-white'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
                )}
              >
                {draftCount.toLocaleString('vi-VN')}
              </span>
            </button>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={onSwitchToCreate}
            className="gap-1.5 bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            <Plus className="h-3.5 w-3.5" />
            {t('importsForm.tabCreateReceipt')}
          </Button>
        </div>
      )}

      {/* Thẻ thống kê tổng quan */}
      {mode === 'HISTORY' ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="stat-card rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                {t('importsForm.statTotalReceipts')}
              </span>
              <FileCheck2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 font-mono text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {stats.count.toLocaleString('vi-VN')}
            </div>
          </div>

          <div className="stat-card rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                {t('importsForm.statTotalImportValue')}
              </span>
              <Coins className="h-4 w-4 text-amber-500" />
            </div>
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
          </div>

          <div className="stat-card rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                {t('importsForm.statTotalPaid')}
              </span>
              <Wallet className="h-4 w-4 text-blue-600" />
            </div>
            <div className="mt-2 font-mono text-xl font-extrabold text-blue-600 dark:text-blue-400">
              {formatCurrencyVND(stats.totalPaid)}
            </div>
          </div>

          <div className="stat-card rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                {t('importsForm.statTotalDebt')}
              </span>
              <AlertCircle className="h-4 w-4 text-rose-500" />
            </div>
            <div className="mt-2 font-mono text-xl font-extrabold text-rose-600 dark:text-rose-400">
              {formatCurrencyVND(stats.totalDebt)}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="stat-card rounded-xl border border-amber-200 bg-amber-50/40 p-4 shadow-xs dark:border-amber-900/50 dark:bg-amber-950/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                {t('importsForm.statTotalDrafts')}
              </span>
              <FileClock className="h-4 w-4 text-amber-600" />
            </div>
            <div className="mt-2 font-mono text-2xl font-extrabold text-amber-900 dark:text-amber-200">
              {stats.count.toLocaleString('vi-VN')}
            </div>
          </div>

          <div className="stat-card rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">
                {t('importsForm.statTotalDraftValue')}
              </span>
              <Coins className="h-4 w-4 text-emerald-600" />
            </div>
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
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                {t('importsForm.tabCreateReceipt')}
              </div>
              <p className="mt-0.5 text-[11px] text-slate-500">
                Tạo mới phiếu nhập hoặc chọn 1 bản lưu tạm bên dưới để làm tiếp
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              onClick={onSwitchToCreate}
              className="bg-emerald-600 text-xs text-white hover:bg-emerald-700"
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Lập phiếu mới
            </Button>
          </div>
        </div>
      )}

      {/* Thanh tìm kiếm & lọc theo ngày */}
      <div className="flex flex-col gap-2.5 rounded-xl border border-slate-200 bg-white p-3 shadow-xs sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-1 items-center gap-2">
          <div className="flex-1">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('importsForm.historySearchPlaceholder')}
              leftIcon={<Search className="h-4 w-4 text-slate-400" />}
            />
          </div>
          <div className="w-44">
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              leftIcon={<Calendar className="h-4 w-4 text-emerald-600" />}
            />
          </div>
          {(searchQuery || dateFilter) && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setDateFilter('');
              }}
              className="text-xs"
            >
              Xóa lọc
            </Button>
          )}
        </div>

        <Button
          type="button"
          size="sm"
          onClick={onSwitchToCreate}
          className="gap-1.5 bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          {t('importsForm.tabCreateReceipt')}
        </Button>
      </div>

      {/* Bảng danh sách Lịch sử nhập hàng / Phiếu Lưu tạm */}
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
              {filteredRecords.length === 0 ? (
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
                      <Button
                        type="button"
                        size="sm"
                        onClick={onSwitchToCreate}
                        className="mt-1 bg-emerald-600 text-xs text-white hover:bg-emerald-700"
                      >
                        <Plus className="mr-1 h-3.5 w-3.5" />
                        {t('importsForm.tabCreateReceipt')}
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec, idx) => {
                  const totalQty = rec.items.reduce(
                    (s, i) => s + i.quantity,
                    0,
                  );
                  const totalCny = rec.items.reduce(
                    (s, i) =>
                      s +
                      (i.isGift ? 0 : i.quantity * (i.cnyUnitPrice || 0)),
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
          </table>
        </div>
      </div>
    </div>
  );
}

