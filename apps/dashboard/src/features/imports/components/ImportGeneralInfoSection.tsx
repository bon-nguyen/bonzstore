import {
  Calendar,
  FileText,
  Hash,
  MessageSquareText,
  RefreshCw,
  Truck,
  UserCheck,
} from 'lucide-react';
import { Control, UseFormSetValue, useWatch } from 'react-hook-form';
import { LogisticsUnit } from '../../../api/types/logistics.types';
import { FormField } from '../../../components/ui/form-field';
import {
  CreatableSelectOption,
  RHFCreatableSelect,
  RHFInput,
} from '../../../components/ui/rhf-fields';
import { useI18n } from '../../i18n/I18nContext';
import {
  ImportReceiptFormValues,
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
}

export function ImportGeneralInfoSection({
  control,
  setValue,
  logisticsOptions,
  staffOptions,
  savedReceiptsCount,
  onOpenCreateLogistics,
}: ImportGeneralInfoSectionProps) {
  const { t } = useI18n();
  const importDate = useWatch({ control, name: 'importDate' });

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
          <span>
            {t('importsForm.createdDateLabel')}{' '}
            <strong className="font-semibold text-emerald-600 dark:text-emerald-400">
              {formatVnDateDisplay(importDate)}
            </strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-3">
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

        {/* 6. Diễn giải */}
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
