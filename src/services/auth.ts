import { supabase } from '../lib/supabase';

// Mise à jour du type pour inclure la préorientation
type RegisterUserParams = {
  user: {
    name: string;
    email: string;
    password: string; 
    year?: number;
    departement?: string;
    preorientation?: string; // Ajout de la préorientation
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
    // 1. Créer l'utilisateur avec l'authentification Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error("L'inscription a échoué");

    // 2. Insérer les informations supplémentaires dans la table users
    // S'assurer que la préorientation n'est incluse que pour les 2A
    const userData = {
      id: authData.user.id,
      name: user.name,
      email: user.email,
      year: user.year,
      departement: user.departement
    };

    // Ajouter la préorientation uniquement pour les 2A
    if (user.year === 2 && user.preorientation) {
      Object.assign(userData, { preorientation: user.preorientation });
    }

    const { data: insertedUser, error: userError } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();

    if (userError) {
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw userError;
    }

    return insertedUser;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
}

// Nouvelle fonction pour la connexion
export async function loginUser(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    
    // Récupérer les informations de l'utilisateur depuis la table users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
      
    if (userError) throw userError;
    
    return { session: data.session, user: userData };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Fonction de déconnexion
export async function logoutUser() {
  return supabase.auth.signOut();
}