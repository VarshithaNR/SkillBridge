import { useMutation } from '@tanstack/react-query';
import { logoutRequest } from '../services/auth.service';
import { useAuthStore } from '../stores/authStore';

export function useLogout() {
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: logoutRequest,
    // Clear local state even if the network call fails — the user asked to
    // log out, and it should never appear to hang or fail from their side.
    onSettled: () => clearAuth(),
  });
}
