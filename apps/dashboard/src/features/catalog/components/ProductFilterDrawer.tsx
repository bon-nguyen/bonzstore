import { Filter, RotateCcw, Sparkles, Tag, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  CategoryItem,
  ProductTagSummary,
  SourcePlatform,
} from '../../../api/types/catalog.types';
import { Button } from '../../../components/ui/button';
import { FormField } from '../../../components/ui/form-field';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { cn } from '../../../lib/utils';

export interface ProductDrawerFilterValues {
  categoryId: string;
  tag: string;
  platform: SourcePlatform | '';
  stockState: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
  minPrice: string;
  maxPrice: string;
  hasDiscount: boolean;
}

export interface ProductFilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  values: ProductDrawerFilterValues;
  categories: CategoryItem[];
  tags: ProductTagSummary[];
  onApply: (next: ProductDrawerFilterValues) => void;
  onReset: () => void;
}

export function ProductFilterDrawer({
  open,
  onOpenChange,
  values,
  categories,
  tags,
  onApply,
  onReset,
}: ProductFilterDrawerProps) {
  const [draft, setDraft] = useState<ProductDrawerFilterValues>(values);

  useEffect(() => {
    if (open) {
      setDraft(values);
    }
  }, [open, values]);

  if (!open) return null;

  const handleReset = () => {
    const empty: ProductDrawerFilterValues = {
      categoryId: '',
      tag: '',
      platform: '',
      stockState: 'all',
      minPrice: '',
      maxPrice: '',
      hasDiscount: false,
    };
    setDraft(empty);
    onReset();
    onOpenChange(false);
  };

  const handleApply = () => {
    onApply(draft);
    onOpenChange(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-[1px] transition-opacity"
        onClick={() => onOpenChange(false)}
      />

      {/* Slide-over Drawer Panel */}
      <aside className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-border bg-card text-foreground shadow-2xl">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="stat-card-icon h-8 w-8">
              <Filter className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-foreground">
                Bộ lọc sản phẩm nâng cao
              </h3>
              <p className="text-xs text-muted-foreground">
                Lọc theo Thẻ, Nguồn sàn, Tồn kho SKU & Khoảng giá bán lẻ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 space-y-5 overflow-y-auto p-5 text-xs">
          {/* 1. Hạng mục (Category 202405) */}
          <FormField label="1. Hạng mục ngành hàng (Category 202405)">
            <Select
              value={draft.categoryId}
              onChange={(e) =>
                setDraft({ ...draft, categoryId: e.target.value })
              }
              placeholder="-- Tất cả hạng mục --"
              options={categories.map((c) => ({
                value: c.id,
                label: `${c.level > 1 ? '↳ ' : ''}${c.localName} (#${c.externalCategoryId})`,
              }))}
            />
          </FormField>

          {/* 2. Thẻ sản phẩm (Product Tags) */}
          <div className="space-y-2">
            <label className="block font-display text-xs font-bold text-foreground">
              2. Thẻ sản phẩm (Tags)
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setDraft({ ...draft, tag: '' })}
                className={cn(
                  'rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition',
                  draft.tag === ''
                    ? 'border-foreground bg-primary text-primary-foreground'
                    : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                Tất cả thẻ
              </button>
              {tags.map((tagItem) => {
                const active = draft.tag === tagItem.name;
                return (
                  <button
                    key={tagItem.name}
                    type="button"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        tag: active ? '' : tagItem.name,
                      })
                    }
                    className={cn(
                      'inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition',
                      active
                        ? 'border-foreground bg-primary text-primary-foreground'
                        : 'border-border bg-background text-foreground hover:bg-muted',
                    )}
                  >
                    <Tag className="h-3 w-3" />
                    <span>{tagItem.name}</span>
                    <span className="rounded-full bg-muted px-1.5 py-0.2 font-mono text-[10px]">
                      {tagItem.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Tình trạng Hàng có sẵn (Stock State) */}
          <div className="space-y-2">
            <label className="block font-display text-xs font-bold text-foreground">
              3. Tình trạng Hàng có sẵn (Tồn kho SKU)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'all', label: 'Tất cả tồn kho' },
                { key: 'in_stock', label: 'Còn hàng (> 0)' },
                { key: 'low_stock', label: 'Sắp hết hàng (1–10)' },
                { key: 'out_of_stock', label: 'Hết hàng (Có SKU = 0)' },
              ].map((opt) => {
                const active = draft.stockState === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        stockState:
                          opt.key as ProductDrawerFilterValues['stockState'],
                      })
                    }
                    className={cn(
                      'rounded-lg border px-3 py-2 text-left text-xs font-semibold transition',
                      active
                        ? 'border-foreground bg-primary text-primary-foreground'
                        : 'border-border bg-background text-foreground hover:bg-muted',
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Khoảng Giá bán lẻ (Retail Price Range) */}
          <div className="space-y-2">
            <label className="block font-display text-xs font-bold text-foreground">
              4. Khoảng Giá bán lẻ (VND)
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <span className="mb-1 block text-[11px] text-muted-foreground">
                  Giá tối thiểu (₫)
                </span>
                <Input
                  type="number"
                  min={0}
                  placeholder="VD: 50000"
                  value={draft.minPrice}
                  onChange={(e) =>
                    setDraft({ ...draft, minPrice: e.target.value })
                  }
                  className="font-mono text-xs"
                />
              </div>
              <div>
                <span className="mb-1 block text-[11px] text-muted-foreground">
                  Giá tối đa (₫)
                </span>
                <Input
                  type="number"
                  min={0}
                  placeholder="VD: 500000"
                  value={draft.maxPrice}
                  onChange={(e) =>
                    setDraft({ ...draft, maxPrice: e.target.value })
                  }
                  className="font-mono text-xs"
                />
              </div>
            </div>

            {/* Quick Price Range Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                type="button"
                onClick={() =>
                  setDraft({ ...draft, minPrice: '0', maxPrice: '100000' })
                }
                className="rounded border border-border bg-muted/40 px-2 py-1 text-[11px] font-medium hover:bg-muted"
              >
                Dưới 100.000₫
              </button>
              <button
                type="button"
                onClick={() =>
                  setDraft({
                    ...draft,
                    minPrice: '100000',
                    maxPrice: '350000',
                  })
                }
                className="rounded border border-border bg-muted/40 px-2 py-1 text-[11px] font-medium hover:bg-muted"
              >
                100.000₫ – 350.000₫
              </button>
              <button
                type="button"
                onClick={() =>
                  setDraft({ ...draft, minPrice: '350000', maxPrice: '' })
                }
                className="rounded border border-border bg-muted/40 px-2 py-1 text-[11px] font-medium hover:bg-muted"
              >
                Trên 350.000₫
              </button>
            </div>
          </div>

          {/* 5. Nguồn đồng bộ sàn (Source Platform) */}
          <div className="space-y-2">
            <label className="block font-display text-xs font-bold text-foreground">
              5. Nguồn đồng bộ sản phẩm
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: '', label: 'Tất cả nguồn' },
                { value: 'TIKTOK_SHOP', label: 'TikTok Shop (Synced)' },
                { value: 'SHOPEE', label: 'Shopee (Synced)' },
                { value: 'LOCAL', label: 'BonzStore Web (LOCAL)' },
              ].map((plat) => {
                const active = draft.platform === plat.value;
                return (
                  <button
                    key={plat.value || 'all'}
                    type="button"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        platform: plat.value as SourcePlatform | '',
                      })
                    }
                    className={cn(
                      'rounded-lg border px-3 py-2 text-left text-xs font-semibold transition',
                      active
                        ? 'border-foreground bg-primary text-primary-foreground'
                        : 'border-border bg-background text-foreground hover:bg-muted',
                    )}
                  >
                    {plat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Trạng thái Khuyến mãi */}
          <div className="rounded-xl border border-border bg-muted/30 p-3.5">
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-4 w-4 text-foreground dark:text-primary" />
                <div>
                  <p className="font-semibold text-foreground">
                    Đang áp dụng Giá khuyến mãi
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Chỉ hiển thị sản phẩm có giá Khuyến mãi thấp hơn Giá bán lẻ
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={draft.hasDiscount}
                onChange={(e) =>
                  setDraft({ ...draft, hasDiscount: e.target.checked })
                }
                className="h-4 w-4 rounded border-border accent-foreground"
              />
            </label>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-border bg-muted/20 px-5 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="flex-1"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Đặt lại</span>
          </Button>
          <Button type="button" onClick={handleApply} className="flex-1">
            <Filter className="h-3.5 w-3.5" />
            <span>Áp dụng bộ lọc</span>
          </Button>
        </div>
      </aside>
    </div>
  );
}

