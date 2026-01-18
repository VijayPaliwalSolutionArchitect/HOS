export interface Question {
  id: string;
  question_text: string;
  question_type: 'single_choice' | 'multiple_choice' | 'true_false';
  options: QuestionOption[];
  correct_answer?: string | string[];
  explanation?: string;
  category_id?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  points?: number;
  order_index?: number;
}

export interface QuestionOption {
  id: string;
  text: string;
  is_correct?: boolean;
}

export interface Exam {
  id: string;
  title: string;
  description?: string;
  course_id?: string;
  category_id?: string;
  duration_minutes: number;
  total_questions: number;
  total_points?: number;
  passing_score?: number;
  is_published: boolean;
  is_timed: boolean;
  allow_review: boolean;
  shuffle_questions: boolean;
  shuffle_options: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExamAttempt {
  id: string;
  user_id: string;
  exam_id: string;
  started_at: string;
  submitted_at?: string;
  time_spent_seconds?: number;
  score?: number;
  percentage?: number;
  passed?: boolean;
  answers: ExamAnswer[];
  status: 'in_progress' | 'submitted' | 'graded';
}

export interface ExamAnswer {
  question_id: string;
  selected_answer: string | string[];
  is_correct?: boolean;
  points_earned?: number;
  time_spent_seconds?: number;
}

export interface ExamResult {
  id: string;
  exam_id: string;
  exam_title: string;
  user_id: string;
  score: number;
  percentage: number;
  total_points: number;
  passed: boolean;
  time_spent_seconds: number;
  attempted_at: string;
  submitted_at: string;
  answers_breakdown: {
    correct: number;
    incorrect: number;
    skipped: number;
  };
}
