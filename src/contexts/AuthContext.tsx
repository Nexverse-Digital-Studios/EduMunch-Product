import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';

// Demo user for when Supabase isn't connected
const DEMO_USER: User = {
  id: 'demo-user-id',
  email: 'demo@eduadmin.com',
  aud: 'authenticated',
  role: 'authenticated',
  app_metadata: {},
  user_metadata: { full_name: 'Demo Admin' },
  created_at: new Date().toISOString(),
};

const DEMO_SESSION: Session = {
  access_token: 'demo-token',
  refresh_token: 'demo-refresh',
  expires_in: 3600,
  expires_at: Date.now() + 3600000,
  token_type: 'bearer',
  user: DEMO_USER,
};

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isDemo: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const isDemo = !isSupabaseConfigured;

  useEffect(() => {
    // If Supabase isn't configured, use demo mode
    if (!isSupabaseConfigured || !supabase) {
      // Check if user has "logged in" via demo mode (stored in localStorage)
      const demoLoggedIn = localStorage.getItem('demo_logged_in');
      if (demoLoggedIn === 'true') {
        setUser(DEMO_USER);
        setSession(DEMO_SESSION);
      }
      setLoading(false);
      return;
    }

    // Real Supabase auth flow
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    // Demo mode signup
    if (!isSupabaseConfigured || !supabase) {
      localStorage.setItem('demo_logged_in', 'true');
      localStorage.setItem('demo_email', email);
      setUser({ ...DEMO_USER, email });
      setSession({ ...DEMO_SESSION, user: { ...DEMO_USER, email } });
      return { error: null };
    }

    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    // Demo mode signin
    if (!isSupabaseConfigured || !supabase) {
      localStorage.setItem('demo_logged_in', 'true');
      localStorage.setItem('demo_email', email);
      setUser({ ...DEMO_USER, email });
      setSession({ ...DEMO_SESSION, user: { ...DEMO_USER, email } });
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    // Demo mode signout
    if (!isSupabaseConfigured || !supabase) {
      localStorage.removeItem('demo_logged_in');
      localStorage.removeItem('demo_email');
      setUser(null);
      setSession(null);
      return;
    }

    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isDemo, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
