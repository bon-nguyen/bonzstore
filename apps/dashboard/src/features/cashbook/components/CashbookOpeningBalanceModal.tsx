import { X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Button } from '../../../components/ui/button';
import { RHFCurrencyInput } from '../../../components/ui/rhf-fields';
import { useI18n } from '../../i18n/I18nContext';
import { useUpdateOpeningBalance } from '../hooks/useCashbook';

interface OpeningBalanceFormValues {
  cash: number;
  card: number;
  transfer: number;
}

interface CashbookOpeningBalanceModalProps {
  open: boolean;
  initialValues: {
    cash: number;
    card: number;
    transfer: number;
  };
  onClose: () => void;
}

function formatVND(val: number): string {
  return `${Math.round(val || 0).toLocaleString('vi-VN')}₫`;
}

export function CashbookOpeningBalanceModal({
  open,
  initialValues,
  onClose,
}: CashbookOpeningBalanceModalProps) {
  const { t } = useI18n();
  const updateOpeningMutation = useUpdateOpeningBalance();
  const isSubmitting = updateOpeningMutation.isPending;

  const { control, handleSubmit, reset } = useForm<OpeningBalanceFormValues>({
    defaultValues: {
      cash: 0,
      card: 0,
      transfer: 0,
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        cash: initialValues.cash || 0,
        card: initialValues.card || 0,
        transfer: initialValues.transfer || 0,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const watchedCash = useWatch({ control, name: 'cash' }) || 0;
  const watchedCard = useWatch({ control, name: 'card' }) || 0;
  const watchedTransfer = useWatch({ control, name: 'transfer' }) || 0;
  const totalOpening =
    Number(watchedCash) + Number(watchedCard) + Number(watchedTransfer);

  if (!open) return null;

  const onSubmit = (values: OpeningBalanceFormValues) => {
    updateOpeningMutation.mutate(
      {
        cash: Number(values.cash || 0),
        card: Number(values.card || 0),
        transfer: Number(values.transfer || 0),
      },
      {
        onSuccess: () => onClose(),
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h3 className="font-display text-sm font-bold text-foreground">
              {t('cashbook.openingModalTitle')}
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {t('cashbook.openingModalSub')}
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 p-5">
          <RHFCurrencyInput
            control={control}
            name="cash"
            disabled={isSubmitting}
            label={t('cashbook.openingCashLabel')}
          />
          <RHFCurrencyInput
            control={control}
            name="card"
            disabled={isSubmitting}
            label={t('cashbook.openingCardLabel')}
          />
          <RHFCurrencyInput
            control={control}
            name="transfer"
            disabled={isSubmitting}
            label={t('cashbook.openingTransferLabel')}
          />

          <div className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 text-xs">
            <span className="font-semibold text-muted-foreground">
              {t('cashbook.openingTotalLabel')}
            </span>
            <span className="font-mono font-bold text-foreground">
              {formatVND(totalOpening)}
            </span>
          </div>

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
              {t('cashbook.openingSaveBtn')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

