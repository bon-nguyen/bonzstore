import { ProductItem, ProductSkuItem } from '../../../api/types/catalog.types';

export type DiscountValueType = 'VND' | 'PERCENT';

export type ImportReceiptStatus = 'COMPLETED' | 'DRAFT';

export type ImportsActiveTab = 'CREATE' | 'HISTORY' | 'DRAFTS';

export const DEFAULT_CNY_EXCHANGE_RATE = 3790;

export interface FlattenedCatalogSkuEntry {
  product: ProductItem;
  sku: ProductSkuItem;
  variantLabel: string;
  importPrice: number;
  cnyCostPrice: number;
}

export interface ImportLineItemFormValue {
  lineId: string;
  productId?: string;
  skuId?: string;
  isGift: boolean; // Hàng tặng (không tính tiền)
  itemCode: string; // Mã hàng (SKU)
  itemName: string; // Tên mặt hàng
  variantLabel?: string;
  thumbnailUrl?: string | null;
  expiryDate: string; // Hạn sử dụng (YYYY-MM-DD)
  unit: string; // Đơn vị
  quantity: number; // Số lượng
  cnyUnitPrice: number; // Giá vốn bằng Nhân dân tệ (¥)
  unitPrice: number; // Đơn giá vốn quy đổi sang tiền Việt (VNĐ)
  productDiscountType: DiscountValueType; // Giảm tiền (VND) hoặc Giảm phần trăm (PERCENT)
  productDiscountValue: number; // Giá trị giảm
  currentStock?: number;
}

export interface ImportReceiptFormValues {
  importDate: string;
  logisticsUnitId: string;
  logisticsUnitName: string;
  receiptNumber: string;
  invoiceNumber: string;
  staffName: string;
  description: string;
  exchangeRateCny: number; // Tỷ giá 1 ¥ Tệ -> VNĐ (VD: 3.790 ₫)
  items: ImportLineItemFormValue[];
  vatPercent: number;
  orderDiscountType: DiscountValueType;
  orderDiscountValue: number;
  shippingFee: number;
  amountPaid: number;
  paymentMethod: 'CASH' | 'TRANSFER';
  autoRecordCashbook: boolean;
}

export interface SavedImportReceiptRecord extends ImportReceiptFormValues {
  id: string;
  status: ImportReceiptStatus;
  subtotalBeforeTax: number;
  vatAmount: number;
  orderDiscountAmount: number;
  totalPayable: number;
  debtRemaining: number;
  createdAt: string;
  updatedAt: string;
}

export const UNIT_OPTIONS = [
  'Hộp',
  'Cái',
  'Bộ',
  'Thùng',
  'Chiếc',
  'Lốc',
  'Gói',
] as const;

export const VAT_PRESETS = [0, 5, 8, 10] as const;

export const EXCHANGE_RATE_PRESETS = [3700, 3750, 3790, 3850] as const;

export function formatVnDateDisplay(isoDate: string): string {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

export function generateReceiptSequence(count: number, isDraft = false): string {
  const seq = String(count + 1).padStart(4, '0');
  return isDraft ? `NHAP-TAM-${seq}` : `PN-20261110-${seq}`;
}

export function convertCnyToVnd(
  cnyAmount: number,
  exchangeRateCny: number,
): number {
  const rate = exchangeRateCny > 0 ? exchangeRateCny : DEFAULT_CNY_EXCHANGE_RATE;
  if (!cnyAmount || cnyAmount <= 0) return 0;
  return Math.round(cnyAmount * rate);
}

export function convertVndToCny(
  vndAmount: number,
  exchangeRateCny: number,
): number {
  const rate = exchangeRateCny > 0 ? exchangeRateCny : DEFAULT_CNY_EXCHANGE_RATE;
  if (!vndAmount || vndAmount <= 0) return 0;
  return Number((vndAmount / rate).toFixed(2));
}

export function flattenProductsToSkuEntries(
  products: ProductItem[],
  exchangeRateCny = DEFAULT_CNY_EXCHANGE_RATE,
): FlattenedCatalogSkuEntry[] {
  const result: FlattenedCatalogSkuEntry[] = [];

  for (const product of products) {
    if (product.skus && product.skus.length > 0) {
      for (const sku of product.skus) {
        const variantLabel =
          sku.salesAttributes
            ?.map((attr) => `${attr.name}: ${attr.value_name}`)
            .join(' • ') || '';
        const rawCost =
          sku.salePrice > 0
            ? Math.round((sku.salePrice * 0.7) / 1000) * 1000
            : sku.originalPrice;
        const importPrice = rawCost || 150000;
        result.push({
          product,
          sku,
          variantLabel,
          importPrice,
          cnyCostPrice: convertVndToCny(importPrice, exchangeRateCny),
        });
      }
    } else {
      const importPrice =
        Math.round(((product.minPrice || 150000) * 0.7) / 1000) * 1000;
      result.push({
        product,
        sku: {
          id: product.id,
          externalSkuId: product.externalProductId,
          sellerSku:
            product.externalProductId || `SP-${product.id.slice(0, 6)}`,
          salesAttributes: [],
          originalPrice: product.minOriginalPrice || 200000,
          salePrice: product.minPrice || 150000,
          stockQuantity: product.totalStock || 0,
        },
        variantLabel: '',
        importPrice,
        cnyCostPrice: convertVndToCny(importPrice, exchangeRateCny),
      });
    }
  }

  return result;
}

export function calculateLineGrossAmount(line: ImportLineItemFormValue): number {
  if (line.isGift) return 0;
  return Math.max(0, Math.round(line.quantity * line.unitPrice));
}

export function calculateLineProductDiscountAmount(
  line: ImportLineItemFormValue,
): number {
  if (line.isGift) return 0;
  const gross = calculateLineGrossAmount(line);
  if (gross <= 0 || line.productDiscountValue <= 0) return 0;

  if (line.productDiscountType === 'PERCENT') {
    const pct = Math.min(100, Math.max(0, line.productDiscountValue));
    return Math.round((gross * pct) / 100);
  }
  return Math.min(gross, Math.round(line.productDiscountValue));
}

export function calculateLineSubtotalBeforeTax(
  line: ImportLineItemFormValue,
): number {
  if (line.isGift) return 0;
  const gross = calculateLineGrossAmount(line);
  const disc = calculateLineProductDiscountAmount(line);
  return Math.max(0, gross - disc);
}
