/*
  # Enhanced INSA CVL Tutoring Platform Schema

  1. New Tables
    - `campuses` - Store campus information (Blois, Bourges)
    - `subjects` - Store INSA CVL curriculum subjects
    - `tutor_subjects` - Many-to-many relationship between tutors and subjects
    - `tutoring_sessions` - Store tutoring session information
    - `session_requests` - Store session booking requests
    - `reviews` - Store session reviews and ratings
    - `messages` - Store chat messages between users

  2. Updated Tables
    - `users` - Add campus_id, profile_picture_url, remove hourly_rate references
    - Add admin role functionality

  3. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
    - Special admin policies for management functions

  4. Indexes
    - Add performance indexes for common queries
*/

-- Create campuses table
CREATE TABLE IF NOT EXISTS campuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  city text NOT NULL,
  address text,
  created_at timestamptz DEFAULT now()
);

-- Insert campus data
INSERT INTO campuses (name, city, address) VALUES
  ('INSA CVL Blois', 'Blois', '3 Rue de la Chocolaterie, 41000 Blois'),
  ('INSA CVL Bourges', 'Bourges', '88 Boulevard Lahitolle, 18000 Bourges')
ON CONFLICT (name) DO NOTHING;

-- Create subjects table with INSA CVL curriculum
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  department text NOT NULL,
  year_level integer NOT NULL,
  semester integer NOT NULL CHECK (semester IN (1, 2)),
  credits integer DEFAULT 0,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Insert INSA CVL subjects
INSERT INTO subjects (name, code, department, year_level, semester, credits, description) VALUES
  -- Génie Civil
  ('Mathématiques 1', 'GC-MATH1', 'Génie Civil', 1, 1, 6, 'Analyse et algèbre linéaire'),
  ('Physique Générale', 'GC-PHYS1', 'Génie Civil', 1, 1, 5, 'Mécanique et thermodynamique'),
  ('Résistance des Matériaux', 'GC-RDM1', 'Génie Civil', 2, 1, 6, 'Contraintes et déformations'),
  ('Béton Armé', 'GC-BA1', 'Génie Civil', 3, 1, 7, 'Calcul des structures en béton'),
  ('Géotechnique', 'GC-GEO1', 'Génie Civil', 3, 2, 6, 'Mécanique des sols'),
  
  -- Génie Informatique
  ('Algorithmique', 'GI-ALGO1', 'Génie Informatique', 1, 1, 6, 'Structures de données et algorithmes'),
  ('Programmation C', 'GI-PROG1', 'Génie Informatique', 1, 1, 5, 'Programmation en langage C'),
  ('Bases de Données', 'GI-BDD1', 'Génie Informatique', 2, 1, 6, 'Conception et requêtes SQL'),
  ('Programmation Orientée Objet', 'GI-POO1', 'Génie Informatique', 2, 2, 6, 'Java et concepts OOP'),
  ('Réseaux Informatiques', 'GI-RES1', 'Génie Informatique', 3, 1, 6, 'Protocoles et architectures réseau'),
  ('Intelligence Artificielle', 'GI-IA1', 'Génie Informatique', 4, 1, 7, 'Machine Learning et IA'),
  
  -- Génie Mécanique
  ('Mécanique du Solide', 'GM-MECA1', 'Génie Mécanique', 1, 2, 6, 'Statique et cinématique'),
  ('Thermodynamique', 'GM-THERMO1', 'Génie Mécanique', 2, 1, 6, 'Cycles thermodynamiques'),
  ('Mécanique des Fluides', 'GM-FLUID1', 'Génie Mécanique', 2, 2, 6, 'Écoulements et turbulence'),
  ('Conception Mécanique', 'GM-CONC1', 'Génie Mécanique', 3, 1, 7, 'CAO et dimensionnement'),
  ('Automatique', 'GM-AUTO1', 'Génie Mécanique', 3, 2, 6, 'Systèmes asservis'),
  
  -- Génie Énergétique
  ('Transferts Thermiques', 'GE-TRANS1', 'Génie Énergétique', 2, 1, 6, 'Conduction, convection, rayonnement'),
  ('Énergies Renouvelables', 'GE-RENOUV1', 'Génie Énergétique', 3, 2, 7, 'Solaire, éolien, hydraulique'),
  ('Machines Thermiques', 'GE-MACH1', 'Génie Énergétique', 4, 1, 6, 'Moteurs et turbines'),
  
  -- Génie des Matériaux
  ('Science des Matériaux', 'GMAT-SCI1', 'Génie des Matériaux', 1, 2, 6, 'Structure et propriétés'),
  ('Métallurgie', 'GMAT-MET1', 'Génie des Matériaux', 2, 1, 6, 'Alliages et traitements'),
  ('Matériaux Composites', 'GMAT-COMP1', 'Génie des Matériaux', 3, 1, 7, 'Fibres et matrices'),
  
  -- Sécurité et Technologies
  ('Sécurité Industrielle', 'ST-SEC1', 'Sécurité et Technologies', 2, 1, 6, 'Analyse des risques'),
  ('Prévention des Risques', 'ST-PREV1', 'Sécurité et Technologies', 3, 1, 7, 'Management de la sécurité'),
  
  -- Matières transversales
  ('Anglais', 'TRANS-ANG1', 'Transversal', 1, 1, 3, 'Anglais technique et général'),
  ('Communication', 'TRANS-COM1', 'Transversal', 1, 2, 3, 'Expression écrite et orale'),
  ('Gestion de Projet', 'TRANS-GP1', 'Transversal', 4, 1, 4, 'Méthodologie projet'),
  ('Stage Entreprise', 'TRANS-STAGE1', 'Transversal', 4, 2, 8, 'Stage en entreprise')
