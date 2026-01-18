import { create } from 'zustand';
import { User, AuthTokens } from '@/types';
import { tokenStorage, storage } from '@/lib/storage';
import { apiClient } from '@/lib/api';
import { STORAGE_KEYS } from '@/lib/constants';

interface AuthStore {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; full_name: string }) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });

      const response = await apiClient.auth.login(email, password);
      const { access_token, refresh_token, token_type } = response.data;

      const tokens: AuthTokens = {
        access_token,
        refresh_token,
        token_type,
      };

      // Save tokens
      await tokenStorage.saveTokens(access_token, refresh_token);

      // Fetch user data
      const userResponse = await apiClient.auth.me();
      const user = userResponse.data;

      // Save user to storage
      await storage.setItem(STORAGE_KEYS.USER, user);

      set({
        user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Login failed';
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (data) => {
    try {
      set({ isLoading: true, error: null });

      const response = await apiClient.auth.register(data);
      const { access_token, refresh_token, token_type } = response.data;

      const tokens: AuthTokens = {
        access_token,
        refresh_token,
        token_type,
      };

      // Save tokens
      await tokenStorage.saveTokens(access_token, refresh_token);

      // Fetch user data
      const userResponse = await apiClient.auth.me();
      const user = userResponse.data;

      // Save user to storage
      await storage.setItem(STORAGE_KEYS.USER, user);

      set({
        user,
        tokens,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Registration failed';
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      // Clear tokens
      await tokenStorage.clearTokens();
      await storage.removeItem(STORAGE_KEYS.USER);

      set({
        user: null,
        tokens: null,
        isAuthenticated: false,
        error: null,
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  loadUser: async () => {
    try {
      set({ isLoading: true });

      // Check if tokens exist
      const accessToken = await tokenStorage.getAccessToken();
      if (!accessToken) {
        set({ isLoading: false });
        return;
      }

      // Load user from storage first (for quick UI update)
      const cachedUser = await storage.getItem<User>(STORAGE_KEYS.USER);
      if (cachedUser) {
        set({
          user: cachedUser,
          isAuthenticated: true,
        });
      }

      // Fetch fresh user data
      const userResponse = await apiClient.auth.me();
      const user = userResponse.data;

      // Update storage
      await storage.setItem(STORAGE_KEYS.USER, user);

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Load user error:', error);
      // If loading fails, clear auth state
      await get().logout();
      set({ isLoading: false });
    }
  },

  refreshUser: async () => {
    try {
      const userResponse = await apiClient.auth.me();
      const user = userResponse.data;

      await storage.setItem(STORAGE_KEYS.USER, user);

      set({ user });
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  },

  setUser: (user) => {
    set({ user });
  },

  clearError: () => {
    set({ error: null });
  },
}));
