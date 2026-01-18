import { create } from 'zustand';
import { Exam, ExamAttempt, ExamAnswer, Question } from '@/types';

interface ExamStore {
  currentExam: Exam | null;
  currentAttempt: ExamAttempt | null;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Map<string, ExamAnswer>;
  timeRemaining: number;
  isSubmitting: boolean;

  // Actions
  setExam: (exam: Exam) => void;
  setAttempt: (attempt: ExamAttempt) => void;
  setQuestions: (questions: Question[]) => void;
  setCurrentQuestionIndex: (index: number) => void;
  setAnswer: (questionId: string, answer: ExamAnswer) => void;
  setTimeRemaining: (time: number) => void;
  decrementTime: () => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  goToQuestion: (index: number) => void;
  clearExam: () => void;
  setSubmitting: (isSubmitting: boolean) => void;
}

export const useExamStore = create<ExamStore>((set, get) => ({
  currentExam: null,
  currentAttempt: null,
  questions: [],
  currentQuestionIndex: 0,
  answers: new Map(),
  timeRemaining: 0,
  isSubmitting: false,

  setExam: (exam) => {
    set({ currentExam: exam, timeRemaining: exam.duration_minutes * 60 });
  },

  setAttempt: (attempt) => {
    set({ currentAttempt: attempt });
    // Load existing answers if any
    if (attempt.answers) {
      const answersMap = new Map<string, ExamAnswer>();
      attempt.answers.forEach((answer) => {
        answersMap.set(answer.question_id, answer);
      });
      set({ answers: answersMap });
    }
  },

  setQuestions: (questions) => {
    set({ questions });
  },

  setCurrentQuestionIndex: (index) => {
    set({ currentQuestionIndex: index });
  },

  setAnswer: (questionId, answer) => {
    const { answers } = get();
    const newAnswers = new Map(answers);
    newAnswers.set(questionId, answer);
    set({ answers: newAnswers });
  },

  setTimeRemaining: (time) => {
    set({ timeRemaining: time });
  },

  decrementTime: () => {
    const { timeRemaining } = get();
    if (timeRemaining > 0) {
      set({ timeRemaining: timeRemaining - 1 });
    }
  },

  nextQuestion: () => {
    const { currentQuestionIndex, questions } = get();
    if (currentQuestionIndex < questions.length - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    }
  },

  previousQuestion: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex > 0) {
      set({ currentQuestionIndex: currentQuestionIndex - 1 });
    }
  },

  goToQuestion: (index) => {
    const { questions } = get();
    if (index >= 0 && index < questions.length) {
      set({ currentQuestionIndex: index });
    }
  },

  clearExam: () => {
    set({
      currentExam: null,
      currentAttempt: null,
      questions: [],
      currentQuestionIndex: 0,
      answers: new Map(),
      timeRemaining: 0,
      isSubmitting: false,
    });
  },

  setSubmitting: (isSubmitting) => {
    set({ isSubmitting });
  },
}));
