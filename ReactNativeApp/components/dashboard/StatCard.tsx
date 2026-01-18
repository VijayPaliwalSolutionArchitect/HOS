import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { Text } from '../ui/Text';
import { theme } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  color,
  trend,
}) => {
  const { colors } = useTheme();
  const cardColor = color || colors.primary;

  return (
    <Card variant="elevated" padding="md" style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: cardColor + '15' }]}>
          <Ionicons name={icon} size={24} color={cardColor} />
        </View>
        {trend && (
          <View style={styles.trend}>
            <Ionicons
              name={trend.isPositive ? 'trending-up' : 'trending-down'}
              size={16}
              color={trend.isPositive ? colors.success : colors.error}
            />
            <Text
              variant="bodySm"
              color={trend.isPositive ? 'success' : 'error'}
              style={styles.trendText}
            >
              {Math.abs(trend.value)}%
            </Text>
          </View>
        )}
      </View>
      <Text variant="h2" weight="bold" style={styles.value}>
        {value}
      </Text>
      <Text variant="bodySm" color="secondary">
        {label}
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 150,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontWeight: theme.fontWeights.semibold,
  },
  value: {
    marginBottom: theme.spacing.xs,
  },
});
