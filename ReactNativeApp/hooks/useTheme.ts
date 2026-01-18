import { useThemeStore } from '@/store/themeStore';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { useEffect } from 'react';
import { getThemeColors, ColorScheme } from '@/theme';

export const useTheme = () => {
  const systemColorScheme = useRNColorScheme();
  const { colorScheme, isSystemTheme, setColorScheme, setSystemTheme, toggleTheme, loadTheme } =
    useThemeStore();

  // Load theme on mount
  useEffect(() => {
    loadTheme();
  }, []);

  // Update theme when system theme changes (if using system theme)
  useEffect(() => {
    if (isSystemTheme && systemColorScheme) {
      setColorScheme(systemColorScheme as ColorScheme);
    }
  }, [systemColorScheme, isSystemTheme]);

  const activeColorScheme = isSystemTheme && systemColorScheme
    ? (systemColorScheme as ColorScheme)
    : colorScheme;

  const colors = getThemeColors(activeColorScheme);
  const isDark = activeColorScheme === 'dark';

  return {
    colorScheme: activeColorScheme,
    colors,
    isDark,
    isSystemTheme,
    toggleTheme,
    setColorScheme,
    setSystemTheme,
  };
};
