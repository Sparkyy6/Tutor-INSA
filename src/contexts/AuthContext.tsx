import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase, refreshSession, checkSessionHealth } from '../lib/supabase';
import { clearAuthCookies } from '../lib/cookieManager';
import type { users } from '../types/index';

type AuthContextType = {
  user: users | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (userData: any) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<users | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const userRef = useRef<users | null>(null);

  // Session management
  const manageSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        console.log('Pas de session active');
        setUser(null);
        return;
      }

      // Vérifier si l'utilisateur existe dans la table users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, name, email, year, departement, preorientation')
        .eq('id', session.user.id)
        .single();

      if (userError) {
        console.error('Erreur lors de la récupération des données utilisateur:', userError);
        
        // Si l'utilisateur n'existe pas dans la table users mais existe dans auth
        if (userError.code === 'PGRST116') {
          console.log('Création du profil utilisateur...');
          // Créer l'entrée dans users à partir des métadonnées
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: session.user.id,
              name: session.user.user_metadata.name || 'Utilisateur',
              email: session.user.email,
              departement: session.user.user_metadata.departement || 'stpi',
              year: 1 // Valeur par défaut
            });
            
          if (insertError) {
            console.error('Erreur création profil:', insertError);
            setUser(null);
            return;
          }
          
          // Récupérer les données fraîchement créées
          const { data: newUserData } = await supabase
            .from('users')
            .select('id, name, email, year, departement, preorientation')
            .eq('id', session.user.id)
            .single();
            
          if (newUserData) {
            userRef.current = newUserData;
            setUser(newUserData);
          }
        } else {
          setUser(null);
        }
        return;
      }

      if (userData) {
        console.log('Données utilisateur récupérées:', userData);
        userRef.current = userData;
        setUser(userData);
      }
    } catch (error) {
      console.error('Session error:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sign in implementation
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      if (!data.session) throw new Error('No session returned');

      await manageSession();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [manageSession]);

  // Sign up implementation
  const signUp = useCallback(async (userData: any) => {
    try {
      setIsLoading(true);
      
      // 1. Créer l'utilisateur dans auth.users
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            departement: userData.departement
          }
        }
      });

      if (error) throw error;
      if (!data.user) throw new Error('Registration failed');

      // 2. Insérer l'utilisateur dans la table public.users
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          name: userData.name,
          email: userData.email,
          year: userData.year,
          departement: userData.departement,
          preorientation: userData.preorientation
        });

      if (insertError) {
        console.error('Error inserting into users table:', insertError);
        throw new Error("Erreur lors de la création du profil utilisateur");
      }

      await manageSession();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [manageSession]);

  // Sign out implementation
  const signOut = useCallback(async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      clearAuthCookies();
      setUser(null);
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      clearAuthCookies();
      window.location.reload();
    }
  }, []);

  // Auto-refresh and health check
  useEffect(() => {
    let mounted = true;
    let healthCheckInterval: NodeJS.Timeout;

    const setupSessionMonitoring = async () => {
      await manageSession();

      if (userRef.current) {
        healthCheckInterval = setInterval(async () => {
          if (!mounted) return;
          try {
            if (!(await checkSessionHealth())) {
              console.log('Session unhealthy, refreshing...');
              await refreshSession();
            }
          } catch (error) {
            console.error('Health check failed:', error);
            if (mounted) {
              setUser(null);
              clearAuthCookies();
            }
          }
        }, 300000); // 5 minutes
      }
    };

    setupSessionMonitoring();

    return () => {
      mounted = false;
      clearInterval(healthCheckInterval);
    };
  }, [manageSession]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading,
      signIn,
      signUp,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};