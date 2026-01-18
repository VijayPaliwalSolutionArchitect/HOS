import { create } from 'zustand';
import { ColorScheme } from '@/theme';
import { storage } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/constants';
import { useColorScheme } from 'react-native';

interface ThemeStore {
  colorScheme: ColorScheme;
  isSystemTheme: boolean;

  // Actions
  setColorScheme: (scheme: ColorScheme) => void;
  setSystemTheme: (useSystem: boolean) => void;
  toggleTheme: () => void;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  colorScheme: 'light',
  isSystemTheme: true,

  setColorScheme: async (scheme) => {
    set({ colorScheme: scheme });
    await storage.setItem(STORAGE_KEYS.THEME, {
      colorScheme: scheme,
      isSystemTheme: get().isSystemTheme,
    });
  },

  setSystemTheme: async (useSystem) => {
    set({ isSystemTheme: useSystem });
    await storage.setItem(STORAGE_KEYS.THEME, {
      colorScheme: get().colorScheme,
      isSystemTheme: useSystem,
    });
  },

  toggleTheme: () => {
    const { colorScheme } = get();
    const newScheme: ColorScheme = colorScheme === 'light' ? 'dark' : 'light';
    get().setColorScheme(newScheme);
    get().setSystemTheme(false);
  },

  loadTheme: async () => {
    try {
      const savedTheme = await storage.getItem<{
        colorScheme: ColorScheme;
        isSystemTheme: boolean;
      }>(STORAGE_KEYS.THEME);

      if (savedTheme) {
        set({
          colorScheme: savedTheme.colorScheme,
          isSystemTheme: savedTheme.isSystemTheme,
        });
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  },
}));
