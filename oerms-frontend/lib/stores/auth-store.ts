import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/lib/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setUser: (user: User) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) => set({
        user,
        isAuthenticated: true,
        isLoading: false
      }),

      setAccessToken: (token) => set({
        accessToken: token
      }),

      logout: () => set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false
      }),

      hasRole: (role) => {
        const { user } = get();
        return user?.roles.includes(role as any) ?? false;
      },

      setLoading: (loading) => set({ isLoading: loading })
    }),
    {
      name: 'auth-storage',
      // Only persist user data, not tokens (tokens are in httpOnly cookies)
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
