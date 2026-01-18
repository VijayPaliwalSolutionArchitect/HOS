import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { theme } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  style,
  onPress,
  ...props
}) => {
  const { colors, isDark } = useTheme();

  const handlePress = async (e: any) => {
    if (disabled || isLoading) return;
    
    // Haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (onPress) {
      onPress(e);
    }
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.base,
      ...styles[size],
    };

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: colors.primary,
          ...theme.shadows.md,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: colors.secondary,
          ...theme.shadows.md,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: colors.border,
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      ...styles.text,
      ...styles[`text_${size}` as keyof typeof styles],
      fontWeight: theme.fontWeights.medium,
    };

    switch (variant) {
      case 'primary':
      case 'secondary':
        return {
          ...baseStyle,
          color: '#FFFFFF',
        };
      case 'outline':
      case 'ghost':
        return {
          ...baseStyle,
          color: colors.text.primary,
        };
      default:
        return baseStyle;
    }
  };

  return (
    <TouchableOpacity
      style={[
        getButtonStyle(),
        (disabled || isLoading) && styles.disabled,
        style,
      ]}
      onPress={handlePress}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'secondary' ? '#FFFFFF' : colors.primary}
        />
      ) : (
        <>
          {leftIcon}
          <Text style={getTextStyle()}>{title}</Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.sm,
  },
  sm: {
    height: 36,
    paddingHorizontal: theme.spacing.md,
  },
  md: {
    height: 44,
    paddingHorizontal: theme.spacing.lg,
  },
  lg: {
    height: 52,
    paddingHorizontal: theme.spacing.xl,
  },
  text: {
    textAlign: 'center',
  },
  text_sm: {
    fontSize: theme.fontSizes.sm,
  },
  text_md: {
    fontSize: theme.fontSizes.base,
  },
  text_lg: {
    fontSize: theme.fontSizes.lg,
  },
  disabled: {
    opacity: 0.5,
  },
});
