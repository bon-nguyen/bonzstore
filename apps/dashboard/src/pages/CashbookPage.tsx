import debounce from 'lodash/debounce';
import {
  BarChart3,
  Loader2,
  MinusCircle,
  Pencil,
  PlusCircle,
  RefreshCw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CashbookVoucherItem,
  CashbookVoucherType,
} from '../api/types/cashbook.types';
import { Button } from '../components/ui/button';
import { Pagination } from '../components/ui/pagination';
import {
  ADMIN_MANAGER_ROLES,
  PERMISSIONS,
} from '../constants/rbac.constants';
import { PermissionGate } from '../features/auth/components/PermissionGate';
import { useAuthContext } from '../features/auth/context/AuthContext';
import { CashbookOpeningBalanceModal } from '../features/cashbook/components/CashbookOpeningBalanceModal';
import { CashbookSummaryCards } from '../features/cashbook/components/CashbookSummaryCards';
import { CashbookVoucherModal } from '../features/cashbook/components/CashbookVoucherModal';
import {
  useCashbookVouchers,
  useDeleteCashbookVoucher,
} from '../features/cashbook/hooks/useCashbook';
import { useI18n } from '../features/i18n/I18nContext';
import { Column, ResponsiveTable } from '../features/shared/ResponsiveTable';
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

