import React from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { theme } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import { useExamAttempts } from '@/hooks/useExams';
import { ExamAttempt } from '@/types';
import { formatDate } from '@/lib/utils';

export default function ResultsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { data: attempts, isLoading, refetch } = useExamAttempts({ status: 'submitted' });
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, []);

  const handleResultPress = (attempt: ExamAttempt) => {
    // Navigate to result detail
    // router.push(`/result/${attempt.id}`);
    console.log('Result pressed:', attempt.id);
  };

  const renderResult = ({ item }: { item: ExamAttempt }) => {
    const passed = item.passed || false;
    const statusColor = passed ? colors.success : colors.error;

    return (
      <TouchableOpacity onPress={() => handleResultPress(item)} activeOpacity={0.7}>
        <Card variant="elevated" padding="md" style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
              <Ionicons
                name={passed ? 'checkmark-circle' : 'close-circle'}
                size={20}
                color={statusColor}
              />
              <Text
                variant="bodySm"
                weight="semibold"
                style={{ color: statusColor }}
              >
                {passed ? 'Passed' : 'Failed'}
              </Text>
            </View>
            <Text variant="caption" color="secondary">
              {formatDate(item.submitted_at || item.started_at)}
            </Text>
          </View>

          <Text variant="h4" weight="semibold" style={styles.examTitle}>
            Exam Result
          </Text>

          <View style={styles.scoreContainer}>
            <View style={styles.scoreItem}>
              <Text variant="h2" weight="bold" style={{ color: colors.primary }}>
                {item.percentage || 0}%
              </Text>
              <Text variant="caption" color="secondary">
                Score
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.scoreItem}>
              <Text variant="h4" weight="semibold">
                {Math.floor((item.time_spent_seconds || 0) / 60)}m
              </Text>
              <Text variant="caption" color="secondary">
                Time
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  if (isLoading && !refreshing) {
    return <LoadingSpinner fullScreen text="Loading results..." />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text variant="h2" weight="bold">
          Results
        </Text>
        <Text variant="body" color="secondary" style={styles.subtitle}>
          View your exam performance
        </Text>
      </View>

      {!attempts || attempts.length === 0 ? (
        <EmptyState
          icon="bar-chart-outline"
          title="No results yet"
          description="Complete an exam to see your results here"
          actionLabel="Take an Exam"
          onAction={() => router.push('/(tabs)/exams')}
        />
      ) : (
        <FlatList
          data={attempts}
          renderItem={renderResult}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  subtitle: {
    marginTop: 4,
  },
  list: {
    padding: theme.spacing.md,
  },
  resultCard: {
    marginBottom: theme.spacing.md,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.md,
  },
  examTitle: {
    marginBottom: theme.spacing.md,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  scoreItem: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#E2E8F0',
  },
  footer: {
    alignItems: 'flex-end',
  },
});
