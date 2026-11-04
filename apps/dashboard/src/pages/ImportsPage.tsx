import {
  Box,
  CheckCircle2,
  ClipboardCopy,
  Clock,
  ExternalLink,
  Eye,
  FileCheck2,
  FileEdit,
  KeyRound,
  Layers,
  Link2,
  LogIn,
  LogOut,
  MessageSquare,
  Package,
  PackagePlus,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Truck,
  Wallet,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  deleteStoredImportOrderRecord,
  saveStoredImportOrderRecord,
  saveStoredImportTokenConfig,
} from '../api/data/hoabinh-55479-fallback';
import { decodeHoabinhJwt } from '../api/endpoints/imports.api';
import {
  HoabinhMainOrderData,
  ImportOrderTabType,
  StoredImportOrderRecord,
} from '../api/types/imports.types';
import { Pagination } from '../components/ui/pagination';
import {
  ADMIN_MANAGER_ROLES,
  PERMISSIONS,
} from '../constants/rbac.constants';
import { PermissionGate } from '../features/auth/components/PermissionGate';
import {
  useFetchExternalImportOrder,
  useImportOrders,
  useLoginHoabinh,
  useRestoreImportsData,
  useSyncImportOrderToCatalog,
  useUpdateImportOrderTab,
} from '../features/imports/hooks/useImports';
import { Column, ResponsiveTable } from '../features/shared/ResponsiveTable';
import { cn } from '../lib/utils';

type PrimaryImportMode = 'INTERNAL_CUSTOM' | 'PREVIOUS_ORDERS';

type DetailTabKey =
  | 'ITEMS'
  | 'PACKAGES'
  | 'PAYMENTS'
  | 'TIMELINE'
  | 'COMMENTS_JSON';

interface InternalCustomItemDraft {
  id: string;
  title: string;
  skuVariant: string;
  imageUrl: string;
  quantity: number;
  unitPriceVND: number;
}

const ORDER_SUB_TABS: Array<{
  key: ImportOrderTabType;
  label: string;
  shortLabel: string;
  orderType: number;
}> = [
  {
    key: 'CURRENT',
    label: 'Danh sách đơn (Hiện tại)',
    shortLabel: 'Danh sách đơn',
    orderType: 1,
  },
  {
    key: 'DRAFT',
    label: 'Danh sách đơn (Bản nháp)',
    shortLabel: 'Đơn nháp',
    orderType: 0,
  },
  {
    key: 'APPROVED',
    label: 'Danh sách bản đã duyệt',
    shortLabel: 'Đơn đã duyệt',
    orderType: 2,
  },
];

function formatVND(amount?: number | null): string {
  return `${Number(amount || 0).toLocaleString('vi-VN')}₫`;
}

