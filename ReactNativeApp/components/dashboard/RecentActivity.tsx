import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { Text } from '../ui/Text';
import { theme } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import { RecentActivity as RecentActivityType } from '@/types';
import { formatRelativeTime } from '@/lib/utils';

interface RecentActivityProps {
  activities: RecentActivityType[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const { colors } = useTheme();

  const getActivityIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'exam_completed':
        return 'checkmark-circle';
      case 'course_enrolled':
        return 'book';
      case 'achievement':
        return 'trophy';
      case 'level_up':
        return 'arrow-up-circle';
      default:
        return 'flash';
    }
  };

  const getActivityColor = (type: string): string => {
    switch (type) {
      case 'exam_completed':
        return colors.success;
      case 'course_enrolled':
        return colors.primary;
      case 'achievement':
        return colors.accent;
      case 'level_up':
        return colors.secondary;
      default:
        return colors.text.secondary;
    }
  };

  const renderActivity = ({ item }: { item: RecentActivityType }) => {
    const iconColor = getActivityColor(item.type);

    return (
      <View style={styles.activityItem}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
          <Ionicons name={getActivityIcon(item.type)} size={20} color={iconColor} />
        </View>
        <View style={styles.activityContent}>
          <Text variant="body" weight="medium">
            {item.title}
          </Text>
          <Text variant="bodySm" color="secondary">
            {item.description}
          </Text>
          <Text variant="caption" color="tertiary" style={styles.timestamp}>
            {formatRelativeTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Card variant="elevated" padding="md">
      <Text variant="h4" weight="semibold" style={styles.title}>
        Recent Activity
      </Text>
      <FlatList
        data={activities}
        renderItem={renderActivity}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  title: {
    marginBottom: theme.spacing.md,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  timestamp: {
    marginTop: theme.spacing.xs,
  },
  separator: {
    height: theme.spacing.md,
  },
});
