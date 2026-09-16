import { useMutation } from '@tanstack/react-query';
import { loginRequest } from '../services/auth.service';
import { useAuthStore } from '../stores/authStore';

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
    },
  });
}