ON CONFLICT (code) DO NOTHING;

-- Update users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS campus_id uuid REFERENCES campuses(id);
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture_url text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS role text DEFAULT 'student' CHECK (role IN ('student', 'tutor', 'admin'));

-- Create tutor_subjects junction table
CREATE TABLE IF NOT EXISTS tutor_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  experience_level text DEFAULT 'beginner' CHECK (experience_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(tutor_id, subject_id)
);

-- Create tutoring_sessions table
CREATE TABLE IF NOT EXISTS tutoring_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  scheduled_at timestamptz NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 60,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  session_type text DEFAULT 'online' CHECK (session_type IN ('online', 'in_person')),
  meeting_link text,
  location text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create session_requests table
CREATE TABLE IF NOT EXISTS session_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tutor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  message text,
  preferred_date timestamptz,
  duration_minutes integer DEFAULT 60,
  session_type text DEFAULT 'online' CHECK (session_type IN ('online', 'in_person')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  created_at timestamptz DEFAULT now()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES tutoring_sessions(id) ON DELETE CASCADE,
  reviewer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewed_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(session_id, reviewer_id)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  session_id uuid REFERENCES tutoring_sessions(id) ON DELETE SET NULL,
  message_type text DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image')),
  file_url text,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE campuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies for campuses (read-only for all authenticated users)
CREATE POLICY "Anyone can read campuses"
  ON campuses FOR SELECT
  TO authenticated
  USING (true);

-- Policies for subjects (read-only for all authenticated users)
CREATE POLICY "Anyone can read subjects"
  ON subjects FOR SELECT
  TO authenticated
  USING (true);

-- Policies for tutor_subjects
CREATE POLICY "Tutors can manage their subjects"
  ON tutor_subjects FOR ALL
  TO authenticated
  USING (tutor_id = auth.uid());

CREATE POLICY "Anyone can read tutor subjects"
  ON tutor_subjects FOR SELECT
  TO authenticated
  USING (true);

-- Policies for tutoring_sessions
CREATE POLICY "Users can read their sessions"
  ON tutoring_sessions FOR SELECT
  TO authenticated
  USING (tutor_id = auth.uid() OR student_id = auth.uid());

CREATE POLICY "Users can create sessions"
  ON tutoring_sessions FOR INSERT
  TO authenticated
  WITH CHECK (tutor_id = auth.uid() OR student_id = auth.uid());

CREATE POLICY "Users can update their sessions"
  ON tutoring_sessions FOR UPDATE
  TO authenticated
  USING (tutor_id = auth.uid() OR student_id = auth.uid());

-- Policies for session_requests
CREATE POLICY "Users can read their requests"
  ON session_requests FOR SELECT
  TO authenticated
  USING (student_id = auth.uid() OR tutor_id = auth.uid());

CREATE POLICY "Students can create requests"
  ON session_requests FOR INSERT
  TO authenticated
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Users can update their requests"
  ON session_requests FOR UPDATE
  TO authenticated
  USING (student_id = auth.uid() OR tutor_id = auth.uid());

-- Policies for reviews
CREATE POLICY "Anyone can read reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create reviews for their sessions"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (reviewer_id = auth.uid());

-- Policies for messages
CREATE POLICY "Users can read their messages"
  ON messages FOR SELECT
  TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their sent messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (sender_id = auth.uid());

-- Admin policies (admins can do everything)
CREATE POLICY "Admins can manage campuses"
  ON campuses FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage subjects"
  ON subjects FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all sessions"
  ON tutoring_sessions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all requests"
  ON session_requests FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage all messages"
  ON messages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_campus_id ON users(campus_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_tutor_subjects_tutor_id ON tutor_subjects(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_subjects_subject_id ON tutor_subjects(subject_id);
CREATE INDEX IF NOT EXISTS idx_tutoring_sessions_tutor_id ON tutoring_sessions(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutoring_sessions_student_id ON tutoring_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_tutoring_sessions_scheduled_at ON tutoring_sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_session_requests_student_id ON session_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_session_requests_tutor_id ON session_requests(tutor_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_id ON reviews(reviewed_id);

-- Create a default admin user (you'll need to update this with a real user ID after signup)
-- This is just a placeholder - you'll need to manually update a user to admin role