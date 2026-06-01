import { create } from 'zustand';
import * as authService from '../api/auth-service';
import type { AuthUser } from '../api/auth-service';
import { getAccessToken, clearTokens } from '../api/token-store';
import { queryClient } from '../api/query-client';

type AuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;

  /** Attempt to restore a previous session from secure storage. */
  restoreSession: () => Promise<void>;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: true,
  user: null,

  restoreSession: async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        set({ isAuthenticated: false, isLoading: false, user: null });
        return;
      }

      const session = await authService.getSession();
      set({
        isAuthenticated: true,
        isLoading: false,
        user: { id: session.userId, email: '', timezone: 'UTC' },
      });
    } catch {
      await clearTokens();
      set({ isAuthenticated: false, isLoading: false, user: null });
    }
  },

  login: async (email, password) => {
    const auth = await authService.login({ email, password });
    set({ isAuthenticated: true, user: auth.user });
  },

  register: async (email, password, name?) => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const auth = await authService.register({ email, password, name, timezone });
    set({ isAuthenticated: true, user: auth.user });
  },

  logout: async () => {
    await authService.logout();
    queryClient.clear();
    set({ isAuthenticated: false, user: null });
  },
}));
