import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { loginUser, logoutUser, registerUser } from '../services/auth';
import type { users } from '../types/index';
import { clearAuthCookies } from '../lib/cookieManager';

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
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<users | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const userRef = useRef<users | null>(null);

  useEffect(() => {
    let mounted = true;
    let authListener: any;

    const checkSession = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase.auth.getSession();
        if (!mounted) return;
        
        if (error) throw error;
        if (!data.session) return setUser(null);

        const { data: userData } = await supabase
          .from('users')
          .select('id, name, email, year, departement, preorientation')
          .eq('id', data.session.user.id)
          .single();
          
        if (mounted && JSON.stringify(userRef.current) !== JSON.stringify(userData)) {
          userRef.current = userData;
          setUser(userData);
        }
      } catch (error) {
        console.error('Session check failed:', error);
        if (mounted) {
          setUser(null);
          clearAuthCookies();
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    
    checkSession();
    
    authListener = supabase.auth.onAuthStateChange(async (_, session) => {
      if (!mounted) return;
      
      if (session) {
        const { data } = await supabase
          .from('users')
          .select('id, name, email, year, departement, preorientation')
          .eq('id', session.user.id)
          .single();
        
        if (mounted && JSON.stringify(userRef.current) !== JSON.stringify(data)) {
          userRef.current = data;
          setUser(data);
        }
      } else if (mounted && userRef.current !== null) {
        userRef.current = null;
        setUser(null);
      }
      
      if (mounted) setIsLoading(false);
    });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      setIsLoading(true);
      await logoutUser();
      clearAuthCookies();
      setUser(null);
      window.location.reload(); // Ensure complete reset
    } catch (error) {
      console.error("Logout failed:", error);
      clearAuthCookies();
      window.location.reload();
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      await loginUser(email, password);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (userData: any) => {
    try {
      setIsLoading(true);
      await registerUser(userData);
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}