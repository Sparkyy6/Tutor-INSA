import { supabase } from '../lib/supabase';

// Type pour les nouveaux paramètres
type RegisterUserParams = {
  user: {
    name: string;
    email: string;
    password: string;
    year?: number;
    departement?: string;
  };
  isStudent: boolean;
  isTutor: boolean;
  studentData?: {
    matieres: string[];
  };
  tutorData?: {
    matieres: string[];
    availablehours: string[];
  };
};

export async function registerUser(params: RegisterUserParams) {
  const { user } = params;

  try {
    // Créer l'utilisateur de base dans la table users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        name: user.name,
        email: user.email,
        password: user.password, // Idéalement, utiliser un hash
        year: user.year,
        departement: user.departement
      })
      .select()
      .single();

    if (userError) throw userError;

    // Les rôles (étudiant/tuteur) seront attribués après la connexion
    return userData;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
}