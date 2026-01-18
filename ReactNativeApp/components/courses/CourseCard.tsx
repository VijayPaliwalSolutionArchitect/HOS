import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { Text } from '../ui/Text';
import { theme } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import { Course } from '@/types';
import { getDifficultyColor } from '@/lib/utils';

interface CourseCardProps {
  course: Course;
  onPress?: () => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onPress }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card variant="elevated" padding="md" style={styles.card}>
        <View style={styles.header}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.primary + '15' },
            ]}
          >
            <Ionicons name="book" size={24} color={colors.primary} />
          </View>
          {course.difficulty && (
            <View
              style={[
                styles.badge,
                { backgroundColor: getDifficultyColor(course.difficulty) + '15' },
              ]}
            >
              <Text
                variant="caption"
                style={{
                  color: getDifficultyColor(course.difficulty),
                  fontWeight: theme.fontWeights.semibold,
                }}
              >
                {course.difficulty}
              </Text>
            </View>
          )}
        </View>
        <Text variant="h4" weight="semibold" numberOfLines={2} style={styles.title}>
          {course.title}
        </Text>
        <Text variant="bodySm" color="secondary" numberOfLines={2} style={styles.description}>
          {course.description}
        </Text>
        <View style={styles.footer}>
          {course.instructor_name && (
            <View style={styles.meta}>
              <Ionicons name="person" size={16} color={colors.text.secondary} />
              <Text variant="caption" color="secondary">
                {course.instructor_name}
              </Text>
            </View>
          )}
          {course.duration_hours && (
            <View style={styles.meta}>
              <Ionicons name="time" size={16} color={colors.text.secondary} />
              <Text variant="caption" color="secondary">
                {course.duration_hours}h
              </Text>
            </View>
          )}
          {course.enrollment_count && (
            <View style={styles.meta}>
              <Ionicons name="people" size={16} color={colors.text.secondary} />
              <Text variant="caption" color="secondary">
                {course.enrollment_count}
              </Text>
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: theme.spacing.md,
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
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.md,
  },
  title: {
    marginBottom: theme.spacing.sm,
  },
  description: {
    marginBottom: theme.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
