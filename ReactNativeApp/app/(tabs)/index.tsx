import React from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { PerformanceChart } from '@/components/dashboard/PerformanceChart';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { theme } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardStats, useRecentActivity } from '@/hooks/useApi';

export default function DashboardScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useDashboardStats();
  const { data: activities, isLoading: activitiesLoading, refetch: refetchActivities } = useRecentActivity(5);

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchStats(), refetchActivities()]);
    setRefreshing(false);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (statsLoading && !refreshing) {
    return <LoadingSpinner fullScreen text="Loading dashboard..." />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text variant="caption" color="secondary">
              {getGreeting()}, 👋
            </Text>
            <Text variant="h2" weight="bold" style={styles.userName}>
              {user?.full_name || 'Student'}
            </Text>
          </View>
          <View
            style={[
              styles.avatarContainer,
              { backgroundColor: colors.primary + '15' },
            ]}
          >
            <Ionicons name="person" size={28} color={colors.primary} />
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <StatCard
            label="Total XP"
            value={stats?.xp || 0}
            icon="flash"
            color={colors.accent}
          />
          <StatCard
            label="Level"
            value={stats?.level || 1}
            icon="trending-up"
            color={colors.primary}
          />
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            label="Day Streak"
            value={stats?.streak || 0}
            icon="flame"
            color={colors.error}
          />
          <StatCard
            label="Courses"
            value={stats?.courses_enrolled || 0}
            icon="book"
            color={colors.secondary}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text variant="h4" weight="semibold" style={styles.sectionTitle}>
            Quick Actions
          </Text>
          <View style={styles.quickActions}>
            <Button
              title="Browse Courses"
              variant="primary"
              leftIcon={<Ionicons name="book" size={20} color="#FFF" />}
              onPress={() => router.push('/(tabs)/courses')}
              style={styles.actionButton}
            />
            <Button
              title="Take Exam"
              variant="secondary"
              leftIcon={<Ionicons name="document-text" size={20} color="#FFF" />}
              onPress={() => router.push('/(tabs)/exams')}
              style={styles.actionButton}
            />
          </View>
        </View>

        {/* Performance Chart */}
        {stats && (
          <View style={styles.section}>
            <PerformanceChart
              data={{
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
                values: [85, 78, 92, 88, 95],
              }}
            />
          </View>
        )}

        {/* Recent Activity */}
        {activities && activities.length > 0 && (
          <View style={styles.section}>
            <RecentActivity activities={activities} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  userName: {
    marginTop: 4,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  section: {
    marginTop: theme.spacing.lg,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
