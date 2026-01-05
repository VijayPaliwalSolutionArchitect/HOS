/**
 * Quiz State Management Hook
 * 
 * Uses Zustand for state management with localStorage persistence.
 * Handles the entire quiz-taking flow including:
 * - Question navigation
 * - Answer selection
 * - Timer state
 * - Pause/resume functionality
 * - Flag questions for review
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ===========================================
// TYPES
// ===========================================

export interface QuizQuestion {
  id: string;
  order: number;
  text: string;
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_BLANK';
  timeLimit: number;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation?: string;
  imageUrl?: string;
  audioUrl?: string;
}

export interface QuizAnswer {
  questionId: string;
  selectedOption: string | null;
  timeSpent: number;
  flaggedForReview: boolean;
  answeredAt: number; // timestamp
}

export interface QuizState {
  // Quiz metadata
  attemptId: string | null;
  quizSetId: string | null;
  quizTitle: string;
  totalQuestions: number;
  duration: number; // in minutes
  
  // Questions
  questions: QuizQuestion[];
  
  // Navigation state
  currentIndex: number;
  
  // Answers
  answers: Record<string, QuizAnswer>;
  
  // Timer state
  startTime: number; // timestamp when quiz started
  elapsedTime: number; // in seconds
  isPaused: boolean;
  pausedAt: number | null; // timestamp when paused
  totalPausedTime: number; // total paused duration in seconds
  
  // Quiz status
  isStarted: boolean;
  isCompleted: boolean;
  isSubmitting: boolean;
  
  // Actions
  initQuiz: (data: {
    attemptId: string;
    quizSetId: string;
    quizTitle: string;
    questions: QuizQuestion[];
    duration: number;
  }) => void;
  
  selectAnswer: (questionId: string, optionId: string) => void;
  clearAnswer: (questionId: string) => void;
  toggleFlag: (questionId: string) => void;
  
  nextQuestion: () => void;
  previousQuestion: () => void;
  goToQuestion: (index: number) => void;
  
  updateElapsedTime: (seconds: number) => void;
  pause: () => void;
  resume: () => void;
  
  setSubmitting: (submitting: boolean) => void;
  complete: () => void;
  reset: () => void;
}

// ===========================================
// INITIAL STATE
// ===========================================

const initialState = {
  attemptId: null,
  quizSetId: null,
  quizTitle: '',
  totalQuestions: 0,
  duration: 30,
  questions: [],
  currentIndex: 0,
  answers: {},
  startTime: 0,
  elapsedTime: 0,
  isPaused: false,
  pausedAt: null,
  totalPausedTime: 0,
  isStarted: false,
  isCompleted: false,
  isSubmitting: false,
};

// ===========================================
// STORE
// ===========================================

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      /**
       * Initialize quiz with questions and metadata
       */
      initQuiz: (data) => {
        set({
          attemptId: data.attemptId,
          quizSetId: data.quizSetId,
          quizTitle: data.quizTitle,
          questions: data.questions,
          totalQuestions: data.questions.length,
          duration: data.duration,
          currentIndex: 0,
          answers: {},
          startTime: Date.now(),
          elapsedTime: 0,
          isPaused: false,
          pausedAt: null,
          totalPausedTime: 0,
          isStarted: true,
          isCompleted: false,
          isSubmitting: false,
        });
      },
      
      /**
       * Select an answer for a question
       */
      selectAnswer: (questionId, optionId) => {
        const state = get();
        const existingAnswer = state.answers[questionId];
        const currentQuestion = state.questions[state.currentIndex];
        
        // Calculate time spent on this question
        const previousTimeSpent = existingAnswer?.timeSpent || 0;
        const additionalTime = existingAnswer?.answeredAt
          ? Math.floor((Date.now() - existingAnswer.answeredAt) / 1000)
          : 0;
        
        set({
          answers: {
            ...state.answers,
            [questionId]: {
              questionId,
              selectedOption: optionId,
              timeSpent: previousTimeSpent + additionalTime,
              flaggedForReview: existingAnswer?.flaggedForReview || false,
              answeredAt: Date.now(),
            },
          },
        });
      },
      
      /**
       * Clear answer for a question
       */
      clearAnswer: (questionId) => {
        const state = get();
        const existingAnswer = state.answers[questionId];
        
        if (existingAnswer) {
          set({
            answers: {
              ...state.answers,
              [questionId]: {
                ...existingAnswer,
                selectedOption: null,
              },
            },
          });
        }
      },
      
      /**
       * Toggle flag for review on a question
       */
      toggleFlag: (questionId) => {
        const state = get();
        const existingAnswer = state.answers[questionId];
        
        set({
          answers: {
            ...state.answers,
            [questionId]: {
              questionId,
              selectedOption: existingAnswer?.selectedOption || null,
              timeSpent: existingAnswer?.timeSpent || 0,
              flaggedForReview: !existingAnswer?.flaggedForReview,
              answeredAt: existingAnswer?.answeredAt || Date.now(),
            },
          },
        });
      },
      
      /**
       * Navigate to next question
       */
      nextQuestion: () => {
        const state = get();
        if (state.currentIndex < state.questions.length - 1) {
          set({ currentIndex: state.currentIndex + 1 });
        }
      },
      
      /**
       * Navigate to previous question
       */
      previousQuestion: () => {
        const state = get();
        if (state.currentIndex > 0) {
          set({ currentIndex: state.currentIndex - 1 });
        }
      },
      
      /**
       * Jump to specific question
       */
      goToQuestion: (index) => {
        const state = get();
        if (index >= 0 && index < state.questions.length) {
          set({ currentIndex: index });
        }
      },
      
      /**
       * Update elapsed time
       */
      updateElapsedTime: (seconds) => {
        set({ elapsedTime: seconds });
      },
      
      /**
       * Pause the quiz
       */
      pause: () => {
        const state = get();
        if (!state.isPaused) {
          set({
            isPaused: true,
            pausedAt: Date.now(),
          });
        }
      },
      
      /**
       * Resume the quiz
       */
      resume: () => {
        const state = get();
        if (state.isPaused && state.pausedAt) {
          const pausedDuration = Math.floor((Date.now() - state.pausedAt) / 1000);
          set({
            isPaused: false,
            pausedAt: null,
            totalPausedTime: state.totalPausedTime + pausedDuration,
          });
        }
      },
      
      /**
       * Set submitting state
       */
      setSubmitting: (submitting) => {
        set({ isSubmitting: submitting });
      },
      
      /**
       * Mark quiz as completed
       */
      complete: () => {
        set({
          isCompleted: true,
          isSubmitting: false,
        });
      },
      
      /**
       * Reset quiz state
       */
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'ielts-quiz-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist specific fields for quiz recovery
      partialize: (state) => ({
        attemptId: state.attemptId,
        quizSetId: state.quizSetId,
        quizTitle: state.quizTitle,
        questions: state.questions,
        totalQuestions: state.totalQuestions,
        duration: state.duration,
        currentIndex: state.currentIndex,
        answers: state.answers,
        startTime: state.startTime,
        elapsedTime: state.elapsedTime,
        totalPausedTime: state.totalPausedTime,
        isStarted: state.isStarted,
        isCompleted: state.isCompleted,
      }),
    }
  )
);

