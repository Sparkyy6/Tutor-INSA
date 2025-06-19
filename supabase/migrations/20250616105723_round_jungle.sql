-- Table des étudiants
  DROP TABLE IF EXISTS public.session CASCADE;
  DROP TABLE IF EXISTS public.cours CASCADE;
  DROP TABLE IF EXISTS public.student CASCADE;
  DROP TABLE IF EXISTS public.tutor CASCADE;
  DROP TABLE IF EXISTS public.admin CASCADE;
  DROP TABLE IF EXISTS public.users CASCADE;
  DROP TABLE IF EXISTS public.matiere CASCADE;
  DROP TABLE IF EXISTS public.conversation CASCADE;
  DROP TABLE IF EXISTS public.message CASCADE;

  CREATE TABLE IF NOT EXISTS public.users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    year INT CHECK (year BETWEEN 1 AND 5),
    departement TEXT CHECK (departement IN ('stpi', 'gsi', 'sti', 'mri')),
    preorientation TEXT CHECK (preorientation IN ('gsi', 'sti', 'mri'))
  );

  CREATE TABLE IF NOT EXISTS public.matiere (
    nom TEXT,
    departement TEXT,
    preorientation TEXT CHECK (preorientation IN ('gsi', 'sti', 'mri')),
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
    statue TEXT CHECK (statue IN ('attente', 'oui', 'non')) DEFAULT 'attente',
    date TIMESTAMPTZ NOT NULL,
    duree INT NOT NULL CHECK (duree > 0),
    CONSTRAINT fk_matiere FOREIGN KEY (matiere_nom, matiere_departement,matiere_annee) 
    REFERENCES public.matiere(nom, departement, annee)
  );

  -- Table des conversations
  CREATE TABLE IF NOT EXISTS public.conversation (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    tutor_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    subject TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
  );

  -- Table des messages
  CREATE TABLE IF NOT EXISTS public.message (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id uuid REFERENCES public.conversation(id) ON DELETE CASCADE,
    sender_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
  );

  -- Activer la Row Level Security (RLS)

  ALTER TABLE public.student ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.tutor ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.admin ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.session ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.conversation ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.message ENABLE ROW LEVEL SECURITY;


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

-- Modification de la table users pour ajouter la préorientation
ALTER TABLE IF EXISTS public.users
ADD COLUMN IF NOT EXISTS preorientation TEXT CHECK (preorientation IN ('gsi', 'sti', 'mri'));

-- Mise à jour de la contrainte sur le département
ALTER TABLE IF EXISTS public.users
DROP CONSTRAINT IF EXISTS users_departement_check;

ALTER TABLE IF EXISTS public.users
ADD CONSTRAINT users_departement_check CHECK (departement IN ('stpi', 'gsi', 'sti', 'mri'));

-- Modifier la définition de la table users pour restreindre la préorientation aux 2A

-- Supprimer la contrainte existante si elle existe
ALTER TABLE IF EXISTS public.users
DROP CONSTRAINT IF EXISTS users_preorientation_check;

-- Ajouter une contrainte conditionnelle pour la préorientation
ALTER TABLE IF EXISTS public.users
ADD CONSTRAINT users_preorientation_year_check 
CHECK (
  (year = 2 AND preorientation IN ('gsi', 'sti', 'mri')) OR
  (year != 2 AND preorientation IS NULL)
);

-- Nettoyer les données existantes
UPDATE public.users
SET preorientation = NULL
WHERE year != 2;


-- RLS et policies (optionnel, à adapter selon tes besoins)
ALTER TABLE public.conversation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow select conversation for all" ON public.conversation;
CREATE POLICY "Allow select conversation for all" ON public.conversation FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert conversation for all" ON public.conversation;
CREATE POLICY "Allow insert conversation for all" ON public.conversation FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow select message for all" ON public.message;
CREATE POLICY "Allow select message for all" ON public.message FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert message for all" ON public.message;
CREATE POLICY "Allow insert message for all" ON public.message FOR INSERT WITH CHECK (true);
