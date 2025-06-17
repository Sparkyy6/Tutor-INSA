-- Table des étudiants
  DROP TABLE IF EXISTS public.session CASCADE;
  DROP TABLE IF EXISTS public.cours CASCADE;
  DROP TABLE IF EXISTS public.student CASCADE;
  DROP TABLE IF EXISTS public.tutor CASCADE;
  DROP TABLE IF EXISTS public.admin CASCADE;
  DROP TABLE IF EXISTS public.users CASCADE;
  DROP TABLE IF EXISTS public.matiere CASCADE;

  CREATE TABLE IF NOT EXISTS public.users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    year INT CHECK (year BETWEEN 1 AND 5),
    departement TEXT CHECK (departement IN ('stpi', 'gsi', 'sti', 'mri'))
  );

  CREATE TABLE IF NOT EXISTS public.matiere (
    nom TEXT,
    departement TEXT,
    annee INT CHECK (annee BETWEEN 1 AND 5),
    PRIMARY KEY (nom, departement,annee)
  );

  CREATE TABLE IF NOT EXISTS public.student (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    matieres TEXT[] -- On ne peut pas référencer avec un tableau
  );

  -- Table des tuteurs
  CREATE TABLE IF NOT EXISTS public.tutor (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    matieres TEXT[] -- On ne peut pas référencer avec un tableau
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
    eleve uuid REFERENCES public.student(id) ON DELETE CASCADE,
    tuteur uuid REFERENCES public.tutor(id) ON DELETE CASCADE,
    matiere_nom TEXT,
    matiere_departement TEXT,
    matiere_annee INT CHECK (matiere_annee BETWEEN 1 AND 5),
    date TIMESTAMPTZ NOT NULL,
    duree INT NOT NULL CHECK (duree > 0),
    CONSTRAINT fk_matiere FOREIGN KEY (matiere_nom, matiere_departement,matiere_annee) 
    REFERENCES public.matiere(nom, departement, annee)
  );
    
  -- Activer la Row Level Security (RLS)

  ALTER TABLE public.student ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.tutor ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.admin ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.session ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;


  -- STUDENT
  DROP POLICY IF EXISTS "Allow select student for all" ON public.student;
  CREATE POLICY "Allow select student for all" ON public.student
    FOR SELECT USING (true);

  DROP POLICY IF EXISTS "Allow insert student for all" ON public.student;
  CREATE POLICY "Allow insert student for all" ON public.student
    FOR INSERT WITH CHECK (true);

  DROP POLICY IF EXISTS "Allow update student for all" ON public.student;
  CREATE POLICY "Allow update student for all" ON public.student
    FOR UPDATE USING (true);

  DROP POLICY IF EXISTS "Allow delete student for all" ON public.student;
  CREATE POLICY "Allow delete student for all" ON public.student
    FOR DELETE USING (true);

  -- TUTOR
  DROP POLICY IF EXISTS "Allow select tutor for all" ON public.tutor;
  CREATE POLICY "Allow select tutor for all" ON public.tutor
    FOR SELECT USING (true);

  DROP POLICY IF EXISTS "Allow insert tutor for all" ON public.tutor;
  CREATE POLICY "Allow insert tutor for all" ON public.tutor
    FOR INSERT WITH CHECK (true);

  DROP POLICY IF EXISTS "Allow update tutor for all" ON public.tutor;
  CREATE POLICY "Allow update tutor for all" ON public.tutor
    FOR UPDATE USING (true);

  DROP POLICY IF EXISTS "Allow delete tutor for all" ON public.tutor;
  CREATE POLICY "Allow delete tutor for all" ON public.tutor
    FOR DELETE USING (true);

  -- ADMIN
  DROP POLICY IF EXISTS "Allow select admin for all" ON public.admin;
  CREATE POLICY "Allow select admin for all" ON public.admin
    FOR SELECT USING (true);

  DROP POLICY IF EXISTS "Allow insert admin for all" ON public.admin;
  CREATE POLICY "Allow insert admin for all" ON public.admin
    FOR INSERT WITH CHECK (true);

  DROP POLICY IF EXISTS "Allow update admin for all" ON public.admin;
  CREATE POLICY "Allow update admin for all" ON public.admin
    FOR UPDATE USING (true);

  DROP POLICY IF EXISTS "Allow delete admin for all" ON public.admin;
  CREATE POLICY "Allow delete admin for all" ON public.admin
    FOR DELETE USING (true);

  -- SESSION
  DROP POLICY IF EXISTS "Allow select session for all" ON public.session;
  CREATE POLICY "Allow select session for all" ON public.session
    FOR SELECT USING (true);

  DROP POLICY IF EXISTS "Allow insert session for all" ON public.session;
  CREATE POLICY "Allow insert session for all" ON public.session
    FOR INSERT WITH CHECK (true);

  DROP POLICY IF EXISTS "Allow update session for all" ON public.session;
  CREATE POLICY "Allow update session for all" ON public.session
    FOR UPDATE USING (true);

  DROP POLICY IF EXISTS "Allow delete session for all" ON public.session;
  CREATE POLICY "Allow delete session for all" ON public.session
    FOR DELETE USING (true);

-- Pour users
DROP POLICY IF EXISTS "Allow select users for all" ON public.users;
CREATE POLICY "Allow select users for all" ON public.users
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert users for all" ON public.users;
CREATE POLICY "Allow insert users for all" ON public.users
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update users for all" ON public.users;
CREATE POLICY "Allow update users for all" ON public.users
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow delete users for all" ON public.users;
CREATE POLICY "Allow delete users for all" ON public.users
  FOR DELETE USING (true);