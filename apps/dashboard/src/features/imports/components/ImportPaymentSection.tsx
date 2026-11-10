import {
  Banknote,
  CreditCard,
  FileClock,
  Loader2,
  Percent,
  Printer,
  Save,
  Truck,
} from 'lucide-react';
import { Control, UseFormSetValue, useWatch } from 'react-hook-form';
import { Button } from '../../../components/ui/button';
import { FormField } from '../../../components/ui/form-field';
import {
  RHFCheckbox,
  RHFCurrencyInput,
} from '../../../components/ui/rhf-fields';
import { cn, formatCurrencyVND } from '../../../lib/utils';
import { useI18n } from '../../i18n/I18nContext';
import { PriceSuggestionsBar } from '../../shared/PriceSuggestionsBar';
import { ImportReceiptFormValues, VAT_PRESETS } from './ImportFormTypes';

export interface ImportPaymentSectionProps {
  control: Control<ImportReceiptFormValues>;
  setValue: UseFormSetValue<ImportReceiptFormValues>;
  subtotalBeforeTax: number;
  vatAmount: number;
  orderDiscountAmount: number;
  totalPayable: number;
  totalWithShipping: number;
  debtRemaining: number;
  isSavingReceipt: boolean;
  isEditingDraft?: boolean;
  onMarkAmountPaidTouched: () => void;
  onSaveDraft: () => void;
  onSaveReceipt: () => void;
}

