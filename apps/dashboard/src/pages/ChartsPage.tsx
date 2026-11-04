import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  BarChart3,
  CreditCard,
  Landmark,
  Package,
  PieChart,
  RefreshCw,
  Scale,
  ShoppingBag,
  Trash2,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ADMIN_MANAGER_ROLES,
  PERMISSIONS,
} from '../constants/rbac.constants';
import { PermissionGate } from '../features/auth/components/PermissionGate';
import {
  useCashbookCharts,
  useRestoreCashbookData,
} from '../features/cashbook/hooks/useCashbook';
import { cn } from '../lib/utils';

function formatVND(amount?: number | null): string {
  return `${Number(amount || 0).toLocaleString('vi-VN')}₫`;
}

function formatCompactVND(amount?: number | null): string {
  const val = Number(amount || 0);
  if (Math.abs(val) >= 1_000_000) {
    return `${(val / 1_000_000).toFixed(2)}M₫`;
  }
  if (Math.abs(val) >= 1_000) {
    return `${(val / 1_000).toFixed(0)}K₫`;
  }
  return `${val}₫`;
}

export function ChartsPage() {
  const navigate = useNavigate();
  const { data, isLoading, isFetching, refetch } = useCashbookCharts();
  const restoreMutation = useRestoreCashbookData();

  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);
  const [chartMetricMode, setChartMetricMode] = useState<
    'ALL' | 'CHANNELS_INCOME' | 'CHANNELS_EXPENSE'
  >('ALL');

  const summary = data?.summary;
  const timeline = data?.timelineSeries || [];
  const paymentChannels = data?.paymentChannels || [];
  const incomeByCategory = data?.incomeByCategory || [];
  const expenseByCategory = data?.expenseByCategory || [];
  const orderAnalytics = data?.order55479Analytics;

  const maxBarVal = Math.max(
    1,
    ...timeline.map((pt) => Math.max(pt.income, pt.expense, pt.closingBalance)),
  );

  const activePoint =
    hoveredDayIndex !== null && timeline[hoveredDayIndex]
      ? timeline[hoveredDayIndex]
      : timeline[timeline.length - 1] || null;

  const closingTotal = summary?.closingBalance?.total || 0;
  const cashPct =
    closingTotal > 0
      ? Math.max(0, ((summary?.closingBalance?.cash || 0) / closingTotal) * 100)
      : 0;
  const cardPct =
    closingTotal > 0
      ? Math.max(0, ((summary?.closingBalance?.card || 0) / closingTotal) * 100)
      : 0;
  const transferPct =
    closingTotal > 0 ? Math.max(0, 100 - cashPct - cardPct) : 0;

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <p className="page-subtitle">
            Financial & Import Analytics — Visual BI Dashboard
          </p>
          <h1 className="page-title">Biểu Đồ Dòng Tiền & Phân Tích Nhập Hàng</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Trực quan hóa xu hướng Thu - Chi - Tồn quỹ theo ngày, cơ cấu Tiền mặt / Thẻ / Chuyển khoản và chi phí đơn nhập hàng do bạn thao tác.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/imports')}
            className="action-btn action-btn-secondary"
          >
            <ShoppingBag className="h-4 w-4 text-primary" />
            <span>Quản lý Nhập hàng</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/cashbook')}
            className="action-btn action-btn-secondary"
          >
            <Wallet className="h-4 w-4 text-emerald-500" />
            <span>Sổ Quỹ Thu/Chi</span>
          </button>

          <button
            type="button"
            onClick={() => refetch()}
            className="action-btn action-btn-secondary"
          >
            <RefreshCw
              className={cn('h-4 w-4', isFetching && 'animate-spin')}
            />
            <span>Làm mới</span>
          </button>

          <PermissionGate
            roles={ADMIN_MANAGER_ROLES}
            permission={PERMISSIONS.DASHBOARD_VIEW}
          >
            <button
              type="button"
              onClick={() => restoreMutation.mutate()}
              disabled={restoreMutation.isPending}
              className="action-btn action-btn-secondary text-destructive hover:border-destructive"
            >
              <Trash2
                className={cn(
                  'h-4 w-4',
                  restoreMutation.isPending && 'animate-spin',
                )}
              />
              <span>Xóa trắng dữ liệu</span>
            </button>
          </PermissionGate>
        </div>
      </div>

      {/* 4 Top KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Quỹ Cuối Kỳ Hiện Tại
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-foreground dark:text-primary">
                {formatVND(summary?.closingBalance?.total ?? 0)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Đầu kỳ:{' '}
                <strong>{formatVND(summary?.openingBalance?.total ?? 0)}</strong>
              </p>
            </div>
            <div className="stat-card-icon">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tổng Thu Trong Kỳ
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                +{formatVND(summary?.totalIncome?.total ?? 0)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                TM: {formatCompactVND(summary?.totalIncome?.cash)} • Thẻ:{' '}
                {formatCompactVND(summary?.totalIncome?.card)} • CK:{' '}
                {formatCompactVND(summary?.totalIncome?.transfer)}
              </p>
            </div>
            <div className="stat-card-icon">
              <ArrowUpRight className="h-5 w-5 text-emerald-500" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Tổng Chi Trong Kỳ
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-rose-600 dark:text-rose-400">
                -{formatVND(summary?.totalExpense?.total ?? 0)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                TM: {formatCompactVND(summary?.totalExpense?.cash)} • Thẻ:{' '}
                {formatCompactVND(summary?.totalExpense?.card)} • CK:{' '}
                {formatCompactVND(summary?.totalExpense?.transfer)}
              </p>
            </div>
            <div className="stat-card-icon">
              <ArrowDownRight className="h-5 w-5 text-rose-500" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Chênh Lệch Thu - Chi Nhập Hàng
              </p>
              <p className="mt-1 font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatVND(orderAnalytics?.netProfitToDateVND ?? 0)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Thu:{' '}
                <strong>
                  {formatCompactVND(orderAnalytics?.recordedRevenueVND ?? 0)}
                </strong>{' '}
                / Vốn nhập:{' '}
                <strong>
                  {formatCompactVND(orderAnalytics?.totalImportCostVND ?? 0)}
                </strong>
              </p>
            </div>
            <div className="stat-card-icon">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart 1: Interactive Cashflow Trend */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-border pb-4 lg:flex-row lg:items-center">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h2 className="font-display text-base font-bold text-foreground">
                Biểu Đồ 1: Xu Hướng Dòng Tiền Thu - Chi & Biến Động Tồn Quỹ Theo Ngày
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Tự động tổng hợp từ các Phiếu Thu / Phiếu Chi bạn tạo trong Sổ Quỹ.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5 text-xs">
              {[
                { key: 'ALL', label: 'Tổng Thu vs Tổng Chi' },
                { key: 'CHANNELS_INCOME', label: 'Phân bổ Thu (TM/Thẻ/CK)' },
                { key: 'CHANNELS_EXPENSE', label: 'Phân bổ Chi (TM/Thẻ/CK)' },
              ].map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setChartMetricMode(m.key as any)}
                  className={cn(
                    'rounded-md px-2.5 py-1 font-semibold transition-colors',
                    chartMetricMode === m.key
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active Day Inspector Banner */}
        {activePoint && (
          <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-border bg-muted/30 p-3 text-xs sm:grid-cols-4">
            <div>
              <span className="text-muted-foreground">Ngày giao dịch:</span>
              <p className="font-display text-sm font-bold text-foreground">
                {activePoint.date} ({activePoint.voucherCount} phiếu)
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Tổng Thu trong ngày:</span>
              <p className="font-display text-sm font-bold text-emerald-600 dark:text-emerald-400">
                +{formatVND(activePoint.income)}
              </p>
              <span className="text-[10px] text-muted-foreground">
                TM: {formatCompactVND(activePoint.incomeCash)} | Thẻ:{' '}
                {formatCompactVND(activePoint.incomeCard)} | CK:{' '}
                {formatCompactVND(activePoint.incomeTransfer)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Tổng Chi trong ngày:</span>
              <p className="font-display text-sm font-bold text-rose-600 dark:text-rose-400">
                -{formatVND(activePoint.expense)}
              </p>
              <span className="text-[10px] text-muted-foreground">
                TM: {formatCompactVND(activePoint.expenseCash)} | Thẻ:{' '}
                {formatCompactVND(activePoint.expenseCard)} | CK:{' '}
                {formatCompactVND(activePoint.expenseTransfer)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">
                Tồn quỹ Cuối ngày (Lũy kế):
              </span>
              <p className="font-display text-sm font-bold text-foreground dark:text-primary">
                {formatVND(activePoint.closingBalance)}
              </p>
              <span className="text-[10px] text-muted-foreground">
                Chênh lệch ròng:{' '}
                {activePoint.netFlow >= 0 ? '+' : ''}
                {formatCompactVND(activePoint.netFlow)}
              </span>
            </div>
          </div>
        )}

        {/* Interactive Chart Content */}
        {isLoading ? (
          <div className="py-16 text-center text-sm text-muted-foreground">
            Đang dựng biểu đồ dòng tiền...
          </div>
        ) : timeline.length === 0 ? (
          <div className="my-6 rounded-xl border border-dashed border-border p-10 text-center">
            <BarChart3 className="mx-auto h-9 w-9 text-muted-foreground/50" />
            <p className="mt-2 font-display text-sm font-bold text-foreground">
              Chưa có dữ liệu dòng tiền
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Hãy sang trang Sổ Quỹ để lập Phiếu Thu / Phiếu Chi hoặc cập nhật Quỹ Đầu Kỳ để biểu đồ hiển thị.
            </p>
          </div>
        ) : (
          <div className="mt-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
              {timeline.map((pt, idx) => {
                const incomeHeightPct = Math.min(
                  100,
                  Math.round((pt.income / maxBarVal) * 100),
                );
                const expenseHeightPct = Math.min(
                  100,
                  Math.round((pt.expense / maxBarVal) * 100),
                );
                const closingHeightPct = Math.min(
                  100,
                  Math.round((pt.closingBalance / maxBarVal) * 100),
                );
                const isHovered = hoveredDayIndex === idx;

                return (
                  <div
                    key={pt.date}
                    onMouseEnter={() => setHoveredDayIndex(idx)}
                    className={cn(
                      'group flex cursor-pointer flex-col justify-between rounded-xl border p-3 transition-all',
                      isHovered
                        ? 'border-primary bg-primary/10 shadow-sm'
                        : 'border-border bg-muted/20 hover:border-primary/40',
                    )}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono font-bold text-foreground">
                        {pt.date.slice(5)}
                      </span>
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {pt.voucherCount} phiếu
                      </span>
                    </div>

                    <div className="my-3 flex h-36 items-end justify-center gap-2 border-b border-border pb-1">
                      {chartMetricMode === 'ALL' && (
                        <>
                          <div className="flex h-full flex-col items-center justify-end">
                            <div
                              style={{
                                height: `${Math.max(incomeHeightPct, pt.income > 0 ? 8 : 2)}%`,
                              }}
                              className="w-4 rounded-t-md bg-emerald-500 transition-all duration-300"
                              title={`Thu: ${formatVND(pt.income)}`}
                            />
                          </div>
                          <div className="flex h-full flex-col items-center justify-end">
                            <div
                              style={{
                                height: `${Math.max(expenseHeightPct, pt.expense > 0 ? 8 : 2)}%`,
                              }}
                              className="w-4 rounded-t-md bg-rose-500 transition-all duration-300"
                              title={`Chi: ${formatVND(pt.expense)}`}
                            />
                          </div>
                          <div className="flex h-full flex-col items-center justify-end">
                            <div
                              style={{
                                height: `${Math.max(closingHeightPct, 12)}%`,
                              }}
                              className="w-3 rounded-t-md bg-primary/80 transition-all duration-300"
                              title={`Cuối kỳ: ${formatVND(pt.closingBalance)}`}
                            />
                          </div>
                        </>
                      )}

                      {chartMetricMode === 'CHANNELS_INCOME' && (
                        <>
                          <div
                            style={{
                              height: `${Math.max(Math.round((pt.incomeCash / maxBarVal) * 100), pt.incomeCash > 0 ? 8 : 2)}%`,
                            }}
                            className="w-3.5 rounded-t bg-emerald-500"
                            title={`Thu Tiền mặt: ${formatVND(pt.incomeCash)}`}
                          />
                          <div
                            style={{
                              height: `${Math.max(Math.round((pt.incomeCard / maxBarVal) * 100), pt.incomeCard > 0 ? 8 : 2)}%`,
                            }}
                            className="w-3.5 rounded-t bg-sky-500"
                            title={`Thu Thẻ: ${formatVND(pt.incomeCard)}`}
                          />
                          <div
                            style={{
                              height: `${Math.max(Math.round((pt.incomeTransfer / maxBarVal) * 100), pt.incomeTransfer > 0 ? 8 : 2)}%`,
                            }}
                            className="w-3.5 rounded-t bg-amber-500"
                            title={`Thu Chuyển khoản: ${formatVND(pt.incomeTransfer)}`}
                          />
                        </>
                      )}

                      {chartMetricMode === 'CHANNELS_EXPENSE' && (
                        <>
                          <div
                            style={{
                              height: `${Math.max(Math.round((pt.expenseCash / maxBarVal) * 100), pt.expenseCash > 0 ? 8 : 2)}%`,
                            }}
                            className="w-3.5 rounded-t bg-emerald-500"
                            title={`Chi Tiền mặt: ${formatVND(pt.expenseCash)}`}
                          />
                          <div
                            style={{
                              height: `${Math.max(Math.round((pt.expenseCard / maxBarVal) * 100), pt.expenseCard > 0 ? 8 : 2)}%`,
                            }}
                            className="w-3.5 rounded-t bg-sky-500"
                            title={`Chi Thẻ: ${formatVND(pt.expenseCard)}`}
                          />
                          <div
                            style={{
                              height: `${Math.max(Math.round((pt.expenseTransfer / maxBarVal) * 100), pt.expenseTransfer > 0 ? 8 : 2)}%`,
                            }}
                            className="w-3.5 rounded-t bg-rose-500"
                            title={`Chi Chuyển khoản: ${formatVND(pt.expenseTransfer)}`}
                          />
                        </>
                      )}
                    </div>

                    <div className="space-y-0.5 text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Thu:</span>
                        <strong className="text-emerald-600 dark:text-emerald-400">
                          +{formatCompactVND(pt.income)}
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Chi:</span>
                        <strong className="text-rose-600 dark:text-rose-400">
                          -{formatCompactVND(pt.expense)}
                        </strong>
                      </div>
                      <div className="flex justify-between border-t border-border pt-0.5">
                        <span className="text-muted-foreground">Tồn:</span>
                        <strong className="text-foreground dark:text-primary">
                          {formatCompactVND(pt.closingBalance)}
                        </strong>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Row 2: Payment Channels & Import Order Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Chart 2: Payment Channels Structure */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <PieChart className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-display text-base font-bold text-foreground">
                Biểu Đồ 2: Cơ Cấu Kênh Thanh Toán (Tiền Mặt • Thẻ • Chuyển Khoản)
              </h3>
              <p className="text-xs text-muted-foreground">
                Đối chiếu Đầu kỳ, Tổng thu, Tổng chi và Tồn quỹ Cuối kỳ theo từng phương thức
              </p>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">
                Tỷ trọng Tồn Quỹ Cuối Kỳ ({formatVND(summary?.closingBalance?.total ?? 0)})
              </span>
              <span className="text-muted-foreground">
                TM {cashPct.toFixed(1)}% • Thẻ {cardPct.toFixed(1)}% • CK{' '}
                {transferPct.toFixed(1)}%
              </span>
            </div>
            <div className="flex h-4 w-full overflow-hidden rounded-full bg-muted">
              <div
                style={{ width: `${cashPct}%` }}
                className="bg-emerald-500 transition-all"
                title={`Tiền mặt: ${formatVND(summary?.closingBalance?.cash)}`}
              />
              <div
                style={{ width: `${cardPct}%` }}
                className="bg-sky-500 transition-all"
                title={`Thẻ: ${formatVND(summary?.closingBalance?.card)}`}
              />
              <div
                style={{ width: `${transferPct}%` }}
                className="bg-amber-500 transition-all"
                title={`Chuyển khoản: ${formatVND(summary?.closingBalance?.transfer)}`}
              />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {paymentChannels.map((ch) => {
              const Icon =
                ch.channel === 'CASH'
                  ? Banknote
                  : ch.channel === 'CARD'
                    ? CreditCard
                    : Landmark;
              const badgeColor =
                ch.channel === 'CASH'
                  ? 'text-emerald-500'
                  : ch.channel === 'CARD'
                    ? 'text-sky-500'
                    : 'text-amber-500';

              return (
                <div
                  key={ch.channel}
                  className="rounded-xl border border-border bg-muted/20 p-3.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
                      <Icon className={cn('h-4 w-4', badgeColor)} />
                      <span>{ch.labelVi}</span>
                    </div>
                    <span className="font-display text-sm font-bold text-foreground dark:text-primary">
                      Cuối kỳ: {formatVND(ch.closing)}
                    </span>
                  </div>

                  <div className="mt-2.5 grid grid-cols-3 gap-2 border-t border-border pt-2">
                    <div>
                      <span className="text-muted-foreground">Đầu kỳ:</span>
                      <p className="font-semibold text-foreground">
                        {formatVND(ch.opening)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">+ Tổng thu:</span>
                      <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                        +{formatVND(ch.income)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">- Tổng chi:</span>
                      <p className="font-semibold text-rose-600 dark:text-rose-400">
                        -{formatVND(ch.expense)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 3: Import Order Cost, Weight & SKU Breakdown */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Scale className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-display text-base font-bold text-foreground">
                Biểu Đồ 3: Phân Tích Cơ Cấu Giá Vốn & Kiện Hàng Đơn Nhập
              </h3>
              <p className="text-xs text-muted-foreground">
                {orderAnalytics && orderAnalytics.orderId > 0
                  ? `Đơn #${orderAnalytics.orderId} • ${orderAnalytics.shopName}`
                  : 'Chưa có đơn nhập hàng nào'}
              </p>
            </div>
          </div>

          {!orderAnalytics || orderAnalytics.orderId === 0 ? (
            <div className="my-6 rounded-xl border border-dashed border-border p-10 text-center">
              <ShoppingBag className="mx-auto h-9 w-9 text-muted-foreground/50" />
              <p className="mt-2 font-display text-sm font-bold text-foreground">
                Chưa có dữ liệu đơn nhập hàng
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Tạo đơn nhập hàng nội bộ hoặc liên kết đơn hàng trước đó ở trang Nhập hàng để xem phân tích chi phí.
              </p>
            </div>
          ) : (
            <>
              <div className="mt-4 space-y-2.5">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  1. Cơ cấu Tổng chi phí đơn #{orderAnalytics.orderId} (
                  {formatVND(orderAnalytics.totalImportCostVND)})
                </p>
                {(orderAnalytics.costBreakdown || []).map((item, i) => (
                  <div key={i} className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="font-medium text-foreground">
                        {item.labelVi}
                      </span>
                      <span className="font-mono font-bold text-foreground">
                        {formatVND(item.amount)} ({item.percent}%)
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        style={{ width: `${Math.max(item.percent, 3)}%` }}
                        className={cn(
                          'h-full rounded-full',
                          i === 0
                            ? 'bg-primary'
                            : i === 1
                              ? 'bg-amber-500'
                              : 'bg-emerald-500',
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-2 border-t border-border pt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  2. Kiện Vận Đơn ({orderAnalytics.packagesBreakdown.length} kiện)
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {(orderAnalytics.packagesBreakdown || []).map((pkg) => (
                    <div
                      key={pkg.packageId}
                      className="rounded-lg border border-border bg-muted/20 p-2.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-foreground">
                          #{pkg.packageId}
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {pkg.weightKg} kg
                        </span>
                      </div>
                      <p className="truncate font-mono text-[11px] text-muted-foreground">
                        VĐ: {pkg.trackingCode}
                      </p>
                      <p className="mt-0.5 text-[11px] text-foreground">
                        Cước: <strong>{formatVND(pkg.feeVND)}</strong> •{' '}
                        {pkg.statusName}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 space-y-2 border-t border-border pt-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  3. Danh sách mặt hàng ({orderAnalytics.itemsBreakdown.length}{' '}
                  dòng)
                </p>
                {(orderAnalytics.itemsBreakdown || []).map((it) => (
                  <div
                    key={it.rowId}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2 text-xs"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="truncate font-semibold text-foreground">
                        {it.nameVi}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        SL: <strong>{it.quantity}</strong> ×{' '}
                        {formatVND(it.unitPriceVND)} • {it.property}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display font-bold text-foreground">
                        {formatVND(it.totalVND)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Row 3: Category Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Package className="h-5 w-5 text-emerald-500" />
            <h3 className="font-display text-base font-bold text-foreground">
              Biểu Đồ 4A: Tỷ Trọng Doanh Thu Theo Phân Loại Phiếu Thu
            </h3>
          </div>
          {incomeByCategory.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              Chưa có phiếu thu nào.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {incomeByCategory.map((item) => (
                <div key={item.category} className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="font-semibold text-foreground">
                      {item.category}
                    </span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      +{formatVND(item.amount)} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      style={{ width: `${Math.max(item.percentage, 4)}%` }}
                      className="h-full rounded-full bg-emerald-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <ShoppingBag className="h-5 w-5 text-rose-500" />
            <h3 className="font-display text-base font-bold text-foreground">
              Biểu Đồ 4B: Tỷ Trọng Chi Phí Theo Phân Loại Phiếu Chi
            </h3>
          </div>
          {expenseByCategory.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              Chưa có phiếu chi nào.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {expenseByCategory.map((item) => (
                <div key={item.category} className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="font-semibold text-foreground">
                      {item.category}
                    </span>
                    <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                      -{formatVND(item.amount)} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      style={{ width: `${Math.max(item.percentage, 4)}%` }}
                      className="h-full rounded-full bg-rose-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
