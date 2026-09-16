import { useEffect } from 'react';
import { refreshRequest, meRequest } from '../services/auth.service';
import { useAuthStore } from '../stores/authStore';

/**
 * The access token lives only in memory, so it's gone after a page reload.
 * On mount, we try to silently mint a new one from the httpOnly refresh
 * cookie (if any) and fetch the profile it belongs to. If there's no valid
 * refresh cookie, this just settles into "not logged in" — that's the
 * expected outcome for a first-time visitor, not an error.
 *
 * Call this once, near the root of the app (see App.tsx).
 */
export function useSessionBootstrap() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const setInitialized = useAuthStore((state) => state.setInitialized);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  useEffect(() => {
    if (isInitialized) return;

    let cancelled = false;

    async function restoreSession() {
      try {
        const { accessToken } = await refreshRequest();
        useAuthStore.getState().setAccessToken(accessToken);
        const { user } = await meRequest();
        if (!cancelled) setAuth(user, accessToken);
      } catch {
        // No valid session to restore — normal for a logged-out visitor.
      } finally {
        if (!cancelled) setInitialized();
      }
    }

    void restoreSession();

    return () => {
      cancelled = true;
    };
  }, [isInitialized, setAuth, setInitialized]);
}
