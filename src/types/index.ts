export interface User {
  id: string;
  email: string;
  full_name: string;
  profile_picture_url?: string;
  year_level: number;
  department: string;
  campus_id: string;
  is_tutor: boolean;
  role: 'student' | 'tutor' | 'admin';
  bio?: string;
  created_at: string;
}

export interface Campus {
  id: string;
  name: string;
  city: string;
  address?: string;
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  department: string;
  year_level: number;
  semester: number;
  credits: number;
  description?: string;
  created_at: string;
}

export interface TutorSubject {
  id: string;
  tutor_id: string;
  subject_id: string;
  experience_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  created_at: string;
  subject?: Subject;
}

export interface TutoringSession {
  id: string;
  tutor_id: string;
  student_id: string;
  subject_id: string;
  title: string;
  description?: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  session_type: 'online' | 'in_person';
  meeting_link?: string;
  location?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  tutor?: User;
  student?: User;
  subject?: Subject;
}

export interface SessionRequest {
  id: string;
  student_id: string;
  tutor_id: string;
  subject_id: string;
  message?: string;
  preferred_date?: string;
  duration_minutes: number;
  session_type: 'online' | 'in_person';
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  created_at: string;
  student?: User;
  tutor?: User;
  subject?: Subject;
}

export interface Review {
  id: string;
  session_id: string;
  reviewer_id: string;
  reviewed_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  reviewer?: User;
  session?: TutoringSession;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  session_id?: string;
  message_type: 'text' | 'file' | 'image';
  file_url?: string;
  read_at?: string;
  created_at: string;
  sender?: User;
  receiver?: User;
}

export interface TutorProfile extends User {
  subjects: TutorSubject[];
  rating: number;
  total_sessions: number;
  reviews: Review[];
}