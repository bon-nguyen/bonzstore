import { useMutation } from '@tanstack/react-query';
import { LoginPayload } from '../../../api/types/auth.types';
import { useAuthContext } from '../context/AuthContext';

export function useAdminLogin() {
  const { login } = useAuthContext();

  return useMutation({
    mutationFn: (payload: LoginPayload) => login(payload),
  });
}

