import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Erreur: Variables d\'environnement Supabase manquantes');
}

import { clearAuthCookies } from './cookieManager'; 

// Ajouter des options de configuration pour améliorer la gestion de session
export const supabase = createClient<Database>(
  supabaseUrl, 
  supabaseAnonKey, 
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      storageKey: 'tutor-insa-auth-token',
      flowType: 'pkce',
      debug: process.env.NODE_ENV === 'development'
    },
    global: {
      headers: { 'x-application-name': 'tutor-insa' },
    },
    // Configurer des timeouts plus longs pour éviter les problèmes
    realtime: {
      timeout: 20000
    },
    db: {
      schema: 'public'
    }
  }
);

// Ajouter un gestionnaire de timeout lors de l'initialisation de Supabase

// Fonction utilitaire pour tester la connexion
export async function testConnection() {
  try {
    const start = Date.now();
    const { error } = await supabase.from('votre_table_test').select('count()', { count: 'exact' }).limit(1);
    const duration = Date.now() - start;
    
    console.log(`Temps de réponse Supabase: ${duration}ms`);
    
    if (error) {
      console.error('Erreur de connexion à Supabase:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Exception lors du test de connexion:', err);
    return false;
  }
}

// Initialiser Supabase avec promesse de timeout
export function initSupabase() {
  let connectionTimeout = setTimeout(() => {
    console.error('Timeout de connexion à Supabase');
    clearAuthCookies(); // Assurer que cette fonction est importée
    window.location.reload();
  }, 15000);
  
  // Tester la connexion et annuler le timeout si succès
  testConnection().then(success => {
    if (success) {
      clearTimeout(connectionTimeout);
    }
  });
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