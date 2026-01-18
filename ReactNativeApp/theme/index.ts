export * from './colors';
export * from './typography';
export * from './spacing';

import { colors, getThemeColors, ColorScheme } from './colors';
import { typography, fontWeights, fontSizes, lineHeights, fontFamilies } from './typography';
import { spacing, borderRadius, shadows } from './spacing';

export const theme = {
  colors,
  typography,
  fontWeights,
  fontSizes,
  lineHeights,
  fontFamilies,
  spacing,
  borderRadius,
  shadows,
  getThemeColors,
};

export type Theme = typeof theme;
export type { ColorScheme };

export default theme;
