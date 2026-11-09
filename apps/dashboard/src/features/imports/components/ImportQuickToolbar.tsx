import {
  Barcode,
  FileSpreadsheet,
  Loader2,
  Package,
  PackagePlus,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { cn, formatCurrencyVND } from '../../../lib/utils';
import { useProducts } from '../../catalog/hooks/useCatalog';
import { useI18n } from '../../i18n/I18nContext';
import {
  FlattenedCatalogSkuEntry,
  flattenProductsToSkuEntries,
} from './ImportFormTypes';

export interface ImportQuickToolbarProps {
  onSelectProductSku: (entry: FlattenedCatalogSkuEntry) => void;
  onAddBlankRow: () => void;
  onOpenCatalogPicker: () => void;
  onOpenExcelModal: () => void;
  onOpenCreateProductModal: (initialSearch?: string) => void;
}

export function ImportQuickToolbar({
  onSelectProductSku,
  onAddBlankRow,
  onOpenCatalogPicker,
  onOpenExcelModal,
  onOpenCreateProductModal,
}: ImportQuickToolbarProps) {
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(searchQuery.trim(), 300);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Gọi trực tiếp API danh sách sản phẩm hiện tại theo từ khóa tìm kiếm
  const {
    data: searchProductsResponse,
    isLoading: isSearchingProducts,
    isFetching: isFetchingSearchProducts,
    refetch: refetchSearchProducts,
  } = useProducts({
    page: 1,
    limit: 20,
    search: debouncedSearch || undefined,
  });

  const searchSkuEntries = useMemo(() => {
    const products = searchProductsResponse?.data ?? [];
    return flattenProductsToSkuEntries(products);
  }, [searchProductsResponse]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const handlePickEntry = (entry: FlattenedCatalogSkuEntry) => {
    onSelectProductSku(entry);
    setSearchQuery('');
    setDropdownOpen(false);
  };

  return (
    <section className="rounded-xl border border-slate-300 bg-slate-100 p-3 shadow-xs dark:border-slate-700 dark:bg-slate-800/90">
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
        {/* Ô tìm kiếm kết nối trực tiếp API danh sách Products + Các nút biểu tượng bổ trợ */}
        <div className="flex flex-1 items-center gap-2">
          <div ref={searchContainerRef} className="relative flex-1">
            <Input
              type="text"
              value={searchQuery}
              onFocus={() => setDropdownOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setDropdownOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchSkuEntries.length > 0) {
                  e.preventDefault();
                  handlePickEntry(searchSkuEntries[0]);
                }
              }}
              placeholder={t('importsForm.searchPlaceholder')}
              leftIcon={
                isFetchingSearchProducts ? (
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                ) : (
                  <Search className="h-4 w-4 text-slate-500" />
                )
              }
              rightAddon={
                <div className="pointer-events-none mr-1.5 flex items-center gap-1 text-[11px] text-slate-400">
                  <Barcode className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">
                    {t('importsForm.pressEnterHint')}
                  </span>
                </div>
              }
              className="pr-28"
            />

            {dropdownOpen && (
              <div className="absolute left-0 z-40 mt-1.5 max-h-80 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 px-2.5 py-1.5 text-[11px] font-semibold text-slate-500 dark:border-slate-800">
                  <span>
                    {t('importsForm.searchDropdownHeader', {
                      count: searchSkuEntries.length,
                    })}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      onOpenCatalogPicker();
                    }}
                    className="text-emerald-600 hover:underline"
                  >
                    {t('importsForm.openMultiPickerBtn')}
                  </button>
                </div>

                {isSearchingProducts ? (
                  <div className="flex items-center justify-center gap-2 py-6 text-xs text-slate-500">
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                    {t('importsForm.loadingProducts')}
                  </div>
                ) : searchSkuEntries.length === 0 ? (
                  <div className="space-y-2 px-3 py-5 text-center">
                    <p className="text-xs text-slate-500">
                      {t('importsForm.noProductsMatch', { query: searchQuery })}
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenCreateProductModal(searchQuery);
                      }}
                      className="bg-emerald-600 text-xs text-white hover:bg-emerald-700"
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" />
                      {t('importsForm.createNewProductNowBtn')}
                    </Button>
                  </div>
                ) : (
                  searchSkuEntries.map((entry) => {
                    const { product, sku, variantLabel, importPrice } = entry;
                    return (
                      <button
                        key={`${product.id}-${sku.id}`}
                        type="button"
                        onClick={() => handlePickEntry(entry)}
                        className="flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left transition hover:bg-emerald-50/80 dark:hover:bg-slate-800"
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          {product.thumbnailUrl ? (
                            <img
                              src={product.thumbnailUrl}
                              alt={product.title}
                              className="h-9 w-9 shrink-0 rounded-md border border-slate-200 object-cover dark:border-slate-700"
                            />
                          ) : (
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-400 dark:bg-slate-800">
                              <Package className="h-4 w-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="truncate text-xs font-semibold text-slate-900 dark:text-slate-100">
                              {product.title}
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500">
                              <span className="rounded bg-slate-100 px-1.5 py-0.2 font-mono font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                {sku.sellerSku}
                              </span>
                              {variantLabel && (
                                <span className="text-emerald-600 dark:text-emerald-400">
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

                        <div className="shrink-0 text-right">
                          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrencyVND(importPrice)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {t('importsForm.salePriceLabel')}{' '}
                            {formatCurrencyVND(sku.salePrice)}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              refetchSearchProducts();
              toast.success(t('importsForm.refreshProductsTooltip'));
            }}
            title={t('importsForm.refreshProductsTooltip')}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 shadow-2xs transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
          >
            <RefreshCw
              className={cn(
                'h-4 w-4',
                isFetchingSearchProducts && 'animate-spin text-emerald-600',
              )}
            />
          </button>

          <button
            type="button"
            onClick={onOpenCatalogPicker}
            title={t('importsForm.pickFromCatalogTooltip')}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 shadow-2xs transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
          >
            <PackagePlus className="h-4 w-4 text-emerald-600" />
          </button>

          <button
            type="button"
            onClick={onAddBlankRow}
            title={t('importsForm.addBlankRowTooltip')}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 shadow-2xs transition hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Nhập excel (Màu xanh dương) & Tạo mới (Màu xanh lá) - Đã bỏ Quét hóa đơn */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenExcelModal}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 active:scale-[0.99]"
          >
            <FileSpreadsheet className="h-4 w-4" />
            {t('importsForm.excelImportBtn')}
          </button>

          <button
            type="button"
            onClick={() => onOpenCreateProductModal(searchQuery)}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700 active:scale-[0.99]"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            {t('importsForm.createNewBtn')}
          </button>
        </div>
      </div>
    </section>
  );
}