function formatCNY(amount?: number | null): string {
  return `¥${Number(amount || 0).toLocaleString('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
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

export function ImportsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // 2 Tabs chính ở trang Nhập hàng:
  // 1) INTERNAL_CUSTOM: "Nhập hàng" (Custom của bản nội bộ)
  // 2) PREVIOUS_ORDERS: "Nhập hàng đơn trước đó" (Không gợi ý kết quả, đăng nhập mở pop-up lấy token)
  const primaryMode =
    (searchParams.get('mode') as PrimaryImportMode) || 'INTERNAL_CUSTOM';

  // 3 Sub-tabs: Danh sách đơn (Hiện tại) / Danh sách đơn (Bản nháp) / Danh sách bản đã duyệt
  const activeOrderTab =
    (searchParams.get('tab') as ImportOrderTabType) || 'CURRENT';
  const pageParam = Math.max(Number(searchParams.get('page')) || 1, 1);
  const limitParam = Number(searchParams.get('limit')) || 20;
  const searchQuery = searchParams.get('search') || '';

  const currentOrderType =
    activeOrderTab === 'DRAFT' ? 0 : activeOrderTab === 'APPROVED' ? 2 : 1;

  const [searchInput, setSearchInput] = useState(searchQuery);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [activeDetailTab, setActiveDetailTab] =
    useState<DetailTabKey>('ITEMS');
  const [markupMultiplier, setMarkupMultiplier] = useState<number>(1.38);

  // Pop-up Đăng nhập thao tác trên web của họ (Không gợi ý kết quả)
  const [isWebLoginPopupOpen, setIsWebLoginPopupOpen] = useState(false);
  const [popupUsername, setPopupUsername] = useState('');
  const [popupPassword, setPopupPassword] = useState('');
  const [popupTokenResult, setPopupTokenResult] = useState('');
  const [orderIdToFetch, setOrderIdToFetch] = useState('');

  // State cho Tab 1: "Nhập hàng (Custom của bản nội bộ)"
  const [showCreateInternalModal, setShowCreateInternalModal] = useState(false);
  const [customSupplierName, setCustomSupplierName] = useState('');
  const [customOrderCode, setCustomOrderCode] = useState('');
  const [customShippingFee, setCustomShippingFee] = useState('');
  const [customWeightKg, setCustomWeightKg] = useState('');
  const [customNote, setCustomNote] = useState('');
  const [customTargetTab, setCustomTargetTab] =
    useState<ImportOrderTabType>('CURRENT');
  const [customItems, setCustomItems] = useState<InternalCustomItemDraft[]>([
    {
      id: 'item-1',
      title: '',
      skuVariant: '',
      imageUrl: '',
      quantity: 1,
      unitPriceVND: 0,
    },
  ]);

  const { data, isLoading, isFetching, refetch } = useImportOrders({
    page: pageParam,
    limit: limitParam,
    PageIndex: pageParam,
    PageSize: limitParam,
    OrderBy: 'Id desc',
    UID: 0,
    OrderType: currentOrderType,
    tab: activeOrderTab,
    search: searchQuery || undefined,
  });

  const loginHoabinhMutation = useLoginHoabinh();
  const updateOrderTabMutation = useUpdateImportOrderTab();
  const fetchOrderMutation = useFetchExternalImportOrder();
  const syncCatalogMutation = useSyncImportOrderToCatalog();
  const restoreMutation = useRestoreImportsData();

  const tokenConfig = data?.tokenConfig;
  const isPreviousOrdersLinked = Boolean(tokenConfig?.hasToken);
  const decodedJwt = useMemo(
    () => decodeHoabinhJwt(tokenConfig?.token || ''),
    [tokenConfig?.token],
  );
  const uid = tokenConfig?.uid || decodedJwt.userData.UserId || 0;

  // Danh sách đơn hiển thị theo Tab chính (Nội bộ vs Đơn trước đó) & 3 Sub-tabs
  const allDisplayedOrders = useMemo(() => {
    const allOrders = data?.data || [];
    if (primaryMode === 'INTERNAL_CUSTOM') {
      return allOrders.filter((o) =>
        o.sourceUrl.startsWith('internal://'),
      );
    }
    if (!isPreviousOrdersLinked) {
      return [];
    }
    return allOrders.filter((o) => !o.sourceUrl.startsWith('internal://'));
  }, [primaryMode, data?.data, isPreviousOrdersLinked]);

  const tabCounts = useMemo(() => {
    return {
      CURRENT: data?.stats?.currentTabCount ?? 0,
      DRAFT: data?.stats?.draftTabCount ?? 0,
      APPROVED: data?.stats?.approvedTabCount ?? 0,
    };
  }, [data?.stats]);

  const selectedRecord = useMemo(() => {
    if (!selectedOrderId) return null;
    return (
      allDisplayedOrders.find((o) => o.id === selectedOrderId) ||
      (data?.data || []).find((o) => o.id === selectedOrderId) ||
      null
    );
  }, [allDisplayedOrders, data?.data, selectedOrderId]);

  const activeOrder: HoabinhMainOrderData | null =
    selectedRecord?.rawData || null;

  const handleSwitchPrimaryMode = (mode: PrimaryImportMode) => {
    setSelectedOrderId(null);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('mode', mode);
      next.set('page', '1');
      return next;
    });
  };

  const handleSelectSubTab = (tab: ImportOrderTabType) => {
    setSelectedOrderId(null);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      next.set('page', '1');
      return next;
    });
  };

  const handleApplySearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (searchInput.trim()) {
        next.set('search', searchInput.trim());
      } else {
        next.delete('search');
      }
      next.set('page', '1');
      return next;
    });
  };

  // Mở Pop-up cửa sổ trình duyệt thao tác trực tiếp trên web của họ
  const handleOpenExternalWebPopup = () => {
    const width = 1040;
    const height = 740;
    const left = Math.max(0, Math.round((window.screen.width - width) / 2));
    const top = Math.max(0, Math.round((window.screen.height - height) / 2));

    window.open(
      'https://hoabinhlogistics.com',
      'HoabinhLogisticsLoginPopup',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`,
    );
    setIsWebLoginPopupOpen(true);
  };

  // Xử lý khi đăng nhập trên Pop-up thành công -> Lấy Token về
  const handleCompletePopupLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedToken = popupTokenResult.trim().replace(/^Bearer\s+/i, '');
    if (!cleanedToken && !popupUsername.trim()) {
      toast.warning('Vui lòng nhập tài khoản/mật khẩu hoặc dán Token lấy từ web');
      return;
    }

    await loginHoabinhMutation.mutateAsync({
      userName: popupUsername.trim(),
      password: popupPassword,
      customToken: cleanedToken || undefined,
    });

    setIsWebLoginPopupOpen(false);
    setPopupUsername('');
    setPopupPassword('');
    setPopupTokenResult('');
    refetch();
  };

  const handleUnlinkPreviousOrders = () => {
    saveStoredImportTokenConfig({
      token: '',
      userName: '',
      uid: 0,
      sourceUrl: '',
    });
    localStorage.removeItem('hoabinh_import_token');
    setSelectedOrderId(null);
    refetch();
    toast.info('Đã ngắt kết nối Token.');
  };

  const handleFetchOrderById = () => {
    const raw = orderIdToFetch.trim();
    if (!raw) {
      toast.warning('Vui lòng nhập mã đơn hàng hoặc URL cần lấy');
      return;
    }
    fetchOrderMutation.mutate({
      orderIdOrUrl: raw.startsWith('http')
        ? raw
        : `https://hoabinhlogistics.com/api/main-order/${raw}`,
      targetTab: activeOrderTab,
      autoSyncProducts: false,
      autoSyncCashbook: false,
    });
    setOrderIdToFetch('');
  };

  // Tạo đơn nhập hàng Custom Nội bộ (Tab 1)
  const handleCreateInternalCustomOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = customItems.filter((it) => it.title.trim().length > 0);
    if (validItems.length === 0) {
      toast.warning('Vui lòng nhập ít nhất 1 mặt hàng');
      return;
    }

    const newOrderId = Math.floor(10000 + Math.random() * 90000);
    const merchTotalVND = validItems.reduce(
      (sum, it) =>
        sum + Number(it.quantity || 1) * Number(it.unitPriceVND || 0),
      0,
    );
    const shipFeeVND = Number(customShippingFee || 0);
    const totalVND = merchTotalVND + shipFeeVND;
    const weightKg = Number(customWeightKg || 0);
    const nowIso = new Date().toISOString();

    const newRecord: StoredImportOrderRecord = {
      id: newOrderId,
      orderCode: customOrderCode.trim() || `NB-${newOrderId}`,
      sourceUrl: 'internal://bonzstore/custom-import',
      workflowTab: customTargetTab,
      orderTypeParam:
        customTargetTab === 'DRAFT' ? 0 : customTargetTab === 'APPROVED' ? 2 : 1,
      approvedAt: customTargetTab === 'APPROVED' ? nowIso : null,
      approvedBy: customTargetTab === 'APPROVED' ? 'Admin' : null,
      syncedToCatalog: false,
      syncedToCashbook: false,
      lastSyncedAt: nowIso,
      syncedProductIds: [],
      rawData: {
        Id: newOrderId,
        UID: uid,
        UserName: '',
        FullName: '',
        Email: '',
        Phone: '',
        Wallet: 0,
        Address: '',
        ReceiverFullName: '',
        ReceiverPhone: '',
        ReceiverEmail: '',
        DeliveryAddress: '',
        Status: customTargetTab === 'DRAFT' ? 0 : 14,
        StatusName:
          customTargetTab === 'DRAFT'
            ? 'Bản nháp'
            : customTargetTab === 'APPROVED'
              ? 'Đã duyệt'
              : 'Hiện tại',
        OrderType:
          customTargetTab === 'DRAFT'
            ? 0
            : customTargetTab === 'APPROVED'
              ? 2
              : 1,
        OrderTypeName: 'Đơn nhập nội bộ',
        FromPlaceName: customSupplierName.trim() || 'Nội bộ',
        ReceivePlaceName: 'Kho nội bộ',
        ShippingTypeName: 'Tự vận chuyển',
        TotalPriceVND: totalVND,
        TotalOrderAmount: totalVND,
        AmountDeposit: totalVND,
        Deposit: customTargetTab === 'DRAFT' ? 0 : totalVND,
        RemainingAmount: customTargetTab === 'DRAFT' ? totalVND : 0,
        PriceVND: merchTotalVND,
        PriceCNY: 0,
        TotalPriceReal: merchTotalVND,
        TotalPriceRealCNY: 0,
        CurrentCNYVN: 0,
        FeeBuyPro: 0,
        FeeBuyProCNY: 0,
        CKFeeBuyPro: 0,
        FeeWeight: shipFeeVND,
        OrderWeight: weightKg,
        TQVNWeight: weightKg,
        LessDeposit: 0,
        ShopId: '',
        ShopName: customSupplierName.trim() || 'Nhà cung cấp nội bộ',
        Site: 'NỘI BỘ',
        ImageOrigin: validItems[0]?.imageUrl?.trim() || '',
        OrdererUserName: '',
        SalerUserName: '',
        ReceivedBy: '',
        WaitHCMBy: '',
        GoingHCMBy: '',
        StaffNote: customNote.trim(),
        Note: customNote.trim(),
        Created: nowIso,
        CreatedBy: 'Admin',
        Updated: nowIso,
        UpdatedBy: 'Admin',
        DepositDate: nowIso,
        DateBuy: nowIso,
        DateBuying: nowIso,
        DateDelivery: nowIso,
        DateBackToVN: nowIso,
        DateWaitHCM: nowIso,
        DateGoingHCM: nowIso,
        DateVN: nowIso,
        DateReceived: nowIso,
        PayDate: nowIso,
        CompleteDate: nowIso,
        MainOrderCodes: [
          {
            MainOrderID: newOrderId,
            Code: customOrderCode.trim() || `NB-${newOrderId}`,
            OrderTransactionCode: [],
            RowNumber: 0,
            Id: newOrderId,
            Created: nowIso,
            CreatedBy: 'Admin',
          },
        ],
        SmallPackages: [],
        Orders: validItems.map((it, idx) => ({
          Id: newOrderId * 100 + idx + 1,
          MainOrderId: newOrderId,
          ItemId: `${newOrderId}-${idx + 1}`,
          TitleOrigin: it.title.trim(),
          TitleTranslated: it.title.trim(),
          Property: it.skuVariant.trim(),
          PropertyTranslated: it.skuVariant.trim(),
          Quantity: Number(it.quantity || 1),
          RealPrice: 0,
          PriceOrigin: 0,
          PricePromotion: 0,
          UPriceBuy: 0,
          UPriceBuyVN: Number(it.unitPriceVND || 0),
          PriceCNY: 0,
          PriceVND: Number(it.unitPriceVND || 0) * Number(it.quantity || 1),
          TotalPriceVND:
            Number(it.unitPriceVND || 0) * Number(it.quantity || 1),
          CurrentCNYVN: 0,
          ImageOrigin: it.imageUrl.trim() || '',
          LinkOrigin: '',
          ShopId: '',
          ShopName: customSupplierName.trim() || '',
          Wangwang: '',
          Site: 'NỘI BỘ',
          Stock: Number(it.quantity || 1),
          StepPrice: '',
          ProductStatusName: '',
          StatusComplainName: '',
          Created: nowIso,
          CreatedBy: 'Admin',
        })),
        PayOrderHistories: [],
        OrderComments: [],
      },
    };

    saveStoredImportOrderRecord(newRecord);
    setSelectedOrderId(newOrderId);
    setShowCreateInternalModal(false);
    setCustomSupplierName('');
    setCustomOrderCode('');
    setCustomShippingFee('');
    setCustomWeightKg('');
    setCustomNote('');
    setCustomItems([
      {
        id: `item-${Date.now()}`,
        title: '',
        skuVariant: '',
        imageUrl: '',
        quantity: 1,
        unitPriceVND: 0,
      },
    ]);
    handleSelectSubTab(customTargetTab);
    refetch();
    toast.success(`Đã tạo đơn nhập hàng nội bộ #${newOrderId}`);
  };

  const handleMoveOrderBetweenTabs = (
    record: StoredImportOrderRecord,
    targetTab: ImportOrderTabType,
  ) => {
    updateOrderTabMutation.mutate({
      orderId: record.id,
      targetTab,
    });
  };

  const handleDeleteOrder = (record: StoredImportOrderRecord) => {
    deleteStoredImportOrderRecord(record.id);
    if (selectedOrderId === record.id) {
      setSelectedOrderId(null);
    }
    refetch();
    toast.success(`Đã xóa đơn #${record.id}`);
  };

  const handleViewOrderDetail = (orderId: number) => {
    setSelectedOrderId(orderId);
    const el = document.getElementById('hoabinh-order-detail-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Đã sao chép ${label}`);
  };

  const orderColumns: Column<StoredImportOrderRecord>[] = [
    {
      key: 'id',
      header: 'ID',
      width: 145,
      isPrimary: true,
      render: (record) => {
        const d = record.rawData;
        return (
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display text-base font-bold text-foreground">
                #{d.Id}
              </span>
              {d.Site && (
                <span className="rounded bg-amber-500/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400">
                  {d.Site}
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
              <span
                className="max-w-[110px] truncate"
                title={record.orderCode}
              >
                {record.orderCode}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyText(record.orderCode, 'Mã đơn');
                }}
                className="text-muted-foreground hover:text-primary"
              >
                <ClipboardCopy className="h-3 w-3" />
              </button>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {formatDateTime(d.Created)}
            </p>
          </div>
        );
      },
    },
    {
      key: 'image',
      header: 'Ảnh',
      width: 112,
      skeletonRender: () => (
        <div className="h-16 w-16 rounded-xl bg-muted" />
      ),
      render: (record) => {
        const d = record.rawData;
        return (
          <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
            {d.ImageOrigin ? (
              <img
                src={d.ImageOrigin}
                alt={`Đơn #${d.Id}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <Package className="h-6 w-6 text-muted-foreground" />
            )}
            <span className="absolute bottom-1 right-1 rounded bg-black/75 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">
              {d.Orders?.length || 0} SP
            </span>
          </div>
        );
      },
    },
    {
      key: 'info',
      header: 'Thông Tin',
      isSecondary: true,
      render: (record) => {
        const d = record.rawData;
        const totalQty = (d.Orders || []).reduce(
          (s, it) => s + Number(it.Quantity || 0),
          0,
        );
        return (
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display font-bold text-foreground">
                {d.ShopName || '—'}
              </span>
              {(d.FromPlaceName || d.ReceivePlaceName) && (
                <span className="rounded border border-border bg-muted/50 px-2 py-0.5 text-[11px] text-muted-foreground">
                  {d.FromPlaceName} → {d.ReceivePlaceName}
                </span>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              Sản phẩm:{' '}
              <strong className="text-foreground">
                {d.Orders?.length || 0} mặt hàng ({totalQty} cái)
              </strong>{' '}
              • Kiện:{' '}
              <strong className="text-foreground">
                {d.SmallPackages?.length || 0} kiện (
                {d.TQVNWeight || d.OrderWeight || 0} kg)
              </strong>
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
              <span>
                Tiền hàng:{' '}
                <strong className="text-foreground">
                  {formatVND(d.PriceVND)}
                </strong>
              </span>
              <span>
                Cước vận chuyển:{' '}
                <strong className="text-foreground">
                  {formatVND(d.FeeWeight)}
                </strong>
              </span>
              <span>
                Tổng cộng:{' '}
                <strong className="font-display text-sm text-emerald-600 dark:text-emerald-400">
                  {formatVND(d.TotalPriceVND)}
                </strong>
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Trạng Thái',
      width: 190,
      render: (record) => {
        const d = record.rawData;
        return (
          <div>
            <span className="status-badge status-active">{d.StatusName}</span>
            <div className="mt-2 flex flex-col gap-1">
              {record.syncedToCatalog && (
                <span className="inline-flex w-fit items-center gap-1 rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  Đã đồng bộ Kho SP
                </span>
              )}
              {record.syncedToCashbook && (
                <span className="inline-flex w-fit items-center gap-1 rounded bg-sky-500/15 px-2 py-0.5 text-[10px] font-semibold text-sky-600 dark:text-sky-400">
                  <Wallet className="h-3 w-3" />
                  Đã ghi Sổ Quỹ
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: 'Thao Tác',
      align: 'right',
      width: 260,
      render: (record) => (
        <div
          className="flex flex-wrap items-center justify-end gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => handleViewOrderDetail(record.id)}
            className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs font-semibold text-foreground hover:border-primary"
          >
            <Eye className="h-3.5 w-3.5 text-primary" />
            <span>Chi tiết</span>
          </button>

          {activeOrderTab !== 'APPROVED' && (
            <button
              type="button"
              onClick={() => handleMoveOrderBetweenTabs(record, 'APPROVED')}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
            >
              <FileCheck2 className="h-3.5 w-3.5" />
              <span>Duyệt đơn</span>
            </button>
          )}

          {activeOrderTab !== 'DRAFT' && (
            <button
              type="button"
              onClick={() => handleMoveOrderBetweenTabs(record, 'DRAFT')}
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/60 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <FileEdit className="h-3.5 w-3.5" />
              <span>Lưu nháp</span>
            </button>
          )}

          {activeOrderTab !== 'CURRENT' && (
            <button
              type="button"
              onClick={() => handleMoveOrderBetweenTabs(record, 'CURRENT')}
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/60 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <Truck className="h-3.5 w-3.5" />
              <span>Về Hiện tại</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleDeleteOrder(record)}
            className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 bg-destructive/10 px-2 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20"
            title="Xóa đơn"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <p className="page-subtitle">
            Quản Lý Nhập Hàng Nội Bộ & Liên Kết Đơn Hàng Trước Đó
          </p>
          <h1 className="page-title">Quản Lý Nhập Hàng</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Chuyển đổi giữa 2 chế độ: <strong>Nhập hàng (Custom của bản nội bộ)</strong> và{' '}
            <strong>Nhập hàng đơn trước đó</strong> (Mở Pop-up thao tác trên web của họ để lấy Token).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {primaryMode === 'INTERNAL_CUSTOM' ? (
            <button
              type="button"
              onClick={() => setShowCreateInternalModal(true)}
              className="action-btn action-btn-primary"
            >
              <PackagePlus className="h-4 w-4" />
              <span>+ Tạo Đơn Nhập Hàng Nội Bộ</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleOpenExternalWebPopup}
              className="action-btn action-btn-primary"
            >
              <LogIn className="h-4 w-4" />
              <span>
                {isPreviousOrdersLinked
                  ? 'Đã lấy Token — Mở lại Pop-up Web'
                  : 'Đăng nhập Pop-up Web & Lấy Token'}
              </span>
            </button>
          )}

          <PermissionGate
            roles={ADMIN_MANAGER_ROLES}
            permission={PERMISSIONS.DASHBOARD_VIEW}
          >
            <button
              type="button"
              onClick={() => {
                setSelectedOrderId(null);
                restoreMutation.mutate();
              }}
              disabled={restoreMutation.isPending}
              className="action-btn action-btn-secondary text-destructive hover:border-destructive"
              title="Xóa trắng toàn bộ dữ liệu để tự thao tác"
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

      {/* 2 Primary Tabs ở trang Nhập hàng:
          1. Nhập hàng (Custom của bản nội bộ)
          2. Nhập hàng đơn trước đó */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => handleSwitchPrimaryMode('INTERNAL_CUSTOM')}
          className={cn(
            'flex items-start gap-3.5 rounded-xl border p-4 text-left transition-all',
            primaryMode === 'INTERNAL_CUSTOM'
              ? 'border-primary bg-primary/10 shadow-xs'
              : 'border-border bg-card hover:border-primary/40 hover:bg-muted/30',
          )}
        >
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
              primaryMode === 'INTERNAL_CUSTOM'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground',
            )}
          >
            <PackagePlus className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-display text-sm font-bold text-foreground">
                1. Nhập hàng
              </span>
              <span className="rounded-md bg-primary/15 px-2 py-0.5 font-mono text-[10px] font-bold text-foreground dark:text-primary">
                Custom của bản nội bộ
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Tự tạo và quản lý đơn nhập hàng nội bộ, lưu nháp hoặc duyệt đơn.
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleSwitchPrimaryMode('PREVIOUS_ORDERS')}
          className={cn(
            'flex items-start gap-3.5 rounded-xl border p-4 text-left transition-all',
            primaryMode === 'PREVIOUS_ORDERS'
              ? 'border-primary bg-primary/10 shadow-xs'
              : 'border-border bg-card hover:border-primary/40 hover:bg-muted/30',
          )}
        >
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
              primaryMode === 'PREVIOUS_ORDERS'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground',
            )}
          >
            <Truck className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="font-display text-sm font-bold text-foreground">
                2. Nhập hàng đơn trước đó
              </span>
              <span
                className={cn(
                  'rounded-md px-2 py-0.5 font-mono text-[10px] font-bold',
                  isPreviousOrdersLinked
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
                )}
              >
                {isPreviousOrdersLinked ? 'Đã có Token' : 'Chưa đăng nhập'}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Không gợi ý kết quả • Khi thao tác đăng nhập mở Pop-up thao tác trên web của họ • Đăng nhập thành công lấy Token về.
            </p>
          </div>
        </button>
      </div>

      {/* Khu vực điều khiển riêng theo từng Tab chính */}
      {primaryMode === 'PREVIOUS_ORDERS' ? (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="flex items-start gap-3">
              <div className="stat-card-icon h-10 w-10 shrink-0">
                <Link2 className="h-5 w-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-base font-bold text-foreground">
                    Nhập Hàng Đơn Trước Đó
                  </h2>
                  {isPreviousOrdersLinked ? (
                    <span className="status-badge status-active">
                      Đã lấy Token
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                      Chưa đăng nhập lấy Token
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Không gợi ý kết quả. Khi thao tác đăng nhập sẽ mở Pop-up trên web của họ, đăng nhập thành công lấy Token về.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleOpenExternalWebPopup}
                className="action-btn action-btn-primary text-xs"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Đăng nhập (Mở Pop-up Web)</span>
              </button>

              {isPreviousOrdersLinked && (
                <>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      autoComplete="off"
                      spellCheck={false}
                      value={orderIdToFetch}
                      onChange={(e) => setOrderIdToFetch(e.target.value)}
                      placeholder="Nhập ID đơn..."
                      className="w-40 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleFetchOrderById}
                      disabled={fetchOrderMutation.isPending}
                      className="action-btn action-btn-secondary text-xs"
                    >
                      <RefreshCw
                        className={cn(
                          'h-3.5 w-3.5',
                          fetchOrderMutation.isPending && 'animate-spin',
                        )}
                      />
                      <span>Lấy chi tiết đơn</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleUnlinkPreviousOrders}
                    className="action-btn action-btn-secondary text-xs text-destructive hover:border-destructive"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Xóa Token</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <div className="stat-card-icon h-10 w-10 shrink-0">
                <PackagePlus className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-base font-bold text-foreground">
                    Nhập Hàng (Custom Của Bản Nội Bộ)
                  </h2>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Tự tạo phiếu nhập hàng nội bộ và thao tác giữa 3 danh sách: Hiện tại, Bản nháp và Đã duyệt.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowCreateInternalModal(true)}
                className="action-btn action-btn-primary text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tạo Đơn Nhập Nội Bộ Mới</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/cashbook')}
                className="action-btn action-btn-secondary text-xs"
              >
                <Wallet className="h-3.5 w-3.5" />
                <span>Sổ Quỹ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bảng Danh Sách Đơn Hàng với 3 Sub-Tabs:
          - Danh sách đơn (Hiện tại)
          - Danh sách đơn (Bản nháp)
          - Danh sách bản đã duyệt
          Và đúng 5 cột: ID | Ảnh | Thông tin | Trạng thái | Thao tác */}
      <div className="rounded-xl border border-border bg-card shadow-sm">
        {/* Header 3 Sub-Tabs */}
        <div className="border-b border-border px-4 pt-4">
          <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
            <div className="flex flex-wrap items-center gap-2">
              {ORDER_SUB_TABS.map((tItem) => {
                const isActive = activeOrderTab === tItem.key;
                const count = tabCounts[tItem.key] ?? 0;

                return (
                  <button
                    key={tItem.key}
                    type="button"
                    onClick={() => handleSelectSubTab(tItem.key)}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-t-xl border-b-2 px-4 py-2.5 font-display text-xs font-bold transition-all',
                      isActive
                        ? 'border-primary bg-primary/10 text-foreground dark:text-primary'
                        : 'border-transparent text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                    )}
                  >
                    {tItem.key === 'CURRENT' && (
                      <Truck className="h-3.5 w-3.5" />
                    )}
                    {tItem.key === 'DRAFT' && (
                      <FileEdit className="h-3.5 w-3.5" />
                    )}
                    {tItem.key === 'APPROVED' && (
                      <FileCheck2 className="h-3.5 w-3.5" />
                    )}
                    <span>{tItem.label}</span>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 font-mono text-[10px]',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground',
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Thanh tìm kiếm (Không gợi ý kết quả / autoComplete="off") */}
            <form
              onSubmit={handleApplySearch}
              autoComplete="off"
              className="flex flex-wrap items-center gap-2 pb-2 lg:pb-0"
            >
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  autoComplete="off"
                  spellCheck={false}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Tìm kiếm..."
                  className="w-full rounded-lg border border-border bg-background py-1.5 pl-9 pr-8 text-xs text-foreground focus:border-primary focus:outline-none"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput('');
                      setSearchParams((prev) => {
                        const next = new URLSearchParams(prev);
                        next.delete('search');
                        next.set('page', '1');
                        return next;
                      });
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={() => refetch()}
                className="action-btn action-btn-secondary text-xs"
              >
                <RefreshCw
                  className={cn('h-3.5 w-3.5', isFetching && 'animate-spin')}
                />
                <span>Làm mới</span>
              </button>
            </form>
          </div>
        </div>

        {/* Bảng danh sách đơn chuẩn 5 cột (AntD-inspired Tailwind Table): ID | Ảnh | Thông Tin | Trạng Thái | Thao Tác */}
        <ResponsiveTable
          embedded
          columns={orderColumns}
          data={allDisplayedOrders}
          keyExtractor={(record) =>
            `${record.workflowTab || 'CURRENT'}-${record.id}`
          }
          isLoading={isLoading}
          isFetching={isFetching}
          onRowClick={(record) => setSelectedOrderId(record.id)}
          rowClassName={(record) =>
            cn(
              'align-top',
              record.id === selectedOrderId && 'bg-primary/10',
            )
          }
          emptyMessage="Chưa có dữ liệu đơn hàng"
          emptyDescription={
            primaryMode === 'INTERNAL_CUSTOM'
              ? 'Bấm "+ Tạo Đơn Nhập Hàng Nội Bộ" để tự thêm đơn mới.'
              : !isPreviousOrdersLinked
                ? 'Bấm "Đăng nhập (Mở Pop-up Web)" để đăng nhập trên web của họ và lấy Token về.'
                : 'Nhập ID đơn hàng và bấm "Lấy chi tiết đơn" để tải dữ liệu.'
          }
        />

        <div className="border-t border-border px-4 py-3">
          <Pagination
            page={data?.meta?.page || 1}
            limit={data?.meta?.limit || 20}
            total={allDisplayedOrders.length}
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

      {/* Pop-up Thao tác Đăng nhập trên Web của họ & Lấy Token về (Không gợi ý kết quả) */}
      {isWebLoginPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-foreground dark:text-primary">
                  <ExternalLink className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">
                    Pop-up Đăng Nhập Trên Web & Lấy Token
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Thao tác đăng nhập trên cửa sổ web của họ → Đăng nhập thành công lấy Token về
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsWebLoginPopupOpen(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={handleCompletePopupLogin}
              autoComplete="off"
              className="mt-4 space-y-4"
            >
              <div className="rounded-xl border border-border bg-muted/30 p-3.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-foreground">
                    Cửa sổ Pop-up Web bên ngoài
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      window.open(
                        'https://hoabinhlogistics.com',
                        'HoabinhLogisticsLoginPopup',
                        'width=1040,height=740,left=180,top=80',
                      );
                    }}
                    className="inline-flex items-center gap-1 font-semibold text-primary underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span>Mở lại cửa sổ Web</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    Tài khoản
                  </label>
                  <input
                    type="text"
                    name="hb_web_user_clean"
                    autoComplete="off"
                    spellCheck={false}
                    value={popupUsername}
                    onChange={(e) => setPopupUsername(e.target.value)}
                    placeholder="Nhập tài khoản..."
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    name="hb_web_pass_clean"
                    autoComplete="new-password"
                    value={popupPassword}
                    onChange={(e) => setPopupPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-foreground">
                  Token lấy về từ phiên đăng nhập
                </label>
                <textarea
                  rows={2}
                  autoComplete="off"
                  spellCheck={false}
                  value={popupTokenResult}
                  onChange={(e) => setPopupTokenResult(e.target.value)}
                  placeholder="Dán Bearer Token lấy từ web..."
                  className="w-full rounded-lg border border-border bg-background p-2.5 font-mono text-[11px] text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setIsWebLoginPopupOpen(false)}
                  className="action-btn action-btn-secondary text-xs"
                >
                  <span>Hủy</span>
                </button>
                <button
                  type="submit"
                  disabled={loginHoabinhMutation.isPending}
                  className="action-btn action-btn-primary text-xs"
                >
                  <KeyRound className="h-4 w-4" />
                  <span>
                    {loginHoabinhMutation.isPending
                      ? 'Đang xử lý...'
                      : 'Xác Nhận & Lấy Token Về'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Tạo Đơn Nhập Hàng Nội Bộ (Tab 1: Custom của bản nội bộ) */}
      {showCreateInternalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-border pb-4">
              <div>
                <h3 className="font-display text-base font-bold text-foreground">
                  Tạo Đơn Nhập Hàng (Custom Của Bản Nội Bộ)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Tự nhập thông tin đơn hàng nội bộ (không có dữ liệu gợi ý sẵn).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateInternalModal(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form
              onSubmit={handleCreateInternalCustomOrder}
              autoComplete="off"
              className="mt-4 space-y-4"
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    Nhà cung cấp / Nguồn nhập
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={customSupplierName}
                    onChange={(e) => setCustomSupplierName(e.target.value)}
                    placeholder="Nhập tên nhà cung cấp..."
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    Mã phiếu nhập
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={customOrderCode}
                    onChange={(e) => setCustomOrderCode(e.target.value)}
                    placeholder="Nhập mã phiếu..."
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    Lưu vào Tab
                  </label>
                  <select
                    value={customTargetTab}
                    onChange={(e) =>
                      setCustomTargetTab(e.target.value as ImportOrderTabType)
                    }
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground"
                  >
                    <option value="CURRENT">Danh sách đơn (Hiện tại)</option>
                    <option value="DRAFT">Danh sách đơn (Bản nháp)</option>
                    <option value="APPROVED">Danh sách bản đã duyệt</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-foreground">
                    Danh sách sản phẩm nhập
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setCustomItems((prev) => [
                        ...prev,
                        {
                          id: `item-${Date.now()}`,
                          title: '',
                          skuVariant: '',
                          imageUrl: '',
                          quantity: 1,
                          unitPriceVND: 0,
                        },
                      ])
                    }
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Thêm dòng sản phẩm</span>
                  </button>
                </div>

                {customItems.map((it, idx) => (
                  <div
                    key={it.id}
                    className="grid grid-cols-1 gap-2 rounded-xl border border-border bg-muted/20 p-3 sm:grid-cols-12"
                  >
                    <div className="sm:col-span-5">
                      <input
                        type="text"
                        autoComplete="off"
                        value={it.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomItems((prev) =>
                            prev.map((p, i) =>
                              i === idx ? { ...p, title: val } : p,
                            ),
                          );
                        }}
                        placeholder="Tên sản phẩm..."
                        className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <input
                        type="text"
                        autoComplete="off"
                        value={it.skuVariant}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomItems((prev) =>
                            prev.map((p, i) =>
                              i === idx ? { ...p, skuVariant: val } : p,
                            ),
                          );
                        }}
                        placeholder="Phân loại..."
                        className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <input
                        type="number"
                        min={1}
                        value={it.quantity}
                        onChange={(e) => {
                          const val = Number(e.target.value || 1);
                          setCustomItems((prev) =>
                            prev.map((p, i) =>
                              i === idx ? { ...p, quantity: val } : p,
                            ),
                          );
                        }}
                        placeholder="SL"
                        className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs"
                      />
                    </div>
                    <div className="flex items-center gap-1 sm:col-span-2">
                      <input
                        type="number"
                        min={0}
                        value={it.unitPriceVND || ''}
                        onChange={(e) => {
                          const val = Number(e.target.value || 0);
                          setCustomItems((prev) =>
                            prev.map((p, i) =>
                              i === idx ? { ...p, unitPriceVND: val } : p,
                            ),
                          );
                        }}
                        placeholder="Đơn giá"
                        className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
                      />
                      {customItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setCustomItems((prev) =>
                              prev.filter((_, i) => i !== idx),
                            )
                          }
                          className="text-destructive hover:opacity-80"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    Cước vận chuyển (VNĐ)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={customShippingFee}
                    onChange={(e) => setCustomShippingFee(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    Trọng lượng (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min={0}
                    value={customWeightKg}
                    onChange={(e) => setCustomWeightKg(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    Ghi chú
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="Nhập ghi chú..."
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateInternalModal(false)}
                  className="action-btn action-btn-secondary text-xs"
                >
                  <span>Đóng</span>
                </button>
                <button
                  type="submit"
                  className="action-btn action-btn-primary text-xs"
                >
                  <PackagePlus className="h-4 w-4" />
                  <span>Lưu Đơn Nhập Hàng</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Khung Xem Chi Tiết Đơn Hàng Đang Chọn */}
      {activeOrder && (
        <div
          id="hoabinh-order-detail-section"
          className="rounded-xl border border-border bg-card shadow-sm"
        >
          <div className="flex flex-col justify-between gap-4 border-b border-border p-5 lg:flex-row lg:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-primary/20 px-2.5 py-1 font-display text-xs font-bold text-foreground dark:text-primary">
                  CHI TIẾT ĐƠN NHẬP HÀNG #{activeOrder.Id}
                </span>
                <span className="status-badge status-active">
                  {activeOrder.StatusName}
                </span>
                <span className="rounded border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  {activeOrder.OrderTypeName}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Shop:{' '}
                <strong className="text-foreground">
                  {activeOrder.ShopName || '—'}
                </strong>{' '}
                • Mã đơn:{' '}
                <strong className="text-foreground">
                  {activeOrder.MainOrderCodes?.[0]?.Code || '—'}
                </strong>
              </p>
            </div>

            <PermissionGate
              roles={ADMIN_MANAGER_ROLES}
              permission={PERMISSIONS.DASHBOARD_VIEW}
            >
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 rounded-lg border border-border bg-muted/40 px-2.5 py-1 text-xs">
                  <span className="text-muted-foreground">Hệ số giá bán:</span>
                  <input
                    type="number"
                    step="0.05"
                    min="1.05"
                    max="3"
                    value={markupMultiplier}
                    onChange={(e) =>
                      setMarkupMultiplier(Number(e.target.value) || 1.38)
                    }
                    className="w-14 rounded border border-border bg-background px-1.5 py-0.5 text-center font-mono text-xs font-bold"
                  />
                </div>

                <button
                  type="button"
                  onClick={() =>
                    syncCatalogMutation.mutate({
                      orderId: activeOrder.Id,
                      priceMarkupMultiplier: markupMultiplier,
                    })
                  }
                  disabled={syncCatalogMutation.isPending}
                  className="action-btn action-btn-primary text-xs"
                >
                  <RefreshCw
                    className={cn(
                      'h-3.5 w-3.5',
                      syncCatalogMutation.isPending && 'animate-spin',
                    )}
                  />
                  <span>
                    {syncCatalogMutation.isPending
                      ? 'Đang đồng bộ...'
                      : 'Duyệt & Đồng Bộ Kho SP + Sổ Quỹ'}
                  </span>
                </button>
              </div>
            </PermissionGate>
          </div>

          {/* 5 Detail Tabs Navigation */}
          <div className="flex flex-wrap border-b border-border bg-muted/20 px-4">
            {[
              {
                key: 'ITEMS' as DetailTabKey,
                label: `1. Sản Phẩm (${activeOrder.Orders?.length || 0} dòng)`,
                icon: Layers,
              },
              {
                key: 'PACKAGES' as DetailTabKey,
                label: `2. Kiện Hàng (${activeOrder.SmallPackages?.length || 0} kiện)`,
                icon: Box,
              },
              {
                key: 'PAYMENTS' as DetailTabKey,
                label: `3. Lịch Sử Thanh Toán (${activeOrder.PayOrderHistories?.length || 0})`,
                icon: Wallet,
              },
              {
                key: 'TIMELINE' as DetailTabKey,
                label: '4. Tiến Trình Kho',
                icon: Clock,
              },
              {
                key: 'COMMENTS_JSON' as DetailTabKey,
                label: `5. Trao Đổi & Raw JSON`,
                icon: MessageSquare,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeDetailTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveDetailTab(tab.key)}
                  className={cn(
                    'inline-flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors',
                    active
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-5">
            {activeDetailTab === 'ITEMS' && (
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-muted/40">
                    <tr>
                      <th className="table-header-cell px-4 py-3">ID / Ảnh</th>
                      <th className="table-header-cell px-4 py-3">
                        Thông Tin Sản Phẩm & Phân Loại
                      </th>
                      <th className="table-header-cell px-4 py-3 text-center">
                        Số Lượng
                      </th>
                      <th className="table-header-cell px-4 py-3 text-right">
                        Đơn Giá
                      </th>
                      <th className="table-header-cell px-4 py-3 text-right">
                        Thành Tiền
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(activeOrder.Orders || []).map((item) => (
                      <tr key={item.Id} className="table-row-interactive">
                        <td className="px-4 py-3">
                          <span className="font-mono text-xs font-bold text-foreground">
                            #{item.Id}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-foreground">
                            {item.TitleTranslated || item.TitleOrigin}
                          </p>
                          {item.Property && (
                            <span className="mt-1 inline-block rounded bg-primary/15 px-2 py-0.5 text-xs font-medium text-foreground dark:text-primary">
                              {item.PropertyTranslated || item.Property}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center font-bold">
                          {item.Quantity}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {formatVND(item.UPriceBuyVN)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          {formatVND(item.PriceVND)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeDetailTab === 'PACKAGES' && (
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-muted/40">
                    <tr>
                      <th className="table-header-cell px-4 py-3">
                        ID Kiện / Mã Vận Đơn
                      </th>
                      <th className="table-header-cell px-4 py-3 text-right">
                        Cân Nặng
                      </th>
                      <th className="table-header-cell px-4 py-3 text-right">
                        Thành Tiền
                      </th>
                      <th className="table-header-cell px-4 py-3">
                        Trạng Thái
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(activeOrder.SmallPackages || []).map((pkg) => (
                      <tr key={pkg.Id} className="table-row-interactive">
                        <td className="px-4 py-3 font-mono text-xs">
                          #{pkg.Id} — {pkg.OrderTransactionCode}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold">
                          {pkg.PayableWeight || pkg.Weight} kg
                        </td>
                        <td className="px-4 py-3 text-right font-bold">
                          {formatVND(pkg.TotalPrice)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="status-badge status-active">
                            {pkg.StatusName}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeDetailTab === 'PAYMENTS' && (
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-muted/40">
                    <tr>
                      <th className="table-header-cell px-4 py-3">Mã GD</th>
                      <th className="table-header-cell px-4 py-3">Thời Gian</th>
                      <th className="table-header-cell px-4 py-3">Nội Dung</th>
                      <th className="table-header-cell px-4 py-3 text-right">
                        Số Tiền
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {(activeOrder.PayOrderHistories || []).map((pay) => (
                      <tr key={pay.Id} className="table-row-interactive">
                        <td className="px-4 py-3 font-mono text-xs">
                          #{pay.Id}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {formatDateTime(pay.Created)}
                        </td>
                        <td className="px-4 py-3 font-semibold">
                          {pay.StatusName}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-rose-600">
                          {formatVND(pay.Amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeDetailTab === 'TIMELINE' && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: '1. Ngày tạo đơn', time: activeOrder.Created },
                  { label: '2. Ngày đặt cọc', time: activeOrder.DepositDate },
                  { label: '3. Ngày đặt hàng', time: activeOrder.DateBuy },
                  { label: '4. Hoàn thành', time: activeOrder.CompleteDate },
                ].map((step, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-border bg-muted/20 p-3.5"
                  >
                    <p className="text-xs font-bold text-foreground">
                      {step.label}
                    </p>
                    <p className="mt-1 font-mono text-xs text-primary">
                      {formatDateTime(step.time)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {activeDetailTab === 'COMMENTS_JSON' && (
              <div className="rounded-xl border border-border bg-muted/30 p-4">
                <pre className="max-h-72 overflow-auto rounded-lg bg-background p-3 font-mono text-[11px] text-foreground">
                  {JSON.stringify(
                    { Success: true, Data: activeOrder },
                    null,
                    2,
                  )}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
