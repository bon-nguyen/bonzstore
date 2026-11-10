import { Package, Plus } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Drawer } from '../../../components/ui/drawer';
import { Skeleton } from '../../../components/ui/skeleton';
import { formatCurrencyVND } from '../../../lib/utils';
import { useI18n } from '../../i18n/I18nContext';
import {
  FlattenedCatalogSkuEntry,
  ImportLineItemFormValue,
} from './ImportFormTypes';

export interface ImportCatalogPickerDrawerProps {
  open: boolean;
  isLoadingProducts: boolean;
  flattenedCatalogSkus: FlattenedCatalogSkuEntry[];
  items: ImportLineItemFormValue[];
  onClose: () => void;
  onSelectProductSku: (entry: FlattenedCatalogSkuEntry) => void;
}

export function ImportCatalogPickerDrawer({
  open,
  isLoadingProducts,
  flattenedCatalogSkus,
  items,
  onClose,
  onSelectProductSku,
}: ImportCatalogPickerDrawerProps) {
  const { t } = useI18n();

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={t('importsForm.pickFromCatalogTooltip')}
      description={t('importsForm.pageSubtitle')}
      widthClassName="max-w-2xl"
    >
      <div className="space-y-2.5">
        {isLoadingProducts
          ? Array.from({ length: 6 }).map((_, sIdx) => (
              <div
                key={`drawer-skeleton-${sIdx}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-11 w-11 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-56" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="space-y-1.5 text-right">
                    <Skeleton className="ml-auto h-4 w-20" />
                    <Skeleton className="ml-auto h-3 w-14" />
                  </div>
                  <Skeleton className="h-8 w-16 rounded-lg" />
                </div>
              </div>
            ))
          : flattenedCatalogSkus.map((entry) => {
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
                      onClick={() => onSelectProductSku(entry)}
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
  );
}
