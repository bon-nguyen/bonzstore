import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { recordLocalNotification } from '../../../api/data/hoabinh-55479-fallback';
import { productsApi } from '../../../api/endpoints/catalog.api';
import { ProductItem } from '../../../api/types/catalog.types';
import { LogisticsUnit } from '../../../api/types/logistics.types';
import { CreatableSelectOption } from '../../../components/ui/rhf-fields';
import { formatCurrencyVND } from '../../../lib/utils';
import { useAuthContext } from '../../auth/context/AuthContext';
import { useCreateCashbookVoucher } from '../../cashbook/hooks/useCashbook';
import {
  useCategories,
  useCreateProduct,
  useProducts,
} from '../../catalog/hooks/useCatalog';
import { useI18n } from '../../i18n/I18nContext';
import { useLogisticsUnits } from '../../logistics/hooks/useLogistics';
import { useUsers } from '../../users/hooks/useUsers';
import {
  DEFAULT_CNY_EXCHANGE_RATE,
  FlattenedCatalogSkuEntry,
  ImportLineItemFormValue,
  ImportReceiptFormValues,
  ImportsActiveTab,
  SavedImportReceiptRecord,
  calculateLineSubtotalBeforeTax,
  convertVndToCny,
  flattenProductsToSkuEntries,
  generateReceiptSequence,
} from '../components/ImportFormTypes';

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
    description:
      'Đơn hàng đang kiểm đếm tại kho Hòa Bình (Lưu tạm chờ chốt giá Tệ)',
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

export function useImportFormManager() {
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
  const { data: productsResponse, isLoading: isLoadingProducts } = useProducts({
    page: 1,
    limit: 100,
  });
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

  // Thao tác Lưu tạm (Save Draft)
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

  // Thao tác Hoàn tất lưu phiếu nhập & Nhập kho
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

  return {
    activeTab,
    setActiveTab,
    editingDraftId,
    control,
    setValue,
    getValues,
    items,
    exchangeRateCny,
    catalogProducts,
    isLoadingProducts,
    categories,
    leafCategories,
    createProductMutation,
    logisticsOptions,
    staffOptions,
    completedReceipts,
    draftReceipts,
    flattenedCatalogSkus,
    subtotalBeforeTax,
    orderDiscountAmount,
    vatAmount,
    totalPayable,
    totalWithShipping,
    debtRemaining,
    isSavingReceipt,
    setIsAmountPaidTouched,
    handleSelectProductSku,
    handleAddBlankRow,
    handleUpdateRow,
    handleRemoveRow,
    handleResetForm,
    handleSaveDraft,
    handleSaveReceipt,
    executeFinalizeImport,
    handleResumeRecord,
    handleDeleteRecord,
  };
}
