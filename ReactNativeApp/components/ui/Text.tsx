import React from 'react';
import { Text as RNText, StyleSheet, TextProps as RNTextProps } from 'react-native';
import { theme } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

interface TextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'bodyLg' | 'bodySm' | 'caption';
  color?: 'primary' | 'secondary' | 'tertiary' | 'error' | 'success' | 'warning';
  align?: 'left' | 'center' | 'right';
  weight?: keyof typeof theme.fontWeights;
}

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'body',
  color,
  align = 'left',
  weight,
  style,
  ...props
}) => {
  const { colors } = useTheme();

  const getTextColor = () => {
    switch (color) {
      case 'primary':
        return colors.text.primary;
      case 'secondary':
        return colors.text.secondary;
      case 'tertiary':
        return colors.text.tertiary;
      case 'error':
        return colors.error;
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      default:
        return colors.text.primary;
    }
  };

  const variantStyle = theme.typography[variant];

  return (
    <RNText
      style={[
        styles.base,
        variantStyle,
        {
          color: getTextColor(),
          textAlign: align,
          fontWeight: weight ? theme.fontWeights[weight] : variantStyle.fontWeight,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  base: {
    // Base text styles
  },
});
