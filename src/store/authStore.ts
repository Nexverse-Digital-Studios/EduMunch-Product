import { create } from 'zustand';
import { AuthUser, authService } from '@/services/auth.service';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  resetError: () => void;
  setUser: (user: AuthUser | null) => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(email, password);
      if (response.success && response.user) {
        set({ user: response.user, isAuthenticated: true, isLoading: false });
      } else {
        set({ error: response.error || 'Login failed', isLoading: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Login failed',
        isLoading: false,
      });
    }
  },

  signup: async (email: string, password: string, displayName: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.signup(email, password, displayName);
      if (response.success) {
        set({
          error: 'Signup successful! Check your email to verify your account.',
          isLoading: false,
        });
      } else {
        set({ error: response.error || 'Signup failed', isLoading: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Signup failed',
        isLoading: false,
      });
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.logout();
      if (response.success) {
        set({ user: null, isAuthenticated: false, isLoading: false });
      } else {
        set({ error: response.error || 'Logout failed', isLoading: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Logout failed',
        isLoading: false,
      });
    }
  },

  resetError: () => set({ error: null }),

  setUser: (user: AuthUser | null) => {
    set({ user, isAuthenticated: !!user });
  },

  initializeAuth: async () => {
    set({ isLoading: true });
    try {
      const user = await authService.getCurrentUser();
      set({ user, isAuthenticated: !!user, isLoading: false });

      // Subscribe to auth state changes
      authService.onAuthStateChange((user) => {
        set({ user, isAuthenticated: !!user });
      });
    } catch (error) {
      set({ isLoading: false });
    }
  },
}));
