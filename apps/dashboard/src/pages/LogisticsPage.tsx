import { trim } from 'lodash';
import {
  Building2,
  ClipboardCopy,
  ClipboardPaste,
  ExternalLink,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { LogisticsUnit } from '../api/types/logistics.types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Pagination } from '../components/ui/pagination';
import {
  ADMIN_MANAGER_ROLES,
  PERMISSIONS,
} from '../constants/rbac.constants';
import { PermissionGate } from '../features/auth/components/PermissionGate';
import { useAuthContext } from '../features/auth/context/AuthContext';
import { useI18n } from '../features/i18n/I18nContext';
import {
  useCreateLogisticsUnit,
  useDeleteLogisticsUnit,
  useLogisticsUnits,
  useUpdateLogisticsUnit,
} from '../features/logistics/hooks/useLogistics';
import { PageHeader } from '../features/shared/PageHeader';
import { PageSectionContainer } from '../features/shared/PageSectionContainer';
import { Column, ResponsiveTable } from '../features/shared/ResponsiveTable';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { cn } from '../lib/utils';

export function LogisticsPage() {
  const { hasAnyRole } = useAuthContext();
  const { t } = useI18n();
  const canOperate = hasAnyRole(ADMIN_MANAGER_ROLES);

  const [searchParams, setSearchParams] = useSearchParams();
  const pageParam = Math.max(Number(searchParams.get('page')) || 1, 1);
  const limitParam = Number(searchParams.get('limit')) || 20;
  const initialSearch = searchParams.get('search') || '';

  const [searchInput, setSearchInput] = useState(initialSearch);
  const debouncedSearch = useDebouncedValue(searchInput, 400);

  // Đồng bộ từ khóa tìm kiếm sau khi debounce 400ms lên URL query params & đưa về trang 1
  useEffect(() => {
    const currentUrlSearch = searchParams.get('search') || '';
    const cleanedDebounced = trim(debouncedSearch);
    if (cleanedDebounced !== currentUrlSearch) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (cleanedDebounced) {
            next.set('search', cleanedDebounced);
          } else {
            next.delete('search');
          }
          next.set('page', '1');
          return next;
        },
        { replace: true },
      );
    }
  }, [debouncedSearch, searchParams, setSearchParams]);

  // State cho Modal Thêm mới / Chỉnh sửa
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<LogisticsUnit | null>(null);
  const [formName, setFormName] = useState('');
  const [formShortName, setFormShortName] = useState('');
  const [formAvatarUrl, setFormAvatarUrl] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formGmail, setFormGmail] = useState('');
  const [formIsHidden, setFormIsHidden] = useState(false);

  // State cho Modal Xem Avatar
  const [previewAvatar, setPreviewAvatar] = useState<{
    url: string;
    title: string;
  } | null>(null);

  // State cho Modal Xác nhận Xóa
  const [deletingUnit, setDeletingUnit] = useState<LogisticsUnit | null>(null);

  // State theo dõi ID bản ghi đang bật/tắt trạng thái ẩn trên từng dòng
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const activeSearchQuery = trim(debouncedSearch);

  const { data, isLoading, isFetching, refetch } = useLogisticsUnits({
    search: activeSearchQuery || undefined,
    page: pageParam,
    limit: limitParam,
  });

  const createMutation = useCreateLogisticsUnit();
  const updateMutation = useUpdateLogisticsUnit();
  const deleteMutation = useDeleteLogisticsUnit();

  const units = data?.data || [];
  const totalCount = data?.totalCount ?? 0;
  const filteredCount = data?.filteredCount ?? 0;
  const isSearching =
    isFetching || trim(searchInput) !== trim(debouncedSearch);

  if (!canOperate) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-card p-10 text-center shadow-sm">
        <ShieldAlert className="mx-auto h-10 w-10 text-destructive" />
        <h2 className="mt-3 font-display text-lg font-bold text-foreground">
          {t('forbidden.title')}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {t('forbidden.desc')}
        </p>
      </div>
    );
  }

  const handleOpenCreateModal = () => {
    setEditingUnit(null);
    setFormName('');
    setFormShortName('');
    setFormAvatarUrl('');
    setFormAddress('');
    setFormPhone('');
    setFormGmail('');
    setFormIsHidden(false);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (unit: LogisticsUnit) => {
    setEditingUnit(unit);
    setFormName(unit.name || '');
    setFormShortName(unit.shortName || '');
    setFormAvatarUrl(unit.avatarUrl || '');
    setFormAddress(unit.address || '');
    setFormPhone(unit.phone || '');
    setFormGmail(unit.gmail || '');
    setFormIsHidden(Boolean(unit.isHidden));
    setIsFormModalOpen(true);
  };

  const handleToggleHidden = async (unit: LogisticsUnit) => {
    setTogglingId(unit.id);
    try {
      await updateMutation.mutateAsync({
        id: unit.id,
        data: {
          isHidden: !unit.isHidden,
        },
      });
    } finally {
      setTogglingId(null);
    }
  };

  const handlePasteAvatarUrl = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        setFormAvatarUrl(text.trim());
        toast.success(t('logistics.pastedUrl'));
      }
    } catch {
      // Clipboard API permission denied or unsupported
    }
  };

  const handleCopyAvatarUrl = (url: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    toast.success(t('logistics.copiedUrl'));
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.warning(t('logistics.requiredNameWarning'));
      return;
    }

    if (editingUnit) {
      await updateMutation.mutateAsync({
        id: editingUnit.id,
        data: {
          name: formName.trim(),
          shortName: formShortName.trim(),
          avatarUrl: formAvatarUrl.trim(),
          address: formAddress.trim(),
          phone: formPhone.trim(),
          gmail: formGmail.trim(),
          isHidden: formIsHidden,
        },
      });
    } else {
      await createMutation.mutateAsync({
        name: formName.trim(),
        shortName: formShortName.trim(),
        avatarUrl: formAvatarUrl.trim(),
        address: formAddress.trim(),
        phone: formPhone.trim(),
        gmail: formGmail.trim(),
        isHidden: formIsHidden,
      });
    }

    setIsFormModalOpen(false);
    setEditingUnit(null);
  };

  const handleConfirmDelete = async () => {
    if (!deletingUnit) return;
    await deleteMutation.mutateAsync(deletingUnit.id);
    setDeletingUnit(null);
  };

  const columns: Column<LogisticsUnit>[] = [
    {
      key: 'index',
      header: t('logistics.colIndex'),
      align: 'center',
      width: 64,
      skeletonRender: () => (
        <div className="mx-auto h-4 w-5 rounded bg-muted" />
      ),
      render: (_unit, idx) => (
        <span className="font-mono text-xs font-bold text-muted-foreground">
          {(pageParam - 1) * limitParam + idx + 1}
        </span>
      ),
    },
    {
      key: 'avatar',
      header: t('logistics.colAvatar'),
      width: 96,
      skeletonRender: () => (
        <div className="h-11 w-11 rounded-xl bg-muted" />
      ),
      render: (unit) => (
        <div
          onClick={() => {
            if (unit.avatarUrl) {
              setPreviewAvatar({
                url: unit.avatarUrl,
                title: unit.name,
              });
            }
          }}
          title={unit.avatarUrl ? t('logistics.viewAvatarBtn') : undefined}
          className={cn(
            'group relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted',
            unit.avatarUrl && 'cursor-pointer hover:border-primary',
          )}
        >
          {unit.avatarUrl ? (
            <>
              <img
                src={unit.avatarUrl}
                alt={unit.name}
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <Eye className="h-4 w-4 text-white" />
              </div>
            </>
          ) : (
            <Building2 className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      ),
    },
    {
      key: 'name',
      header: t('logistics.colName'),
      isPrimary: true,
      skeletonRender: () => <div className="h-4 w-36 rounded bg-muted" />,
      render: (unit) => (
        <span
          className={cn(
            'font-display font-bold',
            unit.isHidden
              ? 'line-through text-muted-foreground'
              : 'text-foreground',
          )}
        >
          {unit.name}
        </span>
      ),
    },
    {
      key: 'shortName',
      header: t('logistics.colShortName'),
      width: 144,
      skeletonRender: () => <div className="h-6 w-16 rounded-md bg-muted" />,
      render: (unit) =>
        unit.shortName ? (
          <span
            className={cn(
              'rounded-md px-2.5 py-1 font-mono text-xs font-bold',
              unit.isHidden
                ? 'bg-muted text-muted-foreground'
                : 'bg-primary/15 text-foreground dark:text-primary',
            )}
          >
            {unit.shortName}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      key: 'address',
      header: t('logistics.colAddress'),
      isSecondary: true,
      skeletonRender: () => <div className="h-4 w-44 rounded bg-muted" />,
      render: (unit) =>
        unit.address ? (
          <div
            className={cn(
              'flex items-start gap-1.5 text-xs',
              unit.isHidden ? 'text-muted-foreground' : 'text-foreground',
            )}
          >
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="whitespace-pre-line">{unit.address}</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      key: 'phone',
      header: t('logistics.colPhone'),
      width: 160,
      skeletonRender: () => <div className="h-4 w-24 rounded bg-muted" />,
      render: (unit) =>
        unit.phone ? (
          <div
            className={cn(
              'inline-flex items-center gap-1.5 font-mono text-xs font-medium',
              unit.isHidden ? 'text-muted-foreground' : 'text-foreground',
            )}
          >
            <Phone
              className={cn(
                'h-3.5 w-3.5',
                unit.isHidden ? 'text-muted-foreground' : 'text-emerald-500',
              )}
            />
            <span>{unit.phone}</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      key: 'gmail',
      header: t('logistics.colGmail'),
      width: 210,
      skeletonRender: () => <div className="h-4 w-36 rounded bg-muted" />,
      render: (unit) =>
        unit.gmail ? (
          <div
            className={cn(
              'inline-flex items-center gap-1.5 font-mono text-xs',
              unit.isHidden ? 'text-muted-foreground' : 'text-foreground',
            )}
          >
            <Mail
              className={cn(
                'h-3.5 w-3.5',
                unit.isHidden ? 'text-muted-foreground' : 'text-sky-500',
              )}
            />
            <span>{unit.gmail}</span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        ),
    },
    {
      key: 'status',
      header: t('logistics.colStatus'),
      width: 130,
      skeletonRender: () => <div className="h-5 w-16 rounded-md bg-muted" />,
      render: (unit) =>
        unit.isHidden ? (
          <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
            <EyeOff className="h-3 w-3" />
            <span>{t('logistics.statusHidden')}</span>
          </span>
        ) : (
          <span className="status-badge status-active text-[11px]">
            {t('logistics.statusVisible')}
          </span>
        ),
    },
    {
      key: 'actions',
      header: t('logistics.colActions'),
      align: 'right',
      width: 130,
      skeletonRender: () => (
        <div className="ml-auto flex items-center justify-end gap-1">
          <div className="h-8 w-8 rounded-lg bg-muted" />
          <div className="h-8 w-8 rounded-lg bg-muted" />
          <div className="h-8 w-8 rounded-lg bg-muted" />
        </div>
      ),
      render: (unit) => {
        const isHidden = Boolean(unit.isHidden);
        return (
          <div className="inline-flex items-center justify-end gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleToggleHidden(unit)}
              disabled={togglingId === unit.id}
              title={
                isHidden
                  ? t('logistics.unhideTooltip')
                  : t('logistics.hideTooltip')
              }
            >
              {togglingId === unit.id ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : isHidden ? (
                <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              ) : (
                <EyeOff className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => handleOpenEditModal(unit)}
              disabled={togglingId === unit.id}
              title={t('logistics.editBtn')}
            >
              <Pencil className="h-4 w-4 text-muted-foreground hover:text-foreground" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setDeletingUnit(unit)}
              disabled={togglingId === unit.id}
              title={t('logistics.deleteBtn')}
            >
              <Trash2 className="h-4 w-4 text-rose-500 hover:text-rose-600 dark:text-rose-400" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="page-container">
      {/* Page Header đồng bộ với TagsPage / CategoriesPage / UsersPage */}
      <PageHeader
        subtitle={t('logistics.subtitle')}
        title={t('logistics.title')}
        badge={`${totalCount} Logistics`}
        description={t('logistics.desc')}
        actions={
          <PermissionGate
            roles={ADMIN_MANAGER_ROLES}
            permission={PERMISSIONS.DASHBOARD_VIEW}
          >
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw
                  className={cn('h-4 w-4', isFetching && 'animate-spin')}
                />
                <span>{t('logistics.refreshBtn')}</span>
              </Button>

              <Button onClick={handleOpenCreateModal}>
                <Plus className="h-4 w-4" />
                <span>{t('logistics.addBtn')}</span>
              </Button>
            </div>
          </PermissionGate>
        }
      />

      {/* Cục Tổng Đơn Vị Logistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="stat-card border-primary/40 bg-primary/5">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t('logistics.totalCardTitle')}
              </p>
              {isLoading ? (
                <>
                  <div className="h-9 w-16 animate-pulse rounded-lg bg-muted" />
                  <div className="h-3.5 w-44 animate-pulse rounded bg-muted" />
                </>
              ) : (
                <>
                  <p className="font-display text-3xl font-bold text-foreground dark:text-primary">
                    {totalCount}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('logistics.totalCardSub')}
                  </p>
                </>
              )}
            </div>
            <div className="stat-card-icon h-11 w-11">
              <Truck className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {t('logistics.filteredCardTitle')}
              </p>
              {isLoading || isSearching ? (
                <>
                  <div className="h-9 w-16 animate-pulse rounded-lg bg-muted" />
                  <div className="h-3.5 w-48 animate-pulse rounded bg-muted" />
                </>
              ) : (
                <>
                  <p className="font-display text-3xl font-bold text-foreground">
                    {filteredCount}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activeSearchQuery
                      ? t('logistics.filteredCardSubSearch', {
                          query: activeSearchQuery,
                        })
                      : t('logistics.filteredCardSubAll')}
                  </p>
                </>
              )}
            </div>
            <div className="stat-card-icon h-11 w-11">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Bảng Danh Sách Đơn Vị Logistics chuẩn PageSectionContainer */}
      <PageSectionContainer
        title={t('logistics.listTitle', { count: filteredCount })}
        subBadge="Logistics Partners"
        description={t('logistics.listSub')}
        icon={Building2}
        headerRight={
          isLoading || isSearching ? (
            <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
          ) : (
            <span className="status-badge status-active font-mono text-xs">
              {t('products.totalRows', { total: filteredCount })}
            </span>
          )
        }
        toolbar={
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('logistics.searchPlaceholder')}
              className="pl-9 pr-16"
            />
            <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
              {isSearching ? (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              ) : null}
              {searchInput ? (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              ) : null}
            </div>
          </div>
        }
        noBodyPadding
        footer={
          <Pagination
            embedded
            page={data?.meta?.page || 1}
            limit={data?.meta?.limit || 20}
            total={filteredCount}
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
        }
      >
        <ResponsiveTable
          embedded
          columns={columns}
          data={units}
          keyExtractor={(unit) => unit.id}
          isLoading={isLoading}
          isFetching={isSearching}
          emptyMessage={
            activeSearchQuery
              ? t('logistics.emptySearchTitle')
              : t('logistics.emptyTitle')
          }
          emptyDescription={t('logistics.emptyDesc')}
          rowClassName={(unit) =>
            unit.isHidden
              ? 'bg-muted/60 text-muted-foreground opacity-60 grayscale'
              : undefined
          }
        />
      </PageSectionContainer>

      {/* Modal Thêm Mới / Chỉnh Sửa Đơn Vị Logistics */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
              <div>
                <h3 className="font-display text-base font-bold text-foreground">
                  {editingUnit
                    ? t('logistics.editModalTitle')
                    : t('logistics.createModalTitle')}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {t('logistics.modalSub')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsFormModalOpen(false);
                  setEditingUnit(null);
                }}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={handleSubmitForm}
              autoComplete="off"
              className="mt-4 space-y-4"
            >
              {/* Field Avatar (Copy / truyền URL) — Hover hiện icon mắt trên ảnh */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  {t('logistics.fieldAvatar')}
                </label>
                <div className="flex items-center gap-3">
                  <div
                    onClick={() => {
                      if (formAvatarUrl.trim()) {
                        setPreviewAvatar({
                          url: formAvatarUrl.trim(),
                          title: formName.trim() || t('logistics.title'),
                        });
                      }
                    }}
                    title={
                      formAvatarUrl.trim()
                        ? t('logistics.viewAvatarBtn')
                        : undefined
                    }
                    className={cn(
                      'group relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted',
                      formAvatarUrl.trim() &&
                        'cursor-pointer hover:border-primary',
                    )}
                  >
                    {formAvatarUrl.trim() ? (
                      <>
                        <img
                          src={formAvatarUrl.trim()}
                          alt="Avatar preview"
                          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                          <Eye className="h-4 w-4 text-white" />
                        </div>
                      </>
                    ) : (
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <input
                      type="url"
                      autoComplete="off"
                      value={formAvatarUrl}
                      onChange={(e) => setFormAvatarUrl(e.target.value)}
                      placeholder={t('logistics.fieldAvatarPlaceholder')}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handlePasteAvatarUrl}
                        className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 px-2 py-1 text-[11px] font-medium text-foreground hover:border-primary"
                      >
                        <ClipboardPaste className="h-3 w-3" />
                        <span>{t('logistics.pasteUrlBtn')}</span>
                      </button>
                      {formAvatarUrl.trim() && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopyAvatarUrl(formAvatarUrl.trim())
                            }
                            className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 px-2 py-1 text-[11px] font-medium text-foreground hover:border-primary"
                          >
                            <ClipboardCopy className="h-3 w-3" />
                            <span>{t('logistics.copyUrlBtn')}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormAvatarUrl('')}
                            className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 px-2 py-1 text-[11px] font-medium text-rose-500 hover:border-rose-500"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>{t('logistics.clearUrlBtn')}</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 1. Tên đơn vị (text)(required) */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  {t('logistics.fieldName')}{' '}
                  <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoComplete="off"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={t('logistics.fieldNamePlaceholder')}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* 2. Tên viết tắt */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  {t('logistics.fieldShortName')}
                </label>
                <input
                  type="text"
                  autoComplete="off"
                  value={formShortName}
                  onChange={(e) => setFormShortName(e.target.value)}
                  placeholder={t('logistics.fieldShortNamePlaceholder')}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* 3. Địa chỉ (textarea) */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  {t('logistics.fieldAddress')}
                </label>
                <textarea
                  rows={3}
                  autoComplete="off"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  placeholder={t('logistics.fieldAddressPlaceholder')}
                  className="w-full rounded-lg border border-border bg-background p-3 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* 4. Số điện thoại (tel) & 5. Gmail */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    {t('logistics.fieldPhone')}
                  </label>
                  <input
                    type="tel"
                    autoComplete="off"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder={t('logistics.fieldPhonePlaceholder')}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    {t('logistics.fieldGmail')}
                  </label>
                  <input
                    type="email"
                    autoComplete="off"
                    value={formGmail}
                    onChange={(e) => setFormGmail(e.target.value)}
                    placeholder={t('logistics.fieldGmailPlaceholder')}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {/* 6. Trạng thái ẩn (isHidden) */}
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-border bg-muted/30 p-3">
                <div>
                  <p className="text-xs font-semibold text-foreground">
                    {t('logistics.fieldIsHidden')}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {t('logistics.fieldIsHiddenDesc')}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formIsHidden}
                  onChange={(e) => setFormIsHidden(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-primary"
                />
              </label>

              <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                  onClick={() => {
                    setIsFormModalOpen(false);
                    setEditingUnit(null);
                  }}
                >
                  <span>{t('app.cancel')}</span>
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : editingUnit ? (
                    <Pencil className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  <span>
                    {editingUnit
                      ? t('logistics.saveEditBtn')
                      : t('logistics.saveCreateBtn')}
                  </span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Xem Avatar (Preview) */}
      {previewAvatar && (
        <div
          onClick={() => setPreviewAvatar(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-2 border-b border-border pb-3">
              <h3 className="truncate font-display text-base font-bold text-foreground">
                {previewAvatar.title || t('logistics.viewAvatarModalTitle')}
              </h3>
              <button
                type="button"
                onClick={() => setPreviewAvatar(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="my-4 flex max-h-80 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/40 p-2">
              <img
                src={previewAvatar.url}
                alt={previewAvatar.title}
                className="max-h-72 w-auto rounded-lg object-contain"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleCopyAvatarUrl(previewAvatar.url)}
                >
                  <ClipboardCopy className="h-3.5 w-3.5" />
                  <span>{t('logistics.copyUrlBtn')}</span>
                </Button>
                <a
                  href={previewAvatar.url}
                  target="_blank"
                  rel="noreferrer"
                  className="action-btn action-btn-secondary text-xs"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>{t('logistics.openOriginalUrl')}</span>
                </a>
              </div>
              <Button type="button" onClick={() => setPreviewAvatar(null)}>
                <span>{t('app.close')}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xác Nhận Xóa */}
      {deletingUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h3 className="font-display text-base font-bold text-foreground">
              {t('logistics.deleteModalTitle')}
            </h3>
            <p className="mt-2 text-xs text-muted-foreground">
              {t('logistics.deleteModalConfirm', { name: deletingUnit.name })}
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={deleteMutation.isPending}
                onClick={() => setDeletingUnit(null)}
              >
                <span>{t('app.cancel')}</span>
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleConfirmDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                <span>{t('logistics.confirmDeleteBtn')}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
