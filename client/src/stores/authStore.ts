import { create } from 'zustand';
import type { User } from '../types/auth';

interface AuthState {
  user: User | null;
  /**
   * Deliberately held only in memory (Zustand's default, in-JS-heap state) —
   * never localStorage/sessionStorage. That keeps it out of reach of an XSS
   * payload that could read persisted storage. It's lost on a full page
   * reload by design; the refresh flow (httpOnly cookie) restores a session
   * on load instead of persisting the access token itself.
   */
  accessToken: string | null;
  /** Whether the initial session-restore (via the refresh cookie) has finished. */
  isInitialized: boolean;
  setAuth: (user: User, accessToken: string) => void;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
  setInitialized: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isInitialized: false,
  setAuth: (user, accessToken) => set({ user, accessToken }),
  setAccessToken: (accessToken) => set({ accessToken }),
  clearAuth: () => set({ user: null, accessToken: null }),
  setInitialized: () => set({ isInitialized: true }),
}));
