import { FormEvent, useEffect, useState } from 'react';
import { ProductItem, ProductSkuItem } from '../../../api/types/catalog.types';
import { Button } from '../../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { useI18n } from '../../i18n/I18nContext';
import { useUpdateProductSkus } from '../hooks/useCatalog';

export interface QuickEditStockDialogProps {
  product: ProductItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickEditStockDialog({
  product,
  open,
  onOpenChange,
}: QuickEditStockDialogProps) {
  const { t } = useI18n();
  const updateSkusMutation = useUpdateProductSkus();
  const [skuList, setSkuList] = useState<ProductSkuItem[]>([]);
  const [batchStock, setBatchStock] = useState<string>('');

  useEffect(() => {
    if (product && open) {
      setSkuList(product.skus.map((s) => ({ ...s })));
      setBatchStock('');
    }
  }, [product, open]);

  if (!product) return null;

  const totalStock = skuList.reduce(
    (sum, s) => sum + (Number(s.stockQuantity) || 0),
    0,
  );

  const handleApplyBatch = () => {
    const val = Math.max(0, Number(batchStock) || 0);
    setSkuList((prev) => prev.map((s) => ({ ...s, stockQuantity: val })));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await updateSkusMutation.mutateAsync({
      id: product.id,
      payload: {
        skus: skuList.map((s) => ({
          id: s.id,
          sellerSku: s.sellerSku,
          originalPrice: Number(s.originalPrice),
          salePrice: Number(s.salePrice),
          stockQuantity: Math.max(0, Number(s.stockQuantity) || 0),
          salesAttributes: s.salesAttributes,
        })),
      },
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('products.quickStockTitle')}</DialogTitle>
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {product.title} (ID: {product.externalProductId || product.id})
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 p-3">
            <div className="text-xs">
              <span className="text-muted-foreground">
                Tổng Hàng có sẵn ({skuList.length} SKU):{' '}
              </span>
              <strong className="font-display text-sm text-foreground dark:text-primary">
                {totalStock}
              </strong>
            </div>

            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                placeholder="Nhập số lượng chung..."
                value={batchStock}
                onChange={(e) => setBatchStock(e.target.value)}
                className="h-8 w-40 text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleApplyBatch}
              >
                Áp dụng tất cả SKU
              </Button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto rounded-lg border border-border">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 border-b border-border bg-muted/80 font-display text-[11px] uppercase text-muted-foreground backdrop-blur">
                <tr>
                  <th className="px-3 py-2.5">Phân loại SKU</th>
                  <th className="px-3 py-2.5">Seller SKU</th>
                  <th className="w-36 px-3 py-2.5 text-right">Hàng có sẵn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {skuList.map((sku, idx) => {
                  const attrText =
                    sku.salesAttributes
                      ?.map((a) => `${a.name}: ${a.value_name}`)
                      .join(' / ') || sku.sellerSku;
                  return (
                    <tr key={sku.id || idx} className="hover:bg-muted/30">
                      <td className="px-3 py-2 font-medium text-foreground">
                        {attrText}
                      </td>
                      <td className="px-3 py-2 font-mono text-muted-foreground">
                        {sku.sellerSku}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Input
                          type="number"
                          min={0}
                          required
                          value={sku.stockQuantity}
                          onChange={(e) => {
                            const val = Math.max(0, Number(e.target.value) || 0);
                            setSkuList((prev) =>
                              prev.map((item, i) =>
                                i === idx
                                  ? { ...item, stockQuantity: val }
                                  : item,
                              ),
                            );
                          }}
                          className="ml-auto h-8 w-28 text-right font-mono text-xs"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t('app.cancel')}
            </Button>
            <Button type="submit" disabled={updateSkusMutation.isPending}>
              {t('app.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

