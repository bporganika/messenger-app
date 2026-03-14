import { create } from 'zustand';

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
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  isLoading: false,

  setAuth: ({ accessToken, refreshToken }, user) =>
    set({ accessToken, refreshToken, user, isLoading: false }),

  setUser: (user) => set({ user }),

  logout: () =>
    set({
      accessToken: null,
      refreshToken: null,
      user: null,
      isLoading: false,
    }),

  setLoading: (isLoading) => set({ isLoading }),
}));
