export interface Course {
  id: string;
  title: string;
  description: string;
  category_id?: string;
  instructor_id: string;
  instructor_name?: string;
  thumbnail_url?: string;
  duration_hours?: number;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  is_published: boolean;
  price?: number;
  enrollment_count?: number;
  rating?: number;
  created_at: string;
  updated_at: string;
}

export interface CourseEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  progress?: number;
  completed?: boolean;
  completed_at?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  icon?: string;
  order_index?: number;
}
