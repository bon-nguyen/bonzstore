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
import { formatCurrencyVND } from '../../../lib/utils';
import { useI18n } from '../../i18n/I18nContext';
import { useUpdateProductSkus } from '../hooks/useCatalog';

export interface QuickEditPriceDialogProps {
  product: ProductItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickEditPriceDialog({
  product,
  open,
  onOpenChange,
}: QuickEditPriceDialogProps) {
  const { t } = useI18n();
  const updateSkusMutation = useUpdateProductSkus();
  const [skuList, setSkuList] = useState<ProductSkuItem[]>([]);
  const [discountPercent, setDiscountPercent] = useState<string>('25');

  useEffect(() => {
    if (product && open) {
      setSkuList(product.skus.map((s) => ({ ...s })));
    }
  }, [product, open]);

  if (!product) return null;

  const handleApplyDiscount = () => {
    const pct = Math.min(95, Math.max(0, Number(discountPercent) || 0));
    setSkuList((prev) =>
      prev.map((s) => ({
        ...s,
        salePrice: Math.round((Number(s.originalPrice) * (100 - pct)) / 100),
      })),
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await updateSkusMutation.mutateAsync({
      id: product.id,
      payload: {
        skus: skuList.map((s) => ({
          id: s.id,
          sellerSku: s.sellerSku,
          originalPrice: Math.max(0, Number(s.originalPrice) || 0),
          salePrice: Math.max(0, Number(s.salePrice) || 0),
          stockQuantity: Number(s.stockQuantity),
          salesAttributes: s.salesAttributes,
        })),
      },
    });
    onOpenChange(false);
  };

  const origPrices = skuList.map((s) => Number(s.originalPrice) || 0);
  const promoPrices = skuList.map((s) => Number(s.salePrice) || 0);
  const minOrig = origPrices.length ? Math.min(...origPrices) : 0;
  const maxOrig = origPrices.length ? Math.max(...origPrices) : 0;
  const minPromo = promoPrices.length ? Math.min(...promoPrices) : 0;
  const maxPromo = promoPrices.length ? Math.max(...promoPrices) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('products.quickPriceTitle')}</DialogTitle>
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {product.title} (ID: {product.externalProductId || product.id})
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 p-3">
            <div className="space-y-0.5 text-xs">
              <div>
                <span className="text-muted-foreground">Giá bán lẻ: </span>
                <strong className="font-mono text-foreground">
                  {minOrig === maxOrig
                    ? formatCurrencyVND(minOrig)
                    : `${formatCurrencyVND(minOrig)} - ${formatCurrencyVND(maxOrig)}`}
                </strong>
              </div>
              <div>
                <span className="text-muted-foreground">
                  {t('products.promoPrefix')}{' '}
                </span>
                <strong className="font-mono text-foreground dark:text-primary">
                  {minPromo === maxPromo
                    ? formatCurrencyVND(minPromo)
                    : `${formatCurrencyVND(minPromo)} - ${formatCurrencyVND(maxPromo)}`}
                </strong>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Giảm giá %:</span>
              <Input
                type="number"
                min={0}
                max={95}
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                className="h-8 w-20 text-center font-mono text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleApplyDiscount}
              >
                Tính giá Khuyến mãi tự động
              </Button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto rounded-lg border border-border">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 border-b border-border bg-muted/80 font-display text-[11px] uppercase text-muted-foreground backdrop-blur">
                <tr>
                  <th className="px-3 py-2.5">Phân loại SKU</th>
                  <th className="px-3 py-2.5">Seller SKU</th>
                  <th className="w-40 px-3 py-2.5 text-right">
                    Giá bán lẻ (₫)
                  </th>
                  <th className="w-40 px-3 py-2.5 text-right">
                    Giá khuyến mãi (₫)
                  </th>
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
                          value={sku.originalPrice}
                          onChange={(e) => {
                            const val = Math.max(0, Number(e.target.value) || 0);
                            setSkuList((prev) =>
                              prev.map((item, i) =>
                                i === idx
                                  ? { ...item, originalPrice: val }
                                  : item,
                              ),
                            );
                          }}
                          className="ml-auto h-8 w-32 text-right font-mono text-xs"
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Input
                          type="number"
                          min={0}
                          required
                          value={sku.salePrice}
                          onChange={(e) => {
                            const val = Math.max(0, Number(e.target.value) || 0);
                            setSkuList((prev) =>
                              prev.map((item, i) =>
                                i === idx ? { ...item, salePrice: val } : item,
                              ),
                            );
                          }}
                          className="ml-auto h-8 w-32 text-right font-mono text-xs"
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

