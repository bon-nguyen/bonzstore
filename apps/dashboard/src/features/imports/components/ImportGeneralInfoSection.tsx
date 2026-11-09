import {
  ArrowRightLeft,
  Calendar,
  Coins,
  FileText,
  Hash,
  MessageSquareText,
  RefreshCw,
  Truck,
  UserCheck,
} from 'lucide-react';
import { useState } from 'react';
import { Control, UseFormSetValue, useWatch } from 'react-hook-form';
import { LogisticsUnit } from '../../../api/types/logistics.types';
import { FormField } from '../../../components/ui/form-field';
import { VnCnyInput, VnNumberInput } from '../../../components/ui/input';
import {
  CreatableSelectOption,
  RHFCreatableSelect,
  RHFInput,
} from '../../../components/ui/rhf-fields';
import { cn, formatCurrencyVND } from '../../../lib/utils';
import { useI18n } from '../../i18n/I18nContext';
import {
  EXCHANGE_RATE_PRESETS,
  ImportReceiptFormValues,
  convertCnyToVnd,
  convertVndToCny,
  formatVnDateDisplay,
  generateReceiptSequence,
} from './ImportFormTypes';

export interface ImportGeneralInfoSectionProps {
  control: Control<ImportReceiptFormValues>;
  setValue: UseFormSetValue<ImportReceiptFormValues>;
  logisticsOptions: CreatableSelectOption<LogisticsUnit>[];
  staffOptions: CreatableSelectOption[];
  savedReceiptsCount: number;
  onOpenCreateLogistics: () => void;
  onExchangeRateChange: (newRate: number) => void;
  onApplyDefaultCostPriceToRows?: (cnyPrice: number, vndPrice: number) => void;
}

