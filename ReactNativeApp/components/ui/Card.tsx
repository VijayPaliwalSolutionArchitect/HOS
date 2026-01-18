import React from 'react';
import { View, StyleSheet, ViewProps, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: keyof typeof theme.spacing;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  style,
  ...props
}) => {
  const { colors } = useTheme();

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: colors.card,
      borderRadius: theme.borderRadius['2xl'],
      padding: theme.spacing[padding],
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          ...theme.shadows.lg,
        };
      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: colors.border,
        };
      default:
        return {
          ...baseStyle,
          ...theme.shadows.sm,
        };
    }
  };

  return (
    <View style={[getCardStyle(), style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({});
