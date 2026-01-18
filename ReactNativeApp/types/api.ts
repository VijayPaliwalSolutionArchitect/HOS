export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface DashboardStats {
  xp: number;
  level: number;
  streak: number;
  courses_enrolled: number;
  exams_completed?: number;
  average_score?: number;
  total_study_time?: number;
}

export interface RecentActivity {
  id: string;
  type: 'exam_completed' | 'course_enrolled' | 'achievement' | 'level_up';
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface PerformanceData {
  labels: string[];
  scores: number[];
  dates: string[];
}
