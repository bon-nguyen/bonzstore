import { Download, FileSpreadsheet, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/button';
import { useI18n } from '../../i18n/I18nContext';
import {
  FlattenedCatalogSkuEntry,
  ImportLineItemFormValue,
  convertCnyToVnd,
  convertVndToCny,
} from './ImportFormTypes';

export interface ImportExcelModalProps {
  open: boolean;
  exchangeRateCny: number;
  catalogSkus: FlattenedCatalogSkuEntry[];
  onClose: () => void;
  onImported: (lines: ImportLineItemFormValue[]) => void;
}

export function ImportExcelModal({
  open,
  exchangeRateCny,
  catalogSkus,
  onClose,
  onImported,
}: ImportExcelModalProps) {
  const { t } = useI18n();

  if (!open) return null;

  const handleDownloadSampleCsv = () => {
    const csvContent = [
      'MaHang,TenMatHang,DonVi,SoLuong,GiaVonTe_CNY,DonGia_VND,LoaiGiamGia,GiaTriGiam,HanSuDung,HangTang',
      'HXH002-SET8,Mô Hình Hunter x Hunter Bộ 8 Nhân Vật Chibi,Bộ,15,41,155390,VND,0,2027-12-31,0',
      'OP-LUFFY-G5,Mô Hình One Piece Luffy Gear 5 Nika,Hộp,20,55.5,210345,PERCENT,5,2027-12-31,0',
      'GIFT-STAND-01,Đế trưng bày Acrylic trong suốt (Tặng kèm),Cái,5,9,34110,VND,0,,1',
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Mau_Nhap_Hang_Bonzstore.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Mau_Nhap_Hang_Bonzstore.csv');
  };

  const handleFileUpload = async (file: File) => {
    const text = await file.text();
    const rows = text
      .split(/\r?\n/)
      .map((r) => r.trim())
      .filter(Boolean);

    const parsedLines: ImportLineItemFormValue[] = [];
    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i].split(',');
      if (cols.length < 2) continue;
      const code = cols[0]?.trim() || `EX-${i}`;
      const name = cols[1]?.trim() || `Mặt hàng Excel #${i}`;
      const unit = cols[2]?.trim() || 'Hộp';
      const qty = Math.max(1, Number(cols[3]?.replace(/[^\d]/g, '')) || 1);
      const rawCny = parseFloat((cols[4] || '0').replace(',', '.')) || 0;
      const rawVnd = Math.max(0, Number(cols[5]?.replace(/[^\d]/g, '')) || 0);
      const discountTypeRaw = (cols[6]?.trim() || 'VND').toUpperCase();
      const discountType =
        discountTypeRaw === 'PERCENT' || discountTypeRaw === '%'
          ? 'PERCENT'
          : 'VND';
      const discountVal = Math.max(
        0,
        Number(cols[7]?.replace(/[^\d]/g, '')) || 0,
      );
      const expiry = cols[8]?.trim() || '';
      const isGift = cols[9]?.trim() === '1' || cols[9]?.trim() === 'true';

      const matched = catalogSkus.find(
        (c) => c.sku.sellerSku.toLowerCase() === code.toLowerCase(),
      );

      const finalVnd =
        rawCny > 0
          ? convertCnyToVnd(rawCny, exchangeRateCny)
          : rawVnd || matched?.importPrice || 150000;
      const finalCny =
        rawCny > 0 ? rawCny : convertVndToCny(finalVnd, exchangeRateCny);

      parsedLines.push({
        lineId: `excel-${Date.now()}-${i}`,
        productId: matched?.product.id,
        skuId: matched?.sku.id,
        isGift,
        itemCode: code,
        itemName: matched?.product.title || name,
        variantLabel: matched?.variantLabel,
        thumbnailUrl: matched?.product.thumbnailUrl,
        unit,
        quantity: qty,
        cnyUnitPrice: finalCny,
        unitPrice: finalVnd,
        productDiscountType: discountType,
        productDiscountValue: discountVal,
        expiryDate: expiry,
        currentStock: matched?.sku.stockQuantity,
      });
    }

    if (parsedLines.length > 0) {
      onImported(parsedLines);
    } else {
      toast.error('File không có dòng dữ liệu hợp lệ');
    }
  };

  const handleLoadBatchFromCatalog = () => {
    const batch: ImportLineItemFormValue[] = catalogSkus
      .slice(0, 5)
      .map((entry, idx) => ({
        lineId: `excel-cat-${Date.now()}-${idx}`,
        productId: entry.product.id,
        skuId: entry.sku.id,
        isGift: false,
        itemCode: entry.sku.sellerSku,
        itemName: entry.product.title,
        variantLabel: entry.variantLabel,
        thumbnailUrl: entry.product.thumbnailUrl,
        expiryDate: '',
        unit: 'Hộp',
        quantity: 10,
        cnyUnitPrice: entry.cnyCostPrice,
        unitPrice: entry.importPrice,
        productDiscountType: 'VND',
        productDiscountValue: 0,
        currentStock: entry.sku.stockQuantity,
      }));
    onImported(batch);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {t('importsForm.excelModalTitle')}
              </h3>
              <p className="text-[11px] text-slate-500">
                {t('importsForm.excelModalDesc')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3.5">
          <button
            type="button"
            onClick={handleDownloadSampleCsv}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50/70 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300"
          >
            <Download className="h-4 w-4" />
            {t('importsForm.excelDownloadSampleBtn')}
          </button>

          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-blue-300 bg-slate-50 px-4 py-6 text-center transition hover:bg-blue-50/40 dark:border-blue-500/40 dark:bg-slate-800/40">
            <Upload className="mb-2 h-7 w-7 text-blue-600" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              {t('importsForm.excelUploadTitle')}
            </span>
            <span className="mt-1 text-[11px] text-slate-400">
              {t('importsForm.excelUploadHint')}
            </span>
            <input
              type="file"
              accept=".csv,.txt"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileUpload(file);
                }
              }}
            />
          </label>

          <div className="flex items-center justify-between gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleLoadBatchFromCatalog}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {t('importsForm.excelLoadFromCatalogBtn')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
