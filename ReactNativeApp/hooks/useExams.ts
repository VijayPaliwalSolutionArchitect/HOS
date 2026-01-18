import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Exam, ExamAttempt } from '@/types';

/**
 * Hook to fetch all exams
 */
export const useExams = (filters?: any) => {
  return useQuery({
    queryKey: ['exams', filters],
    queryFn: async () => {
      const response = await apiClient.exams.list(filters);
      return response.data as Exam[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch a single exam
 */
export const useExam = (examId: string | undefined) => {
  return useQuery({
    queryKey: ['exams', examId],
    queryFn: async () => {
      if (!examId) throw new Error('Exam ID is required');
      const response = await apiClient.exams.get(examId);
      return response.data as Exam;
    },
    enabled: !!examId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to start an exam
 */
export const useStartExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (examId: string) => {
      const response = await apiClient.exams.start(examId);
      return response.data as ExamAttempt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attempts'] });
    },
  });
};

/**
 * Hook to sync exam answers
 */
export const useSyncExamAnswers = () => {
  return useMutation({
    mutationFn: async ({ attemptId, data }: { attemptId: string; data: any }) => {
      const response = await apiClient.attempts.sync(attemptId, data);
      return response.data;
    },
  });
};

/**
 * Hook to submit exam
 */
export const useSubmitExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attemptId: string) => {
      const response = await apiClient.attempts.submit(attemptId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attempts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

/**
 * Hook to fetch exam attempts (results)
 */
export const useExamAttempts = (filters?: any) => {
  return useQuery({
    queryKey: ['attempts', filters],
    queryFn: async () => {
      const response = await apiClient.attempts.list(filters);
      return response.data as ExamAttempt[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to fetch a single attempt
 */
export const useExamAttempt = (attemptId: string | undefined) => {
  return useQuery({
    queryKey: ['attempts', attemptId],
    queryFn: async () => {
      if (!attemptId) throw new Error('Attempt ID is required');
      const response = await apiClient.attempts.get(attemptId);
      return response.data as ExamAttempt;
    },
    enabled: !!attemptId,
  });
};