export function CashbookPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { hasAnyRole } = useAuthContext();
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

  // Modular Modal States
  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [modalType, setModalType] = useState<CashbookVoucherType>('INCOME');
  const [editingVoucher, setEditingVoucher] =
    useState<CashbookVoucherItem | null>(null);
  const [openingModalOpen, setOpeningModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, isLoading, isFetching, refetch } = useCashbookVouchers({
    page: pageParam,
    limit: limitParam,
    search: searchQuery || undefined,
    type: typeParam,
    paymentChannel: channelParam,
    category: categoryParam !== 'ALL' ? categoryParam : undefined,
  });

  const deleteMutation = useDeleteCashbookVoucher();

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
  const categoriesList = data?.categories || [];

  const openCreateModal = (type: CashbookVoucherType) => {
    setEditingVoucher(null);
    setModalType(type);
    setVoucherModalOpen(true);
  };

  const openEditModal = (v: CashbookVoucherItem) => {
    setEditingVoucher(v);
    setModalType(v.type);
    setVoucherModalOpen(true);
  };

  const handleDeleteVoucher = (v: CashbookVoucherItem) => {
    if (
      !window.confirm(
        t('cashbook.confirmDeleteVoucher', { code: v.voucherCode }),
      )
    ) {
      return;
    }
    setDeletingId(v.id);
    deleteMutation.mutate(v.id, {
      onSettled: () => setDeletingId(null),
    });
  };

  const columns: Column<CashbookVoucherItem>[] = [
    {
      key: 'voucherCode',
      header: t('cashbook.colVoucher'),
      width: 145,
      isPrimary: true,
      render: (v) => {
        const isIncome = v.type === 'INCOME';
        return (
          <div className="flex flex-col gap-1">
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
                Đơn #{v.importOrderId}
              </button>
            )}
          </div>
        );
      },
    },
    {
      key: 'createdAt',
      header: t('cashbook.colCreatedAt'),
      width: 150,
      render: (v) => {
        const createdDisplay = formatDateTime(v.createdAt || v.transactionDate);
        const txDisplay = formatDateTime(v.transactionDate);
        return (
          <div className="flex flex-col gap-0.5">
            <span className="whitespace-nowrap font-mono text-xs font-medium text-foreground">
              {createdDisplay}
            </span>
            {v.transactionDate && txDisplay !== createdDisplay && (
              <span className="whitespace-nowrap text-[10px] text-muted-foreground">
                GD: {txDisplay}
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: 'category',
      header: t('cashbook.colTypeCategory'),
      width: 185,
      render: (v) => {
        const isIncome = v.type === 'INCOME';
        const isBusiness = v.isBusinessAccounting ?? true;
        return (
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-1">
              <span
                className={cn(
                  'inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase',
                  isIncome
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
                )}
              >
                {isIncome
                  ? t('cashbook.badgeIncome')
                  : t('cashbook.badgeExpense')}
              </span>
              {v.categoryCode && (
                <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] font-bold text-foreground">
                  {v.categoryCode}
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-foreground">
              {v.category}
            </p>
            <span
              className={cn(
                'inline-block rounded px-1.5 py-0.5 text-[10px] font-medium',
                isBusiness
                  ? 'bg-primary/15 text-foreground dark:text-primary'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {isBusiness
                ? t('cashbook.accountingYes')
                : t('cashbook.accountingNo')}
            </span>
          </div>
        );
      },
    },
    {
      key: 'partnerName',
      header: t('cashbook.colContentPartner'),
      className: 'min-w-[200px]',
      render: (v) => {
        const isIncome = v.type === 'INCOME';
        const payerGroupKey = v.payerGroup || 'PARTNER';
        return (
          <div className="space-y-1 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-foreground">
                {t(`cashbook.payerGroup.${payerGroupKey}` as any)}
              </span>
              <span className="text-muted-foreground">
                {isIncome
                  ? t('cashbook.payerLabelIncome')
                  : t('cashbook.payerLabelExpense')}{' '}
                <strong className="text-foreground">{v.partnerName}</strong>
              </span>
            </div>
            {v.staffName && (
              <div className="text-[11px] text-muted-foreground">
                {isIncome
                  ? t('cashbook.staffLabelIncome')
                  : t('cashbook.staffLabelExpense')}{' '}
                <strong className="text-foreground">{v.staffName}</strong>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'note',
      header: t('cashbook.colNote'),
      className: 'min-w-[180px] max-w-xs',
      render: (v) => {
        const noteText =
          v.note?.trim() ||
          (v.content && v.content !== v.category ? v.content.trim() : '');
        return noteText ? (
          <p
            className="line-clamp-2 text-xs text-foreground"
            title={noteText}
          >
            {noteText}
          </p>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        );
      },
    },
    {
      key: 'cashAmount',
      header: t('cashbook.colCash'),
      align: 'right',
      width: 120,
      render: (v) => (
        <span className="whitespace-nowrap font-mono text-xs">
          {v.cashAmount > 0 ? (
            <span className="font-semibold text-foreground">
              {formatVND(v.cashAmount)}
            </span>
          ) : (
            <span className="text-muted-foreground">0₫</span>
          )}
        </span>
      ),
    },
    {
      key: 'cardAmount',
      header: t('cashbook.colCard'),
      align: 'right',
      width: 120,
      render: (v) => (
        <span className="whitespace-nowrap font-mono text-xs">
          {v.cardAmount > 0 ? (
            <span className="font-semibold text-foreground">
              {formatVND(v.cardAmount)}
            </span>
          ) : (
            <span className="text-muted-foreground">0₫</span>
          )}
        </span>
      ),
    },
    {
      key: 'transferAmount',
      header: t('cashbook.colTransfer'),
      align: 'right',
      width: 135,
      render: (v) => (
        <span className="whitespace-nowrap font-mono text-xs">
          {v.transferAmount > 0 ? (
            <span className="font-semibold text-foreground">
              {formatVND(v.transferAmount)}
            </span>
          ) : (
            <span className="text-muted-foreground">0₫</span>
          )}
        </span>
      ),
    },
    {
      key: 'totalAmount',
      header: t('cashbook.colTotal'),
      align: 'right',
      width: 140,
      render: (v) => {
        const isIncome = v.type === 'INCOME';
        return (
          <span
            className={cn(
              'whitespace-nowrap font-display text-sm font-bold',
              isIncome
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400',
            )}
          >
            {isIncome ? '+' : '-'}
            {formatVND(v.totalAmount)}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: t('cashbook.colActions'),
      align: 'right',
      width: 100,
      render: (v) => {
        const isDeletingThis = deleteMutation.isPending && deletingId === v.id;
        return canManage ? (
          <div className="inline-flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => openEditModal(v)}
              className="table-action-btn"
              title={t('cashbook.editVoucherTooltip')}
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              disabled={isDeletingThis}
              onClick={() => handleDeleteVoucher(v)}
              className="table-action-btn text-rose-500 hover:text-rose-600 disabled:opacity-50"
              title={t('cashbook.deleteVoucherTooltip')}
            >
              {isDeletingThis ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        ) : (
          <span className="text-[11px] text-muted-foreground">—</span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <p className="page-subtitle">{t('cashbook.subtitle')}</p>
          <h1 className="page-title">{t('cashbook.title')}</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/charts')}
            leftIcon={<BarChart3 className="h-4 w-4 text-primary" />}
          >
            {t('cashbook.viewChartsBtn')}
          </Button>

          <PermissionGate
            roles={ADMIN_MANAGER_ROLES}
            permission={PERMISSIONS.DASHBOARD_VIEW}
          >
            <Button
              type="button"
              onClick={() => openCreateModal('INCOME')}
              leftIcon={<PlusCircle className="h-4 w-4" />}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {t('cashbook.createIncomeBtn')}
            </Button>

            <Button
              type="button"
              onClick={() => openCreateModal('EXPENSE')}
              leftIcon={<MinusCircle className="h-4 w-4" />}
              className="bg-rose-600 text-white hover:bg-rose-700"
            >
              {t('cashbook.createExpenseBtn')}
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* 4 Cashbook Summary Cards */}
      <CashbookSummaryCards
        summary={summary}
        isLoading={isLoading || isFetching}
        canManage={canManage}
        onEditOpeningBalance={() => setOpeningModalOpen(true)}
      />

      {/* Search & Filters Bar + Main Cashbook Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-border p-4 lg:flex-row lg:items-center">
          {/* Left: Search Input */}
          <div className="relative w-full lg:w-96">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                debouncedSetSearch(e.target.value);
              }}
              placeholder={t('cashbook.searchPlaceholder')}
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
            <div className="inline-flex rounded-lg border border-border bg-muted/40 p-0.5 text-xs">
              {[
                {
                  key: 'ALL',
                  label: t('cashbook.tabAll', {
                    count: summary?.voucherCounts?.total ?? 0,
                  }),
                },
                {
                  key: 'INCOME',
                  label: t('cashbook.tabIncome', {
                    count: summary?.voucherCounts?.incomeCount ?? 0,
                  }),
                },
                {
                  key: 'EXPENSE',
                  label: t('cashbook.tabExpense', {
                    count: summary?.voucherCounts?.expenseCount ?? 0,
                  }),
                },
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
              <option value="ALL">{t('cashbook.channelAll')}</option>
              <option value="CASH">{t('cashbook.channelCashTab')}</option>
              <option value="CARD">{t('cashbook.channelCardTab')}</option>
              <option value="TRANSFER">
                {t('cashbook.channelTransferTab')}
              </option>
            </select>

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
              <option value="ALL">Tất cả loại nguồn thu/chi</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={isFetching}
              onClick={() => refetch()}
              leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            />
          </div>
        </div>

        {/* Ant Design Table inspired Tailwind Table */}
        <ResponsiveTable
          embedded
          columns={columns}
          data={vouchers}
          keyExtractor={(v) => v.id}
          isLoading={isLoading}
          isFetching={isFetching}
          emptyMessage={t('cashbook.emptyVouchers')}
        />

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
          />
        </div>
      </div>

      {/* Modal Lập / Sửa Phiếu Thu & Phiếu Chi (React Hook Form) */}
      <CashbookVoucherModal
        open={voucherModalOpen}
        modalType={modalType}
        editingVoucher={editingVoucher}
        onClose={() => setVoucherModalOpen(false)}
      />

      {/* Modal Cập nhật Số dư Đầu kỳ (React Hook Form) */}
      <CashbookOpeningBalanceModal
        open={openingModalOpen}
        initialValues={{
          cash: summary?.openingBalance?.cash || 0,
          card: summary?.openingBalance?.card || 0,
          transfer: summary?.openingBalance?.transfer || 0,
        }}
        onClose={() => setOpeningModalOpen(false)}
      />
    </div>
  );
}
