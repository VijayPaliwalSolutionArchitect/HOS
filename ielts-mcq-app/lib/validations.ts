import { z } from 'zod';

/**
 * Zod Validation Schemas
 * Centralized validation schemas for form inputs and API requests
 */

// ===========================================
// AUTH SCHEMAS
// ===========================================

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Registration form validation schema
 */
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one uppercase letter, one lowercase letter, and one number'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// ===========================================
// QUIZ SCHEMAS
// ===========================================

/**
 * Quiz set creation/edit schema
 */
export const quizSetSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  topic: z.enum(['READING', 'LISTENING', 'WRITING', 'SPEAKING', 'GENERAL', 'VOCABULARY', 'GRAMMAR']),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']),
  duration: z
    .number()
    .min(5, 'Duration must be at least 5 minutes')
    .max(180, 'Duration must be less than 180 minutes'),
  passScore: z
    .number()
    .min(0, 'Pass score must be at least 0')
    .max(100, 'Pass score must be at most 100'),
  tags: z.array(z.string()).optional(),
  active: z.boolean().optional(),
  featured: z.boolean().optional(),
});

export type QuizSetFormData = z.infer<typeof quizSetSchema>;

/**
 * Question option schema
 */
export const optionSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'Option text is required'),
  isCorrect: z.boolean(),
});

export type OptionData = z.infer<typeof optionSchema>;

/**
 * Question creation/edit schema
 */
export const questionSchema = z.object({
  text: z
    .string()
    .min(1, 'Question text is required')
    .min(10, 'Question must be at least 10 characters'),
  type: z.enum(['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_BLANK']),
  timeLimit: z
    .number()
    .min(0, 'Time limit cannot be negative')
    .max(300, 'Time limit must be less than 5 minutes'),
  explanation: z.string().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']),
  options: z
    .array(optionSchema)
    .min(2, 'At least 2 options are required')
    .max(6, 'Maximum 6 options allowed'),
});

export type QuestionFormData = z.infer<typeof questionSchema>;

// ===========================================
// ANSWER SCHEMAS
// ===========================================

/**
 * Answer submission schema
 */
export const answerSchema = z.object({
  questionId: z.string().uuid('Invalid question ID'),
  selectedOption: z.string().nullable(),
  timeSpent: z.number().min(0),
  confidence: z.number().min(1).max(5).optional(),
  flaggedForReview: z.boolean().optional(),
});

export type AnswerData = z.infer<typeof answerSchema>;

/**
 * Quiz submission schema
 */
export const quizSubmissionSchema = z.object({
  attemptId: z.string().uuid('Invalid attempt ID'),
  answers: z.array(answerSchema),
  totalTime: z.number().min(0),
});

export type QuizSubmissionData = z.infer<typeof quizSubmissionSchema>;

// ===========================================
// PROFILE SCHEMAS
// ===========================================

/**
 * Profile update schema
 */
export const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .optional(),
  bio: z
    .string()
    .max(200, 'Bio must be less than 200 characters')
    .optional(),
  targetBand: z
    .number()
    .min(1, 'Target band must be at least 1')
    .max(9, 'Target band must be at most 9')
    .optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),
  notifications: z.boolean().optional(),
  soundEnabled: z.boolean().optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// ===========================================
// SEARCH & FILTER SCHEMAS
// ===========================================

/**
 * Quiz search/filter schema
 */
export const quizFilterSchema = z.object({
  search: z.string().optional(),
  topic: z.enum(['READING', 'LISTENING', 'WRITING', 'SPEAKING', 'GENERAL', 'VOCABULARY', 'GRAMMAR']).optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']).optional(),
  sortBy: z.enum(['newest', 'popular', 'rating', 'duration']).optional(),
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(50).optional(),
});

export type QuizFilterData = z.infer<typeof quizFilterSchema>;
