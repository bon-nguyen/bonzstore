import { X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  CashbookSourceCategoryItem,
  CashbookVoucherType,
} from '../../../api/types/cashbook.types';
import { Button } from '../../../components/ui/button';
import { RHFInput, RHFTextarea } from '../../../components/ui/rhf-fields';
import { useI18n } from '../../i18n/I18nContext';
import {
  useCreateCashbookSourceCategory,
  useUpdateCashbookSourceCategory,
} from '../hooks/useCashbook';

interface SourceCategoryFormValues {
  code: string;
  name: string;
  description: string;
}

interface CashbookSourceCategoryModalProps {
  open: boolean;
  type: CashbookVoucherType;
  editingCategory: CashbookSourceCategoryItem | null;
  onClose: () => void;
  onSaved?: (savedItem: CashbookSourceCategoryItem) => void;
}

export function CashbookSourceCategoryModal({
  open,
  type,
  editingCategory,
  onClose,
  onSaved,
}: CashbookSourceCategoryModalProps) {
  const { t } = useI18n();
  const createMutation = useCreateCashbookSourceCategory();
  const updateMutation = useUpdateCashbookSourceCategory();

  const isIncome = type === 'INCOME';

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { isSubmitting: formIsSubmitting },
  } = useForm<SourceCategoryFormValues>({
    defaultValues: {
      code: '',
      name: '',
      description: '',
    },
  });

  const isSubmitting =
    formIsSubmitting || createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!open) return;
    if (editingCategory) {
      reset({
        code: editingCategory.code,
        name: editingCategory.name,
        description: editingCategory.description || '',
      });
    } else {
      const prefix = isIncome ? 'INC-' : 'EXP-';
      reset({
        code: `${prefix}${Math.floor(100 + Math.random() * 900)}`,
        name: '',
        description: '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingCategory?.id, isIncome]);

  if (!open) return null;

  const onSubmit = async (values: SourceCategoryFormValues) => {
    const cleanCode = values.code.trim().toUpperCase();
    const cleanName = values.name.trim();
    const cleanDesc = values.description.trim();

    if (!cleanCode) {
      setError('code', { message: t('cashbook.valRequiredSourceCode') });
      return;
    }
    if (!cleanName) {
      setError('name', { message: t('cashbook.valRequiredSourceName') });
      return;
    }

    try {
      if (editingCategory) {
        const updated = await updateMutation.mutateAsync({
          id: editingCategory.id,
          data: {
            code: cleanCode,
            name: cleanName,
            description: cleanDesc,
          },
        });
        onSaved?.(updated);
      } else {
        const created = await createMutation.mutateAsync({
          type,
          code: cleanCode,
          name: cleanName,
          description: cleanDesc,
        });
        onSaved?.(created);
      }
      onClose();
    } catch {
      // Error toast is handled by mutation onError
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/65 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="font-display text-sm font-bold text-foreground">
            {editingCategory
              ? isIncome
                ? t('cashbook.sourceModalEditIncomeTitle')
                : t('cashbook.sourceModalEditExpenseTitle')
              : isIncome
                ? t('cashbook.sourceModalCreateIncomeTitle')
                : t('cashbook.sourceModalCreateExpenseTitle')}
          </h3>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-5">
          <RHFInput
            control={control}
            name="code"
            required
            disabled={isSubmitting}
            label={
              isIncome
                ? t('cashbook.fieldSourceCodeIncome')
                : t('cashbook.fieldSourceCodeExpense')
            }
            placeholder={t('cashbook.fieldSourceCodePlaceholder')}
            inputClassName="font-mono uppercase"
          />

          <RHFInput
            control={control}
            name="name"
            required
            disabled={isSubmitting}
            label={
              isIncome
                ? t('cashbook.fieldSourceNameIncome')
                : t('cashbook.fieldSourceNameExpense')
            }
            placeholder={
              isIncome
                ? t('cashbook.fieldSourceNamePlaceholderIncome')
                : t('cashbook.fieldSourceNamePlaceholderExpense')
            }
          />

          <RHFTextarea
            control={control}
            name="description"
            disabled={isSubmitting}
            rows={3}
            label={
              isIncome
                ? t('cashbook.fieldSourceDescIncome')
                : t('cashbook.fieldSourceDescExpense')
            }
            placeholder={t('cashbook.fieldSourceDescPlaceholder')}
          />

          <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={onClose}
            >
              {t('app.cancel')}
            </Button>
            <Button type="submit" loading={isSubmitting}>
              {t('app.save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
