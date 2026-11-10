import { useQuery } from '@tanstack/react-query';
import { Calendar, Truck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { useI18n } from '../../i18n/I18nContext';
import {
  DatePresetType,
  computeDatePresetRange,
  formatActiveDateRangeLabel,
} from '../../shared/DateRangeFilterSection';
import {
  ActiveFilterTag,
  SearchFilterToolbar,
} from '../../shared/SearchFilterToolbar';
import { SavedImportReceiptRecord } from './ImportFormTypes';
import {
  DebtFilterType,
  ImportHistoryFilterDrawer,
  PaymentFilterType,
} from './history/ImportHistoryFilterDrawer';
import {
  ImportHistoryComputedStats,
  ImportHistoryStatsCards,
} from './history/ImportHistoryStatsCards';
import { ImportHistoryTable } from './history/ImportHistoryTable';
import { ImportHistoryTabsBar } from './history/ImportHistoryTabsBar';

export interface ImportHistorySectionProps {
  mode: 'HISTORY' | 'DRAFTS';
  completedRecords: SavedImportReceiptRecord[];
  draftRecords: SavedImportReceiptRecord[];
  onModeChange: (nextMode: 'HISTORY' | 'DRAFTS') => void;
  onResumeRecord: (record: SavedImportReceiptRecord) => void;
  onFinalizeDraft?: (record: SavedImportReceiptRecord) => void;
  onDeleteRecord: (id: string) => void;
}

export function ImportHistorySection({
  mode,
  completedRecords,
  draftRecords,
  onModeChange,
  onResumeRecord,
  onFinalizeDraft,
  onDeleteRecord,
}: ImportHistorySectionProps) {
  const { t } = useI18n();

  // Search input + Debounce 350ms để gọi API / Query
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput.trim(), 350);

  // State cho Drawer Bộ lọc
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [datePreset, setDatePreset] = useState<DatePresetType>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [logisticsFilter, setLogisticsFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilterType>('ALL');
  const [debtFilter, setDebtFilter] = useState<DebtFilterType>('ALL');

  const sourceRecords = mode === 'DRAFTS' ? draftRecords : completedRecords;

  const logisticsList = useMemo(() => {
    const all = [...completedRecords, ...draftRecords];
    const set = new Set<string>();
    for (const r of all) {
      if (r.logisticsUnitName?.trim()) {
        set.add(r.logisticsUnitName.trim());
      }
    }
    return Array.from(set);
  }, [completedRecords, draftRecords]);

  const activeFilterCount =
    (startDate || endDate ? 1 : 0) +
    (logisticsFilter !== 'ALL' ? 1 : 0) +
    (paymentFilter !== 'ALL' ? 1 : 0) +
    (debtFilter !== 'ALL' ? 1 : 0);

  const handleSelectDatePreset = (preset: DatePresetType) => {
    setDatePreset(preset);
    const range = computeDatePresetRange(preset);
    setStartDate(range.startDate);
    setEndDate(range.endDate);
  };

  const handleResetAllFilters = () => {
    setDatePreset('ALL');
    setStartDate('');
    setEndDate('');
    setLogisticsFilter('ALL');
    setPaymentFilter('ALL');
    setDebtFilter('ALL');
  };

  // Query dữ liệu có debounce search & filter theo mốc thời gian (hỗ trợ Skeleton mượt mà)
  const {
    data: filteredRecords = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: [
      'imports-history-query',
      mode,
      debouncedSearch,
      startDate,
      endDate,
      logisticsFilter,
      paymentFilter,
      debtFilter,
      sourceRecords,
    ],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 220));
      const q = debouncedSearch.toLowerCase();

      return sourceRecords.filter((rec) => {
        if (startDate && rec.importDate < startDate) return false;
        if (endDate && rec.importDate > endDate) return false;
        if (
          logisticsFilter !== 'ALL' &&
          rec.logisticsUnitName !== logisticsFilter
        ) {
          return false;
        }
        if (paymentFilter !== 'ALL' && rec.paymentMethod !== paymentFilter) {
          return false;
        }
        if (debtFilter === 'PAID' && rec.debtRemaining > 0) return false;
        if (debtFilter === 'DEBT' && rec.debtRemaining <= 0) return false;

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
    },
  });

  // Các cột tổng và thẻ thống kê luôn đi theo đúng mốc thời gian & điều kiện được filter
  const stats = useMemo<ImportHistoryComputedStats>(() => {
    const totalValue = filteredRecords.reduce((s, r) => s + r.totalPayable, 0);
    const totalPaid = filteredRecords.reduce((s, r) => s + r.amountPaid, 0);
    const totalDebt = filteredRecords.reduce((s, r) => s + r.debtRemaining, 0);
    const totalQuantity = filteredRecords.reduce(
      (s, r) =>
        s + r.items.reduce((lineSum, item) => lineSum + item.quantity, 0),
      0,
    );
    const totalItemsLines = filteredRecords.reduce(
      (s, r) => s + r.items.length,
      0,
    );
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
      totalQuantity,
      totalItemsLines,
      totalCny,
    };
  }, [filteredRecords]);

  const isBusy =
    isLoading || isFetching || searchInput.trim() !== debouncedSearch;

  const activeTimeLabel = useMemo(
    () => formatActiveDateRangeLabel(startDate, endDate),
    [startDate, endDate],
  );

  const activeFilterTags = useMemo<ActiveFilterTag[]>(() => {
    const tags: ActiveFilterTag[] = [];
    if (startDate || endDate) {
      tags.push({
        id: 'date',
        label: activeTimeLabel,
        icon: <Calendar className="h-3 w-3" />,
        variant: 'emerald',
        onRemove: () => handleSelectDatePreset('ALL'),
      });
    }
    if (logisticsFilter !== 'ALL') {
      tags.push({
        id: 'logistics',
        label: logisticsFilter,
        icon: <Truck className="h-3 w-3" />,
        variant: 'blue',
        onRemove: () => setLogisticsFilter('ALL'),
      });
    }
    if (paymentFilter !== 'ALL') {
      tags.push({
        id: 'payment',
        label: paymentFilter === 'CASH' ? 'Tiền mặt' : 'Chuyển khoản',
        variant: 'amber',
        onRemove: () => setPaymentFilter('ALL'),
      });
    }
    if (debtFilter !== 'ALL') {
      tags.push({
        id: 'debt',
        label: debtFilter === 'PAID' ? 'Đã thanh toán đủ' : 'Còn nợ NCC',
        variant: 'rose',
        onRemove: () => setDebtFilter('ALL'),
      });
    }
    return tags;
  }, [startDate, endDate, activeTimeLabel, logisticsFilter, paymentFilter, debtFilter]);

  return (
    <div className="space-y-4">
      {/* 1. Thanh 2 Tabs: Lịch sử nhập hàng | Lưu tạm */}
      <ImportHistoryTabsBar
        mode={mode}
        completedCount={completedRecords.length}
        draftCount={draftRecords.length}
        activeTimeLabel={activeTimeLabel}
        onModeChange={onModeChange}
      />

      {/* 2. Thẻ thống kê KPI đi theo mốc thời gian filter */}
      <ImportHistoryStatsCards
        mode={mode}
        stats={stats}
        activeTimeLabel={activeTimeLabel}
        isBusy={isBusy}
      />

      {/* 3. Thanh tìm kiếm có Debounce + Nút mở Drawer Bộ lọc (Tái sử dụng từ SearchFilterToolbar) */}
      <SearchFilterToolbar
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        searchPlaceholder={t('importsForm.historySearchPlaceholder')}
        isBusy={isBusy}
        activeFilterCount={activeFilterCount}
        activeFilterTags={activeFilterTags}
        onOpenFilterDrawer={() => setFilterDrawerOpen(true)}
        onResetAllFilters={handleResetAllFilters}
      />

      {/* 4. Bảng danh sách Lịch sử nhập hàng / Phiếu Lưu tạm kèm dòng Tổng cộng theo mốc thời gian */}
      <ImportHistoryTable
        mode={mode}
        records={filteredRecords}
        stats={stats}
        activeTimeLabel={activeTimeLabel}
        isBusy={isBusy}
        onResumeRecord={onResumeRecord}
        onFinalizeDraft={onFinalizeDraft}
        onDeleteRecord={onDeleteRecord}
      />

      {/* 5. Drawer Bộ lọc Thời gian, Đơn vị Logistics, Kênh thanh toán & Công nợ */}
      <ImportHistoryFilterDrawer
        open={filterDrawerOpen}
        activeFilterCount={activeFilterCount}
        datePreset={datePreset}
        startDate={startDate}
        endDate={endDate}
        logisticsFilter={logisticsFilter}
        logisticsList={logisticsList}
        paymentFilter={paymentFilter}
        debtFilter={debtFilter}
        onClose={() => setFilterDrawerOpen(false)}
        onResetAllFilters={handleResetAllFilters}
        onSelectDatePreset={handleSelectDatePreset}
        onChangeStartDate={(val) => {
          setStartDate(val);
          setDatePreset(val || endDate ? 'CUSTOM' : 'ALL');
        }}
        onChangeEndDate={(val) => {
          setEndDate(val);
          setDatePreset(startDate || val ? 'CUSTOM' : 'ALL');
        }}
        onChangeLogisticsFilter={setLogisticsFilter}
        onChangePaymentFilter={setPaymentFilter}
        onChangeDebtFilter={setDebtFilter}
      />
    </div>
  );
}
