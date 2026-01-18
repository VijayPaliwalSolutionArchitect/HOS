import React from 'react';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import { CourseCard } from './CourseCard';
import { EmptyState } from '../common/EmptyState';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Course } from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { theme } from '@/theme';

interface CourseListProps {
  courses: Course[];
  isLoading?: boolean;
  isRefreshing?: boolean;
  onRefresh?: () => void;
  onCoursePress?: (course: Course) => void;
  onEndReached?: () => void;
}

export const CourseList: React.FC<CourseListProps> = ({
  courses,
  isLoading,
  isRefreshing,
  onRefresh,
  onCoursePress,
  onEndReached,
}) => {
  const { colors } = useTheme();

  if (isLoading && !isRefreshing) {
    return <LoadingSpinner text="Loading courses..." />;
  }

  if (!isLoading && courses.length === 0) {
    return (
      <EmptyState
        icon="book-outline"
        title="No courses available"
        description="Check back later for new courses"
      />
    );
  }

  return (
    <FlatList
      data={courses}
      renderItem={({ item }) => (
        <CourseCard course={item} onPress={() => onCoursePress?.(item)} />
      )}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing || false}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        ) : undefined
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: theme.spacing.md,
  },
});
