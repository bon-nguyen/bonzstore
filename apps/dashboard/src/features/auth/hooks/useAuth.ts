import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { LoginPayload } from '../../../api/types/auth.types';
import { getErrorMessage } from '../../../lib/utils';
import { useI18n } from '../../i18n/I18nContext';
import { useAuthContext } from '../context/AuthContext';

export function useAdminLogin() {
  const { login } = useAuthContext();
  const { t } = useI18n();

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: (res) => {
      toast.success(
        t('api.loginSuccess', {
          name: res.user.fullName,
          role: res.user.role.code,
        }),
      );
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, t('api.loginError')));
    },
  });
}
