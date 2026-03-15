import { create } from 'zustand';
import { secureStorage } from '../services/secureStorage';

interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  avatarUrl: string | null;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isLoading: boolean;

  setAuth: (
    tokens: { accessToken: string; refreshToken: string },
    user: AuthUser,
  ) => void;
  setUser: (user: AuthUser) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isLoading: true,

  setAuth: ({ accessToken, refreshToken }, user) => {
    secureStorage.setTokens(accessToken, refreshToken);
    set({ accessToken, refreshToken, user, isLoading: false });
  },

  setUser: (user) => set({ user }),

  logout: () => {
    secureStorage.clearTokens();
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      isLoading: false,
    });
  },

  setLoading: (isLoading) => set({ isLoading }),

  restoreSession: async () => {
    try {
      const { accessToken, refreshToken } = await secureStorage.getTokens();
      if (accessToken && refreshToken) {
        set({ accessToken, refreshToken, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
