import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { theme } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  intensity?: number;
  padding?: keyof typeof theme.spacing;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  intensity = 20,
  padding = 'md',
  style,
  ...props
}) => {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.container,
        {
          borderRadius: theme.borderRadius['2xl'],
          overflow: 'hidden',
        },
        style,
      ]}
      {...props}
    >
      <BlurView
        intensity={intensity}
        tint={isDark ? 'dark' : 'light'}
        style={styles.blurView}
      >
        <View
          style={[
            styles.content,
            {
              backgroundColor: isDark
                ? 'rgba(30, 41, 59, 0.7)'
                : 'rgba(255, 255, 255, 0.7)',
              borderColor: isDark
                ? 'rgba(255, 255, 255, 0.1)'
                : 'rgba(0, 0, 0, 0.05)',
              padding: theme.spacing[padding],
            },
          ]}
        >
          {children}
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...theme.shadows.lg,
  },
  blurView: {
    flex: 1,
  },
  content: {
    flex: 1,
    borderWidth: 1,
    borderRadius: theme.borderRadius['2xl'],
  },
});
