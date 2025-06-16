export interface User {
  id: string;
  created_at: string;
  email: string;
  full_name: string;
  profile_picture_url: string | null;
  department: string | null;
  year_level?: number; // Ajout de cette propriété
  bio?: string; // Ajout de cette propriété
  is_tutor: boolean;
  role: 'student' | 'tutor' | 'admin';
  campus_id: number | null;
  campus?: Campus;
}

export interface Subject {
  id: number;
  name: string;
  code: string;
  description: string | null;
  department: string;
  year_level: string;
  credits: number;
  level: 'L1' | 'L2' | 'L3' | 'M1' | 'M2' | null;
}

export interface Campus {
  id: number;
  name: string;
  city: string;
  address: string | null;
}

export interface TutoringSession {
  id: number;
  title: string; // Propriété utilisée dans AdminPanel
  tutor_id: string;
  student_id: string;
  subject_id: number;
  scheduled_at?: string; // Propriété optionnelle utilisée dans AdminPanel
  start_time: string;
  end_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string | null;
  created_at: string;
  tutor?: User;
  student?: User;
  subject?: Subject;
}

// Vous pouvez conserver ces types supplémentaires qui ne sont pas dans database.types.ts
export interface TutorSubject {
  id: string;
  tutor_id: string;
  subject_id: string;
  experience_level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  created_at: string;
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