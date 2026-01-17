import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authAPI } from '../lib/api';

/**
 * Auth Store - Manages authentication state
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.login({ email, password });
          const { access_token, refresh_token, user } = response.data;
          
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);
          
          set({
            user,
            accessToken: access_token,
            refreshToken: refresh_token,
            isAuthenticated: true,
            isLoading: false,
          });
          
          return { success: true, user };
        } catch (error) {
          const message = error.response?.data?.detail || 'Login failed';
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      // Register
      register: async (name, email, password, role = 'STUDENT') => {
        set({ isLoading: true, error: null });
        try {
          const response = await authAPI.register({ name, email, password, role });
          const { access_token, refresh_token, user } = response.data;
          
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);
          
          set({
            user,
            accessToken: access_token,
            refreshToken: refresh_token,
            isAuthenticated: true,
            isLoading: false,
          });
          
          return { success: true, user };
        } catch (error) {
          const message = error.response?.data?.detail || 'Registration failed';
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      // Logout
      logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
      },

      // Update user
      updateUser: (updates) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },

      // Clear error
      clearError: () => set({ error: null }),

      // Check auth
      checkAuth: async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return false;
        }
        
        try {
          const response = await authAPI.getMe();
          set({ user: response.data, isAuthenticated: true });
          return true;
        } catch (error) {
          get().logout();
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

/**
 * Exam Store - Manages exam attempt state
 */
export const useExamStore = create((set, get) => ({
  currentExam: null,
  currentAttempt: null,
  questions: [],
  answers: {},
  currentQuestionIndex: 0,
  timeRemaining: 0,
  isSubmitting: false,
  result: null,

  // Set exam data
  setExamData: (exam, attempt, questions, timeRemaining) => {
    set({
      currentExam: exam,
      currentAttempt: attempt,
      questions,
      answers: {},
      currentQuestionIndex: 0,
      timeRemaining,
      result: null,
    });
  },

  // Set answer
  setAnswer: (questionId, answer) => {
    set((state) => ({
      answers: { ...state.answers, [questionId]: answer },
    }));
  },

  // Navigate to question
  goToQuestion: (index) => {
    const { questions } = get();
    if (index >= 0 && index < questions.length) {
      set({ currentQuestionIndex: index });
    }
  },

  // Next question
  nextQuestion: () => {
    const { currentQuestionIndex, questions } = get();
    if (currentQuestionIndex < questions.length - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    }
  },

  // Previous question
  prevQuestion: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex > 0) {
      set({ currentQuestionIndex: currentQuestionIndex - 1 });
    }
  },

  // Update timer
  updateTimer: (seconds) => {
    set({ timeRemaining: seconds });
  },

  // Set result
  setResult: (result) => {
    set({ result, isSubmitting: false });
  },

  // Set submitting
  setSubmitting: (isSubmitting) => {
    set({ isSubmitting });
  },

  // Reset exam
  resetExam: () => {
    set({
      currentExam: null,
      currentAttempt: null,
      questions: [],
      answers: {},
      currentQuestionIndex: 0,
      timeRemaining: 0,
      isSubmitting: false,
      result: null,
    });
  },
}));

/**
 * UI Store - Manages UI state
 */
export const useUIStore = create((set) => ({
  sidebarOpen: true,
  theme: 'light',
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setTheme: (theme) => set({ theme }),
}));
