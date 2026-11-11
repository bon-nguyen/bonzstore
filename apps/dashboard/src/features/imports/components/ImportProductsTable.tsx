import { Gift, PackagePlus, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import {
  Input,
  VnCnyInput,
  VnNumberInput,
} from '../../../components/ui/input';
import { AntdEmptyBoxIcon } from '../../../components/ui/table';
import { cn, formatCurrencyVND } from '../../../lib/utils';
import { useI18n } from '../../i18n/I18nContext';
import {
  ImportLineItemFormValue,
  UNIT_OPTIONS,
  calculateLineProductDiscountAmount,
  calculateLineSubtotalBeforeTax,
  convertCnyToVnd,
  convertVndToCny,
} from './ImportFormTypes';

export interface ImportProductsTableProps {
  items: ImportLineItemFormValue[];
  exchangeRateCny: number;
  catalogProductsCount: number;
  subtotalBeforeTax: number;
  orderDiscountAmount: number;
  onUpdateRow: (
    index: number,
    patch: Partial<ImportLineItemFormValue>,
  ) => void;
  onRemoveRow: (index: number) => void;
  onAddBlankRow: () => void;
  onOpenCatalogPicker: () => void;
}

export function ImportProductsTable({
  items,
  exchangeRateCny,
  catalogProductsCount,
  subtotalBeforeTax,
  orderDiscountAmount,
  onUpdateRow,
  onRemoveRow,
  onAddBlankRow,
  onOpenCatalogPicker,
}: ImportProductsTableProps) {
  const { t } = useI18n();

  const getAllocatedOrderDiscountForLine = (
    item: ImportLineItemFormValue,
  ): number => {
    if (item.isGift || subtotalBeforeTax <= 0 || orderDiscountAmount <= 0) {
      return 0;
    }
    const lineSub = calculateLineSubtotalBeforeTax(item);
    return Math.round((lineSub / subtotalBeforeTax) * orderDiscountAmount);
  };

  const getLineSharePercent = (item: ImportLineItemFormValue): number => {
    if (item.isGift || subtotalBeforeTax <= 0) return 0;
    const lineSub = calculateLineSubtotalBeforeTax(item);
    return Number(((lineSub / subtotalBeforeTax) * 100).toFixed(1));
  };

  const totalCnyAmount = items.reduce(
    (sum, item) => sum + (item.isGift ? 0 : item.quantity * (item.cnyUnitPrice || 0)),
    0,
  );

  return (
    <section className="overflow-hidden rounded-xl border border-emerald-600/30 bg-white shadow-xs dark:border-emerald-500/30 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1400px] border-collapse text-left text-xs">
          <thead>
            <tr className="bg-emerald-600 text-white">
              <th className="w-20 border-r border-emerald-500/50 px-2.5 py-3 text-center font-semibold">
                {t('importsForm.colGift')}
              </th>
              <th className="w-12 border-r border-emerald-500/50 px-2 py-3 text-center font-semibold">
                {t('importsForm.colIndex')}
              </th>
              <th className="w-32 border-r border-emerald-500/50 px-2.5 py-3 font-semibold">
                {t('importsForm.colCode')}
              </th>
              <th className="min-w-[220px] border-r border-emerald-500/50 px-3 py-3 font-semibold">
                {t('importsForm.colName')}
              </th>
              <th className="w-34 border-r border-emerald-500/50 px-2 py-3 text-center font-semibold">
                {t('importsForm.colExpiry')}
              </th>
              <th className="w-22 border-r border-emerald-500/50 px-2 py-3 text-center font-semibold">
                {t('importsForm.colUnit')}
              </th>
              <th className="w-28 border-r border-emerald-500/50 px-2 py-3 text-center font-semibold">
                {t('importsForm.colQuantity')}
              </th>
              <th className="w-36 border-r border-emerald-500/50 bg-emerald-700/60 px-2.5 py-3 text-right font-semibold">
                {t('importsForm.colCnyCostPrice')}
              </th>
              <th className="w-40 border-r border-emerald-500/50 px-2.5 py-3 text-right font-semibold">
                {t('importsForm.colUnitPrice')}
              </th>
              <th className="w-48 border-r border-emerald-500/50 px-2.5 py-3 text-right font-semibold">
                {t('importsForm.colProductDiscount')}
              </th>
              <th className="w-32 border-r border-emerald-500/50 px-2.5 py-3 text-right font-semibold">
                {t('importsForm.colOrderDiscount')}
              </th>
              <th className="w-44 border-r border-emerald-500/50 px-3 py-3 text-right font-semibold">
                {t('importsForm.colSubtotalBeforeTax')}
              </th>
              <th className="w-12 px-2 py-3 text-center font-semibold">#</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {items.length === 0 ? (
              <tr>
                <td colSpan={13} className="px-6 py-14 text-center">
                  <div className="mx-auto flex max-w-md flex-col items-center justify-center space-y-2.5">
                    <AntdEmptyBoxIcon className="h-14 w-14 opacity-75" />
                    <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                      {t('importsForm.emptyTableTitle')}
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {t('importsForm.emptyTableDesc')}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={onOpenCatalogPicker}
                        className="gap-1.5 border-emerald-600/40 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/50"
                      >
                        <PackagePlus className="h-3.5 w-3.5" />
                        {t('importsForm.pickFromProductsBtn', {
                          count: catalogProductsCount,
                        })}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={onAddBlankRow}
                        className="gap-1.5 text-xs"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        {t('importsForm.addManualRowBtn')}
                      </Button>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((item, idx) => {
                const lineSubtotal = calculateLineSubtotalBeforeTax(item);
                const lineDiscountAmount =
                  calculateLineProductDiscountAmount(item);
                const allocatedOrderDiscount =
                  getAllocatedOrderDiscountForLine(item);
                const sharePct = getLineSharePercent(item);

                return (
                  <tr
                    key={item.lineId}
                    className={cn(
                      'table-row-interactive transition hover:bg-emerald-50/40 dark:hover:bg-slate-800/60',
                      item.isGift && 'bg-amber-50/40 dark:bg-amber-950/20',
                    )}
                  >
                    {/* 1. Hàng tặng */}
                    <td className="border-r border-slate-100 px-2.5 py-2 text-center dark:border-slate-800">
                      <label className="inline-flex cursor-pointer items-center justify-center gap-1">
                        <input
                          type="checkbox"
                          checked={item.isGift}
                          onChange={(e) =>
                            onUpdateRow(idx, { isGift: e.target.checked })
                          }
                          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        {item.isGift && (
                          <span title={t('importsForm.giftTooltip')}>
                            <Gift className="h-3.5 w-3.5 text-amber-500" />
                          </span>
                        )}
                      </label>
                    </td>

                    {/* 2. STT */}
                    <td className="border-r border-slate-100 px-2 py-2 text-center font-semibold text-slate-600 dark:border-slate-800 dark:text-slate-400">
                      {idx + 1}
                    </td>

                    {/* 3. Mã hàng */}
                    <td className="border-r border-slate-100 px-2 py-2 dark:border-slate-800">
                      <Input
                        type="text"
                        value={item.itemCode}
                        onChange={(e) =>
                          onUpdateRow(idx, { itemCode: e.target.value })
                        }
                        placeholder="SKU"
                        className="h-8 font-mono text-xs font-semibold"
                      />
                    </td>

                    {/* 4. Tên mặt hàng */}
                    <td className="border-r border-slate-100 px-2.5 py-2 dark:border-slate-800">
                      <div className="space-y-1">
                        <Input
                          type="text"
                          value={item.itemName}
                          onChange={(e) =>
                            onUpdateRow(idx, { itemName: e.target.value })
                          }
                          placeholder={t('importsForm.colName')}
                          className="h-8 text-xs font-medium"
                        />
                        {(item.variantLabel ||
                          typeof item.currentStock === 'number') && (
                          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500">
                            {item.variantLabel && (
                              <span className="rounded bg-emerald-50 px-1.5 py-0.2 font-medium text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                {item.variantLabel}
                              </span>
                            )}
                            {typeof item.currentStock === 'number' && (
                              <span>
                                {t('importsForm.currentStockInfo', {
                                  current:
                                    item.currentStock.toLocaleString('vi-VN'),
                                  after: (
                                    item.currentStock + item.quantity
                                  ).toLocaleString('vi-VN'),
                                })}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* 5. Hạn sử dụng */}
                    <td className="border-r border-slate-100 px-2 py-2 dark:border-slate-800">
                      <Input
                        type="date"
                        value={item.expiryDate}
                        onChange={(e) =>
                          onUpdateRow(idx, { expiryDate: e.target.value })
                        }
                        className="h-8 px-2 text-xs"
                      />
                    </td>

                    {/* 6. Đơn vị */}
                    <td className="border-r border-slate-100 px-2 py-2 dark:border-slate-800">
                      <select
                        value={item.unit}
                        onChange={(e) =>
                          onUpdateRow(idx, { unit: e.target.value })
                        }
                        className="h-8 w-full rounded-lg border border-slate-300 bg-white px-1.5 text-center text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-slate-100"
                      >
                        {UNIT_OPTIONS.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* 7. Số lượng (Format số tiếng Việt + Nút [-] [+]) */}
                    <td className="border-r border-slate-100 px-2 py-2 dark:border-slate-800">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateRow(idx, {
                              quantity: Math.max(1, (item.quantity || 1) - 1),
                            })
                          }
                          disabled={item.quantity <= 1}
                          className="flex h-8 w-6 shrink-0 items-center justify-center rounded border border-slate-200 bg-slate-50 text-xs font-bold text-slate-600 transition hover:bg-slate-200 active:scale-95 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                          -
                        </button>
                        <VnNumberInput
                          min={1}
                          value={item.quantity}
                          onValueChange={(val) =>
                            onUpdateRow(idx, { quantity: val <= 0 ? 1 : val })
                          }
                          className="h-8 min-w-[46px] px-1 text-center text-xs font-bold"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateRow(idx, {
                              quantity: (item.quantity || 0) + 1,
                            })
                          }
                          className="flex h-8 w-6 shrink-0 items-center justify-center rounded border border-slate-200 bg-slate-50 text-xs font-bold text-slate-600 transition hover:bg-slate-200 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    {/* 8. Giá vốn (¥ Tệ) -> Tự động đổi sang Đơn giá tiền Việt (VNĐ) */}
                    <td className="border-r border-slate-100 bg-amber-50/30 px-2 py-2 dark:border-slate-800 dark:bg-amber-950/10">
                      <div className="space-y-0.5">
                        <VnCnyInput
                          min={0}
                          disabled={item.isGift}
                          allowZeroDisplay
                          value={item.cnyUnitPrice || 0}
                          onValueChange={(cnyVal) => {
                            const convertedVnd = convertCnyToVnd(
                              cnyVal,
                              exchangeRateCny,
                            );
                            onUpdateRow(idx, {
                              cnyUnitPrice: cnyVal,
                              unitPrice: convertedVnd,
                            });
                          }}
                          rightAddon={
                            <span className="pointer-events-none pr-1 font-mono text-[11px] font-bold text-amber-600 dark:text-amber-400">
                              ¥
                            </span>
                          }
                          className="h-8 border-amber-300/80 pr-6 pl-2 text-xs font-bold text-amber-800 focus:border-amber-500 dark:border-amber-700/60 dark:text-amber-300"
                        />
                        {!item.isGift && (item.cnyUnitPrice || 0) > 0 && (
                          <div className="text-right font-mono text-[10px] text-amber-700/80 dark:text-amber-400/80">
                            × {exchangeRateCny.toLocaleString('vi-VN')} ₫
                          </div>
                        )}
                      </div>
                    </td>

                    {/* 9. Đơn giá vốn (VNĐ) -> Tự động đổi ngược sang Giá vốn Tệ (¥) */}
                    <td className="border-r border-slate-100 px-2 py-2 dark:border-slate-800">
                      <div className="space-y-0.5">
                        <VnNumberInput
                          min={0}
                          disabled={item.isGift}
                          allowZeroDisplay
                          value={item.unitPrice}
                          onValueChange={(vndVal) => {
                            const nextVnd = Math.max(0, vndVal);
                            onUpdateRow(idx, {
                              unitPrice: nextVnd,
                              cnyUnitPrice: convertVndToCny(
                                nextVnd,
                                exchangeRateCny,
                              ),
                            });
                          }}
                          rightAddon={
                            <span className="pointer-events-none pr-1 text-[10px] font-semibold text-slate-400">
                              ₫
                            </span>
                          }
                          className="h-8 pr-6 pl-2 text-xs font-bold"
                        />
                        {!item.isGift && (item.unitPrice || 0) > 0 && exchangeRateCny > 0 && (
                          <div className="text-right font-mono text-[10px] text-slate-500 dark:text-slate-400">
                            ≈ {convertVndToCny(item.unitPrice, exchangeRateCny).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} ¥
                          </div>
                        )}
                      </div>
                    </td>

                    {/* 10. Giảm giá sản phẩm (Có 2 loại: Giảm tiền ₫ và Giảm theo %) */}
                    <td className="border-r border-slate-100 px-2 py-2 dark:border-slate-800">
                      <div className="space-y-0.5">
                        <VnNumberInput
                          min={0}
                          max={
                            item.productDiscountType === 'PERCENT'
                              ? 100
                              : undefined
                          }
                          disabled={item.isGift}
                          allowZeroDisplay
                          value={item.productDiscountValue}
                          onValueChange={(val) =>
                            onUpdateRow(idx, {
                              productDiscountValue: Math.max(0, val),
                            })
                          }
                          rightAddon={
                            <div className="inline-flex rounded border border-slate-200 bg-slate-100 p-0.5 dark:border-zinc-700 dark:bg-zinc-800">
                              <button
                                type="button"
                                disabled={item.isGift}
                                onClick={() =>
                                  onUpdateRow(idx, {
                                    productDiscountType: 'VND',
                                    productDiscountValue: 0,
                                  })
                                }
                                className={cn(
                                  'rounded px-1.5 py-0.5 text-[10px] font-bold transition',
                                  item.productDiscountType === 'VND'
                                    ? 'bg-emerald-600 text-white'
                                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400',
                                )}
                              >
                                ₫
                              </button>
                              <button
                                type="button"
                                disabled={item.isGift}
                                onClick={() =>
                                  onUpdateRow(idx, {
                                    productDiscountType: 'PERCENT',
                                    productDiscountValue: 0,
                                  })
                                }
                                className={cn(
                                  'rounded px-1.5 py-0.5 text-[10px] font-bold transition',
                                  item.productDiscountType === 'PERCENT'
                                    ? 'bg-emerald-600 text-white'
                                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400',
                                )}
                              >
                                %
                              </button>
                            </div>
                          }
                          className="h-8 pr-14 pl-2 text-xs"
                        />
                        {!item.isGift && lineDiscountAmount > 0 && (
                          <div className="text-right text-[10px] font-medium text-rose-600 dark:text-rose-400">
                            - {formatCurrencyVND(lineDiscountAmount)}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* 11. Giảm giá theo đơn */}
                    <td className="border-r border-slate-100 px-2.5 py-2 text-right dark:border-slate-800">
                      <span className="font-medium text-slate-600 dark:text-slate-400">
                        {formatCurrencyVND(allocatedOrderDiscount)}
                      </span>
                    </td>

                    {/* 12. Thành tiền trước thuế / % */}
                    <td className="border-r border-slate-100 px-3 py-2 text-right dark:border-slate-800">
                      {item.isGift ? (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          {t('importsForm.giftBadge')}
                        </span>
                      ) : (
                        <div>
                          <div className="font-bold text-emerald-700 dark:text-emerald-400">
                            {formatCurrencyVND(lineSubtotal)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {t('importsForm.sharePercentLabel')} {sharePct}%
                          </div>
                        </div>
                      )}
                    </td>

                    {/* 13. Xóa dòng */}
                    <td className="px-2 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => onRemoveRow(idx)}
                        className="table-action-btn inline-flex h-7 w-7 items-center justify-center rounded text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          {items.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-emerald-600/30 bg-emerald-50/60 font-semibold text-slate-800 dark:bg-emerald-950/30 dark:text-slate-100">
                <td colSpan={6} className="px-3 py-2.5 text-right text-xs">
                  {t('importsForm.tableFooterSummary', {
                    total: items.length,
                    gifts: items.filter((i) => i.isGift).length,
                  })}
                </td>
                <td className="px-2.5 py-2.5 text-right font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  {items
                    .reduce((s, i) => s + i.quantity, 0)
                    .toLocaleString('vi-VN')}
                </td>
                <td className="px-2.5 py-2.5 text-right font-mono text-xs font-bold text-amber-700 dark:text-amber-400">
                  {totalCnyAmount.toLocaleString('vi-VN', {
                    maximumFractionDigits: 2,
                  })}{' '}
                  ¥
                </td>
                <td className="px-2.5 py-2.5" />
                <td className="px-2.5 py-2.5 text-right text-xs text-rose-600 dark:text-rose-400">
                  -{' '}
                  {formatCurrencyVND(
                    items.reduce(
                      (s, i) => s + calculateLineProductDiscountAmount(i),
                      0,
                    ),
                  )}
                </td>
                <td className="px-2.5 py-2.5 text-right text-xs text-slate-600 dark:text-slate-300">
                  - {formatCurrencyVND(orderDiscountAmount)}
                </td>
                <td className="px-3 py-2.5 text-right text-sm font-bold text-emerald-700 dark:text-emerald-300">
                  {formatCurrencyVND(subtotalBeforeTax)}
                </td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </section>
  );
}
