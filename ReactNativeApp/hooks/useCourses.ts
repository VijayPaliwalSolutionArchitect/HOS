import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Course } from '@/types';

/**
 * Hook to fetch all courses
 */
export const useCourses = (filters?: any) => {
  return useQuery({
    queryKey: ['courses', filters],
    queryFn: async () => {
      const response = await apiClient.courses.list(filters);
      return response.data as Course[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch a single course
 */
export const useCourse = (courseId: string | undefined) => {
  return useQuery({
    queryKey: ['courses', courseId],
    queryFn: async () => {
      if (!courseId) throw new Error('Course ID is required');
      const response = await apiClient.courses.get(courseId);
      return response.data as Course;
    },
    enabled: !!courseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch published courses only
 */
export const usePublishedCourses = () => {
  return useCourses({ is_published: true });
};
