import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

// Les variables d'environnement doivent être préfixées par VITE_ pour être accessibles côté client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Erreur: Variables d\'environnement Supabase manquantes');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Fonction utilitaire pour tester la connexion
export async function testConnection() {
  try {
    // Tente de récupérer un utilisateur pour vérifier la connexion
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Erreur de connexion à la base de données:', error);
      return { success: false, error };
    }
    
    console.log('Connexion à Supabase réussie!');
    return { success: true, data };
  } catch (err) {
    console.error('Test de connexion échoué:', err);
    return { success: false, error: err };
  }
}

// Fonction pour vérifier que toutes les tables nécessaires existent
export async function verifyDatabaseStructure() {
  const requiredTables = ['users', 'student', 'tutor', 'admin', 'session'];
  const results: Record<string, { exists: boolean; error?: string }> = {};
  
  for (const table of requiredTables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
      
      results[table] = error ? 
        { exists: false, error: error.message } : 
        { exists: true };
    } catch (err: any) {
      results[table] = { exists: false, error: err.message };
    }
  }
  
  console.table(results);
  return results;
}