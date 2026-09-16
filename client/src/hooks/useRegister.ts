import { useMutation } from '@tanstack/react-query';
import { registerRequest } from '../services/auth.service';

// Registration doesn't log the user in automatically — it returns to the
// login page with a success message, keeping the login flow as the single
// place that establishes a session.
export function useRegister() {
  return useMutation({
    mutationFn: registerRequest,
  });
}
