import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { LoginPayload } from '../../../api/types/auth.types';
import { getErrorMessage } from '../../../lib/utils';
import { useAuthContext } from '../context/AuthContext';

export function useAdminLogin() {
  const { login } = useAuthContext();

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
    onSuccess: (res) => {
      toast.success(`Chào mừng ${res.user.fullName} (${res.user.role.code})`);
    },
    onError: (err: unknown) => {
      toast.error(getErrorMessage(err, 'Đăng nhập thất bại'));
    },
  });
}
