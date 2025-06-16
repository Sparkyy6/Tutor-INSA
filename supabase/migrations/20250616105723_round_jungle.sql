-- Table principale des utilisateurs
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  role TEXT NOT NULL CHECK (role IN ('student', 'admin', 'tutor'))
);

-- Table des étudiants
CREATE TABLE IF NOT EXISTS public.student (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  role TEXT NOT NULL DEFAULT 'student' CHECK (role = 'student'),
  enrolledcourses TEXT[],
  year INT,
  department TEXT
);

-- Table des tuteurs
CREATE TABLE IF NOT EXISTS public.tutor (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  role TEXT NOT NULL DEFAULT 'tutor' CHECK (role = 'tutor'),
  subject TEXT[],
  department TEXT,
  availablehours TEXT[]
);

-- Table des admins
CREATE TABLE IF NOT EXISTS public.admin (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role = 'admin'),
  permissions TEXT[]
);

-- Table des sessions de tutorat
CREATE TABLE IF NOT EXISTS public.session (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  student_id uuid REFERENCES public.student(id) ON DELETE CASCADE NOT NULL,
  tutor_id uuid REFERENCES public.tutor(id) ON DELETE CASCADE NOT NULL
);

-- Activer la Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session ENABLE ROW LEVEL SECURITY;

-- Policies de développement : tout le monde peut lire et écrire (à restreindre en prod)

-- USERS
CREATE POLICY "Allow select users for all" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Allow insert users for all" ON public.users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update users for all" ON public.users
  FOR UPDATE USING (true);

CREATE POLICY "Allow delete users for all" ON public.users
  FOR DELETE USING (true);

-- STUDENT
CREATE POLICY "Allow select student for all" ON public.student
  FOR SELECT USING (true);

CREATE POLICY "Allow insert student for all" ON public.student
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update student for all" ON public.student
  FOR UPDATE USING (true);

CREATE POLICY "Allow delete student for all" ON public.student
  FOR DELETE USING (true);

-- TUTOR
CREATE POLICY "Allow select tutor for all" ON public.tutor
  FOR SELECT USING (true);

CREATE POLICY "Allow insert tutor for all" ON public.tutor
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update tutor for all" ON public.tutor
  FOR UPDATE USING (true);

CREATE POLICY "Allow delete tutor for all" ON public.tutor
  FOR DELETE USING (true);

-- ADMIN
CREATE POLICY "Allow select admin for all" ON public.admin
  FOR SELECT USING (true);

CREATE POLICY "Allow insert admin for all" ON public.admin
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update admin for all" ON public.admin
  FOR UPDATE USING (true);

CREATE POLICY "Allow delete admin for all" ON public.admin
  FOR DELETE USING (true);

-- SESSION
CREATE POLICY "Allow select session for all" ON public.session
  FOR SELECT USING (true);

CREATE POLICY "Allow insert session for all" ON public.session
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update session for all" ON public.session
  FOR UPDATE USING (true);

CREATE POLICY "Allow delete session for all" ON public.session
  FOR DELETE USING (true);