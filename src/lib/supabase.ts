import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Déclarer avec un type explicite
let supabase: SupabaseClient<Database>;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not configured. Using mock mode.');
  // Créer un client mock typé
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      // Ajouter d'autres méthodes mock selon vos besoins
    },
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          data: [],
          error: null
        })
      }),
      insert: () => ({
        data: null,
        error: null
      }),
      update: () => ({
        data: null,
        error: null
      }),
      delete: () => ({
        data: null,
        error: null
      })
    })
    // Ajouter d'autres méthodes nécessaires
  } as unknown as SupabaseClient<Database>;
} else {
  // Initialisation du vrai client
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
}

export { supabase };