export function ImportPaymentSection({
  control,
  setValue,
  subtotalBeforeTax,
  vatAmount,
  orderDiscountAmount,
  totalPayable,
  totalWithShipping,
  debtRemaining,
  isSavingReceipt,
  isEditingDraft = false,
  onMarkAmountPaidTouched,
  onSaveDraft,
  onSaveReceipt,
}: ImportPaymentSectionProps) {
  const { t } = useI18n();
  const vatPercent = useWatch({ control, name: 'vatPercent' });
  const orderDiscountType = useWatch({ control, name: 'orderDiscountType' });
  const orderDiscountValue = useWatch({ control, name: 'orderDiscountValue' });
  const shippingFee = useWatch({ control, name: 'shippingFee' });
  const paymentMethod = useWatch({ control, name: 'paymentMethod' });
  const amountPaid = useWatch({ control, name: 'amountPaid' }) ?? 0;

  const baseSuggestedPayable =
    totalWithShipping > 0
      ? totalWithShipping
      : totalPayable > 0
        ? totalPayable
        : amountPaid;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">
            4
          </span>
          <h2 className="text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-200">
            {t('importsForm.section4Title')}
          </h2>
        </div>

        <RHFCheckbox
          control={control}
          name="autoRecordCashbook"
          label={t('importsForm.autoRecordCashbook')}
          className="border-none bg-transparent p-0 hover:bg-transparent dark:bg-transparent"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Cột trái (7/12): Thuế VAT, Giảm giá đơn, Phí vận chuyển, Hình thức thanh toán */}
        <div className="space-y-4 lg:col-span-7">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* 4.2 Thuế VAT */}
            <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/40">
              <FormField
                label={t('importsForm.vatLabel')}
                description={`+ ${formatCurrencyVND(vatAmount)}`}
              >
                <div className="flex items-center gap-1.5">
                  {VAT_PRESETS.map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() =>
                        setValue('vatPercent', pct, { shouldDirty: true })
                      }
                      className={cn(
                        'h-9 flex-1 rounded-lg border text-xs font-semibold transition',
                        vatPercent === pct
                          ? 'border-emerald-600 bg-emerald-600 text-white shadow-2xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
                      )}
                    >
                      {pct}%
                    </button>
                  ))}
                  <div className="w-24">
                    <RHFCurrencyInput
                      control={control}
                      name="vatPercent"
                      min={0}
                      max={100}
                      allowZeroDisplay
                      inputClassName="text-right pr-6"
                      rightAddon={
                        <span className="pointer-events-none pr-1 text-[11px] font-semibold text-slate-400">
                          %
                        </span>
                      }
                    />
                  </div>
                </div>
              </FormField>
            </div>

            {/* 4.3 Giảm giá tổng đơn (VNĐ hoặc %) */}
            <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/40">
              <FormField
                label={t('importsForm.orderDiscountLabel')}
                description={`- ${formatCurrencyVND(orderDiscountAmount)}`}
              >
                <RHFCurrencyInput
                  control={control}
                  name="orderDiscountValue"
                  min={0}
                  max={orderDiscountType === 'PERCENT' ? 100 : undefined}
                  allowZeroDisplay
                  inputClassName="text-right pr-20"
                  rightAddon={
                    <div className="inline-flex rounded-md border border-slate-200 bg-slate-100 p-0.5 dark:border-zinc-700 dark:bg-zinc-800">
                      <button
                        type="button"
                        onClick={() => {
                          setValue('orderDiscountType', 'VND', {
                            shouldDirty: true,
                          });
                          setValue('orderDiscountValue', 0, {
                            shouldDirty: true,
                          });
                        }}
                        className={cn(
                          'rounded px-2 py-0.5 text-[11px] font-bold transition',
                          orderDiscountType === 'VND'
                            ? 'bg-emerald-600 text-white'
                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-300',
                        )}
                      >
                        VNĐ
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setValue('orderDiscountType', 'PERCENT', {
                            shouldDirty: true,
                          });
                          setValue('orderDiscountValue', 0, {
                            shouldDirty: true,
                          });
                        }}
                        className={cn(
                          'rounded px-2 py-0.5 text-[11px] font-bold transition',
                          orderDiscountType === 'PERCENT'
                            ? 'bg-emerald-600 text-white'
                            : 'text-slate-600 hover:text-slate-900 dark:text-slate-300',
                        )}
                      >
                        <Percent className="inline h-3 w-3" />
                      </button>
                    </div>
                  }
                />
              </FormField>
            </div>

            {/* 4.5 Phí vận chuyển */}
            <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/40">
              <FormField
                label={t('importsForm.shippingFeeLabel')}
                description={formatCurrencyVND(shippingFee || 0)}
              >
                <RHFCurrencyInput
                  control={control}
                  name="shippingFee"
                  min={0}
                  allowZeroDisplay
                  placeholder={t('importsForm.shippingFeePlaceholder')}
                  leftIcon={<Truck className="h-4 w-4 text-slate-400" />}
                  inputClassName="text-right pr-7"
                  rightAddon={
                    <span className="pointer-events-none pr-1.5 text-xs font-semibold text-slate-400">
                      ₫
                    </span>
                  }
                />
              </FormField>
            </div>

            {/* 4.7 Hình thức thanh toán (Tiền mặt / Chuyển khoản) */}
            <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/40">
              <FormField
                label={t('importsForm.paymentMethodLabel')}
                description={
                  paymentMethod === 'CASH'
                    ? t('importsForm.paymentCash')
                    : t('importsForm.paymentTransfer')
                }
              >
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setValue('paymentMethod', 'CASH', { shouldDirty: true })
                    }
                    className={cn(
                      'flex h-9 items-center justify-center gap-1.5 rounded-lg border text-xs font-semibold transition',
                      paymentMethod === 'CASH'
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
                    )}
                  >
                    <Banknote className="h-3.5 w-3.5" />
                    {t('importsForm.paymentCash')}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setValue('paymentMethod', 'TRANSFER', {
                        shouldDirty: true,
                      })
                    }
                    className={cn(
                      'flex h-9 items-center justify-center gap-1.5 rounded-lg border text-xs font-semibold transition',
                      paymentMethod === 'TRANSFER'
                        ? 'border-emerald-600 bg-emerald-600 text-white shadow-2xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
                    )}
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    {t('importsForm.paymentTransfer')}
                  </button>
                </div>
              </FormField>
            </div>
          </div>
        </div>

        {/* Cột phải (5/12): Tổng tiền trước thuế, Tổng thanh toán, Tiền thực trả & Các nút Lưu tạm / Lưu phiếu */}
        <div className="flex flex-col justify-between rounded-xl border border-emerald-600/30 bg-emerald-50/40 p-4 dark:border-emerald-500/30 dark:bg-emerald-950/20 lg:col-span-5">
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span>{t('importsForm.subtotalBeforeTaxLabel')}</span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {formatCurrencyVND(subtotalBeforeTax)}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span>
                {t('importsForm.vatSummaryLabel', {
                  percent: vatPercent || 0,
                })}
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                + {formatCurrencyVND(vatAmount)}
              </span>
            </div>

            <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
              <span>
                {t('importsForm.orderDiscountSummaryLabel')}{' '}
                {orderDiscountType === 'PERCENT' && orderDiscountValue > 0
                  ? `(${orderDiscountValue.toLocaleString('vi-VN')}%)`
                  : ''}
                :
              </span>
              <span className="font-semibold text-rose-600 dark:text-rose-400">
                - {formatCurrencyVND(orderDiscountAmount)}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-emerald-600/20 pt-2.5">
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {t('importsForm.totalPayableLabel')}
              </span>
              <span className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400">
                {formatCurrencyVND(totalPayable)}
              </span>
            </div>

            {shippingFee > 0 && (
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span>{t('importsForm.plusShippingLabel')}</span>
                <span className="font-semibold">
                  + {formatCurrencyVND(shippingFee)} (={' '}
                  {formatCurrencyVND(totalWithShipping)})
                </span>
              </div>
            )}

            {/* Tiền thực trả */}
            <div className="rounded-lg border border-emerald-600/30 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-900">
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  {t('importsForm.amountPaidLabel')}
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      onMarkAmountPaidTouched();
                      setValue('amountPaid', totalWithShipping, {
                        shouldDirty: true,
                      });
                    }}
                    className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                  >
                    {t('importsForm.payFullBtn')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onMarkAmountPaidTouched();
                      setValue('amountPaid', 0, { shouldDirty: true });
                    }}
                    className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {t('importsForm.payZeroBtn')}
                  </button>
                </div>
              </div>

              <div onFocusCapture={onMarkAmountPaidTouched}>
                <RHFCurrencyInput
                  control={control}
                  name="amountPaid"
                  min={0}
                  allowZeroDisplay
                  inputClassName="text-right text-sm font-bold text-emerald-700 dark:text-emerald-400 pr-7"
                  rightAddon={
                    <span className="pointer-events-none pr-1.5 text-xs font-bold text-emerald-600">
                      ₫
                    </span>
                  }
                />
              </div>

              {/* Danh sách lựa chọn mệnh giá tái sử dụng từ PriceSuggestionsBar (suggestPrices) */}
              <PriceSuggestionsBar
                baseValue={baseSuggestedPayable}
                selectedValue={amountPaid}
                onSelectPrice={(suggestedAmount) => {
                  onMarkAmountPaidTouched();
                  setValue('amountPaid', suggestedAmount, {
                    shouldDirty: true,
                  });
                }}
              />

              <div className="mt-1.5 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">
                  {t('importsForm.debtRemainingLabel')}
                </span>
                <span
                  className={cn(
                    'font-bold',
                    debtRemaining > 0
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400',
                  )}
                >
                  {debtRemaining > 0
                    ? t('importsForm.debtRemainingValue', {
                        amount: formatCurrencyVND(debtRemaining),
                      })
                    : t('importsForm.paidInFullValue')}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.print()}
              className="gap-1.5 text-xs"
            >
              <Printer className="h-4 w-4" />
              {t('importsForm.printBtn')}
            </Button>

            {/* Nút Thao tác Lưu tạm */}
            <Button
              type="button"
              variant="outline"
              disabled={isSavingReceipt}
              onClick={onSaveDraft}
              className="gap-1.5 border-amber-500/60 bg-amber-50 text-xs font-bold text-amber-800 hover:bg-amber-100 dark:border-amber-500/40 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-950/70"
            >
              <FileClock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              {isEditingDraft
                ? t('importsForm.updateDraftBtn')
                : t('importsForm.saveDraftBtn')}
            </Button>

            {/* Nút Hoàn tất Lưu phiếu nhập & Nhập kho */}
            <Button
              type="button"
              disabled={isSavingReceipt}
              onClick={onSaveReceipt}
              className="flex-1 gap-2 bg-emerald-600 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 sm:flex-initial sm:px-5"
            >
              {isSavingReceipt ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {t('importsForm.saveReceiptBtn')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
