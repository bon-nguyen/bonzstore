import {
  Building2,
  Image as ImageIcon,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  X,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { LogisticsUnit } from '../../../api/types/logistics.types';
import { Button } from '../../../components/ui/button';
import { FormField } from '../../../components/ui/form-field';
import { RHFInput } from '../../../components/ui/rhf-fields';
import { useI18n } from '../../i18n/I18nContext';
import { useCreateLogisticsUnit } from '../../logistics/hooks/useLogistics';

interface CreateLogisticsFormValues {
  name: string;
  shortName: string;
  phone: string;
  gmail: string;
  avatarUrl: string;
  address: string;
}

export interface ImportLogisticsCreateModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (unit: LogisticsUnit) => void;
}

export function ImportLogisticsCreateModal({
  open,
  onClose,
  onCreated,
}: ImportLogisticsCreateModalProps) {
  const { t } = useI18n();
  const createLogisticsMutation = useCreateLogisticsUnit();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateLogisticsFormValues>({
    defaultValues: {
      name: '',
      shortName: '',
      phone: '',
      gmail: '',
      avatarUrl: '',
      address: '',
    },
  });

  if (!open) return null;

  const onSubmit = async (values: CreateLogisticsFormValues) => {
    if (!values.name.trim()) return;
    const created = await createLogisticsMutation.mutateAsync({
      name: values.name.trim(),
      shortName: values.shortName.trim(),
      phone: values.phone.trim(),
      gmail: values.gmail.trim(),
      avatarUrl: values.avatarUrl.trim(),
      address: values.address.trim(),
    });
    reset();
    onCreated(created);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <Plus className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {t('importsForm.logisticsModalTitle')}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <FormField
            label={t('importsForm.logisticsNameLabel')}
            required
            error={errors.name?.message}
          >
            <RHFInput
              control={control}
              name="name"
              required
              autoFocus
              placeholder="VD: HÒa BÌnh logitics..."
              leftIcon={<Building2 className="h-4 w-4" />}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label={t('importsForm.logisticsShortNameLabel')}>
              <RHFInput
                control={control}
                name="shortName"
                placeholder="VD: HBL"
              />
            </FormField>

            <FormField label={t('importsForm.logisticsPhoneLabel')}>
              <RHFInput
                control={control}
                name="phone"
                placeholder="0909 xxx xxx"
                leftIcon={<Phone className="h-3.5 w-3.5" />}
              />
            </FormField>
          </div>

          <FormField label={t('importsForm.logisticsEmailLabel')}>
            <RHFInput
              control={control}
              name="gmail"
              placeholder="contact@logistics.com"
              leftIcon={<Mail className="h-4 w-4" />}
            />
          </FormField>

          <FormField label={t('importsForm.logisticsAvatarLabel')}>
            <RHFInput
              control={control}
              name="avatarUrl"
              placeholder="https://..."
              leftIcon={<ImageIcon className="h-4 w-4" />}
            />
          </FormField>

          <FormField label={t('importsForm.logisticsAddressLabel')}>
            <RHFInput
              control={control}
              name="address"
              placeholder="Địa chỉ kho nhận hàng..."
              leftIcon={<MapPin className="h-4 w-4" />}
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createLogisticsMutation.isPending}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {createLogisticsMutation.isPending && (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              )}
              {t('importsForm.saveAndSelectBtn')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

