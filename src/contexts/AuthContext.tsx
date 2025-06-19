import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { loginUser, logoutUser, registerUser } from '../services/auth';
import type { users } from '../types/index';
import { clearAuthCookies } from '../lib/cookieManager';

// Définition du contexte Auth
type AuthContextType = {
  user: users | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (userData: any) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<users | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier la session au chargement avec timeout et réessai
    const checkSession = async (retryCount = 0) => {
      try {
        setIsLoading(true);
        
        // Timeout plus long pour le premier chargement
        const timeoutDuration = 10000; // Augmenté à 10s
        console.log(`Vérification de session (tentative ${retryCount + 1})...`);
        
        // Ajouter un timeout pour éviter un blocage indéfini
        const timeoutPromise = new Promise(resolve => 
          setTimeout(() => resolve({ timedOut: true }), timeoutDuration)
        );
        const sessionPromise = supabase.auth.getSession();
        
        // Utiliser la première promesse qui se résout
        const result: any = await Promise.race([sessionPromise, timeoutPromise]);
        
        // Si timeout, on essaie à nouveau si on n'a pas dépassé le nombre max de tentatives
        if (result.timedOut) {
          console.warn('Session check timed out');
          if (retryCount < 2) { // Permettre deux tentatives supplémentaires
            console.log('Nouvelle tentative de vérification de session...');
            setTimeout(() => checkSession(retryCount + 1), 1000);
            return;
          }
          // Si on a déjà réessayé, on considère qu'il n'y a pas de session
          console.warn('Session check failed after retries, assuming logged out');
          setUser(null);
          setIsLoading(false);
        } else {
          const { data } = result;
          if (data?.session) {
            // Limiter les informations récupérées pour accélérer
            const { data: userData } = await supabase
              .from('users')
              .select('id, name, email, year, departement, preorientation')
              .eq('id', data.session.user.id)
              .single();
              
            setUser(userData);
          } else {
            setUser(null);
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Session check error:', error);
        // En cas d'erreur, on reset pour permettre la connexion
        setUser(null);
        clearAuthCookies(); // Nettoyer les cookies en cas d'erreur
        setIsLoading(false);
      }
    };
    
    // Configurer un timer court pour déclencher la vérification de session
    // Cela permet au navigateur de finir l'initialisation des cookies
    setTimeout(() => checkSession(), 300);
    
    // Configurer l'écouteur d'authentification avec nettoyage approprié
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_sessionEvent, session) => {
        console.log('Auth state change:', _sessionEvent);
        
        if (session) {
          const { data } = await supabase
            .from('users')
            .select('id, name, email, year, departement, preorientation')
            .eq('id', session.user.id)
            .single();
          
          setUser(data);
        } else {
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );
    
    // Nettoyer correctement l'écouteur
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Améliorer la fonction de déconnexion
  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Désabonner l'écouteur avant de se déconnecter
      const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {});
      subscription.unsubscribe();
      
      // Effectuer la déconnexion
      await logoutUser();
      
      // Nettoyer les cookies
      clearAuthCookies();
      
      // Mettre à jour l'état manuellement
      setUser(null);
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      clearAuthCookies(); // Essayer de nettoyer les cookies même en cas d'erreur
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const result = await loginUser(email, password);
      
      if (!result.session) {
        throw new Error("Échec de la connexion");
      }
      
      // Le reste est géré par onAuthStateChange
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (userData: any) => {
  try {
    setIsLoading(true);
    
    // Utiliser le service d'authentification existant
    const registeredUser = await registerUser({
      user: userData,
      isStudent: false, // Ces valeurs pourraient être passées en paramètres selon vos besoins
      isTutor: false    // ou gérées différemment dans votre flux d'inscription
    });
    
    // Pas besoin de mettre à jour l'état utilisateur ici
    // L'écouteur onAuthStateChange s'en chargera automatiquement
    
    return registeredUser;
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    throw error;
  } finally {
    setIsLoading(false);
  }
};

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
}