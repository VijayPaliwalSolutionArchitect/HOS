import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Card } from '../ui/Card';
import { Text } from '../ui/Text';
import { theme } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

interface PerformanceChartProps {
  data: {
    labels: string[];
    values: number[];
  };
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
  const { colors } = useTheme();
  const chartWidth = Dimensions.get('window').width - theme.spacing.xl * 2;

  // Simple bar chart implementation
  const maxValue = Math.max(...data.values, 100);
  const barWidth = (chartWidth - theme.spacing.md * (data.values.length - 1)) / data.values.length;

  return (
    <Card variant="elevated" padding="md">
      <Text variant="h4" weight="semibold" style={styles.title}>
        Performance Trend
      </Text>
      <View style={styles.chart}>
        {data.values.map((value, index) => {
          const height = (value / maxValue) * 150;
          return (
            <View key={index} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height,
                      width: barWidth - 8,
                      backgroundColor: colors.primary,
                    },
                  ]}
                />
              </View>
              <Text variant="caption" color="secondary" style={styles.label}>
                {data.labels[index]}
              </Text>
              <Text variant="bodySm" weight="medium" style={styles.value}>
                {value}%
              </Text>
            </View>
          );
        })}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  title: {
    marginBottom: theme.spacing.lg,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 200,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  barWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center',
  },
  bar: {
    borderTopLeftRadius: theme.borderRadius.sm,
    borderTopRightRadius: theme.borderRadius.sm,
  },
  label: {
    marginTop: theme.spacing.xs,
  },
  value: {
    marginTop: 2,
  },
});
