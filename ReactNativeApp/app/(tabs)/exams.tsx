import React, { useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { toast } from 'burnt';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { ExamCard } from '@/components/exams/ExamCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { EmptyState } from '@/components/common/EmptyState';
import { theme } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import { useExams, useStartExam } from '@/hooks/useExams';
import { Exam } from '@/types';

export default function ExamsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { data: exams, isLoading, refetch } = useExams({ is_published: true });
  const startExamMutation = useStartExam();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const filteredExams = React.useMemo(() => {
    if (!exams) return [];
    if (!searchQuery) return exams;
    
    return exams.filter((exam: Exam) =>
      exam.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [exams, searchQuery]);

  const handleExamPress = async (exam: Exam) => {
    try {
      const attempt = await startExamMutation.mutateAsync(exam.id);
      toast({
        title: 'Exam started',
        preset: 'done',
      });
      // Navigate to exam screen
      // router.push(`/exam/${exam.id}?attemptId=${attempt.id}`);
      console.log('Exam started:', exam.id, attempt.id);
    } catch (error) {
      toast({
        title: 'Failed to start exam',
        preset: 'error',
      });
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, []);

  if (isLoading && !refreshing) {
    return <LoadingSpinner fullScreen text="Loading exams..." />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text variant="h2" weight="bold">
          Exams
        </Text>
        <Text variant="body" color="secondary" style={styles.subtitle}>
          Take exams to test your knowledge
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Input
          placeholder="Search exams..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="search"
          rightIcon={searchQuery ? 'close-circle' : undefined}
          onRightIconPress={() => setSearchQuery('')}
        />
      </View>

      {filteredExams.length === 0 ? (
        <EmptyState
          icon="document-text-outline"
          title="No exams available"
          description="Check back later for new exams"
        />
      ) : (
        <FlatList
          data={filteredExams}
          renderItem={({ item }) => (
            <ExamCard exam={item} onPress={() => handleExamPress(item)} />
          )}
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
  searchContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  list: {
    padding: theme.spacing.md,
  },
});
