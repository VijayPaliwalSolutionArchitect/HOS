import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Text } from '../ui/Text';
import { theme } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  text?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  text,
  fullScreen = false,
}) => {
  const { colors } = useTheme();

  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, { backgroundColor: colors.background }]}>
        <ActivityIndicator size={size} color={colors.primary} />
        {text && (
          <Text variant="body" color="secondary" style={styles.text}>
            {text}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={colors.primary} />
      {text && (
        <Text variant="body" color="secondary" style={styles.text}>
          {text}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  text: {
    marginTop: theme.spacing.md,
  },
});
