export const colors = {
  primary: {
    DEFAULT: '#4F46E5',
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },
  secondary: {
    DEFAULT: '#10B981',
    50: '#ECFDF5',
    100: '#D1FAE5',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
  },
  accent: {
    DEFAULT: '#F59E0B',
    50: '#FFFBEB',
    500: '#F59E0B',
    600: '#D97706',
  },
  background: {
    light: '#F8FAFC',
    dark: '#0F172A',
  },
  card: {
    light: '#FFFFFF',
    dark: '#1E293B',
  },
  border: {
    light: '#E2E8F0',
    dark: '#334155',
  },
  text: {
    primary: {
      light: '#0F172A',
      dark: '#F8FAFC',
    },
    secondary: {
      light: '#475569',
      dark: '#94A3B8',
    },
    tertiary: {
      light: '#64748B',
      dark: '#64748B',
    },
  },
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
};

export type ColorScheme = 'light' | 'dark';

export const getThemeColors = (scheme: ColorScheme) => ({
  background: colors.background[scheme],
  card: colors.card[scheme],
  border: colors.border[scheme],
  text: {
    primary: colors.text.primary[scheme],
    secondary: colors.text.secondary[scheme],
    tertiary: colors.text.tertiary[scheme],
  },
  primary: colors.primary.DEFAULT,
  secondary: colors.secondary.DEFAULT,
  accent: colors.accent.DEFAULT,
  success: colors.success,
  error: colors.error,
  warning: colors.warning,
  info: colors.info,
});
