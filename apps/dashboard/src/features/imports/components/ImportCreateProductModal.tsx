import { CheckCircle2, Loader2, PackagePlus, X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { CategoryItem } from '../../../api/types/catalog.types';
import { Button } from '../../../components/ui/button';
import { FormField } from '../../../components/ui/form-field';
import { VnCnyInput } from '../../../components/ui/input';
import {
  RHFCreatableSelect,
  RHFCurrencyInput,
  RHFInput,
} from '../../../components/ui/rhf-fields';
import { useI18n } from '../../i18n/I18nContext';
import {
  UNIT_OPTIONS,
  convertCnyToVnd,
  convertVndToCny,
} from './ImportFormTypes';

export interface QuickCreateProductFormValues {
  title: string;
  categoryId: string;
  brandName: string;
  sellerSku: string;
  unit: string;
  expiryDate: string;
  quantity: number;
  cnyUnitPrice: number;
  importPrice: number;
  salePrice: number;
}

export interface ImportCreateProductModalProps {
  open: boolean;
  leafCategories: CategoryItem[];
  initialTitle: string;
  exchangeRateCny: number;
  isSubmitting: boolean;
  onClose: () => void;
  onCreateProduct: (payload: QuickCreateProductFormValues) => Promise<void>;
}

export function ImportCreateProductModal({
  open,
  leafCategories,
  initialTitle,
  exchangeRateCny,
  isSubmitting,
  onClose,
  onCreateProduct,
}: ImportCreateProductModalProps) {
  const { t } = useI18n();

  const { control, handleSubmit, setValue } =
    useForm<QuickCreateProductFormValues>({
      defaultValues: {
        title: initialTitle || '',
        categoryId: leafCategories[0]?.id || '',
        brandName: 'Good Smile Company',
        sellerSku: `SP-${Math.floor(10000 + Math.random() * 90000)}`,
        unit: 'Hộp',
        expiryDate: '',
        quantity: 10,
        cnyUnitPrice: 40,
        importPrice: convertCnyToVnd(40, exchangeRateCny),
        salePrice: 220000,
      },
    });

  const cnyUnitPrice = useWatch({ control, name: 'cnyUnitPrice' }) || 0;

  useEffect(() => {
    if (open) {
      setValue('title', initialTitle || '');
      if (leafCategories[0]?.id) {
        setValue('categoryId', leafCategories[0].id);
      }
      setValue('sellerSku', `SP-${Math.floor(10000 + Math.random() * 90000)}`);
    }
  }, [open, initialTitle, leafCategories, setValue]);

  if (!open) return null;

  const categoryOptions = leafCategories.map((c) => ({
    value: c.id,
    label: c.localName,
    code: c.externalCategoryId || undefined,
  }));

  const unitOptions = UNIT_OPTIONS.map((u) => ({
    value: u,
    label: u,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <PackagePlus className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {t('products.addBtn')}
              </h3>
              <p className="text-[11px] text-slate-500">
                Tỷ giá quy đổi: 1 ¥ = {exchangeRateCny.toLocaleString('vi-VN')} ₫
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

        <form onSubmit={handleSubmit(onCreateProduct)} className="space-y-3">
          <FormField label={t('products.titleLabel')} required>
            <RHFInput
              control={control}
              name="title"
              required
              autoFocus
              placeholder="VD: Mô Hình One Piece Gear 5 Luffy Nika Chính Hãng..."
            />
          </FormField>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FormField label={t('importsForm.colCode')} required>
              <RHFInput
                control={control}
                name="sellerSku"
                required
                inputClassName="font-mono font-semibold"
              />
            </FormField>

            <FormField label={t('products.leafCategoryLabel')} required>
              <RHFCreatableSelect
                control={control}
                name="categoryId"
                options={categoryOptions}
              />
            </FormField>

            <FormField label={t('importsForm.colUnit')}>
              <RHFCreatableSelect
                control={control}
                name="unit"
                options={unitOptions}
                searchable={false}
              />
            </FormField>

            <FormField label={t('importsForm.colQuantity')}>
              <RHFCurrencyInput
                control={control}
                name="quantity"
                min={1}
                inputClassName="text-right"
              />
            </FormField>

            {/* Giá vốn bằng Nhân dân tệ (¥) -> Tự động đổi sang VNĐ */}
            <FormField label={t('importsForm.colCnyCostPrice')}>
              <VnCnyInput
                min={0}
                allowZeroDisplay
                value={cnyUnitPrice}
                onValueChange={(cnyVal) => {
                  setValue('cnyUnitPrice', cnyVal, { shouldDirty: true });
                  setValue(
                    'importPrice',
                    convertCnyToVnd(cnyVal, exchangeRateCny),
                    { shouldDirty: true },
                  );
                }}
                rightAddon={
                  <span className="pointer-events-none pr-1.5 font-mono text-xs font-bold text-amber-600">
                    ¥
                  </span>
                }
                className="h-9 pr-7 text-amber-700 dark:text-amber-400"
              />
            </FormField>

            {/* Đơn giá vốn quy đổi sang tiền Việt (VNĐ) */}
            <FormField label={t('importsForm.colUnitPrice')}>
              <RHFCurrencyInput
                control={control}
                name="importPrice"
                min={0}
                allowZeroDisplay
                inputClassName="text-right pr-7"
                rightAddon={
                  <span className="pointer-events-none pr-1 text-xs text-slate-400">
                    ₫
                  </span>
                }
              />
            </FormField>

            <FormField label={t('products.salePriceLabel')}>
              <RHFCurrencyInput
                control={control}
                name="salePrice"
                min={0}
                allowZeroDisplay
                inputClassName="text-right pr-7"
                rightAddon={
                  <span className="pointer-events-none pr-1 text-xs text-slate-400">
                    ₫
                  </span>
                }
              />
            </FormField>

            <FormField label={t('importsForm.colExpiry')}>
              <RHFInput control={control} name="expiryDate" type="date" />
            </FormField>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {isSubmitting ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
              )}
              {t('importsForm.createNewBtn')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
