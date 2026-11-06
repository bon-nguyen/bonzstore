import { X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import {
  CashbookPayerGroup,
  CashbookSourceCategoryItem,
  CashbookVoucherItem,
  CashbookVoucherType,
} from '../../../api/types/cashbook.types';
import { Button } from '../../../components/ui/button';
import {
  CreatableSelectOption,
  RHFCheckbox,
  RHFCreatableSelect,
  RHFCurrencyInput,
  RHFInput,
  RHFTextarea,
} from '../../../components/ui/rhf-fields';
import { useAuthContext } from '../../auth/context/AuthContext';
import { useI18n } from '../../i18n/I18nContext';
import { useUsers } from '../../users/hooks/useUsers';
import {
  useCashbookSourceCategories,
  useCreateCashbookVoucher,
  useUpdateCashbookVoucher,
} from '../hooks/useCashbook';
import { CashbookSourceCategoryModal } from './CashbookSourceCategoryModal';

export interface CashbookVoucherFormValues {
  transactionDate: string;
  voucherCode: string;
  category: string;
  categoryCode: string;
  payerGroup: CashbookPayerGroup | '';
  partnerName: string;
  cashAmount: number;
  cardAmount: number;
  transferAmount: number;
  staffName: string;
  note: string;
  isBusinessAccounting: boolean;
}

interface CashbookVoucherModalProps {
  open: boolean;
  modalType: CashbookVoucherType;
  editingVoucher: CashbookVoucherItem | null;
  onClose: () => void;
}

const FALLBACK_SYSTEM_CUSTOMERS: CreatableSelectOption[] = [
  {
    value: 'Lê Hoàng Minh (customer@bonzstore.vn)',
    label: 'Lê Hoàng Minh',
    code: 'CUS-001',
    description: 'customer@bonzstore.vn • Khách hàng thành viên hệ thống',
  },
  {
    value: 'Nguyễn Ngọc Ánh (ngocanh.figure@gmail.com)',
    label: 'Nguyễn Ngọc Ánh',
    code: 'CUS-002',
    description: 'ngocanh.figure@gmail.com • Khách hàng VIP Figure',
  },
  {
    value: 'Trần Quốc Bảo (baotran.otaku@gmail.com)',
    label: 'Trần Quốc Bảo',
    code: 'CUS-003',
    description: 'baotran.otaku@gmail.com • Khách hàng Pre-order',
  },
];

const FALLBACK_SYSTEM_STAFF: CreatableSelectOption[] = [
  {
    value: 'BonzStore Super Admin (SUPER_ADMIN)',
    label: 'BonzStore Super Admin',
    code: 'SUPER_ADMIN',
    description: 'admin@bonzstore.vn • Quản trị viên cao nhất',
  },
  {
    value: 'Quản lý Cửa hàng (STORE_MANAGER)',
    label: 'Quản lý Cửa hàng',
    code: 'STORE_MANAGER',
    description: 'manager@bonzstore.vn • Quản lý vận hành & sổ quỹ',
  },
  {
    value: 'Nhân viên Bán hàng (STAFF)',
    label: 'Nhân viên Bán hàng',
    code: 'STAFF',
    description: 'staff@bonzstore.vn • Nhân sự cửa hàng',
  },
];

function getLocalDatetimeInputValue(isoString?: string): string {
  const date = isoString ? new Date(isoString) : new Date();
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
  const tzOffsetMs = safeDate.getTimezoneOffset() * 60000;
  return new Date(safeDate.getTime() - tzOffsetMs).toISOString().slice(0, 16);
}

function formatVND(val: number): string {
  return `${Math.round(val || 0).toLocaleString('vi-VN')}₫`;
}

export function CashbookVoucherModal({
  open,
  modalType,
  editingVoucher,
  onClose,
}: CashbookVoucherModalProps) {
  const { t } = useI18n();
  const { user } = useAuthContext();

  const isIncome = modalType === 'INCOME';

  const { data: sourceCategories = [] } =
    useCashbookSourceCategories(modalType);
  const { data: usersResponse } = useUsers({ limit: 100 });

  const createMutation = useCreateCashbookVoucher();
  const updateMutation = useUpdateCashbookVoucher();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const [sourceModalOpen, setSourceModalOpen] = useState(false);
  const [editingSourceCategory, setEditingSourceCategory] =
    useState<CashbookSourceCategoryItem | null>(null);

  const defaultSystemStaffLabel = useMemo(() => {
    if (!user) return 'BonzStore Super Admin (SUPER_ADMIN)';
    return `${user.fullName} (${user.role?.code || 'SUPER_ADMIN'})`;
  }, [user]);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<CashbookVoucherFormValues>({
    defaultValues: {
      transactionDate: getLocalDatetimeInputValue(),
      voucherCode: '',
      category: '',
      categoryCode: '',
      payerGroup: '',
      partnerName: '',
      cashAmount: 0,
      cardAmount: 0,
      transferAmount: 0,
      staffName: defaultSystemStaffLabel,
      note: '',
      isBusinessAccounting: true,
    },
  });

  useEffect(() => {
    if (!open) return;
    if (editingVoucher) {
      reset({
        transactionDate: getLocalDatetimeInputValue(
          editingVoucher.transactionDate,
        ),
        voucherCode: editingVoucher.voucherCode,
        category: editingVoucher.category,
        categoryCode: editingVoucher.categoryCode || '',
        payerGroup: editingVoucher.payerGroup || 'PARTNER',
        partnerName: editingVoucher.partnerName,
        cashAmount: editingVoucher.cashAmount || 0,
        cardAmount: editingVoucher.cardAmount || 0,
        transferAmount: editingVoucher.transferAmount || 0,
        staffName: editingVoucher.staffName || defaultSystemStaffLabel,
        note: editingVoucher.note || editingVoucher.content || '',
        isBusinessAccounting: editingVoucher.isBusinessAccounting ?? true,
      });
    } else {
      reset({
        transactionDate: getLocalDatetimeInputValue(),
        voucherCode: '',
        category: '',
        categoryCode: '',
        payerGroup: '',
        partnerName: '',
        cashAmount: 0,
        cardAmount: 0,
        transferAmount: 0,
        staffName: defaultSystemStaffLabel,
        note: '',
        isBusinessAccounting: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingVoucher?.id, modalType]);

  const selectedPayerGroup = useWatch({ control, name: 'payerGroup' });
  const cashAmount = useWatch({ control, name: 'cashAmount' }) || 0;
  const cardAmount = useWatch({ control, name: 'cardAmount' }) || 0;
  const transferAmount = useWatch({ control, name: 'transferAmount' }) || 0;
  const totalAmount =
    Number(cashAmount) + Number(cardAmount) + Number(transferAmount);

  const categoryOptions = useMemo<
    CreatableSelectOption<CashbookSourceCategoryItem>[]
  >(
    () =>
      sourceCategories.map((cat) => ({
        value: cat.name,
        label: cat.name,
        code: cat.code,
        description: cat.description,
        meta: cat,
      })),
    [sourceCategories],
  );

  const payerGroupOptions = useMemo<CreatableSelectOption[]>(
    () => [
      {
        value: 'PARTNER',
        label: t('cashbook.payerGroup.PARTNER'),
        code: 'PARTNER',
        description: t('cashbook.payerGroupDesc.PARTNER'),
      },
      {
        value: 'CUSTOMER',
        label: t('cashbook.payerGroup.CUSTOMER'),
        code: 'CUSTOMER',
        description: t('cashbook.payerGroupDesc.CUSTOMER'),
      },
      {
        value: 'STAFF',
        label: t('cashbook.payerGroup.STAFF'),
        code: 'STAFF',
        description: t('cashbook.payerGroupDesc.STAFF'),
      },
      {
        value: 'OTHER',
        label: t('cashbook.payerGroup.OTHER'),
        code: 'OTHER',
        description: t('cashbook.payerGroupDesc.OTHER'),
      },
    ],
    [t],
  );

  const systemCustomerOptions = useMemo<CreatableSelectOption[]>(() => {
    const apiUsers = usersResponse?.data || [];
    const customers = apiUsers.filter((u) => u.role?.code === 'CUSTOMER');
    if (customers.length === 0) return FALLBACK_SYSTEM_CUSTOMERS;
    return customers.map((u) => ({
      value: `${u.fullName} (${u.email})`,
      label: u.fullName,
      code: 'CUSTOMER',
      description: `${u.email}${u.phone ? ` • ${u.phone}` : ''}`,
    }));
  }, [usersResponse]);

  const systemStaffOptions = useMemo<CreatableSelectOption[]>(() => {
    const apiUsers = usersResponse?.data || [];
    const staffList = apiUsers.filter(
      (u) => u.role?.code && u.role.code !== 'CUSTOMER',
    );
    const baseOptions: CreatableSelectOption[] =
      staffList.length > 0
        ? staffList.map((u) => ({
            value: `${u.fullName} (${u.role?.code || 'STAFF'})`,
            label: u.fullName,
            code: u.role?.code || 'STAFF',
            description: `${u.email} • ${u.role?.name || ''}`,
          }))
        : [...FALLBACK_SYSTEM_STAFF];

    if (
      user &&
      !baseOptions.some((opt) => opt.value === defaultSystemStaffLabel)
    ) {
      baseOptions.unshift({
        value: defaultSystemStaffLabel,
        label: user.fullName,
        code: user.role?.code || 'SUPER_ADMIN',
        description: `${user.email} • Phiên đăng nhập hiện tại`,
      });
    }
    return baseOptions;
  }, [usersResponse, user, defaultSystemStaffLabel]);

  if (!open) return null;

  const onSubmit = (values: CashbookVoucherFormValues) => {
    clearErrors();
    let hasError = false;

    if (!values.transactionDate) {
      setError('transactionDate', {
        message: t('cashbook.valRequiredTransactionDate'),
      });
      hasError = true;
    }
    if (!values.category.trim()) {
      setError('category', { message: t('cashbook.valRequiredCategory') });
      hasError = true;
    }
    if (!values.payerGroup) {
      setError('payerGroup', { message: t('cashbook.valRequiredPayerGroup') });
      hasError = true;
    }
    if (!values.partnerName.trim()) {
      setError('partnerName', {
        message: t('cashbook.valRequiredPartnerName'),
      });
      hasError = true;
    }
    const sumAmount =
      Number(values.cashAmount || 0) +
      Number(values.cardAmount || 0) +
      Number(values.transferAmount || 0);
    if (sumAmount <= 0) {
      setError('cashAmount', { message: t('cashbook.valRequiredAmount') });
      hasError = true;
    }

    if (hasError) return;

    const parsedDate = new Date(values.transactionDate);
    const isoDate = Number.isNaN(parsedDate.getTime())
      ? new Date().toISOString()
      : parsedDate.toISOString();

    const operatorTokenInfo = {
      userId: user?.id || 'system-admin',
      email: user?.email || 'admin@bonzstore.vn',
      fullName: user?.fullName || 'BonzStore Super Admin',
      roleCode: user?.role?.code || 'SUPER_ADMIN',
      executedAt: new Date().toISOString(),
    };

    const cleanNote = values.note.trim();
    const cleanCategory = values.category.trim();

    const payload = {
      voucherCode: values.voucherCode.trim() || undefined,
      transactionDate: isoDate,
      type: modalType,
      category: cleanCategory,
      categoryCode: values.categoryCode || undefined,
      payerGroup: values.payerGroup as CashbookPayerGroup,
      partnerName: values.partnerName.trim(),
      content: cleanNote || cleanCategory,
      cashAmount: Number(values.cashAmount || 0),
      cardAmount: Number(values.cardAmount || 0),
      transferAmount: Number(values.transferAmount || 0),
      staffName: values.staffName.trim() || defaultSystemStaffLabel,
      note: cleanNote,
      isBusinessAccounting: values.isBusinessAccounting,
      operatorTokenInfo,
    };

    if (editingVoucher) {
      updateMutation.mutate(
        { id: editingVoucher.id, data: payload },
        { onSuccess: () => onClose() },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => onClose(),
      });
    }
  };

  const isSystemSelectPartner =
    selectedPayerGroup === 'CUSTOMER' || selectedPayerGroup === 'STAFF';

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
        <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-border bg-card px-5 py-4">
            <div>
              <h3 className="font-display text-base font-bold text-foreground">
                {editingVoucher
                  ? isIncome
                    ? t('cashbook.modalEditIncomeTitle', {
                        code: editingVoucher.voucherCode,
                      })
                    : t('cashbook.modalEditExpenseTitle', {
                        code: editingVoucher.voucherCode,
                      })
                  : isIncome
                    ? t('cashbook.modalCreateIncomeTitle')
                    : t('cashbook.modalCreateExpenseTitle')}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t('cashbook.modalVoucherSub')}
              </p>
            </div>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            {/* Scrollable Body */}
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              {/* Row 1: Thời gian giao dịch (*) + Mã phiếu tự động phát sinh */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <RHFInput
                  control={control}
                  name="transactionDate"
                  type="datetime-local"
                  required
                  disabled={isSubmitting}
                  label={t('cashbook.fieldTransactionDate')}
                />

                <RHFInput
                  control={control}
                  name="voucherCode"
                  disabled={isSubmitting}
                  label={t('cashbook.fieldVoucherCode')}
                  placeholder={
                    isIncome
                      ? t('cashbook.fieldVoucherCodePlaceholderIncome')
                      : t('cashbook.fieldVoucherCodePlaceholderExpense')
                  }
                  inputClassName="font-mono"
                />
              </div>

              {/* Row 2: Loại Phiếu Thu / Chi (*) + Nhóm Người Nộp / Nhận (*) */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <RHFCreatableSelect
                  control={control}
                  name="category"
                  required
                  disabled={isSubmitting}
                  dropdownPlacement="bottom"
                  label={
                    isIncome
                      ? t('cashbook.fieldSourceCategoryIncome')
                      : t('cashbook.fieldSourceCategoryExpense')
                  }
                  placeholder={
                    isIncome
                      ? t('cashbook.fieldSourceCategoryPlaceholderIncome')
                      : t('cashbook.fieldSourceCategoryPlaceholderExpense')
                  }
                  options={categoryOptions}
                  createNewLabel={t('cashbook.createNewOptionBtn')}
                  editOptionTooltip={t('cashbook.editOptionTooltip')}
                  onValueSelect={(_val, opt) => {
                    setValue('categoryCode', opt?.code || '');
                    clearErrors('category');
                  }}
                  onCreateNew={() => {
                    setEditingSourceCategory(null);
                    setSourceModalOpen(true);
                  }}
                  onEditOption={(opt) => {
                    if (opt.meta) {
                      setEditingSourceCategory(opt.meta);
                      setSourceModalOpen(true);
                    }
                  }}
                />

                <RHFCreatableSelect
                  control={control}
                  name="payerGroup"
                  required
                  searchable={false}
                  disabled={isSubmitting}
                  dropdownPlacement="bottom"
                  label={
                    isIncome
                      ? t('cashbook.fieldPayerGroupIncome')
                      : t('cashbook.fieldPayerGroupExpense')
                  }
                  placeholder={
                    isIncome
                      ? t('cashbook.fieldPayerGroupPlaceholderIncome')
                      : t('cashbook.fieldPayerGroupPlaceholderExpense')
                  }
                  options={payerGroupOptions}
                  onValueSelect={(nextGroup) => {
                    if (nextGroup !== selectedPayerGroup) {
                      setValue('partnerName', '');
                    }
                    clearErrors('payerGroup');
                  }}
                />
              </div>

              {/* Row 3: Tên người nộp / nhận (*) + Người thu / chi (Thông tin hệ thống) */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {isSystemSelectPartner ? (
                  <RHFCreatableSelect
                    control={control}
                    name="partnerName"
                    required
                    disabled={!selectedPayerGroup || isSubmitting}
                    dropdownPlacement="bottom"
                    label={
                      isIncome
                        ? t('cashbook.fieldPartnerNameIncome')
                        : t('cashbook.fieldPartnerNameExpense')
                    }
                    disabledPlaceholder={t(
                      'cashbook.fieldPartnerNameDisabledPlaceholder',
                    )}
                    placeholder={
                      selectedPayerGroup === 'CUSTOMER'
                        ? t('cashbook.fieldPartnerNameCustomerPlaceholder')
                        : t('cashbook.fieldPartnerNameStaffPlaceholder')
                    }
                    options={
                      selectedPayerGroup === 'CUSTOMER'
                        ? systemCustomerOptions
                        : systemStaffOptions
                    }
                    onValueSelect={() => clearErrors('partnerName')}
                  />
                ) : (
                  <RHFInput
                    control={control}
                    name="partnerName"
                    required
                    disabled={!selectedPayerGroup || isSubmitting}
                    label={
                      isIncome
                        ? t('cashbook.fieldPartnerNameIncome')
                        : t('cashbook.fieldPartnerNameExpense')
                    }
                    placeholder={
                      !selectedPayerGroup
                        ? t('cashbook.fieldPartnerNameDisabledPlaceholder')
                        : t('cashbook.fieldPartnerNameTextPlaceholder')
                    }
                  />
                )}

                <RHFCreatableSelect
                  control={control}
                  name="staffName"
                  disabled={isSubmitting}
                  dropdownPlacement="bottom"
                  label={
                    isIncome
                      ? t('cashbook.fieldStaffNameIncome')
                      : t('cashbook.fieldStaffNameExpense')
                  }
                  options={systemStaffOptions}
                />
              </div>

              {/* Row 4: Số tiền theo Kênh thanh toán (*) */}
              <div className="rounded-xl border border-slate-300 bg-muted/30 p-3.5 dark:border-zinc-700">
                <div className="mb-2.5 flex items-center justify-between">
                  <p className="text-xs font-bold text-foreground">
                    {t('cashbook.fieldPaymentChannelsTitle')}{' '}
                    <span className="text-red-500">*</span>
                  </p>
                  {errors.cashAmount?.message && (
                    <span className="text-[11px] font-medium text-red-500">
                      {errors.cashAmount.message}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <RHFCurrencyInput
                    control={control}
                    name="cashAmount"
                    disabled={isSubmitting}
                    label={t('cashbook.fieldCashAmount')}
                    labelClassName="text-emerald-600 dark:text-emerald-400"
                  />
                  <RHFCurrencyInput
                    control={control}
                    name="cardAmount"
                    disabled={isSubmitting}
                    label={t('cashbook.fieldCardAmount')}
                    labelClassName="text-sky-600 dark:text-sky-400"
                  />
                  <RHFCurrencyInput
                    control={control}
                    name="transferAmount"
                    disabled={isSubmitting}
                    label={t('cashbook.fieldTransferAmount')}
                    labelClassName="text-violet-600 dark:text-violet-400"
                  />
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-2.5 text-xs">
                  <span className="font-semibold text-muted-foreground">
                    {t('cashbook.totalVoucherAmount')}
                  </span>
                  <span className="font-mono text-sm font-bold text-foreground">
                    {formatVND(totalAmount)}
                  </span>
                </div>
              </div>

              {/* Row 5: Ghi chú (Textarea) */}
              <RHFTextarea
                control={control}
                name="note"
                rows={3}
                disabled={isSubmitting}
                label={t('cashbook.fieldNote')}
                placeholder={t('cashbook.fieldNotePlaceholder')}
              />

              {/* Row 6: Checkbox Hạch toán kết quả kinh doanh */}
              <RHFCheckbox
                control={control}
                name="isBusinessAccounting"
                disabled={isSubmitting}
                label={t('cashbook.fieldBusinessAccounting')}
                description={t('cashbook.fieldBusinessAccountingDesc')}
              />
            </div>

            {/* Sticky Footer */}
            <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border bg-card px-5 py-3.5">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={onClose}
              >
                {t('app.cancel')}
              </Button>
              <Button
                type="submit"
                loading={isSubmitting}
                className={
                  isIncome
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : ''
                }
              >
                {editingVoucher
                  ? t('cashbook.submitUpdateVoucher')
                  : isIncome
                    ? t('cashbook.submitCreateIncome')
                    : t('cashbook.submitCreateExpense')}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <CashbookSourceCategoryModal
        open={sourceModalOpen}
        type={modalType}
        editingCategory={editingSourceCategory}
        onClose={() => setSourceModalOpen(false)}
        onSaved={(savedItem) => {
          setValue('category', savedItem.name, { shouldValidate: true });
          setValue('categoryCode', savedItem.code);
          clearErrors('category');
        }}
      />
    </>
  );
}
