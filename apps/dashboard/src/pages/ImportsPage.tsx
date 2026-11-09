import { useQueryClient } from '@tanstack/react-query';
import {
  FileCheck2,
  FileClock,
  FilePlus2,
  Package,
  Plus,
  RotateCcw,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { recordLocalNotification } from '../api/data/hoabinh-55479-fallback';
import { productsApi } from '../api/endpoints/catalog.api';
import { ProductItem } from '../api/types/catalog.types';
import { LogisticsUnit } from '../api/types/logistics.types';
import { Button } from '../components/ui/button';
import { Drawer } from '../components/ui/drawer';
import { CreatableSelectOption } from '../components/ui/rhf-fields';
import { useAuthContext } from '../features/auth/context/AuthContext';
import { useCreateCashbookVoucher } from '../features/cashbook/hooks/useCashbook';
import {
  useCategories,
  useCreateProduct,
  useProducts,
} from '../features/catalog/hooks/useCatalog';
import { useI18n } from '../features/i18n/I18nContext';
import { ImportCreateProductModal } from '../features/imports/components/ImportCreateProductModal';
import { ImportExcelModal } from '../features/imports/components/ImportExcelModal';
import {
  DEFAULT_CNY_EXCHANGE_RATE,
  FlattenedCatalogSkuEntry,
  ImportLineItemFormValue,
  ImportReceiptFormValues,
  ImportsActiveTab,
  SavedImportReceiptRecord,
  calculateLineSubtotalBeforeTax,
  convertCnyToVnd,
  convertVndToCny,
  flattenProductsToSkuEntries,
  generateReceiptSequence,
} from '../features/imports/components/ImportFormTypes';
import { ImportGeneralInfoSection } from '../features/imports/components/ImportGeneralInfoSection';
import { ImportHistorySection } from '../features/imports/components/ImportHistorySection';
import { ImportLogisticsCreateModal } from '../features/imports/components/ImportLogisticsCreateModal';
import { ImportPaymentSection } from '../features/imports/components/ImportPaymentSection';
import { ImportProductsTable } from '../features/imports/components/ImportProductsTable';
import { ImportQuickToolbar } from '../features/imports/components/ImportQuickToolbar';
import { useLogisticsUnits } from '../features/logistics/hooks/useLogistics';
import { useUsers } from '../features/users/hooks/useUsers';
import { cn, formatCurrencyVND } from '../lib/utils';

const STORAGE_RECEIPTS_KEY = 'bonzstore_import_receipts_v4';

const INITIAL_SAMPLE_RECORDS: SavedImportReceiptRecord[] = [
  {
    id: 'rec-sample-completed-1',
    status: 'COMPLETED',
    importDate: '2026-11-09',
    logisticsUnitId: '1e6b0dbe-862b-4811-9eb4-6a13a2ff9944',
    logisticsUnitName: 'HÒa BÌnh logitics',
    receiptNumber: 'PN-20261110-0001',
    invoiceNumber: 'HD-VAT-0055479',
    staffName: 'Nguyễn Thị Hồng Yến Nhiên',
    description: 'Nhập lô mô hình Chibi đợt 1 tháng 11 (Quy đổi từ giá Tệ ¥)',
    exchangeRateCny: 3790,
    items: [
      {
        lineId: 'sample-line-1',
        isGift: false,
        itemCode: 'HXH002-SET8',
        itemName: '[Bonzstore] Mô Hình Hunter x Hunter Bộ 8 Nhân Vật Chibi',
        expiryDate: '',
        unit: 'Bộ',
        quantity: 20,
        cnyUnitPrice: 42,
        unitPrice: 159180,
        productDiscountType: 'VND',
        productDiscountValue: 0,
      },
    ],
    vatPercent: 0,
    orderDiscountType: 'VND',
    orderDiscountValue: 0,
    shippingFee: 150000,
    amountPaid: 3333600,
    paymentMethod: 'TRANSFER',
    autoRecordCashbook: true,
    subtotalBeforeTax: 3183600,
    vatAmount: 0,
    orderDiscountAmount: 0,
    totalPayable: 3183600,
    debtRemaining: 0,
    createdAt: '2026-11-09T09:30:00.000Z',
    updatedAt: '2026-11-09T09:30:00.000Z',
  },
  {
    id: 'rec-sample-draft-1',
    status: 'DRAFT',
    importDate: '2026-11-10',
    logisticsUnitId: '1e6b0dbe-862b-4811-9eb4-6a13a2ff9944',
    logisticsUnitName: 'HÒa BÌnh logitics',
    receiptNumber: 'NHAP-TAM-0001',
    invoiceNumber: '',
    staffName: 'Nguyễn Thị Hồng Yến Nhiên',
    description: 'Đơn hàng đang kiểm đếm tại kho Hòa Bình (Lưu tạm chờ chốt giá Tệ)',
    exchangeRateCny: 3790,
    items: [
      {
        lineId: 'sample-draft-line-1',
        isGift: false,
        itemCode: 'OP-LUFFY-G5',
        itemName: 'Mô Hình One Piece Luffy Gear 5 Nika Chính Hãng',
        expiryDate: '',
        unit: 'Hộp',
        quantity: 15,
        cnyUnitPrice: 55,
        unitPrice: 208450,
        productDiscountType: 'PERCENT',
        productDiscountValue: 5,
      },
    ],
    vatPercent: 0,
    orderDiscountType: 'VND',
    orderDiscountValue: 0,
    shippingFee: 0,
    amountPaid: 0,
    paymentMethod: 'TRANSFER',
    autoRecordCashbook: true,
    subtotalBeforeTax: 2970413,
    vatAmount: 0,
    orderDiscountAmount: 0,
    totalPayable: 2970413,
    debtRemaining: 2970413,
    createdAt: '2026-11-10T00:15:00.000Z',
    updatedAt: '2026-11-10T00:15:00.000Z',
  },
];

export function ImportsPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<ImportsActiveTab>(() => {
    if (location.pathname.startsWith('/imports/history')) return 'HISTORY';
    if (location.pathname.startsWith('/imports/drafts')) return 'DRAFTS';
    return 'CREATE';
  });
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);

  useEffect(() => {
    if (location.pathname.startsWith('/imports/history')) {
      setActiveTab('HISTORY');
    } else if (location.pathname.startsWith('/imports/drafts')) {
      setActiveTab('DRAFTS');
    } else if (location.pathname === '/imports') {
      setActiveTab((prev) => (prev === 'DRAFTS' ? prev : 'CREATE'));
    }
  }, [location.pathname]);

  const handleSwitchTab = (nextTab: ImportsActiveTab) => {
    setActiveTab(nextTab);
    if (nextTab === 'HISTORY') {
      navigate('/imports/history');
    } else if (nextTab === 'DRAFTS') {
      navigate('/imports/drafts');
    } else {
      navigate('/imports');
    }
  };

  // 1. Fetch danh sách Đơn vị Logistics (Nhà phân phối)
  const { data: logisticsResponse } = useLogisticsUnits({
    page: 1,
    limit: 100,
  });

  // 2. Fetch danh sách Admin, Manager và Nhân viên
  const { data: usersResponse } = useUsers({ page: 1, limit: 100 });

  // 3. Fetch danh sách Sản phẩm & Danh mục hiện tại từ bảng `products`
  const { data: productsResponse } = useProducts({ page: 1, limit: 100 });
  const { data: categories = [] } = useCategories();
  const createProductMutation = useCreateProduct();
  const createCashbookVoucherMutation = useCreateCashbookVoucher();

  const catalogProducts: ProductItem[] = useMemo(
    () => productsResponse?.data ?? [],
    [productsResponse],
  );

  const leafCategories = useMemo(
    () => categories.filter((c) => c.isLeaf),
    [categories],
  );

  // Chuyển đổi danh sách Đơn vị Logistics sang CreatableSelectOption
  const logisticsOptions: CreatableSelectOption<LogisticsUnit>[] =
    useMemo(() => {
      const units = (logisticsResponse?.data ?? []).filter((u) => !u.isHidden);
      if (units.length === 0) {
        const fallbackUnit: LogisticsUnit = {
          id: '1e6b0dbe-862b-4811-9eb4-6a13a2ff9944',
          name: 'HÒa BÌnh logitics',
          gmail: '',
          phone: '',
          address: '',
          avatarUrl:
            'https://hoabinhlogistics.com/Upload/Upload/776187b5-fd9c-4083-b9e0-1ee04e77b336-logo-hoabinh-removebg-preview.png',
          createdAt: '2026-11-04T16:42:48.927Z',
          shortName: '',
          updatedAt: '2026-11-04T16:42:53.837Z',
        };
        return [
          {
            value: fallbackUnit.name,
            label: fallbackUnit.name,
            avatarUrl: fallbackUnit.avatarUrl,
            meta: fallbackUnit,
          },
        ];
      }

      return units.map((unit) => ({
        value: unit.name,
        label: unit.name,
        code: unit.shortName || undefined,
        avatarUrl: unit.avatarUrl || undefined,
        description:
          [unit.phone, unit.gmail, unit.address].filter(Boolean).join(' • ') ||
          undefined,
        meta: unit,
      }));
    }, [logisticsResponse]);

  // Chuyển đổi danh sách Người nhập hàng: Admin, Manager và Nhân viên
  const staffOptions: CreatableSelectOption[] = useMemo(() => {
    const map = new Map<string, CreatableSelectOption>();

    for (const u of usersResponse?.data ?? []) {
      const roleCode = (u.role?.code || '').toUpperCase();
      if (roleCode === 'CUSTOMER') continue;

      const roleBadge = roleCode.includes('ADMIN')
        ? 'Admin'
        : roleCode.includes('MANAGER')
          ? 'Manager'
          : u.role?.name || 'Nhân viên';

      if (u.fullName) {
        map.set(u.fullName, {
          value: u.fullName,
          label: u.fullName,
          badge: roleBadge,
          description: u.email,
        });
      }
    }

    if (user?.fullName && !map.has(user.fullName)) {
      map.set(user.fullName, {
        value: user.fullName,
        label: user.fullName,
        badge: user.role?.name || 'Admin',
        description: user.email,
      });
    }

    const defaultStaffList: CreatableSelectOption[] = [
      {
        value: 'Nguyễn Thị Hồng Yến Nhiên',
        label: 'Nguyễn Thị Hồng Yến Nhiên',
        badge: 'Nhân viên',
        description: 'yennhien.warehouse@bonzstore.vn • Nhân viên nhập hàng',
      },
      {
        value: 'Quản trị viên (Super Admin)',
        label: 'Quản trị viên (Super Admin)',
        badge: 'Admin',
        description: 'admin@bonzstore.vn • Quản trị hệ thống',
      },
      {
        value: 'Trần Quốc Bảo',
        label: 'Trần Quốc Bảo',
        badge: 'Manager',
        description: 'manager@bonzstore.vn • Quản lý cửa hàng & kho',
      },
    ];

    for (const item of defaultStaffList) {
      if (!map.has(item.value)) {
        map.set(item.value, item);
      }
    }

    return Array.from(map.values());
  }, [usersResponse, user]);

  // Danh sách phiếu nhập (Gồm cả COMPLETED và DRAFT)
  const [savedRecords, setSavedRecords] = useState<SavedImportReceiptRecord[]>(
    () => {
      try {
        const raw = localStorage.getItem(STORAGE_RECEIPTS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {
        // ignore
      }
      return INITIAL_SAMPLE_RECORDS;
    },
  );

  const persistRecords = (next: SavedImportReceiptRecord[]) => {
    setSavedRecords(next);
    try {
      localStorage.setItem(STORAGE_RECEIPTS_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const completedReceipts = useMemo(
    () => savedRecords.filter((r) => r.status !== 'DRAFT'),
    [savedRecords],
  );

  const draftReceipts = useMemo(
    () => savedRecords.filter((r) => r.status === 'DRAFT'),
    [savedRecords],
  );

  // React Hook Form
  const { control, setValue, getValues, reset } =
    useForm<ImportReceiptFormValues>({
      defaultValues: {
        importDate: '2026-11-10',
        logisticsUnitId: '1e6b0dbe-862b-4811-9eb4-6a13a2ff9944',
        logisticsUnitName: 'HÒa BÌnh logitics',
        receiptNumber: generateReceiptSequence(completedReceipts.length),
        invoiceNumber: '',
        staffName: user?.fullName || 'Nguyễn Thị Hồng Yến Nhiên',
        description: '',
        exchangeRateCny: DEFAULT_CNY_EXCHANGE_RATE,
        items: [],
        vatPercent: 0,
        orderDiscountType: 'VND',
        orderDiscountValue: 0,
        shippingFee: 0,
        amountPaid: 0,
        paymentMethod: 'CASH',
        autoRecordCashbook: true,
      },
    });

  const items = useWatch({ control, name: 'items' }) ?? [];
  const exchangeRateCny =
    useWatch({ control, name: 'exchangeRateCny' }) || DEFAULT_CNY_EXCHANGE_RATE;
  const vatPercent = useWatch({ control, name: 'vatPercent' }) ?? 0;
  const orderDiscountType =
    useWatch({ control, name: 'orderDiscountType' }) ?? 'VND';
  const orderDiscountValue =
    useWatch({ control, name: 'orderDiscountValue' }) ?? 0;
  const shippingFee = useWatch({ control, name: 'shippingFee' }) ?? 0;
  const amountPaid = useWatch({ control, name: 'amountPaid' }) ?? 0;

  const flattenedCatalogSkus = useMemo(
    () => flattenProductsToSkuEntries(catalogProducts, exchangeRateCny),
    [catalogProducts, exchangeRateCny],
  );

  const [isAmountPaidTouched, setIsAmountPaidTouched] = useState(false);
  const [isSavingReceipt, setIsSavingReceipt] = useState(false);

  // Modals / Drawers state
  const [isCreateLogisticsModalOpen, setIsCreateLogisticsModalOpen] =
    useState(false);
  const [isCreateProductModalOpen, setIsCreateProductModalOpen] =
    useState(false);
  const [initialCreateProductTitle, setInitialCreateProductTitle] =
    useState('');
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isCatalogPickerOpen, setIsCatalogPickerOpen] = useState(false);

  // Khi thay đổi Tỷ giá (1 ¥ -> VNĐ), tự động tính lại Đơn giá VNĐ cho các mặt hàng có nhập Giá vốn Tệ
  const handleExchangeRateChange = (newRate: number) => {
    const safeRate = Math.max(1, newRate || DEFAULT_CNY_EXCHANGE_RATE);
    setValue('exchangeRateCny', safeRate, { shouldDirty: true });

    const currentItems = getValues('items') ?? [];
    if (currentItems.length > 0) {
      const updatedItems = currentItems.map((line) => {
        if (line.cnyUnitPrice && line.cnyUnitPrice > 0) {
          return {
            ...line,
            unitPrice: convertCnyToVnd(line.cnyUnitPrice, safeRate),
          };
        }
        return line;
      });
      setValue('items', updatedItems, { shouldDirty: true });
    }
  };

  // Áp dụng nhanh Giá vốn (Tệ ¥ -> Tiền Việt VNĐ) từ Khu vực thông tin chung xuống bảng hàng hóa
  const handleApplyDefaultCostPriceToRows = (
    cnyPrice: number,
    vndPrice: number,
  ) => {
    const currentItems = getValues('items') ?? [];
    if (currentItems.length === 0) {
      setValue(
        'items',
        [
          {
            lineId: `line-${Date.now()}-1`,
            isGift: false,
            itemCode: 'MH-001',
            itemName: 'Mặt hàng mới (Nhập từ Giá vốn Tệ ¥)',
            expiryDate: '',
            unit: 'Cái',
            quantity: 1,
            cnyUnitPrice: cnyPrice,
            unitPrice: vndPrice,
            productDiscountType: 'VND',
            productDiscountValue: 0,
          },
        ],
        { shouldDirty: true },
      );
      toast.success(
        `Đã thêm dòng hàng mới với Giá vốn: ${cnyPrice.toLocaleString('vi-VN')} ¥ (${formatCurrencyVND(vndPrice)})`,
      );
      return;
    }

    const updatedItems = currentItems.map((line) =>
      line.isGift
        ? line
        : {
            ...line,
            cnyUnitPrice: cnyPrice,
            unitPrice: vndPrice,
          },
    );
    setValue('items', updatedItems, { shouldDirty: true });
    toast.success(
      `Đã áp dụng Giá vốn ${cnyPrice.toLocaleString('vi-VN')} ¥ (${formatCurrencyVND(vndPrice)}) cho ${updatedItems.length} dòng hàng`,
    );
  };

  // Tính toán tài chính toàn đơn
  const subtotalBeforeTax = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + calculateLineSubtotalBeforeTax(item),
      0,
    );
  }, [items]);

  const orderDiscountAmount = useMemo(() => {
    if (subtotalBeforeTax <= 0 || orderDiscountValue <= 0) return 0;
    if (orderDiscountType === 'PERCENT') {
      const pct = Math.min(100, Math.max(0, orderDiscountValue));
      return Math.round((subtotalBeforeTax * pct) / 100);
    }
    return Math.min(subtotalBeforeTax, Math.round(orderDiscountValue));
  }, [subtotalBeforeTax, orderDiscountType, orderDiscountValue]);

  const vatAmount = useMemo(() => {
    if (vatPercent <= 0 || subtotalBeforeTax <= 0) return 0;
    const taxableBase = Math.max(0, subtotalBeforeTax - orderDiscountAmount);
    return Math.round((taxableBase * vatPercent) / 100);
  }, [subtotalBeforeTax, orderDiscountAmount, vatPercent]);

  const totalPayable = useMemo(() => {
    return Math.max(0, subtotalBeforeTax + vatAmount - orderDiscountAmount);
  }, [subtotalBeforeTax, vatAmount, orderDiscountAmount]);

  const totalWithShipping = useMemo(() => {
    return totalPayable + Math.max(0, Math.round(shippingFee));
  }, [totalPayable, shippingFee]);

  useEffect(() => {
    if (!isAmountPaidTouched) {
      setValue('amountPaid', totalPayable);
    }
  }, [totalPayable, isAmountPaidTouched, setValue]);

  const debtRemaining = useMemo(() => {
    return Math.max(0, totalWithShipping - amountPaid);
  }, [totalWithShipping, amountPaid]);

  // Handlers thao tác danh sách hàng hóa
  const handleSelectProductSku = (entry: FlattenedCatalogSkuEntry) => {
    const { product, sku, variantLabel, importPrice } = entry;
    const currentItems = getValues('items') ?? [];
    const existingIndex = currentItems.findIndex(
      (line) =>
        line.skuId === sku.id &&
        line.itemCode === sku.sellerSku &&
        !line.isGift,
    );

    if (existingIndex > -1) {
      const next = [...currentItems];
      next[existingIndex] = {
        ...next[existingIndex],
        quantity: next[existingIndex].quantity + 1,
      };
      setValue('items', next, { shouldDirty: true });
      toast.success(
        `${product.title} (${sku.sellerSku}) → SL: ${next[existingIndex].quantity.toLocaleString('vi-VN')}`,
      );
      return;
    }

    const cnyPrice = convertVndToCny(importPrice, exchangeRateCny);
    const newLine: ImportLineItemFormValue = {
      lineId: `line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      productId: product.id,
      skuId: sku.id,
      isGift: false,
      itemCode: sku.sellerSku,
      itemName: product.title,
      variantLabel,
      thumbnailUrl: product.thumbnailUrl,
      expiryDate: '',
      unit: 'Hộp',
      quantity: 1,
      cnyUnitPrice: cnyPrice,
      unitPrice: importPrice,
      productDiscountType: 'VND',
      productDiscountValue: 0,
      currentStock: sku.stockQuantity,
    };

    setValue('items', [...currentItems, newLine], { shouldDirty: true });
    toast.success(`+ ${product.title}`);
  };

  const handleAddBlankRow = () => {
    const currentItems = getValues('items') ?? [];
    const nextIdx = currentItems.length + 1;
    setValue(
      'items',
      [
        ...currentItems,
        {
          lineId: `line-${Date.now()}-${nextIdx}`,
          isGift: false,
          itemCode: `MH-${String(nextIdx).padStart(3, '0')}`,
          itemName: '',
          expiryDate: '',
          unit: 'Cái',
          quantity: 1,
          cnyUnitPrice: 0,
          unitPrice: 0,
          productDiscountType: 'VND',
          productDiscountValue: 0,
        },
      ],
      { shouldDirty: true },
    );
  };

  const handleUpdateRow = (
    index: number,
    patch: Partial<ImportLineItemFormValue>,
  ) => {
    const currentItems = getValues('items') ?? [];
    if (!currentItems[index]) return;
    const next = [...currentItems];
    next[index] = { ...next[index], ...patch };
    setValue('items', next, { shouldDirty: true });
  };

  const handleRemoveRow = (index: number) => {
    const currentItems = getValues('items') ?? [];
    setValue(
      'items',
      currentItems.filter((_, i) => i !== index),
      { shouldDirty: true },
    );
  };

  const handleResetForm = () => {
    setEditingDraftId(null);
    setIsAmountPaidTouched(false);
    reset({
      importDate: '2026-11-10',
      logisticsUnitId:
        logisticsOptions[0]?.meta?.id || '1e6b0dbe-862b-4811-9eb4-6a13a2ff9944',
      logisticsUnitName: logisticsOptions[0]?.value || 'HÒa BÌnh logitics',
      receiptNumber: generateReceiptSequence(completedReceipts.length),
      invoiceNumber: '',
      staffName: user?.fullName || 'Nguyễn Thị Hồng Yến Nhiên',
      description: '',
      exchangeRateCny: DEFAULT_CNY_EXCHANGE_RATE,
      items: [],
      vatPercent: 0,
      orderDiscountType: 'VND',
      orderDiscountValue: 0,
      shippingFee: 0,
      amountPaid: 0,
      paymentMethod: 'CASH',
      autoRecordCashbook: true,
    });
    toast.info(t('importsForm.resetFormBtn'));
  };

  // ==========================================================================
  // THAO TÁC LƯU TẠM (SAVE DRAFT)
  // ==========================================================================
  const handleSaveDraft = () => {
    const values = getValues();
    const nowIso = new Date().toISOString();
    const draftCode =
      values.receiptNumber.trim() ||
      generateReceiptSequence(draftReceipts.length, true);

    const draftRecord: SavedImportReceiptRecord = {
      ...values,
      id: editingDraftId || `draft-${Date.now()}`,
      status: 'DRAFT',
      receiptNumber: draftCode,
      subtotalBeforeTax,
      vatAmount,
      orderDiscountAmount,
      totalPayable,
      debtRemaining,
      createdAt:
        savedRecords.find((r) => r.id === editingDraftId)?.createdAt || nowIso,
      updatedAt: nowIso,
    };

    const nextRecords = editingDraftId
      ? savedRecords.map((r) => (r.id === editingDraftId ? draftRecord : r))
      : [draftRecord, ...savedRecords];

    persistRecords(nextRecords);
    setEditingDraftId(draftRecord.id);

    recordLocalNotification({
      title: `Đã lưu tạm phiếu nhập ${draftCode}`,
      body: `Đơn vị Logistics: ${values.logisticsUnitName} • ${values.items.length} mặt hàng • Tạm tính: ${formatCurrencyVND(totalPayable)}.`,
      eventType: 'SYSTEM_ANNOUNCEMENT',
    });
    queryClient.invalidateQueries({ queryKey: ['notifications'] });

    toast.success(t('importsForm.draftSavedToast', { code: draftCode }));
  };

  // ==========================================================================
  // THAO TÁC HOÀN TẤT LƯU PHIẾU NHẬP & NHẬP KHO
  // ==========================================================================
  const executeFinalizeImport = async (
    values: ImportReceiptFormValues,
    calcSubtotal: number,
    calcVat: number,
    calcDiscount: number,
    calcTotalPayable: number,
    calcDebt: number,
    sourceDraftId?: string | null,
  ) => {
    if (!values.importDate) {
      toast.error(t('importsForm.valRequiredDate'));
      return;
    }
    if (!values.items || values.items.length === 0) {
      toast.error(t('importsForm.valRequiredItems'));
      return;
    }

    setIsSavingReceipt(true);
    try {
      // 1. Cập nhật tồn kho và giá gốc cho các sản phẩm liên kết với bảng `products`
      const productUpdatesMap = new Map<
        string,
        Array<{ skuId: string; addQty: number; newCostPrice: number }>
      >();

      for (const line of values.items) {
        if (line.productId && line.skuId && line.quantity > 0) {
          const list = productUpdatesMap.get(line.productId) ?? [];
          list.push({
            skuId: line.skuId,
            addQty: line.quantity,
            newCostPrice: line.unitPrice,
          });
          productUpdatesMap.set(line.productId, list);
        }
      }

      for (const [productId, lineUpdates] of productUpdatesMap.entries()) {
        const targetProduct = catalogProducts.find((p) => p.id === productId);
        if (targetProduct && targetProduct.skus?.length > 0) {
          const updatedSkusPayload = targetProduct.skus.map((sku) => {
            const matchedLines = lineUpdates.filter((u) => u.skuId === sku.id);
            const addedQty = matchedLines.reduce((s, u) => s + u.addQty, 0);
            const latestCost =
              matchedLines[matchedLines.length - 1]?.newCostPrice;
            return {
              id: sku.id,
              sellerSku: sku.sellerSku,
              originalPrice:
                !lineUpdates[0] || !latestCost || latestCost <= 0
                  ? sku.originalPrice
                  : Math.max(sku.originalPrice, latestCost),
              salePrice: sku.salePrice,
              stockQuantity: sku.stockQuantity + addedQty,
              salesAttributes: sku.salesAttributes,
            };
          });

          try {
            await productsApi.updateSkus(productId, {
              skus: updatedSkusPayload,
            });
          } catch {
            // Tiếp tục lưu phiếu
          }
        }
      }

      // 2. Tự động tạo Phiếu Chi vào Sổ quỹ nếu Tiền thực trả > 0
      if (values.autoRecordCashbook && values.amountPaid > 0) {
        try {
          await createCashbookVoucherMutation.mutateAsync({
            transactionDate: values.importDate,
            type: 'EXPENSE',
            category: 'Chi tiền trả nhà cung cấp hàng hóa',
            categoryCode: 'LC-NCC-01',
            payerGroup: 'SUPPLIER',
            partnerName:
              values.logisticsUnitName.trim() || 'HÒa BÌnh logitics',
            cashAmount:
              values.paymentMethod === 'CASH' ? values.amountPaid : 0,
            cardAmount: 0,
            transferAmount:
              values.paymentMethod === 'TRANSFER' ? values.amountPaid : 0,
            staffName: values.staffName || 'Nguyễn Thị Hồng Yến Nhiên',
            note:
              values.description.trim() ||
              `Thanh toán phiếu nhập hàng ${values.receiptNumber}${values.invoiceNumber ? ` (HĐ: ${values.invoiceNumber})` : ''}`,
            isBusinessAccounting: true,
          });
        } catch {
          // Không chặn luồng lưu phiếu nhập
        }
      }

      // 3. Lưu vào Lịch sử nhập hàng (status: COMPLETED) & xóa bản nháp nếu có
      const nowIso = new Date().toISOString();
      const rawCode = values.receiptNumber.trim();
      const finalReceiptNumber =
        !rawCode || rawCode.startsWith('NHAP-TAM-')
          ? generateReceiptSequence(completedReceipts.length, false)
          : rawCode;

      const completedRecord: SavedImportReceiptRecord = {
        ...values,
        id: sourceDraftId || `rec-${Date.now()}`,
        status: 'COMPLETED',
        receiptNumber: finalReceiptNumber,
        subtotalBeforeTax: calcSubtotal,
        vatAmount: calcVat,
        orderDiscountAmount: calcDiscount,
        totalPayable: calcTotalPayable,
        debtRemaining: calcDebt,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      const filteredWithoutDraft = sourceDraftId
        ? savedRecords.filter((r) => r.id !== sourceDraftId)
        : savedRecords;

      const nextRecords = [completedRecord, ...filteredWithoutDraft];
      persistRecords(nextRecords);

      recordLocalNotification({
        title: `Đã hoàn tất phiếu nhập hàng ${finalReceiptNumber}`,
        body: `Đơn vị Logistics: ${values.logisticsUnitName} • ${values.items.length} mặt hàng • Tổng thanh toán: ${formatCurrencyVND(calcTotalPayable)}.`,
        eventType: 'SYSTEM_ANNOUNCEMENT',
      });

      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      toast.success(
        `${finalReceiptNumber} - ${formatCurrencyVND(calcTotalPayable)}`,
      );

      setEditingDraftId(null);
      setIsAmountPaidTouched(false);
      setValue('items', []);
      setValue(
        'receiptNumber',
        generateReceiptSequence(completedReceipts.length + 1),
      );
      setValue('invoiceNumber', '');
      setValue('description', '');
      setValue('vatPercent', 0);
      setValue('orderDiscountValue', 0);
      setValue('shippingFee', 0);
    } finally {
      setIsSavingReceipt(false);
    }
  };

  const handleSaveReceipt = async () => {
    const values = getValues();
    await executeFinalizeImport(
      values,
      subtotalBeforeTax,
      vatAmount,
      orderDiscountAmount,
      totalPayable,
      debtRemaining,
      editingDraftId,
    );
  };

  // Mở lại 1 bản lưu tạm hoặc phiếu cũ lên Form
  const handleResumeRecord = (rec: SavedImportReceiptRecord) => {
    setEditingDraftId(rec.status === 'DRAFT' ? rec.id : null);
    setIsAmountPaidTouched(true);
    reset({
      importDate: rec.importDate,
      logisticsUnitId: rec.logisticsUnitId,
      logisticsUnitName: rec.logisticsUnitName,
      receiptNumber: rec.receiptNumber,
      invoiceNumber: rec.invoiceNumber,
      staffName: rec.staffName,
      description: rec.description,
      exchangeRateCny: rec.exchangeRateCny || DEFAULT_CNY_EXCHANGE_RATE,
      items: rec.items,
      vatPercent: rec.vatPercent,
      orderDiscountType: rec.orderDiscountType,
      orderDiscountValue: rec.orderDiscountValue,
      shippingFee: rec.shippingFee,
      amountPaid: rec.amountPaid,
      paymentMethod: rec.paymentMethod,
      autoRecordCashbook: rec.autoRecordCashbook,
    });
    handleSwitchTab('CREATE');
  };

  const handleDeleteRecord = (id: string) => {
    const target = savedRecords.find((r) => r.id === id);
    const next = savedRecords.filter((r) => r.id !== id);
    persistRecords(next);
    if (editingDraftId === id) {
      setEditingDraftId(null);
    }
    if (target) {
      toast.success(
        t('importsForm.deleteReceiptToast', { code: target.receiptNumber }),
      );
    }
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-4 pb-10">
      {/* Header + Thanh chuyển đổi 3 Tab: Lập phiếu nhập hàng | Lịch sử nhập hàng | Lưu tạm */}
      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="stat-card-icon flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="page-title text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  {t('importsForm.pageTitle')}
                </h1>
                <span className="status-badge status-active rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/60 dark:text-emerald-300">
                  {t('importsForm.syncedProductsBadge', {
                    count: catalogProducts.length,
                  })}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('importsForm.pageSubtitle')}
              </p>
            </div>
          </div>

          {/* 3 Tabs điều hướng chính */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => handleSwitchTab('CREATE')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition',
                activeTab === 'CREATE'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white',
              )}
            >
              <FilePlus2 className="h-3.5 w-3.5" />
              {t('importsForm.tabCreateReceipt')}
            </button>

            <button
              type="button"
              onClick={() => handleSwitchTab('HISTORY')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition',
                activeTab === 'HISTORY'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white',
              )}
            >
              <FileCheck2 className="h-3.5 w-3.5" />
              {t('importsForm.tabImportHistory', {
                count: completedReceipts.length,
              })}
            </button>

            <button
              type="button"
              onClick={() => handleSwitchTab('DRAFTS')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition',
                activeTab === 'DRAFTS'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white',
              )}
            >
              <FileClock className="h-3.5 w-3.5" />
              {t('importsForm.tabDraftReceipts', {
                count: draftReceipts.length,
              })}
            </button>

            {activeTab === 'CREATE' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetForm}
                className="ml-1 h-7 gap-1 px-2.5 text-xs"
              >
                <RotateCcw className="h-3 w-3" />
                {t('importsForm.resetFormBtn')}
              </Button>
            )}
          </div>
        </div>

        {/* Banner thông báo khi đang mở 1 bản lưu tạm */}
        {activeTab === 'CREATE' && editingDraftId && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-200">
            <div className="flex items-center gap-2">
              <FileClock className="h-4 w-4 text-amber-600" />
              <span>
                {t('importsForm.editingDraftBanner', {
                  code: getValues('receiptNumber'),
                })}
              </span>
            </div>
            <button
              type="button"
              onClick={handleResetForm}
              className="inline-flex items-center gap-1 rounded bg-white/80 px-2 py-0.5 text-[11px] font-semibold text-amber-800 hover:bg-white dark:bg-slate-800 dark:text-amber-300"
            >
              <X className="h-3 w-3" />
              {t('importsForm.exitDraftEditBtn')}
            </button>
          </div>
        )}
      </div>

      {/* ====================================================================
          TAB 1: FORM LẬP PHIẾU NHẬP HÀNG (CREATE)
         ==================================================================== */}
      {activeTab === 'CREATE' && (
        <>
          {/* 1. Khu vực thông tin chung (Phía trên - có thêm Tỷ giá & Nhập Giá vốn Tệ ¥ -> VNĐ) */}
          <ImportGeneralInfoSection
            control={control}
            setValue={setValue}
            logisticsOptions={logisticsOptions}
            staffOptions={staffOptions}
            savedReceiptsCount={completedReceipts.length}
            onOpenCreateLogistics={() => setIsCreateLogisticsModalOpen(true)}
            onExchangeRateChange={handleExchangeRateChange}
            onApplyDefaultCostPriceToRows={handleApplyDefaultCostPriceToRows}
          />

          {/* 2. Khu vực thanh công cụ thao tác nhanh (Thanh màu xám ở giữa) */}
          <ImportQuickToolbar
            onSelectProductSku={handleSelectProductSku}
            onAddBlankRow={handleAddBlankRow}
            onOpenCatalogPicker={() => setIsCatalogPickerOpen(true)}
            onOpenExcelModal={() => setIsExcelModalOpen(true)}
            onOpenCreateProductModal={(initialSearch) => {
              setInitialCreateProductTitle(initialSearch || '');
              setIsCreateProductModalOpen(true);
            }}
          />

          {/* 3. Khu vực danh sách hàng hóa (Bảng màu xanh lá - có cột Giá vốn ¥ Tệ đổi sang tiền Việt) */}
          <ImportProductsTable
            items={items}
            exchangeRateCny={exchangeRateCny}
            catalogProductsCount={catalogProducts.length}
            subtotalBeforeTax={subtotalBeforeTax}
            orderDiscountAmount={orderDiscountAmount}
            onUpdateRow={handleUpdateRow}
            onRemoveRow={handleRemoveRow}
            onAddBlankRow={handleAddBlankRow}
            onOpenCatalogPicker={() => setIsCatalogPickerOpen(true)}
          />

          {/* 4. Khu vực tính toán và thanh toán (Phía dưới - có nút Lưu tạm & Lưu phiếu nhập) */}
          <ImportPaymentSection
            control={control}
            setValue={setValue}
            subtotalBeforeTax={subtotalBeforeTax}
            vatAmount={vatAmount}
            orderDiscountAmount={orderDiscountAmount}
            totalPayable={totalPayable}
            totalWithShipping={totalWithShipping}
            debtRemaining={debtRemaining}
            isSavingReceipt={isSavingReceipt}
            isEditingDraft={Boolean(editingDraftId)}
            onMarkAmountPaidTouched={() => setIsAmountPaidTouched(true)}
            onSaveDraft={handleSaveDraft}
            onSaveReceipt={handleSaveReceipt}
          />
        </>
      )}

      {/* ====================================================================
          TAB 2: TRANG LỊCH SỬ NHẬP HÀNG (HISTORY)
         ==================================================================== */}
      {activeTab === 'HISTORY' && (
        <ImportHistorySection
          mode="HISTORY"
          records={completedReceipts}
          completedCount={completedReceipts.length}
          draftCount={draftReceipts.length}
          onModeChange={(nextMode) => handleSwitchTab(nextMode)}
          onSwitchToCreate={() => handleSwitchTab('CREATE')}
          onResumeRecord={handleResumeRecord}
          onDeleteRecord={handleDeleteRecord}
        />
      )}

      {/* ====================================================================
          TAB 3: TAB LƯU TẠM (DRAFTS)
         ==================================================================== */}
      {activeTab === 'DRAFTS' && (
        <ImportHistorySection
          mode="DRAFTS"
          records={draftReceipts}
          completedCount={completedReceipts.length}
          draftCount={draftReceipts.length}
          onModeChange={(nextMode) => handleSwitchTab(nextMode)}
          onSwitchToCreate={() => handleSwitchTab('CREATE')}
          onResumeRecord={handleResumeRecord}
          onFinalizeDraft={(draftRec) =>
            executeFinalizeImport(
              draftRec,
              draftRec.subtotalBeforeTax,
              draftRec.vatAmount,
              draftRec.orderDiscountAmount,
              draftRec.totalPayable,
              draftRec.debtRemaining,
              draftRec.id,
            )
          }
          onDeleteRecord={handleDeleteRecord}
        />
      )}

      {/* Modal thêm nhanh Đơn vị Logistics (Nhà phân phối) */}
      <ImportLogisticsCreateModal
        open={isCreateLogisticsModalOpen}
        onClose={() => setIsCreateLogisticsModalOpen(false)}
        onCreated={(createdUnit) => {
          setValue('logisticsUnitId', createdUnit.id, { shouldDirty: true });
          setValue('logisticsUnitName', createdUnit.name, {
            shouldDirty: true,
          });
          setIsCreateLogisticsModalOpen(false);
        }}
      />

      {/* Modal tạo mới sản phẩm vào bảng Products */}
      <ImportCreateProductModal
        open={isCreateProductModalOpen}
        leafCategories={leafCategories}
        initialTitle={initialCreateProductTitle}
        exchangeRateCny={exchangeRateCny}
        isSubmitting={createProductMutation.isPending}
        onClose={() => setIsCreateProductModalOpen(false)}
        onCreateProduct={async (payload) => {
          const currentItems = getValues('items') ?? [];
          try {
            const created = await createProductMutation.mutateAsync({
              title: payload.title,
              categoryId:
                payload.categoryId ||
                leafCategories[0]?.id ||
                categories[0]?.id ||
                'cat-leaf-default',
              brandName: payload.brandName || 'Bonzstore Official',
              sellerSku: payload.sellerSku,
              originalPrice: payload.salePrice,
              salePrice: payload.salePrice,
              stockQuantity: payload.quantity,
              status: 'ACTIVE',
              tags: ['Nhập kho mới'],
            });

            const createdSku = created.skus?.[0];
            setValue(
              'items',
              [
                ...currentItems,
                {
                  lineId: `line-${Date.now()}`,
                  productId: created.id,
                  skuId: createdSku?.id,
                  isGift: false,
                  itemCode: createdSku?.sellerSku || payload.sellerSku,
                  itemName: created.title,
                  unit: payload.unit,
                  expiryDate: payload.expiryDate,
                  quantity: payload.quantity,
                  cnyUnitPrice: payload.cnyUnitPrice,
                  unitPrice: payload.importPrice,
                  productDiscountType: 'VND',
                  productDiscountValue: 0,
                  currentStock: createdSku?.stockQuantity ?? payload.quantity,
                },
              ],
              { shouldDirty: true },
            );
            setIsCreateProductModalOpen(false);
          } catch {
            setValue(
              'items',
              [
                ...currentItems,
                {
                  lineId: `line-${Date.now()}`,
                  isGift: false,
                  itemCode: payload.sellerSku,
                  itemName: payload.title,
                  unit: payload.unit,
                  expiryDate: payload.expiryDate,
                  quantity: payload.quantity,
                  cnyUnitPrice: payload.cnyUnitPrice,
                  unitPrice: payload.importPrice,
                  productDiscountType: 'VND',
                  productDiscountValue: 0,
                },
              ],
              { shouldDirty: true },
            );
            setIsCreateProductModalOpen(false);
          }
        }}
      />

      {/* Modal nhập Excel / CSV */}
      <ImportExcelModal
        open={isExcelModalOpen}
        exchangeRateCny={exchangeRateCny}
        catalogSkus={flattenedCatalogSkus}
        onClose={() => setIsExcelModalOpen(false)}
        onImported={(importedLines) => {
          const currentItems = getValues('items') ?? [];
          setValue('items', [...currentItems, ...importedLines], {
            shouldDirty: true,
          });
          setIsExcelModalOpen(false);
        }}
      />

      {/* Drawer chọn nhanh nhiều sản phẩm từ bảng Products */}
      <Drawer
        open={isCatalogPickerOpen}
        onClose={() => setIsCatalogPickerOpen(false)}
        title={t('importsForm.pickFromCatalogTooltip')}
        description={t('importsForm.pageSubtitle')}
        widthClassName="max-w-2xl"
      >
        <div className="space-y-2.5">
          {flattenedCatalogSkus.map((entry) => {
            const { product, sku, variantLabel, importPrice, cnyCostPrice } =
              entry;
            const inTable = items.find((i) => i.skuId === sku.id);
            return (
              <div
                key={`${product.id}-${sku.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs transition hover:border-emerald-500/50 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {product.thumbnailUrl ? (
                    <img
                      src={product.thumbnailUrl}
                      alt={product.title}
                      className="h-11 w-11 shrink-0 rounded-lg border border-slate-200 object-cover dark:border-slate-700"
                    />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-400 dark:bg-slate-800">
                      <Package className="h-5 w-5" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="truncate text-xs font-bold text-slate-900 dark:text-slate-100">
                      {product.title}
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {sku.sellerSku}
                      </span>
                      {variantLabel && (
                        <span className="text-emerald-600">
                          • {variantLabel}
                        </span>
                      )}
                      <span>
                        • {t('importsForm.stockLabel')}{' '}
                        {sku.stockQuantity.toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs font-bold text-emerald-600">
                      {formatCurrencyVND(importPrice)}
                    </div>
                    <div className="font-mono text-[10px] font-semibold text-amber-600">
                      ≈ {cnyCostPrice.toLocaleString('vi-VN')} ¥
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleSelectProductSku(entry)}
                    className="bg-emerald-600 text-xs text-white hover:bg-emerald-700"
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    {inTable
                      ? `SL: ${inTable.quantity.toLocaleString('vi-VN')}`
                      : t('common.add')}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Drawer>
    </div>
  );
}