export function ImportGeneralInfoSection({
  control,
  setValue,
  logisticsOptions,
  staffOptions,
  savedReceiptsCount,
  onOpenCreateLogistics,
  onExchangeRateChange,
  onApplyDefaultCostPriceToRows,
}: ImportGeneralInfoSectionProps) {
  const { t } = useI18n();
  const importDate = useWatch({ control, name: 'importDate' });
  const exchangeRateCny =
    useWatch({ control, name: 'exchangeRateCny' }) || 3790;

  // Field nhập nhanh Giá vốn (Tệ ¥ <-> Tiền Việt VNĐ)
  const [quickCnyCost, setQuickCnyCost] = useState<number>(45);
  const convertedVndCost = convertCnyToVnd(quickCnyCost, exchangeRateCny);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">
            1
          </span>
          <h2 className="text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-200">
            {t('importsForm.section1Title')}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 font-semibold text-amber-700 ring-1 ring-amber-500/20 dark:bg-amber-950/50 dark:text-amber-300">
            1 ¥ (CNY) = {exchangeRateCny.toLocaleString('vi-VN')} ₫
          </span>
          <span>
            {t('importsForm.createdDateLabel')}{' '}
            <strong className="font-semibold text-emerald-600 dark:text-emerald-400">
              {formatVnDateDisplay(importDate)}
            </strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-4">
        {/* 1. Ngày nhập (*) */}
        <FormField label={t('importsForm.fieldImportDate')} required>
          <RHFInput
            control={control}
            name="importDate"
            type="date"
            leftIcon={<Calendar className="h-4 w-4 text-emerald-600" />}
            rightAddon={
              <span className="pointer-events-none mr-6 hidden rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 sm:inline-block dark:bg-slate-800 dark:text-slate-300">
                {formatVnDateDisplay(importDate)}
              </span>
            }
          />
        </FormField>

        {/* 2. Nhà phân phối (Đơn vị Logistics) + Icon (+) nằm bên trong Input */}
        <FormField label={t('importsForm.fieldLogisticsUnit')}>
          <RHFCreatableSelect
            control={control}
            name="logisticsUnitName"
            options={logisticsOptions}
            placeholder={t('importsForm.fieldLogisticsPlaceholder')}
            searchPlaceholder={t('importsForm.fieldLogisticsSearchPlaceholder')}
            leftIcon={<Truck className="h-4 w-4 text-emerald-600" />}
            showInlineCreateButton
            inlineCreateTooltip={t('importsForm.addLogisticsTooltip')}
            createNewLabel={t('importsForm.addLogisticsTooltip')}
            onCreateNew={onOpenCreateLogistics}
            onValueSelect={(_val, opt) => {
              if (opt?.meta?.id) {
                setValue('logisticsUnitId', opt.meta.id, { shouldDirty: true });
              }
            }}
          />
        </FormField>

        {/* 3. Số thứ tự phiếu */}
        <FormField label={t('importsForm.fieldReceiptNumber')}>
          <RHFInput
            control={control}
            name="receiptNumber"
            placeholder={t('importsForm.fieldReceiptNumberPlaceholder')}
            leftIcon={<Hash className="h-4 w-4" />}
            inputClassName="font-mono font-semibold"
            rightAddon={
              <button
                type="button"
                title={t('importsForm.regenerateSequenceTooltip')}
                onClick={() =>
                  setValue(
                    'receiptNumber',
                    generateReceiptSequence(
                      savedReceiptsCount + Math.floor(Math.random() * 89 + 1),
                    ),
                    { shouldDirty: true },
                  )
                }
                className="flex h-6 w-6 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-emerald-600 dark:hover:bg-zinc-800"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            }
          />
        </FormField>

        {/* 4. Số hóa đơn */}
        <FormField label={t('importsForm.fieldInvoiceNumber')}>
          <RHFInput
            control={control}
            name="invoiceNumber"
            placeholder={t('importsForm.fieldInvoiceNumberPlaceholder')}
            leftIcon={<FileText className="h-4 w-4" />}
          />
        </FormField>

        {/* 5. Người nhập hàng (Danh sách Admin, Manager và Nhân viên) */}
        <FormField label={t('importsForm.fieldStaffName')}>
          <RHFCreatableSelect
            control={control}
            name="staffName"
            options={staffOptions}
            placeholder={t('importsForm.fieldStaffPlaceholder')}
            searchPlaceholder={t('importsForm.fieldStaffSearchPlaceholder')}
            leftIcon={<UserCheck className="h-4 w-4 text-emerald-600" />}
          />
        </FormField>

        {/* 6. Tỷ giá Giá vốn (1 ¥ Tệ -> VNĐ) */}
        <FormField
          label={t('importsForm.fieldExchangeRateCny')}
          description={t('importsForm.fieldExchangeRateHint')}
        >
          <VnNumberInput
            min={1}
            value={exchangeRateCny}
            onValueChange={(val) => onExchangeRateChange(val)}
            leftIcon={<Coins className="h-4 w-4 text-amber-500" />}
            rightAddon={
              <div className="flex items-center gap-1 pr-1">
                {EXCHANGE_RATE_PRESETS.map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => onExchangeRateChange(rate)}
                    className={cn(
                      'rounded px-1.5 py-0.5 font-mono text-[10px] font-bold transition',
                      exchangeRateCny === rate
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-zinc-800 dark:text-slate-300',
                    )}
                  >
                    {rate.toLocaleString('vi-VN')}
                  </button>
                ))}
                <span className="text-[10px] font-bold text-slate-400">
                  ₫/¥
                </span>
              </div>
            }
            className="pr-44 text-left font-bold text-amber-700 dark:text-amber-400"
          />
        </FormField>

        {/* 7. Field Nhập Giá vốn (Nhập giá Tệ ¥ đổi sang Tiền Việt VNĐ) */}
        <FormField
          label="Nhập Giá vốn (Giá Tệ ¥ đổi sang Tiền Việt VNĐ)"
          description={`Quy đổi tự động: ${quickCnyCost.toLocaleString('vi-VN')} ¥ × ${exchangeRateCny.toLocaleString('vi-VN')} = ${formatCurrencyVND(convertedVndCost)}`}
        >
          <div className="flex items-center gap-1.5">
            <div className="w-28 shrink-0">
              <VnCnyInput
                min={0}
                allowZeroDisplay
                value={quickCnyCost}
                onValueChange={(cnyVal) => setQuickCnyCost(cnyVal)}
                rightAddon={
                  <span className="pointer-events-none pr-1.5 font-mono text-xs font-bold text-amber-600">
                    ¥
                  </span>
                }
                className="border-amber-300 pr-6 font-bold text-amber-700 dark:border-amber-700 dark:text-amber-300"
              />
            </div>

            <ArrowRightLeft className="h-3.5 w-3.5 shrink-0 text-slate-400" />

            <div className="flex-1">
              <VnNumberInput
                min={0}
                allowZeroDisplay
                value={convertedVndCost}
                onValueChange={(vndVal) =>
                  setQuickCnyCost(convertVndToCny(vndVal, exchangeRateCny))
                }
                rightAddon={
                  onApplyDefaultCostPriceToRows ? (
                    <button
                      type="button"
                      title="Áp dụng giá vốn này cho các mặt hàng trong bảng"
                      onClick={() =>
                        onApplyDefaultCostPriceToRows(
                          quickCnyCost,
                          convertedVndCost,
                        )
                      }
                      className="rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white hover:bg-emerald-700"
                    >
                      Áp dụng
                    </button>
                  ) : (
                    <span className="pointer-events-none pr-1.5 text-xs font-bold text-emerald-600">
                      ₫
                    </span>
                  )
                }
                className="pr-16 font-bold text-emerald-700 dark:text-emerald-400"
              />
            </div>
          </div>
        </FormField>

        {/* 8. Diễn giải */}
        <FormField label={t('importsForm.fieldDescription')}>
          <RHFInput
            control={control}
            name="description"
            placeholder={t('importsForm.fieldDescriptionPlaceholder')}
            leftIcon={<MessageSquareText className="h-4 w-4" />}
          />
        </FormField>
      </div>
    </section>
  );
}
