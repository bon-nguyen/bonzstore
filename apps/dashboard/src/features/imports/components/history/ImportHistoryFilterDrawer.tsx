import { RotateCcw } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Drawer } from '../../../../components/ui/drawer';
import { cn } from '../../../../lib/utils';
import {
  DatePresetType,
  DateRangeFilterSection,
} from '../../../shared/DateRangeFilterSection';

export type PaymentFilterType = 'ALL' | 'CASH' | 'CARD' | 'TRANSFER';
export type DebtFilterType = 'ALL' | 'PAID' | 'DEBT';

export interface ImportHistoryFilterDrawerProps {
  open: boolean;
  activeFilterCount: number;
  datePreset: DatePresetType;
  startDate: string;
  endDate: string;
  logisticsFilter: string;
  logisticsList: string[];
  paymentFilter: PaymentFilterType;
  debtFilter: DebtFilterType;
  onClose: () => void;
  onResetAllFilters: () => void;
  onSelectDatePreset: (preset: DatePresetType) => void;
  onChangeStartDate: (val: string) => void;
  onChangeEndDate: (val: string) => void;
  onChangeLogisticsFilter: (val: string) => void;
  onChangePaymentFilter: (val: PaymentFilterType) => void;
  onChangeDebtFilter: (val: DebtFilterType) => void;
}

export function ImportHistoryFilterDrawer({
  open,
  activeFilterCount,
  datePreset,
  startDate,
  endDate,
  logisticsFilter,
  logisticsList,
  paymentFilter,
  debtFilter,
  onClose,
  onResetAllFilters,
  onSelectDatePreset,
  onChangeStartDate,
  onChangeEndDate,
  onChangeLogisticsFilter,
  onChangePaymentFilter,
  onChangeDebtFilter,
}: ImportHistoryFilterDrawerProps) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      size="md"
      title="Bộ lọc Lịch sử Nhập hàng"
      subtitle="Lọc phiếu nhập hàng và tính tổng theo khoảng thời gian, đơn vị Logistics, kênh thanh toán & công nợ"
      headerBadge={
        activeFilterCount > 0 ? (
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
            {activeFilterCount} đang chọn
          </span>
        ) : null
      }
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onResetAllFilters}
            leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
          >
            Đặt lại mặc định
          </Button>
          <Button
            type="button"
            onClick={onClose}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            Áp dụng & Đóng
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* 1. Bộ lọc Thời gian tái sử dụng từ DateRangeFilterSection */}
        <DateRangeFilterSection
          title="Khoảng thời gian nhập hàng"
          datePreset={datePreset}
          startDate={startDate}
          endDate={endDate}
          onSelectPreset={onSelectDatePreset}
          onChangeStartDate={onChangeStartDate}
          onChangeEndDate={onChangeEndDate}
        />

        {/* 2. Đơn vị Logistics (Nhà phân phối) */}
        <div className="space-y-2 border-t border-border pt-4">
          <label className="block text-xs font-bold tracking-wider text-foreground uppercase">
            Đơn vị Logistics (Nhà phân phối)
          </label>
          <select
            value={logisticsFilter}
            onChange={(e) => onChangeLogisticsFilter(e.target.value)}
            className="h-9 w-full rounded-lg border border-slate-300 bg-background px-3 text-xs font-medium text-foreground focus:border-emerald-600 focus:outline-none dark:border-zinc-700"
          >
            <option value="ALL">Tất cả Đơn vị Logistics</option>
            {logisticsList.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Hình thức thanh toán */}
        <div className="space-y-2 border-t border-border pt-4">
          <label className="block text-xs font-bold tracking-wider text-foreground uppercase">
            Hình thức thanh toán
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {(
              [
                { key: 'ALL', label: 'Tất cả' },
                { key: 'CASH', label: 'Tiền mặt' },
                { key: 'CARD', label: 'Thẻ' },
                { key: 'TRANSFER', label: 'CK' },
              ] as const
            ).map((pm) => (
              <button
                key={pm.key}
                type="button"
                onClick={() => onChangePaymentFilter(pm.key)}
                className={cn(
                  'rounded-lg border px-2.5 py-2 text-center text-xs font-semibold transition-colors',
                  paymentFilter === pm.key
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:border-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-300'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                {pm.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Trạng thái công nợ */}
        <div className="space-y-2 border-t border-border pt-4">
          <label className="block text-xs font-bold tracking-wider text-foreground uppercase">
            Trạng thái công nợ nhà cung cấp
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { key: 'ALL', label: 'Tất cả' },
                { key: 'PAID', label: 'Đã trả đủ' },
                { key: 'DEBT', label: 'Còn nợ NCC' },
              ] as const
            ).map((df) => (
              <button
                key={df.key}
                type="button"
                onClick={() => onChangeDebtFilter(df.key)}
                className={cn(
                  'rounded-lg border px-2.5 py-2 text-center text-xs font-semibold transition-colors',
                  debtFilter === df.key
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:border-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-300'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                {df.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  );
}

