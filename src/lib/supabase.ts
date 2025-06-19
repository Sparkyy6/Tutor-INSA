import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Custom fetch with timeout that matches the expected type
const fetchWithTimeout: typeof fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const timeout = 10000; // 10 seconds
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    // Convert URL to string if needed
    const url = input instanceof URL ? input.toString() : input;
    const response = await fetch(url, {
      ...init,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storageKey: 'tutor-insa-auth-token',
    flowType: 'pkce'
  },
  global: {
    headers: { 'x-application-name': 'tutor-insa' },
    fetch: fetchWithTimeout
  }
});

// Session management utilities
export const refreshSession = async () => {
  const { data, error } = await supabase.auth.refreshSession();
  if (error) throw error;
  return data;
};

export const checkSessionHealth = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;
    
    const { error } = await supabase.auth.getUser();
    return !error;
  } catch {
    return false;
  }
};

// Typed query with timeout
export const queryWithTimeout = async <T>(
  query: Promise<T>,
  timeoutMs = 10000
): Promise<T> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await query;
  } finally {
    clearTimeout(timeout);
  }
};