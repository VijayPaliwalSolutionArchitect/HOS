import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/components/ui/Text';
import { Input } from '@/components/ui/Input';
import { CourseList } from '@/components/courses/CourseList';
import { theme } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import { usePublishedCourses } from '@/hooks/useCourses';
import { Course } from '@/types';

export default function CoursesScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { data: courses, isLoading, refetch } = usePublishedCourses();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCourses = React.useMemo(() => {
    if (!courses) return [];
    if (!searchQuery) return courses;
    
    return courses.filter((course: Course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [courses, searchQuery]);

  const handleCoursePress = (course: Course) => {
    // Navigate to course detail
    // router.push(`/course/${course.id}`);
    console.log('Course pressed:', course.id);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text variant="h2" weight="bold">
          Courses
        </Text>
        <Text variant="body" color="secondary" style={styles.subtitle}>
          Explore and enroll in courses
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <Input
          placeholder="Search courses..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon="search"
          rightIcon={searchQuery ? 'close-circle' : undefined}
          onRightIconPress={() => setSearchQuery('')}
        />
      </View>

      <CourseList
        courses={filteredCourses}
        isLoading={isLoading}
        onRefresh={refetch}
        onCoursePress={handleCoursePress}
      />
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
});
