export interface TutorStudentMatch {
  id: string;
  tutor_id: string;
  student_id: string;
  created_at: string;
  tutor?: {
    id: string;
    email: string;
    profile_data?: {
      firstName?: string;
      lastName?: string;
    };
  };
  student?: {
    id: string;
    email: string;
    profile_data?: {
      firstName?: string;
      lastName?: string;
    };
  };
}

export interface TutorAvailability {
  id: string;
  tutor_id: string;
  day_of_week: number; // 0 = Sunday, 1 = Monday, etc.
  start_time: string; // HH:mm format
  end_time: string; // HH:mm format
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  tutor_id: string;
  student_id: string;
  title: string;
  subject: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  description?: string;
  notes?: string;
  google_meet_link?: string;
  is_recurring: boolean;
  recurring_until?: string;
  parent_lesson_id?: string;
  created_at: string;
  updated_at: string;
  tutor?: {
    id: string;
    email: string;
    profile_data?: {
      firstName?: string;
      lastName?: string;
    };
  };
  student?: {
    id: string;
    email: string;
    profile_data?: {
      firstName?: string;
      lastName?: string;
    };
  };
}

export interface User {
  id: string;
  email: string;
  role: 'student' | 'tutor' | 'parent' | 'admin';
  profile_data?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
  created_at: string;
}
