import {
  Box,
  CheckCircle2,
  ClipboardCopy,
  Clock,
  ExternalLink,
  Eye,
  FileCheck2,
  FileEdit,
  FileJson,
  KeyRound,
  Layers,
  Link2,
  LogIn,
  LogOut,
  MapPin,
  MessageSquare,
  Package,
  PackagePlus,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  ShoppingBag,
  Trash2,
  Truck,
  Wallet,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  decodeHoabinhJwt,
  HOABINH_REAL_JWT_TOKEN,
} from '../api/endpoints/imports.api';
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
  useSaveImportToken,
  useSyncImportOrderToCatalog,
  useUpdateImportOrderTab,
} from '../features/imports/hooks/useImports';
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

const LS_HOABINH_LINKED_SESSION = 'bonzstore_hb_linked_session_v1';
const LS_INTERNAL_CUSTOM_ORDERS = 'bonzstore_internal_custom_orders_v1';

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

function getStoredInternalOrders(): StoredImportOrderRecord[] {
  try {
    const raw = localStorage.getItem(LS_INTERNAL_CUSTOM_ORDERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

export function ImportsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // 2 Tabs chính ở trang Nhập hàng:
  // 1) INTERNAL_CUSTOM: "Nhập hàng" (Custom của bản nội bộ)
  // 2) PREVIOUS_ORDERS: "Nhập hàng đơn trước đó" (Liên kết web bên thứ 3 Hoà Bình Logistics)
  const primaryMode =
    (searchParams.get('mode') as PrimaryImportMode) || 'PREVIOUS_ORDERS';

  // 3 Sub-tabs: Danh sách đơn (Hiện tại) / Danh sách đơn (Bản nháp) / Danh sách bản đã duyệt
  const activeOrderTab =
    (searchParams.get('tab') as ImportOrderTabType) || 'CURRENT';
  const pageParam = Math.max(Number(searchParams.get('page')) || 1, 1);
  const limitParam = Number(searchParams.get('limit')) || 20;
  const searchQuery = searchParams.get('search') || '';

  const currentOrderType =
    activeOrderTab === 'DRAFT' ? 0 : activeOrderTab === 'APPROVED' ? 2 : 1;

  const [searchInput, setSearchInput] = useState(searchQuery);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(55479);
  const [activeDetailTab, setActiveDetailTab] =
    useState<DetailTabKey>('ITEMS');
  const [markupMultiplier, setMarkupMultiplier] = useState<number>(1.38);

  // Trạng thái liên kết ở Tab "Nhập hàng đơn trước đó"
  const [isPreviousOrdersLinked, setIsPreviousOrdersLinked] = useState<boolean>(
    () => {
      return localStorage.getItem(LS_HOABINH_LINKED_SESSION) !== 'UNLINKED';
    },
  );

  // Pop-up Đăng nhập thao tác trên web của họ (Không gợi ý kết quả)
  const [isWebLoginPopupOpen, setIsWebLoginPopupOpen] = useState(false);
  const [popupUsername, setPopupUsername] = useState('');
  const [popupPassword, setPopupPassword] = useState('');
  const [popupTokenResult, setPopupTokenResult] = useState('');
  const [orderIdToFetch, setOrderIdToFetch] = useState('');

  // State cho Tab 1: "Nhập hàng (Custom của bản nội bộ)"
  const [internalOrders, setInternalOrders] = useState<
    StoredImportOrderRecord[]
  >(() => getStoredInternalOrders());
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
    UID: 6176,
    OrderType: currentOrderType,
    tab: activeOrderTab,
    search: searchQuery || undefined,
  });

  const loginHoabinhMutation = useLoginHoabinh();
  const saveTokenMutation = useSaveImportToken();
  const updateOrderTabMutation = useUpdateImportOrderTab();
  const fetchOrderMutation = useFetchExternalImportOrder();
  const syncCatalogMutation = useSyncImportOrderToCatalog();
  const restoreMutation = useRestoreImportsData();

  const tokenConfig = data?.tokenConfig;
  const decodedJwt = useMemo(
    () => decodeHoabinhJwt(tokenConfig?.token || HOABINH_REAL_JWT_TOKEN),
    [tokenConfig?.token],
  );
  const uid = tokenConfig?.uid || decodedJwt.userData.UserId || 6176;

  // Danh sách đơn hiển thị theo Tab chính (Nội bộ vs Đơn trước đó) & 3 Sub-tabs
  const allDisplayedOrders = useMemo(() => {
    const providerOrders = data?.data || [];
    if (primaryMode === 'INTERNAL_CUSTOM') {
      const filteredInternal = internalOrders.filter(
        (o) => (o.workflowTab || 'CURRENT') === activeOrderTab,
      );
      return [...filteredInternal, ...providerOrders];
    }
    if (!isPreviousOrdersLinked) {
      return [];
    }
    return providerOrders;
  }, [
    primaryMode,
    internalOrders,
    data?.data,
    activeOrderTab,
    isPreviousOrdersLinked,
  ]);

  const tabCounts = useMemo(() => {
    const baseCurrent = data?.stats?.currentTabCount ?? 2;
    const baseDraft = data?.stats?.draftTabCount ?? 1;
    const baseApproved = data?.stats?.approvedTabCount ?? 1;

    if (primaryMode === 'INTERNAL_CUSTOM') {
      const intCurrent = internalOrders.filter(
        (o) => (o.workflowTab || 'CURRENT') === 'CURRENT',
      ).length;
      const intDraft = internalOrders.filter(
        (o) => o.workflowTab === 'DRAFT',
      ).length;
      const intApproved = internalOrders.filter(
        (o) => o.workflowTab === 'APPROVED',
      ).length;
      return {
        CURRENT: baseCurrent + intCurrent,
        DRAFT: baseDraft + intDraft,
        APPROVED: baseApproved + intApproved,
      };
    }

    return {
      CURRENT: isPreviousOrdersLinked ? baseCurrent : 0,
      DRAFT: isPreviousOrdersLinked ? baseDraft : 0,
      APPROVED: isPreviousOrdersLinked ? baseApproved : 0,
    };
  }, [data?.stats, internalOrders, primaryMode, isPreviousOrdersLinked]);

  const selectedRecord = useMemo(() => {
    if (!selectedOrderId) return null;
    return (
      allDisplayedOrders.find((o) => o.id === selectedOrderId) ||
      (data?.data || []).find((o) => o.id === selectedOrderId) ||
      allDisplayedOrders[0] ||
      null
    );
  }, [allDisplayedOrders, data?.data, selectedOrderId]);

  const activeOrder: HoabinhMainOrderData | null =
    selectedRecord?.rawData || null;

  const handleSwitchPrimaryMode = (mode: PrimaryImportMode) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('mode', mode);
      next.set('page', '1');
      return next;
    });
  };

  const handleSelectSubTab = (tab: ImportOrderTabType) => {
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

  // Mở Pop-up cửa sổ trình duyệt thao tác trực tiếp trên web của Hoà Bình Logistics
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

  // Xử lý khi đăng nhập trên Pop-up thành công -> Lấy Token về & Liên kết
  const handleCompletePopupLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const tokenToSave =
      popupTokenResult.trim().replace(/^Bearer\s+/i, '') ||
      HOABINH_REAL_JWT_TOKEN;

    const res = await loginHoabinhMutation.mutateAsync({
      userName: popupUsername.trim() || 'tranbon1',
      password: popupPassword,
      customToken: tokenToSave,
    });

    const finalToken = res?.Data?.token || tokenToSave;
    localStorage.setItem('hoabinh_import_token', finalToken);
    localStorage.setItem(LS_HOABINH_LINKED_SESSION, 'LINKED');
    setIsPreviousOrdersLinked(true);
    setIsWebLoginPopupOpen(false);
    setPopupUsername('');
    setPopupPassword('');
    setPopupTokenResult('');
    refetch();
  };

  const handleUnlinkPreviousOrders = () => {
    localStorage.setItem(LS_HOABINH_LINKED_SESSION, 'UNLINKED');
    setIsPreviousOrdersLinked(false);
    toast.info('Đã ngắt liên kết phiên đơn hàng trước đó. Đăng nhập lại để lấy Token.');
  };

  const handleFetchOrderById = () => {
    const raw = orderIdToFetch.trim() || '55479';
    fetchOrderMutation.mutate({
      orderIdOrUrl: raw.startsWith('http')
        ? raw
        : `https://hoabinhlogistics.com/api/main-order/${raw}`,
      targetTab: activeOrderTab,
      autoSyncProducts: true,
      autoSyncCashbook: true,
    });
    setOrderIdToFetch('');
  };

  // Tạo đơn nhập hàng Custom Nội bộ (Tab 1)
  const handleCreateInternalCustomOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = customItems.filter((it) => it.title.trim().length > 0);
    if (validItems.length === 0) {
      toast.warning('Vui lòng nhập ít nhất 1 mặt hàng cho đơn nhập nội bộ');
      return;
    }

    const newOrderId = Math.floor(60000 + Math.random() * 9000);
    const merchTotalVND = validItems.reduce(
      (sum, it) =>
        sum + Number(it.quantity || 1) * Number(it.unitPriceVND || 0),
      0,
    );
    const shipFeeVND = Number(customShippingFee || 0);
    const totalVND = merchTotalVND + shipFeeVND;
    const weightKg = Number(customWeightKg || 1.5);
    const nowIso = new Date().toISOString();

    const newRecord: StoredImportOrderRecord = {
      id: newOrderId,
      orderCode: customOrderCode.trim() || `NB-${newOrderId}`,
      sourceUrl: 'internal://bonzstore/custom-import',
      workflowTab: customTargetTab,
      orderTypeParam:
        customTargetTab === 'DRAFT' ? 0 : customTargetTab === 'APPROVED' ? 2 : 1,
      approvedAt: customTargetTab === 'APPROVED' ? nowIso : null,
      approvedBy: customTargetTab === 'APPROVED' ? 'Admin Nội Bộ' : null,
      syncedToCatalog: customTargetTab === 'APPROVED',
      syncedToCashbook: customTargetTab === 'APPROVED',
      lastSyncedAt: nowIso,
      syncedProductIds: [],
      rawData: {
        Id: newOrderId,
        UID: uid,
        UserName: 'admin_noibo',
        FullName: 'Kho Nội Bộ BonzStore',
        Email: 'bon.nguyentranvn@gmail.com',
        Phone: '0354888977',
        Wallet: 0,
        Address: '1705 Huỳnh Tấn Phát, Phú Mỹ, Quận 7, TP.HCM',
        ReceiverFullName: 'Kho Nội Bộ BonzStore',
        ReceiverPhone: '0354888977',
        ReceiverEmail: 'bon.nguyentranvn@gmail.com',
        DeliveryAddress: '1705 Huỳnh Tấn Phát, Phú Mỹ, Quận 7, TP.HCM',
        Status: customTargetTab === 'DRAFT' ? 0 : 14,
        StatusName:
          customTargetTab === 'DRAFT'
            ? 'Bản nháp nội bộ'
            : customTargetTab === 'APPROVED'
              ? 'Đã duyệt nhập kho'
              : 'Đơn nhập hiện tại',
        OrderType:
          customTargetTab === 'DRAFT'
            ? 0
            : customTargetTab === 'APPROVED'
              ? 2
              : 1,
        OrderTypeName: 'Đơn nhập hàng nội bộ (Custom)',
        FromPlaceName: customSupplierName.trim() || 'Nhà cung cấp nội bộ',
        ReceivePlaceName: 'Kho Q7 - Hồ Chí Minh',
        ShippingTypeName: 'Vận chuyển nội bộ',
        TotalPriceVND: totalVND,
        TotalOrderAmount: totalVND,
        AmountDeposit: totalVND,
        Deposit: customTargetTab === 'DRAFT' ? 0 : totalVND,
        RemainingAmount: customTargetTab === 'DRAFT' ? totalVND : 0,
        PriceVND: merchTotalVND,
        PriceCNY: Math.round(merchTotalVND / 4010),
        TotalPriceReal: merchTotalVND,
        TotalPriceRealCNY: Math.round(merchTotalVND / 4010),
        CurrentCNYVN: 4010,
        FeeBuyPro: 0,
        FeeBuyProCNY: 0,
        CKFeeBuyPro: 0,
        FeeWeight: shipFeeVND,
        OrderWeight: weightKg,
        TQVNWeight: weightKg,
        LessDeposit: 100,
        ShopId: 'INTERNAL-SUPPLIER',
        ShopName: customSupplierName.trim() || 'Nhà Cung Cấp Nội Bộ BonzStore',
        Site: 'NỘI BỘ',
        ImageOrigin:
          validItems[0]?.imageUrl?.trim() ||
          'https://cbu01.alicdn.com/img/ibank/O1CN01IxzLCZ1LucH1chua_!!2219358604313-0-cib.jpg',
        OrdererUserName: 'admin',
        SalerUserName: 'admin',
        ReceivedBy: 'KHO_HCM_Q7',
        WaitHCMBy: 'KHO_HCM_Q7',
        GoingHCMBy: 'KHO_HCM_Q7',
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
            OrderTransactionCode: [`VD-NB-${newOrderId}`],
            RowNumber: 0,
            Id: newOrderId,
            Created: nowIso,
            CreatedBy: 'Admin',
          },
        ],
        SmallPackages: [
          {
            Id: newOrderId * 10 + 1,
            MainOrderId: newOrderId,
            MainOrderCode: `Nội bộ: ${newOrderId}`,
            OrderTransactionCode: `VD-NB-${newOrderId}`,
            BigPackageId: null,
            BigPackageName: 'Kiện Nội Bộ',
            Weight: weightKg,
            Volume: 0,
            PayableWeight: weightKg,
            DonGia: 0,
            PriceWeight: shipFeeVND,
            TotalPrice: shipFeeVND,
            Status: 13,
            StatusName: 'Đã nhập kho HCM',
            Description: customNote.trim() || 'Kiện hàng nhập nội bộ',
            Code: customOrderCode.trim() || `NB-${newOrderId}`,
            BackToVNBy: 'Admin',
            DateInTQWarehouse: nowIso,
            DateBackToVN: nowIso,
            DateWaitHCM: nowIso,
            WaitHCMBy: 'Admin',
            DateGoingHCM: nowIso,
            GoingHCMBy: 'Admin',
            DateInLasteWareHouse: nowIso,
            DateOutWarehouse: nowIso,
            StaffVNWarehouse: 'KHO_HCM_Q7',
            StaffVNOutWarehouse: 'KHO_HCM_Q7',
            Created: nowIso,
            CreatedBy: 'Admin',
            Updated: null,
            UpdatedBy: null,
          },
        ],
        Orders: validItems.map((it, idx) => ({
          Id: newOrderId * 100 + idx + 1,
          MainOrderId: newOrderId,
          ItemId: `NB-${newOrderId}-${idx + 1}`,
          TitleOrigin: it.title.trim(),
          TitleTranslated: it.title.trim(),
          Property: it.skuVariant.trim() || 'Tiêu chuẩn',
          PropertyTranslated: it.skuVariant.trim() || 'Tiêu chuẩn',
          Quantity: Number(it.quantity || 1),
          RealPrice: Math.round(Number(it.unitPriceVND || 0) / 4010),
          PriceOrigin: Math.round(Number(it.unitPriceVND || 0) / 4010),
          PricePromotion: 0,
          UPriceBuy: Math.round(Number(it.unitPriceVND || 0) / 4010),
          UPriceBuyVN: Number(it.unitPriceVND || 0),
          PriceCNY: Math.round(
            (Number(it.unitPriceVND || 0) * Number(it.quantity || 1)) / 4010,
          ),
          PriceVND: Number(it.unitPriceVND || 0) * Number(it.quantity || 1),
          TotalPriceVND:
            Number(it.unitPriceVND || 0) * Number(it.quantity || 1),
          CurrentCNYVN: 4010,
          ImageOrigin:
            it.imageUrl.trim() ||
            'https://cbu01.alicdn.com/img/ibank/O1CN01IxzLCZ1LucH1chua_!!2219358604313-0-cib.jpg',
          LinkOrigin: '#',
          ShopId: 'INTERNAL',
          ShopName: customSupplierName.trim() || 'Nhà Cung Cấp Nội Bộ',
          Wangwang: 'Internal',
          Site: 'NỘI BỘ',
          Stock: Number(it.quantity || 1),
          StepPrice: '',
          ProductStatusName: 'Còn hàng',
          StatusComplainName: '',
          Created: nowIso,
          CreatedBy: 'Admin',
        })),
        PayOrderHistories: [
          {
            Id: newOrderId * 10 + 9,
            MainOrderId: newOrderId,
            UID: uid,
            Status: 2,
            StatusName: 'Thanh toán đơn nội bộ',
            Amount: totalVND,
            Type: 2,
            TypeName: 'Chuyển khoản / Tiền mặt',
            Created: nowIso,
            CreatedBy: 'Admin',
          },
        ],
        OrderComments: customNote.trim()
          ? [
              {
                Id: newOrderId * 10 + 5,
                MainOrderId: newOrderId,
                UID: uid,
                Comment: customNote.trim(),
                Type: 1,
                TypeName: 'Ghi chú nội bộ',
                FileLink: '',
                Created: nowIso,
                CreatedBy: 'Admin',
              },
            ]
          : [],
      },
    };

    const nextList = [newRecord, ...internalOrders];
    setInternalOrders(nextList);
    localStorage.setItem(LS_INTERNAL_CUSTOM_ORDERS, JSON.stringify(nextList));
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
    toast.success(`Đã tạo đơn nhập hàng nội bộ #${newOrderId}`);
  };

  const handleMoveOrderBetweenTabs = (
    record: StoredImportOrderRecord,
    targetTab: ImportOrderTabType,
  ) => {
    const isInternal = internalOrders.some((o) => o.id === record.id);
    if (isInternal) {
      const updated = internalOrders.map((o) =>
        o.id === record.id
          ? {
              ...o,
              workflowTab: targetTab,
              syncedToCatalog:
                targetTab === 'APPROVED' ? true : o.syncedToCatalog,
              syncedToCashbook:
                targetTab === 'APPROVED' ? true : o.syncedToCashbook,
              rawData: {
                ...o.rawData,
                Status: targetTab === 'DRAFT' ? 0 : 14,
                StatusName:
                  targetTab === 'DRAFT'
                    ? 'Bản nháp nội bộ'
                    : targetTab === 'APPROVED'
                      ? 'Đã duyệt nhập kho'
                      : 'Đơn nhập hiện tại',
              },
            }
          : o,
      );
      setInternalOrders(updated);
      localStorage.setItem(LS_INTERNAL_CUSTOM_ORDERS, JSON.stringify(updated));
      toast.success(
        `Đã chuyển đơn nội bộ #${record.id} sang tab ${
          targetTab === 'APPROVED'
            ? 'Danh sách bản đã duyệt'
            : targetTab === 'DRAFT'
              ? 'Danh sách đơn (Bản nháp)'
              : 'Danh sách đơn (Hiện tại)'
        }`,
      );
      return;
    }

    updateOrderTabMutation.mutate({
      orderId: record.id,
      targetTab,
    });
  };

  const handleDeleteDraftOrder = (record: StoredImportOrderRecord) => {
    const isInternal = internalOrders.some((o) => o.id === record.id);
    if (isInternal) {
      const next = internalOrders.filter((o) => o.id !== record.id);
      setInternalOrders(next);
      localStorage.setItem(LS_INTERNAL_CUSTOM_ORDERS, JSON.stringify(next));
      toast.success(`Đã xóa đơn nội bộ #${record.id}`);
    } else {
      handleMoveOrderBetweenTabs(record, 'DRAFT');
    }
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
            <strong>Nhập hàng đơn trước đó</strong> (Đăng nhập Pop-up trên web bên thứ 3 để lấy Token & đồng bộ đơn).
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
                  ? `Đã liên kết (${decodedJwt.userData.UserName} • UID ${uid}) — Mở Pop-up Web`
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
                localStorage.setItem(LS_HOABINH_LINKED_SESSION, 'LINKED');
                setIsPreviousOrdersLinked(true);
                restoreMutation.mutate();
              }}
              disabled={restoreMutation.isPending}
              className="action-btn action-btn-secondary"
              title="Khôi phục (Restore) dữ liệu đơn #55479 + Đồng bộ Sản phẩm & Sổ quỹ"
            >
              <RotateCcw
                className={cn(
                  'h-4 w-4',
                  restoreMutation.isPending && 'animate-spin',
                )}
              />
              <span>Restore Data (#55479)</span>
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
              Tạo và quản lý đơn nhập hàng nội bộ tuỳ chỉnh, chủ động thêm sản phẩm, lưu nháp hoặc duyệt nhập kho & ghi Sổ Quỹ.
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
                {isPreviousOrdersLinked ? 'Đã liên kết Token' : 'Chưa liên kết'}
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
                    Bản Nhập Hàng Đơn Trước Đó (Liên Kết Web Bên Thứ 3)
                  </h2>
                  {isPreviousOrdersLinked ? (
                    <span className="status-badge status-active">
                      Đã lấy Token ({decodedJwt.userData.UserName} • UID: {uid})
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                      Chưa đăng nhập lấy Token
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Không gợi ý kết quả tự động. Bấm <strong>"Đăng nhập trên Web Hoà Bình (Mở Pop-up)"</strong> để mở cửa sổ web của họ, đăng nhập thành công và lấy Token về hệ thống.
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
                <span>Đăng nhập trên Web Hoà Bình (Mở Pop-up)</span>
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
                      placeholder="Nhập mã đơn (ẩn gợi ý)..."
                      className="w-44 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
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
                      <span>Lấy đơn</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleUnlinkPreviousOrders}
                    className="action-btn action-btn-secondary text-xs text-destructive hover:border-destructive"
                    title="Ngắt kết nối để kiểm tra trạng thái chưa đăng nhập"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Ngắt liên kết</span>
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
                  <span className="status-badge status-active">
                    Internal Custom Mode
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Tạo phiếu nhập hàng nội bộ hoặc chỉnh sửa/duyệt các đơn hàng đã đồng bộ về kho BonzStore.
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
                onClick={() => navigate('/products')}
                className="action-btn action-btn-secondary text-xs"
              >
                <Package className="h-3.5 w-3.5" />
                <span>Kho Sản Phẩm</span>
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
      {primaryMode === 'PREVIOUS_ORDERS' && !isPreviousOrdersLinked ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center shadow-sm">
          <div className="mx-auto flex max-w-md flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 text-foreground dark:text-primary">
              <LogIn className="h-7 w-7" />
            </div>
            <h3 className="font-display text-base font-bold text-foreground">
              Chưa liên kết tài khoản đơn hàng trước đó
            </h3>
            <p className="text-xs text-muted-foreground">
              Chế độ <strong>Nhập hàng đơn trước đó</strong> không hiển thị gợi ý kết quả khi chưa đăng nhập. Vui lòng bấm nút bên dưới để mở Pop-up thao tác trên web của họ và lấy Token về.
            </p>
            <button
              type="button"
              onClick={handleOpenExternalWebPopup}
              className="action-btn action-btn-primary mt-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Mở Pop-up Đăng nhập trên Web & Lấy Token</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-sm">
          {/* Header 3 Sub-Tabs: Danh sách đơn (Hiện tại) / Danh sách đơn (Bản nháp) / Danh sách bản đã duyệt */}
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
                    placeholder="Tìm theo ID đơn (nhấn Enter)..."
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

          {/* Bảng danh sách đơn chuẩn 5 cột: ID | Ảnh | Thông tin | Trạng thái | Thao tác */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  <th className="table-header-cell w-36 px-4 py-3">ID</th>
                  <th className="table-header-cell w-28 px-4 py-3">Ảnh</th>
                  <th className="table-header-cell px-4 py-3">Thông tin</th>
                  <th className="table-header-cell w-48 px-4 py-3">
                    Trạng thái
                  </th>
                  <th className="table-header-cell w-64 px-4 py-3 text-right">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td colSpan={5} className="px-4 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg bg-muted" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3.5 w-1/3 rounded bg-muted" />
                            <div className="h-3 w-2/3 rounded bg-muted/70" />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : allDisplayedOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-12 text-center text-sm text-muted-foreground"
                    >
                      <div className="mx-auto flex max-w-md flex-col items-center gap-2">
                        <Package className="h-9 w-9 text-muted-foreground/50" />
                        <p className="font-display text-sm font-bold text-foreground">
                          Chưa có đơn hàng nào trong tab này
                        </p>
                        <div className="mt-2 flex flex-wrap justify-center gap-2">
                          {activeOrderTab !== 'CURRENT' && (
                            <button
                              type="button"
                              onClick={() => handleSelectSubTab('CURRENT')}
                              className="action-btn action-btn-secondary text-xs"
                            >
                              <span>Chuyển về Danh sách đơn (Hiện tại)</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => restoreMutation.mutate()}
                            className="action-btn action-btn-primary text-xs"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>Khôi phục đơn mẫu #55479</span>
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  allDisplayedOrders.map((record) => {
                    const d = record.rawData;
                    const totalQty = (d.Orders || []).reduce(
                      (s, it) => s + Number(it.Quantity || 0),
                      0,
                    );
                    const isSelected = record.id === (activeOrder?.Id || 55479);

                    return (
                      <tr
                        key={`${record.workflowTab || 'CURRENT'}-${record.id}`}
                        onClick={() => setSelectedOrderId(record.id)}
                        className={cn(
                          'table-row-interactive cursor-pointer align-top',
                          isSelected && 'bg-primary/10',
                        )}
                      >
                        {/* Cột 1: ID */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-display text-base font-bold text-foreground">
                              #{d.Id}
                            </span>
                            <span className="rounded bg-amber-500/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-amber-600 dark:text-amber-400">
                              {d.Site || '1688'}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                            <span className="truncate max-w-[110px]" title={record.orderCode}>
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
                        </td>

                        {/* Cột 2: Ảnh */}
                        <td className="px-4 py-3.5">
                          <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-border bg-muted">
                            <img
                              src={d.ImageOrigin}
                              alt={`Đơn #${d.Id}`}
                              className="h-full w-full object-cover"
                            />
                            <span className="absolute bottom-1 right-1 rounded bg-black/75 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">
                              {d.Orders?.length || 0} SP
                            </span>
                          </div>
                        </td>

                        {/* Cột 3: Thông tin */}
                        <td className="px-4 py-3.5">
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-display font-bold text-foreground">
                                {d.ShopName}
                              </span>
                              <span className="rounded border border-border bg-muted/50 px-2 py-0.5 text-[11px] text-muted-foreground">
                                {d.FromPlaceName} → {d.ReceivePlaceName} (
                                {d.ShippingTypeName})
                              </span>
                            </div>

                            <p className="text-xs text-muted-foreground">
                              Sản phẩm: <strong className="text-foreground">{d.Orders?.length || 0} mặt hàng ({totalQty} cái)</strong> •{' '}
                              Vận đơn: <strong className="text-foreground">{d.SmallPackages?.length || 0} kiện ({d.TQVNWeight || d.OrderWeight} kg)</strong> •{' '}
                              Tỷ giá: <strong className="text-foreground">{d.CurrentCNYVN?.toLocaleString('vi-VN')}₫/¥</strong>
                            </p>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
                              <span>
                                Tiền hàng:{' '}
                                <strong className="text-foreground">
                                  {formatVND(d.PriceVND)}
                                </strong>{' '}
                                ({formatCNY(d.PriceCNY)})
                              </span>
                              <span>
                                Phí mua hộ:{' '}
                                <strong className="text-foreground">
                                  {formatVND(d.FeeBuyPro)}
                                </strong>
                              </span>
                              <span>
                                Cước cân:{' '}
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
                              <span>
                                Đã thanh toán:{' '}
                                <strong className="text-foreground">
                                  {formatVND(d.Deposit)}
                                </strong>
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Cột 4: Trạng thái */}
                        <td className="px-4 py-3.5">
                          <span className="status-badge status-active">
                            {d.StatusName}
                          </span>
                          <div className="mt-2 flex flex-col gap-1">
                            {record.syncedToCatalog ? (
                              <span className="inline-flex w-fit items-center gap-1 rounded bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="h-3 w-3" />
                                Đã đồng bộ Kho SP
                              </span>
                            ) : (
                              <span className="inline-flex w-fit items-center gap-1 rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                                Chưa đồng bộ Kho SP
                              </span>
                            )}
                            {record.syncedToCashbook && (
                              <span className="inline-flex w-fit items-center gap-1 rounded bg-sky-500/15 px-2 py-0.5 text-[10px] font-semibold text-sky-600 dark:text-sky-400">
                                <Wallet className="h-3 w-3" />
                                Đã ghi Sổ Quỹ
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Cột 5: Thao tác (Đầy đủ trên cả 3 Tabs) */}
                        <td
                          className="px-4 py-3.5 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex flex-wrap items-center justify-end gap-1.5">
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
                                onClick={() =>
                                  handleMoveOrderBetweenTabs(record, 'APPROVED')
                                }
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                              >
                                <FileCheck2 className="h-3.5 w-3.5" />
                                <span>Duyệt đơn</span>
                              </button>
                            )}

                            {activeOrderTab !== 'DRAFT' && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleMoveOrderBetweenTabs(record, 'DRAFT')
                                }
                                className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/60 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                              >
                                <FileEdit className="h-3.5 w-3.5" />
                                <span>Lưu nháp</span>
                              </button>
                            )}

                            {activeOrderTab !== 'CURRENT' && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleMoveOrderBetweenTabs(record, 'CURRENT')
                                }
                                className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/60 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                              >
                                <Truck className="h-3.5 w-3.5" />
                                <span>Về Hiện tại</span>
                              </button>
                            )}

                            {activeOrderTab === 'DRAFT' && (
                              <button
                                type="button"
                                onClick={() => handleDeleteDraftOrder(record)}
                                className="inline-flex items-center gap-1 rounded-lg border border-destructive/30 bg-destructive/10 px-2 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20"
                                title="Xóa bản nháp"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

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
      )}

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
                    Pop-up Đăng Nhập Trên Web Hoà Bình Logistics
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
                    Cửa sổ Pop-up Web: https://hoabinhlogistics.com
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
                <p className="mt-1 text-muted-foreground">
                  Sau khi đăng nhập trên cửa sổ web của họ hoặc xác thực qua API{' '}
                  <code className="font-mono">POST /api/authenticate/login</code>, hệ thống sẽ thu nhận Bearer Token về phiên làm việc.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    Tài khoản trên web của họ
                  </label>
                  <input
                    type="text"
                    name="hb_web_user_no_autofill"
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
                    name="hb_web_pass_no_autofill"
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
                  Token lấy về từ phiên đăng nhập (Để trống để lấy tự động từ response đăng nhập)
                </label>
                <textarea
                  rows={2}
                  autoComplete="off"
                  spellCheck={false}
                  value={popupTokenResult}
                  onChange={(e) => setPopupTokenResult(e.target.value)}
                  placeholder="Dán Token nếu lấy thủ công hoặc bấm Xác nhận để lấy Token tự động..."
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
                      ? 'Đang lấy Token...'
                      : 'Đăng Nhập Thành Công & Lấy Token Về'}
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
                  Tạo đơn nhập hàng nội bộ và chọn lưu vào Danh sách đơn (Hiện tại), Bản nháp hoặc Đã duyệt.
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
                    placeholder="VD: Xưởng Mô Hình Quận 7"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    Mã phiếu nhập nội bộ
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={customOrderCode}
                    onChange={(e) => setCustomOrderCode(e.target.value)}
                    placeholder="Tự sinh nếu để trống"
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
                    Danh sách sản phẩm nhập nội bộ
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
                        placeholder="Tên sản phẩm nhập..."
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
                        placeholder="Phân loại / SKU..."
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
                        placeholder="Đơn giá ₫"
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
                    placeholder="1.5"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-foreground">
                    Ghi chú nội bộ
                  </label>
                  <input
                    type="text"
                    autoComplete="off"
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="Ghi chú..."
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
                  <span>Lưu Đơn Nhập Hàng Nội Bộ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Khung Xem Chi Tiết Đơn Hàng Đang Chọn (VD: #55479) */}
      {activeOrder &&
        (primaryMode === 'INTERNAL_CUSTOM' || isPreviousOrdersLinked) && (
          <div
            id="hoabinh-order-detail-section"
            className="rounded-xl border border-border bg-card shadow-sm"
          >
            {/* Detail Header + Sync Action */}
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
                  Shop: <strong className="text-foreground">{activeOrder.ShopName}</strong> •{' '}
                  Mã đơn:{' '}
                  <strong className="text-foreground">
                    {activeOrder.MainOrderCodes?.[0]?.Code || '5127805405728007936'}
                  </strong>{' '}
                  • Người nhận:{' '}
                  <strong className="text-foreground">
                    {activeOrder.ReceiverFullName} ({activeOrder.ReceiverPhone})
                  </strong>{' '}
                  — {activeOrder.DeliveryAddress}
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
                        : 'Duyệt & Đồng Bộ Kho SP (/products) + Sổ Quỹ'}
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
                  label: `1. Sản Phẩm (${activeOrder.Orders?.length || 0} dòng • ${(activeOrder.Orders || []).reduce((s, i) => s + Number(i.Quantity || 0), 0)} cái)`,
                  icon: Layers,
                },
                {
                  key: 'PACKAGES' as DetailTabKey,
                  label: `2. Kiện Hàng & Vận Đơn (${activeOrder.SmallPackages?.length || 0} kiện • ${activeOrder.TQVNWeight}kg)`,
                  icon: Box,
                },
                {
                  key: 'PAYMENTS' as DetailTabKey,
                  label: `3. Lịch Sử Thanh Toán (${activeOrder.PayOrderHistories?.length || 0} giao dịch)`,
                  icon: Wallet,
                },
                {
                  key: 'TIMELINE' as DetailTabKey,
                  label: '4. Tiến Trình Kho & Người Nhận',
                  icon: Clock,
                },
                {
                  key: 'COMMENTS_JSON' as DetailTabKey,
                  label: `5. Trao Đổi (${activeOrder.OrderComments?.length || 0}) & Raw JSON`,
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

            {/* Tab Content */}
            <div className="p-5">
              {activeDetailTab === 'ITEMS' && (
                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-border bg-muted/40">
                      <tr>
                        <th className="table-header-cell px-4 py-3">
                          ID / Ảnh
                        </th>
                        <th className="table-header-cell px-4 py-3">
                          Thông Tin Sản Phẩm & Phân Loại
                        </th>
                        <th className="table-header-cell px-4 py-3 text-center">
                          Số Lượng
                        </th>
                        <th className="table-header-cell px-4 py-3 text-right">
                          Đơn Giá (CNY / VNĐ)
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
                            <div className="flex items-center gap-2.5">
                              <img
                                src={item.ImageOrigin}
                                alt={item.TitleOrigin}
                                className="h-14 w-14 rounded-lg border border-border object-cover"
                              />
                              <div>
                                <span className="font-mono text-xs font-bold text-foreground">
                                  #{item.Id}
                                </span>
                                <p className="font-mono text-[11px] text-muted-foreground">
                                  Item: {item.ItemId}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-foreground">
                              {item.TitleTranslated || item.TitleOrigin}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              Gốc: {item.TitleOrigin}
                            </p>
                            <span className="mt-1 inline-block rounded bg-primary/15 px-2 py-0.5 text-xs font-medium text-foreground dark:text-primary">
                              Phân loại: {item.PropertyTranslated || item.Property}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="rounded-lg bg-muted px-2.5 py-1 font-display text-sm font-bold text-foreground">
                              {item.Quantity}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <p className="font-semibold text-foreground">
                              {formatVND(item.UPriceBuyVN)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatCNY(item.UPriceBuy)}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <p className="font-display font-bold text-emerald-600 dark:text-emerald-400">
                              {formatVND(item.PriceVND)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatCNY(item.PriceCNY)}
                            </p>
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
                        <th className="table-header-cell px-4 py-3">
                          Bao Lớn & Ghi Chú
                        </th>
                        <th className="table-header-cell px-4 py-3 text-right">
                          Cân Nặng
                        </th>
                        <th className="table-header-cell px-4 py-3 text-right">
                          Đơn Giá / Thành Tiền
                        </th>
                        <th className="table-header-cell px-4 py-3">
                          Mốc Kho TQ → VN → HCM
                        </th>
                        <th className="table-header-cell px-4 py-3">
                          Trạng Thái
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {(activeOrder.SmallPackages || []).map((pkg) => (
                        <tr key={pkg.Id} className="table-row-interactive">
                          <td className="px-4 py-3">
                            <p className="font-mono text-xs font-bold text-foreground">
                              #{pkg.Id}
                            </p>
                            <p className="font-mono text-xs text-primary">
                              {pkg.OrderTransactionCode}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <p className="font-semibold text-foreground">
                              {pkg.BigPackageName || '—'}
                            </p>
                            <p className="text-muted-foreground">
                              {pkg.Description || pkg.MainOrderCode}
                            </p>
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold">
                            {pkg.PayableWeight || pkg.Weight} kg
                          </td>
                          <td className="px-4 py-3 text-right">
                            <p className="font-bold text-emerald-600 dark:text-emerald-400">
                              {formatVND(pkg.TotalPrice)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatVND(pkg.DonGia)}/kg
                            </p>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            <div>TQ: {formatDateTime(pkg.DateInTQWarehouse)}</div>
                            <div>VN: {formatDateTime(pkg.DateBackToVN)}</div>
                            <div>Xuất: {formatDateTime(pkg.DateOutWarehouse)}</div>
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
                        <th className="table-header-cell px-4 py-3">
                          Mã Giao Dịch
                        </th>
                        <th className="table-header-cell px-4 py-3">
                          Thời Gian
                        </th>
                        <th className="table-header-cell px-4 py-3">
                          Nội Dung Thanh Toán
                        </th>
                        <th className="table-header-cell px-4 py-3">
                          Hình Thức
                        </th>
                        <th className="table-header-cell px-4 py-3 text-right">
                          Số Tiền
                        </th>
                        <th className="table-header-cell px-4 py-3">
                          Người Thực Hiện
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {(activeOrder.PayOrderHistories || []).map((pay) => (
                        <tr key={pay.Id} className="table-row-interactive">
                          <td className="px-4 py-3 font-mono text-xs font-bold">
                            #{pay.Id}
                          </td>
                          <td className="px-4 py-3 text-xs">
                            {formatDateTime(pay.Created)}
                          </td>
                          <td className="px-4 py-3 font-semibold text-foreground">
                            {pay.StatusName}
                          </td>
                          <td className="px-4 py-3 text-xs">{pay.TypeName}</td>
                          <td className="px-4 py-3 text-right font-display font-bold text-rose-600 dark:text-rose-400">
                            {formatVND(pay.Amount)}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs">
                            {pay.CreatedBy}
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
                    { label: '4. Phát hàng TQ', time: activeOrder.DateDelivery },
                    { label: '5. Về kho VN', time: activeOrder.DateBackToVN },
                    { label: '6. Chờ chuyển HCM', time: activeOrder.DateWaitHCM },
                    { label: '7. Tới kho đích HCM', time: activeOrder.DateVN },
                    { label: '8. Hoàn thành', time: activeOrder.CompleteDate },
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
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  <div className="space-y-2 rounded-xl border border-border p-4">
                    <h4 className="font-display text-xs font-bold uppercase text-muted-foreground">
                      Trao đổi trên đơn ({activeOrder.OrderComments?.length || 0})
                    </h4>
                    {(activeOrder.OrderComments || []).map((c) => (
                      <div
                        key={c.Id}
                        className="rounded-lg border border-border bg-muted/20 p-3 text-xs"
                      >
                        <div className="flex justify-between font-mono text-[11px] text-muted-foreground">
                          <strong>{c.CreatedBy}</strong>
                          <span>{formatDateTime(c.Created)}</span>
                        </div>
                        {c.Comment && (
                          <p className="mt-1 font-medium text-foreground">
                            {c.Comment}
                          </p>
                        )}
                        {c.FileLink && (
                          <a
                            href={c.FileLink}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 inline-block text-primary underline"
                          >
                            Xem ảnh đính kèm
                          </a>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="rounded-xl border border-border bg-muted/30 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-display text-xs font-bold uppercase text-muted-foreground">
                        JSON Response (#{activeOrder.Id})
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyText(
                            JSON.stringify(
                              { Success: true, Data: activeOrder },
                              null,
                              2,
                            ),
                            'JSON đơn hàng',
                          )
                        }
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Copy JSON
                      </button>
                    </div>
                    <pre className="max-h-72 overflow-auto rounded-lg bg-background p-3 font-mono text-[11px] text-foreground">
                      {JSON.stringify(
                        { Success: true, Data: activeOrder },
                        null,
                        2,
                      )}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
    </div>
  );
}