// ===========================================
// SELECTOR HOOKS
// ===========================================

/**
 * Get current question
 */
export const useCurrentQuestion = () => {
  return useQuizStore((state) => state.questions[state.currentIndex]);
};

/**
 * Get answer for current question
 */
export const useCurrentAnswer = () => {
  return useQuizStore((state) => {
    const question = state.questions[state.currentIndex];
    return question ? state.answers[question.id] : undefined;
  });
};

/**
 * Get quiz progress stats
 */
export const useQuizProgress = () => {
  return useQuizStore((state) => {
    const answeredCount = Object.values(state.answers).filter(
      (a) => a.selectedOption !== null
    ).length;
    const flaggedCount = Object.values(state.answers).filter(
      (a) => a.flaggedForReview
    ).length;
    
    return {
      current: state.currentIndex + 1,
      total: state.totalQuestions,
      answered: answeredCount,
      flagged: flaggedCount,
      percentage: state.totalQuestions > 0 
        ? Math.round((answeredCount / state.totalQuestions) * 100)
        : 0,
    };
  });
};

/**
 * Get remaining time in seconds
 */
export const useRemainingTime = () => {
  return useQuizStore((state) => {
    const totalSeconds = state.duration * 60;
    const remaining = totalSeconds - state.elapsedTime;
    return Math.max(0, remaining);
  });
};
