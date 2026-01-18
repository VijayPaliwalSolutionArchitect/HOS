import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { Text } from '../ui/Text';
import { theme } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import { Exam } from '@/types';

interface ExamCardProps {
  exam: Exam;
  onPress?: () => void;
}

export const ExamCard: React.FC<ExamCardProps> = ({ exam, onPress }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card variant="elevated" padding="md" style={styles.card}>
        <View style={styles.header}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.secondary + '15' },
            ]}
          >
            <Ionicons name="document-text" size={24} color={colors.secondary} />
          </View>
          {exam.is_published && (
            <View style={[styles.badge, { backgroundColor: colors.success + '15' }]}>
              <Text
                variant="caption"
                style={{
                  color: colors.success,
                  fontWeight: theme.fontWeights.semibold,
                }}
              >
                Available
              </Text>
            </View>
          )}
        </View>
        <Text variant="h4" weight="semibold" numberOfLines={2} style={styles.title}>
          {exam.title}
        </Text>
        {exam.description && (
          <Text variant="bodySm" color="secondary" numberOfLines={2} style={styles.description}>
            {exam.description}
          </Text>
        )}
        <View style={styles.footer}>
          <View style={styles.meta}>
            <Ionicons name="time-outline" size={18} color={colors.text.secondary} />
            <Text variant="bodySm" color="secondary">
              {exam.duration_minutes} min
            </Text>
          </View>
          <View style={styles.meta}>
            <Ionicons name="help-circle-outline" size={18} color={colors.text.secondary} />
            <Text variant="bodySm" color="secondary">
              {exam.total_questions} questions
            </Text>
          </View>
          {exam.total_points && (
            <View style={styles.meta}>
              <Ionicons name="star-outline" size={18} color={colors.text.secondary} />
              <Text variant="bodySm" color="secondary">
                {exam.total_points} pts
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
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
