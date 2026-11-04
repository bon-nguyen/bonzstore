import debounce from 'lodash/debounce';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Banknote,
  CreditCard,
  Landmark,
  MinusCircle,
  Pencil,
  PlusCircle,
  RefreshCw,
  RotateCcw,
  Search,
  Settings2,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CashbookVoucherItem,
  CashbookVoucherType,
} from '../api/types/cashbook.types';
import { Pagination } from '../components/ui/pagination';
import {
  ADMIN_MANAGER_ROLES,
  PERMISSIONS,
} from '../constants/rbac.constants';
import { PermissionGate } from '../features/auth/components/PermissionGate';
import { useAuthContext } from '../features/auth/context/AuthContext';
import {
  useCashbookVouchers,
  useCreateCashbookVoucher,
  useDeleteCashbookVoucher,
  useRestoreCashbookData,
  useUpdateCashbookVoucher,
  useUpdateOpeningBalance,
} from '../features/cashbook/hooks/useCashbook';
import { cn } from '../lib/utils';

function formatVND(amount?: number | null): string {
  return `${Number(amount || 0).toLocaleString('vi-VN')}₫`;
}

function formatDateTime(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const INCOME_CATEGORIES = [
  'Thu tiền bán hàng TikTok Shop',
  'Thu tiền bán lẻ tại Showroom & Online',
  'Thu tiền cọc Pre-order khách lẻ',
  'Thu hoàn tiền vận chuyển / Chiết khấu 1688',
  'Thu nhập khác',
];

const EXPENSE_CATEGORIES = [
  'Đặt cọc nhập hàng 1688',
  'Tất toán & Cước vận chuyển TQ-VN',
  'Chi phí đóng gói & Vận hành kho',
  'Chi phí Marketing & Quảng cáo TikTok',
  'Chi lương & Thưởng nhân sự',
  'Chi phí khác',
];

export function CashbookPage() {
  const navigate = useNavigate();
  const { user, hasAnyRole } = useAuthContext();
  const canManage = hasAnyRole(ADMIN_MANAGER_ROLES);
  const [searchParams, setSearchParams] = useSearchParams();

  const pageParam = Math.max(Number(searchParams.get('page')) || 1, 1);
  const limitParam = Number(searchParams.get('limit')) || 10;
  const searchQuery = searchParams.get('search') || '';
  const typeParam =
    (searchParams.get('type') as 'ALL' | CashbookVoucherType) || 'ALL';
  const channelParam =
    (searchParams.get('channel') as 'ALL' | 'CASH' | 'CARD' | 'TRANSFER') ||
    'ALL';
  const categoryParam = searchParams.get('category') || 'ALL';

  const [searchInput, setSearchInput] = useState(searchQuery);

  // Create / Edit Voucher Modal State
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] =
    useState<CashbookVoucherItem | null>(null);
  const [formType, setFormType] = useState<CashbookVoucherType>('INCOME');
  const [formVoucherCode, setFormVoucherCode] = useState('');
  const [formDate, setFormDate] = useState(() =>
    new Date().toISOString().slice(0, 16),
  );
  const [formCategory, setFormCategory] = useState(INCOME_CATEGORIES[0]);
  const [formContent, setFormContent] = useState('');
  const [formCash, setFormCash] = useState<string>('0');
  const [formCard, setFormCard] = useState<string>('0');
  const [formTransfer, setFormTransfer] = useState<string>('0');
  const [formPartnerName, setFormPartnerName] = useState('');
  const [formStaffName, setFormStaffName] = useState('');
  const [formImportOrderId, setFormImportOrderId] = useState<string>('55479');

  // Opening Balance Modal State
  const [openingModalOpen, setOpeningModalOpen] = useState(false);
  const [openCash, setOpenCash] = useState<string>('5000000');
  const [openCard, setOpenCard] = useState<string>('3500000');
  const [openTransfer, setOpenTransfer] = useState<string>('16500000');

  const { data, isLoading, isFetching, refetch } = useCashbookVouchers({
    page: pageParam,
    limit: limitParam,
    search: searchQuery || undefined,
    type: typeParam,
    paymentChannel: channelParam,
    category: categoryParam !== 'ALL' ? categoryParam : undefined,
  });

  const createMutation = useCreateCashbookVoucher();
  const updateMutation = useUpdateCashbookVoucher();
  const deleteMutation = useDeleteCashbookVoucher();
  const updateOpeningMutation = useUpdateOpeningBalance();
  const restoreMutation = useRestoreCashbookData();

  const debouncedSetSearch = useMemo(
    () =>
      debounce((val: string) => {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          if (val.trim()) {
            next.set('search', val.trim());
          } else {
            next.delete('search');
          }
          next.set('page', '1');
          return next;
        });
      }, 400),
    [setSearchParams],
  );

  useEffect(() => {
    return () => debouncedSetSearch.cancel();
  }, [debouncedSetSearch]);

  const vouchers = data?.data || [];
  const summary = data?.summary;
  const categoriesList = data?.categories || [
    ...INCOME_CATEGORIES,
    ...EXPENSE_CATEGORIES,
  ];

  const openCreateModal = (type: CashbookVoucherType) => {
    setEditingVoucher(null);
    setFormType(type);
    setFormVoucherCode('');
    setFormDate(new Date().toISOString().slice(0, 16));
    setFormCategory(
      type === 'INCOME' ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0],
    );
    setFormContent(
      type === 'INCOME'
        ? 'Thu tiền bán mô hình Anime lô hàng nhập #55479'
        : 'Chi thanh toán nhập hàng / vận chuyển đơn #55479',
    );
    setFormCash('0');
    setFormCard('0');
    setFormTransfer(type === 'INCOME' ? '1500000' : '1000000');
    setFormPartnerName(
      type === 'INCOME'
        ? 'Khách hàng Otaku / TikTok Shop'
        : 'Hoà Bình Logistics (Đơn #55479)',
    );
    setFormStaffName(user?.fullName || 'tranbon1 (bon)');
    setFormImportOrderId('55479');
    setVoucherModalOpen(true);
  };

  const openEditModal = (v: CashbookVoucherItem) => {
    setEditingVoucher(v);
    setFormType(v.type);
    setFormVoucherCode(v.voucherCode);
    setFormDate(v.transactionDate.slice(0, 16));
    setFormCategory(v.category);
    setFormContent(v.content);
    setFormCash(String(v.cashAmount || 0));
    setFormCard(String(v.cardAmount || 0));
    setFormTransfer(String(v.transferAmount || 0));
    setFormPartnerName(v.partnerName);
    setFormStaffName(v.staffName);
    setFormImportOrderId(v.importOrderId ? String(v.importOrderId) : '');
    setVoucherModalOpen(true);
  };

  const handleOpenOpeningBalanceModal = () => {
    if (summary?.openingBalance) {
      setOpenCash(String(summary.openingBalance.cash));
      setOpenCard(String(summary.openingBalance.card));
      setOpenTransfer(String(summary.openingBalance.transfer));
    }
    setOpeningModalOpen(true);
  };

  const computedFormTotal =
    Math.max(0, Number(formCash || 0)) +
    Math.max(0, Number(formCard || 0)) +
    Math.max(0, Number(formTransfer || 0));

  const handleSubmitVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      type: formType,
      voucherCode: formVoucherCode.trim() || undefined,
      transactionDate: formDate
        ? new Date(formDate).toISOString()
        : new Date().toISOString(),
      category: formCategory.trim() || 'Phân loại chung',
      content: formContent.trim(),
      cashAmount: Math.max(0, Number(formCash || 0)),
      cardAmount: Math.max(0, Number(formCard || 0)),
      transferAmount: Math.max(0, Number(formTransfer || 0)),
      partnerName: formPartnerName.trim(),
      staffName: formStaffName.trim() || user?.fullName || 'tranbon1',
      importOrderId: formImportOrderId ? Number(formImportOrderId) : undefined,
    };

    if (editingVoucher) {
      updateMutation.mutate(
        { id: editingVoucher.id, data: payload },
        {
          onSuccess: () => setVoucherModalOpen(false),
        },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => setVoucherModalOpen(false),
      });
    }
  };

  const handleSubmitOpeningBalance = (e: React.FormEvent) => {
    e.preventDefault();
    updateOpeningMutation.mutate(
      {
        cash: Math.max(0, Number(openCash || 0)),
        card: Math.max(0, Number(openCard || 0)),
        transfer: Math.max(0, Number(openTransfer || 0)),
      },
      {
        onSuccess: () => setOpeningModalOpen(false),
      },
    );
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <p className="page-subtitle">
            Financial Cashbook & Multi-Channel Ledger (Tiền mặt • Thẻ • Chuyển khoản)
          </p>
          <h1 className="page-title">Sổ Quỹ Thu Chi & Đối Soát Nhập Hàng</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý dòng tiền mặt, thẻ, chuyển khoản và tự động hạch toán Đặt cọc / Tất toán từ đơn nhập hàng #55479 (`Cuối kỳ = Đầu kỳ + Tổng thu - Tổng chi`).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/charts')}
            className="action-btn action-btn-secondary"
          >
            <BarChart3 className="h-4 w-4 text-primary" />
            <span>Xem Biểu Đồ Sổ Quỹ</span>
          </button>

          <PermissionGate
            roles={ADMIN_MANAGER_ROLES}
            permission={PERMISSIONS.DASHBOARD_VIEW}
          >
            <button
              type="button"
              onClick={() => openCreateModal('INCOME')}
              className="action-btn bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Lập Phiếu Thu</span>
            </button>

            <button
              type="button"
              onClick={() => openCreateModal('EXPENSE')}
              className="action-btn bg-rose-600 text-white hover:bg-rose-700"
            >
              <MinusCircle className="h-4 w-4" />
              <span>Lập Phiếu Chi</span>
            </button>

            <button
              type="button"
              onClick={() => restoreMutation.mutate()}
              disabled={restoreMutation.isPending}
              className="action-btn action-btn-secondary"
              title="Khôi phục dữ liệu mẫu Sổ Quỹ & Đơn nhập #55479"
            >
              <RotateCcw
                className={cn(
                  'h-4 w-4',
                  restoreMutation.isPending && 'animate-spin',
                )}
              />
              <span>Restore Data</span>
            </button>
          </PermissionGate>
        </div>
      </div>

      {/* 4 Cashbook Summary Cards: Đầu kỳ | Tổng thu (+TM, +Thẻ, +CK) | Tổng chi (+TM, +Thẻ, +CK) | Cuối kỳ (= Đầu kỳ + Tổng thu - Tổng chi) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* Card 1: Đầu kỳ */}
        <div className="stat-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                1. Quỹ Đầu Kỳ
              </span>
              {canManage && (
                <button
                  type="button"
                  onClick={handleOpenOpeningBalanceModal}
                  className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground hover:bg-primary/20"
                  title="Cấu hình số dư Đầu kỳ"
                >
                  <Settings2 className="h-3 w-3" />
                  <span>Cấu hình</span>
                </button>
              )}
            </div>
            <p className="mt-1.5 font-display text-2xl font-bold text-foreground">
              {formatVND(summary?.openingBalance?.total ?? 25000000)}
            </p>
          </div>

          <div className="mt-3 space-y-1 border-t border-border pt-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Banknote className="h-3.5 w-3.5 text-emerald-500" />+ Tiền mặt:
              </span>
              <strong className="text-foreground">
                {formatVND(summary?.openingBalance?.cash ?? 5000000)}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <CreditCard className="h-3.5 w-3.5 text-sky-500" />+ Thẻ:
              </span>
              <strong className="text-foreground">
                {formatVND(summary?.openingBalance?.card ?? 3500000)}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Landmark className="h-3.5 w-3.5 text-amber-500" />+ Chuyển khoản:
              </span>
              <strong className="text-foreground">
                {formatVND(summary?.openingBalance?.transfer ?? 16500000)}
              </strong>
            </div>
          </div>
        </div>

        {/* Card 2: Tổng thu (+ Tiền mặt, + Thẻ, + Chuyển khoản) */}
        <div className="stat-card flex flex-col justify-between border-emerald-500/30">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                2. Tổng Thu ({summary?.voucherCounts?.incomeCount ?? 0} phiếu)
              </span>
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="mt-1.5 font-display text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              +{formatVND(summary?.totalIncome?.total ?? 30140000)}
            </p>
          </div>

          <div className="mt-3 space-y-1 border-t border-border pt-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">+ Tiền mặt:</span>
              <strong className="text-emerald-600 dark:text-emerald-400">
                {formatVND(summary?.totalIncome?.cash ?? 3880000)}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">+ Thẻ:</span>
              <strong className="text-emerald-600 dark:text-emerald-400">
                {formatVND(summary?.totalIncome?.card ?? 7150000)}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">+ Chuyển khoản:</span>
              <strong className="text-emerald-600 dark:text-emerald-400">
                {formatVND(summary?.totalIncome?.transfer ?? 19110000)}
              </strong>
            </div>
          </div>
        </div>

        {/* Card 3: Tổng chi (+ Tiền mặt, + Thẻ, + Chuyển khoản) */}
        <div className="stat-card flex flex-col justify-between border-rose-500/30">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                3. Tổng Chi ({summary?.voucherCounts?.expenseCount ?? 0} phiếu)
              </span>
              <ArrowDownRight className="h-4 w-4 text-rose-500" />
            </div>
            <p className="mt-1.5 font-display text-2xl font-bold text-rose-600 dark:text-rose-400">
              -{formatVND(summary?.totalExpense?.total ?? 10974276)}
            </p>
          </div>

          <div className="mt-3 space-y-1 border-t border-border pt-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">+ Tiền mặt:</span>
              <strong className="text-rose-600 dark:text-rose-400">
                {formatVND(summary?.totalExpense?.cash ?? 2915876)}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">+ Thẻ:</span>
              <strong className="text-rose-600 dark:text-rose-400">
                {formatVND(summary?.totalExpense?.card ?? 680000)}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">+ Chuyển khoản:</span>
              <strong className="text-rose-600 dark:text-rose-400">
                {formatVND(summary?.totalExpense?.transfer ?? 7378400)}
              </strong>
            </div>
          </div>
        </div>

        {/* Card 4: Cuối kỳ (Cuối kỳ = Đầu kỳ + Tổng thu - Tổng chi) */}
        <div className="stat-card flex flex-col justify-between border-primary/50 bg-primary/5">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground dark:text-primary">
                4. Tồn Quỹ Cuối Kỳ
              </span>
              <Wallet className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-1.5 font-display text-2xl font-bold text-foreground dark:text-primary">
              {formatVND(summary?.closingBalance?.total ?? 44165724)}
            </p>
            <p className="text-[11px] font-medium text-muted-foreground">
              Cuối kỳ = Đầu kỳ + Tổng thu - Tổng chi
            </p>
          </div>

          <div className="mt-2.5 space-y-1 border-t border-border pt-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">+ Tiền mặt cuối kỳ:</span>
              <strong className="text-foreground">
                {formatVND(summary?.closingBalance?.cash ?? 5964124)}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">+ Thẻ cuối kỳ:</span>
              <strong className="text-foreground">
                {formatVND(summary?.closingBalance?.card ?? 9970000)}
              </strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                + Chuyển khoản cuối kỳ:
              </span>
              <strong className="text-foreground">
                {formatVND(summary?.closingBalance?.transfer ?? 28231600)}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters Bar + Main Cashbook Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-border p-4 lg:flex-row lg:items-center">
          {/* Left: Search Input */}
          <div className="relative w-full lg:w-96">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                debouncedSetSearch(e.target.value);
              }}
              placeholder="Tìm Mã phiếu (PC-HB72865), Phân loại, Nội dung, Người nhận/nộp..."
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-8 text-xs text-foreground focus:border-primary focus:outline-none"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('');
                  debouncedSetSearch('');
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Right: Type, Channel, Category Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter by Voucher Type */}
            <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5 text-xs">
              {[
                { key: 'ALL', label: 'Tất cả phiếu' },
                { key: 'INCOME', label: 'Phiếu Thu (+)' },
                { key: 'EXPENSE', label: 'Phiếu Chi (-)' },
              ].map((tItem) => (
                <button
                  key={tItem.key}
                  type="button"
                  onClick={() =>
                    setSearchParams((prev) => {
                      const next = new URLSearchParams(prev);
                      next.set('type', tItem.key);
                      next.set('page', '1');
                      return next;
                    })
                  }
                  className={cn(
                    'rounded-md px-2.5 py-1 font-semibold transition-colors',
                    typeParam === tItem.key
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {tItem.label}
                </button>
              ))}
            </div>

            {/* Filter by Payment Channel */}
            <select
              value={channelParam}
              onChange={(e) =>
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  next.set('channel', e.target.value);
                  next.set('page', '1');
                  return next;
                })
              }
              className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
            >
              <option value="ALL">Mọi kênh thanh toán</option>
              <option value="CASH">Tiền mặt</option>
              <option value="CARD">Thẻ (POS / Visa)</option>
              <option value="TRANSFER">Chuyển khoản / Ví</option>
            </select>

            {/* Filter by Category */}
            <select
              value={categoryParam}
              onChange={(e) =>
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  next.set('category', e.target.value);
                  next.set('page', '1');
                  return next;
                })
              }
              className="max-w-[200px] truncate rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground focus:border-primary focus:outline-none"
            >
              <option value="ALL">Tất cả phân loại</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => refetch()}
              className="action-btn action-btn-secondary px-2.5 py-1.5 text-xs"
            >
              <RefreshCw
                className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')}
              />
            </button>
          </div>
        </div>

        {/* 10 Required Columns Table:
            Thời gian / Mã Phiếu / Phân Loại / Nội Dung / Tiền mặt / Thẻ / Chuyển Khoản / Tổng tiền / Người nhận, Nộp / Người thu Chi */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <th className="table-header-cell whitespace-nowrap px-3.5 py-3">
                  Thời Gian
                </th>
                <th className="table-header-cell whitespace-nowrap px-3.5 py-3">
                  Mã Phiếu
                </th>
                <th className="table-header-cell whitespace-nowrap px-3.5 py-3">
                  Phân Loại
                </th>
                <th className="table-header-cell min-w-[240px] px-3.5 py-3">
                  Nội Dung
                </th>
                <th className="table-header-cell whitespace-nowrap px-3.5 py-3 text-right">
                  Tiền Mặt
                </th>
                <th className="table-header-cell whitespace-nowrap px-3.5 py-3 text-right">
                  Thẻ
                </th>
                <th className="table-header-cell whitespace-nowrap px-3.5 py-3 text-right">
                  Chuyển Khoản
                </th>
                <th className="table-header-cell whitespace-nowrap px-3.5 py-3 text-right">
                  Tổng Tiền
                </th>
                <th className="table-header-cell whitespace-nowrap px-3.5 py-3">
                  Người Nhận, Nộp
                </th>
                <th className="table-header-cell whitespace-nowrap px-3.5 py-3">
                  Người Thu Chi
                </th>
                <th className="table-header-cell whitespace-nowrap px-3.5 py-3 text-right">
                  Thao Tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={11}
                    className="px-4 py-10 text-center text-sm text-muted-foreground"
                  >
                    Đang tải dữ liệu Sổ Quỹ...
                  </td>
                </tr>
              ) : vouchers.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="px-4 py-10 text-center text-sm text-muted-foreground"
                  >
                    Không tìm thấy phiếu Thu/Chi nào phù hợp.
                  </td>
                </tr>
              ) : (
                vouchers.map((v) => {
                  const isIncome = v.type === 'INCOME';
                  return (
                    <tr key={v.id} className="table-row-interactive">
                      {/* 1. Thời gian */}
                      <td className="whitespace-nowrap px-3.5 py-3 text-xs text-muted-foreground">
                        {formatDateTime(v.transactionDate)}
                      </td>

                      {/* 2. Mã Phiếu */}
                      <td className="whitespace-nowrap px-3.5 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span
                            className={cn(
                              'inline-flex w-fit items-center rounded px-2 py-0.5 font-mono text-xs font-bold',
                              isIncome
                                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                : 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
                            )}
                          >
                            {v.voucherCode}
                          </span>
                          {v.importOrderId && (
                            <button
                              type="button"
                              onClick={() => navigate('/imports')}
                              className="w-fit text-[10px] font-semibold text-primary hover:underline"
                            >
                              Đơn nhập #{v.importOrderId}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* 3. Phân Loại */}
                      <td className="px-3.5 py-3">
                        <span
                          className={cn(
                            'inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase',
                            isIncome
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                              : 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
                          )}
                        >
                          {isIncome ? 'Phiếu Thu' : 'Phiếu Chi'}
                        </span>
                        <p className="mt-1 text-xs font-semibold text-foreground">
                          {v.category}
                        </p>
                      </td>

                      {/* 4. Nội Dung */}
                      <td className="max-w-sm px-3.5 py-3">
                        <p className="text-xs font-medium text-foreground">
                          {v.content}
                        </p>
                        {v.note && (
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {v.note}
                          </p>
                        )}
                      </td>

                      {/* 5. Tiền mặt */}
                      <td className="whitespace-nowrap px-3.5 py-3 text-right font-mono text-xs">
                        {v.cashAmount > 0 ? (
                          <span className="font-semibold text-foreground">
                            {formatVND(v.cashAmount)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">0₫</span>
                        )}
                      </td>

                      {/* 6. Thẻ */}
                      <td className="whitespace-nowrap px-3.5 py-3 text-right font-mono text-xs">
                        {v.cardAmount > 0 ? (
                          <span className="font-semibold text-foreground">
                            {formatVND(v.cardAmount)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">0₫</span>
                        )}
                      </td>

                      {/* 7. Chuyển Khoản */}
                      <td className="whitespace-nowrap px-3.5 py-3 text-right font-mono text-xs">
                        {v.transferAmount > 0 ? (
                          <span className="font-semibold text-foreground">
                            {formatVND(v.transferAmount)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">0₫</span>
                        )}
                      </td>

                      {/* 8. Tổng tiền */}
                      <td className="whitespace-nowrap px-3.5 py-3 text-right">
                        <span
                          className={cn(
                            'font-display text-sm font-bold',
                            isIncome
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400',
                          )}
                        >
                          {isIncome ? '+' : '-'}
                          {formatVND(v.totalAmount)}
                        </span>
                      </td>

                      {/* 9. Người nhận, Nộp */}
                      <td className="px-3.5 py-3 text-xs">
                        <p className="font-semibold text-foreground">
                          {v.partnerName}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {isIncome ? 'Người nộp tiền' : 'Người nhận tiền'}
                        </p>
                      </td>

                      {/* 10. Người thu Chi */}
                      <td className="whitespace-nowrap px-3.5 py-3 text-xs font-semibold text-foreground">
                        {v.staffName}
                      </td>

                      {/* Thao tác */}
                      <td className="whitespace-nowrap px-3.5 py-3 text-right">
                        {canManage ? (
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEditModal(v)}
                              className="table-action-btn"
                              title="Chỉnh sửa phiếu"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteMutation.mutate(v.id)}
                              className="table-action-btn text-rose-500 hover:text-rose-600"
                              title="Xóa phiếu"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">
                            Chỉ xem
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t border-border px-4 py-3">
          <Pagination
            page={data?.meta?.page || 1}
            limit={data?.meta?.limit || 10}
            total={data?.meta?.total || vouchers.length}
            totalPages={data?.meta?.totalPages || 1}
            onPageChange={(newPage) => {
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.set('page', String(newPage));
                return next;
              });
            }}
            onLimitChange={(newLimit) => {
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                next.set('limit', String(newLimit));
                next.set('page', '1');
                return next;
              });
            }}
          />
        </div>
      </div>

      {/* Modal Lập Phiếu Thu / Lập Phiếu Chi */}
      {voucherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                {formType === 'INCOME' ? (
                  <PlusCircle className="h-5 w-5 text-emerald-500" />
                ) : (
                  <MinusCircle className="h-5 w-5 text-rose-500" />
                )}
                <h3 className="font-display text-lg font-bold text-foreground">
                  {editingVoucher
                    ? `Chỉnh Sửa Phiếu ${editingVoucher.voucherCode}`
                    : formType === 'INCOME'
                      ? 'Lập Phiếu Thu Mới (+)'
                      : 'Lập Phiếu Chi Mới (-)'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setVoucherModalOpen(false)}
                className="table-action-btn"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitVoucher} className="mt-4 space-y-4">
              {/* Switch Type */}
              <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-muted/40 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setFormType('INCOME');
                    setFormCategory(INCOME_CATEGORIES[0]);
                  }}
                  className={cn(
                    'rounded-lg py-2 text-xs font-bold transition-colors',
                    formType === 'INCOME'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  + PHIẾU THU (INCOME)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormType('EXPENSE');
                    setFormCategory(EXPENSE_CATEGORIES[0]);
                  }}
                  className={cn(
                    'rounded-lg py-2 text-xs font-bold transition-colors',
                    formType === 'EXPENSE'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  - PHIẾU CHI (EXPENSE)
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-foreground">
                    Thời gian giao dịch
                  </label>
                  <input
                    type="datetime-local"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    required
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">
                    Mã phiếu (Để trống tự sinh)
                  </label>
                  <input
                    type="text"
                    value={formVoucherCode}
                    onChange={(e) => setFormVoucherCode(e.target.value)}
                    placeholder={
                      formType === 'INCOME' ? 'VD: PT-202610-009' : 'VD: PC-202610-009'
                    }
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-foreground">
                    Phân loại *
                  </label>
                  <input
                    type="text"
                    list="cashbook-cat-suggestions"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    required
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground"
                  />
                  <datalist id="cashbook-cat-suggestions">
                    {(formType === 'INCOME'
                      ? INCOME_CATEGORIES
                      : EXPENSE_CATEGORIES
                    ).map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground">
                    Liên kết Mã đơn nhập (Tùy chọn)
                  </label>
                  <input
                    type="number"
                    value={formImportOrderId}
                    onChange={(e) => setFormImportOrderId(e.target.value)}
                    placeholder="55479"
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">
                  Nội dung diễn giải *
                </label>
                <textarea
                  rows={2}
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  required
                  placeholder="Nhập nội dung thu/chi chi tiết..."
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground"
                />
              </div>

              {/* 3 Payment Channels Breakdown -> Auto Total */}
              <div className="rounded-xl border border-border bg-muted/30 p-3.5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    Số tiền theo Kênh thanh toán (VNĐ)
                  </span>
                  <span
                    className={cn(
                      'font-display text-sm font-bold',
                      formType === 'INCOME'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400',
                    )}
                  >
                    Tổng tiền: {formatVND(computedFormTotal)}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground">
                      + Tiền mặt (₫)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formCash}
                      onChange={(e) => setFormCash(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-2.5 py-1.5 font-mono text-xs font-bold text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground">
                      + Thẻ POS / Visa (₫)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formCard}
                      onChange={(e) => setFormCard(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-2.5 py-1.5 font-mono text-xs font-bold text-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground">
                      + Chuyển khoản / Ví (₫)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formTransfer}
                      onChange={(e) => setFormTransfer(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-border bg-background px-2.5 py-1.5 font-mono text-xs font-bold text-foreground"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold text-foreground">
                    {formType === 'INCOME'
                      ? 'Người nộp tiền *'
                      : 'Người nhận tiền *'}
                  </label>
                  <input
                    type="text"
                    value={formPartnerName}
                    onChange={(e) => setFormPartnerName(e.target.value)}
                    required
                    placeholder="Tên khách hàng / đối tác..."
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground">
                    Người thu / chi *
                  </label>
                  <input
                    type="text"
                    value={formStaffName}
                    onChange={(e) => setFormStaffName(e.target.value)}
                    required
                    placeholder="tranbon1 (bon)"
                    className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setVoucherModalOpen(false)}
                  className="action-btn action-btn-secondary"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={
                    createMutation.isPending ||
                    updateMutation.isPending ||
                    computedFormTotal <= 0
                  }
                  className={cn(
                    'action-btn text-white',
                    formType === 'INCOME'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700',
                  )}
                >
                  {editingVoucher
                    ? 'Lưu cập nhật phiếu'
                    : formType === 'INCOME'
                      ? 'Xác nhận Lập Phiếu Thu'
                      : 'Xác nhận Lập Phiếu Chi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cấu hình Số dư Đầu kỳ */}
      {openingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display text-base font-bold text-foreground">
                Cấu Hình Quỹ Đầu Kỳ (Tiền mặt / Thẻ / Chuyển khoản)
              </h3>
              <button
                type="button"
                onClick={() => setOpeningModalOpen(false)}
                className="table-action-btn"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={handleSubmitOpeningBalance}
              className="mt-4 space-y-3"
            >
              <div>
                <label className="text-xs font-semibold text-foreground">
                  Quỹ Tiền mặt đầu kỳ (₫)
                </label>
                <input
                  type="number"
                  min={0}
                  value={openCash}
                  onChange={(e) => setOpenCash(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs font-bold text-foreground"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground">
                  Quỹ Thẻ đầu kỳ (₫)
                </label>
                <input
                  type="number"
                  min={0}
                  value={openCard}
                  onChange={(e) => setOpenCard(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs font-bold text-foreground"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground">
                  Quỹ Chuyển khoản đầu kỳ (₫)
                </label>
                <input
                  type="number"
                  min={0}
                  value={openTransfer}
                  onChange={(e) => setOpenTransfer(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-xs font-bold text-foreground"
                />
              </div>

              <div className="rounded-lg bg-muted/50 p-3 text-xs">
                <span>Tổng Đầu kỳ mới: </span>
                <strong className="font-display text-sm text-primary">
                  {formatVND(
                    Number(openCash || 0) +
                      Number(openCard || 0) +
                      Number(openTransfer || 0),
                  )}
                </strong>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setOpeningModalOpen(false)}
                  className="action-btn action-btn-secondary"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={updateOpeningMutation.isPending}
                  className="action-btn action-btn-primary"
                >
                  Lưu Quỹ Đầu Kỳ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

