import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  supabase,
  isSupabaseConfigured,
  AuthUser,
  getStoredDemoUser,
  setStoredDemoUser
} from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';

export const translateAuthError = (rawError: string): string => {
  const lower = rawError.toLowerCase();
  if (lower.includes('email not confirmed')) {
    return 'Email non ancora confermata. Controlla la tua casella di posta (inclusa la cartella spam) e clicca sul link di conferma inviato da Supabase per attivare l\'account.';
  }
  if (lower.includes('invalid login credentials')) {
    return 'Credenziali non valide. Verifica che email e password siano corrette. Se ti sei appena registrato, assicurati di aver confermato l\'email dal link inviato da Supabase.';
  }
  if (lower.includes('rate limit') || lower.includes('over_email_send_rate_limit')) {
    return 'Limite invio email di Supabase superato (max 3/ora con il provider predefinito). Per accedere subito senza attendere, usa l\'opzione "Accedi subito con questo account" oppure disattiva "Confirm email" nella dashboard di Supabase.';
  }
  if (lower.includes('user already registered') || lower.includes('already registered')) {
    return 'Questo indirizzo email risulta già registrato. Vai al pannello "Accedi" per effettuare il login.';
  }
  if (lower.includes('at least 6 characters') || lower.includes('password should be at least')) {
    return 'La password deve contenere almeno 6 caratteri.';
  }
  return rawError;
};

interface AuthContextType {
  user: AuthUser | null;
  supabaseUser: User | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null; isUnconfirmed?: boolean }>;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{
    error: string | null;
    message?: string;
    isEmailConfirmationRequired?: boolean;
    createdUserId?: string;
  }>;
  resendConfirmation: (email: string) => Promise<{ error: string | null; message?: string }>;
  signOut: () => Promise<void>;
  signInDemo: () => void;
  signInDirectly: (email: string, fullName?: string, userId?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth state
  useEffect(() => {
    let isMounted = true;

    if (isSupabaseConfigured && supabase) {
      // 1. Check current session with real Supabase Auth
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!isMounted) return;
        setSession(session);
        if (session?.user) {
          setSupabaseUser(session.user);
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Utente',
            createdAt: session.user.created_at,
          });
        } else {
          // If no Supabase session, check if there is a local stored session
          const stored = getStoredDemoUser();
          if (stored) {
            setUser(stored);
          } else {
            setUser(null);
            setSupabaseUser(null);
          }
        }
        setIsLoading(false);
      }).catch(err => {
        console.error('Errore getSession Supabase:', err);
        const stored = getStoredDemoUser();
        if (stored) setUser(stored);
        if (isMounted) setIsLoading(false);
      });

      // 2. Listen to Supabase auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (!isMounted) return;
          setSession(session);
          if (session?.user) {
            setSupabaseUser(session.user);
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Utente',
              createdAt: session.user.created_at,
            });
          }
          setIsLoading(false);
        }
      );

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    } else {
      // Fallback/Demo mode check
      const stored = getStoredDemoUser();
      if (stored) {
        setUser(stored);
      }
      setIsLoading(false);
    }
  }, []);

  // Sign In with email & password
  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: string | null; isUnconfirmed?: boolean }> => {
    setIsLoading(true);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          setIsLoading(false);
          const isUnconfirmed =
            error.message.toLowerCase().includes('email not confirmed') ||
            error.message.toLowerCase().includes('not confirmed');
          return {
            error: translateAuthError(error.message),
            isUnconfirmed,
          };
        }

        if (data.user) {
          setSupabaseUser(data.user);
          const newUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || email,
            fullName: data.user.user_metadata?.full_name || email.split('@')[0],
          };
          setUser(newUser);
          setStoredDemoUser(newUser);
        }

        setIsLoading(false);
        return { error: null };
      } catch (err: any) {
        setIsLoading(false);
        return { error: translateAuthError(err.message || 'Errore durante il login') };
      }
    } else {
      // Demo / Mock login
      await new Promise(r => setTimeout(r, 450));
      const demoUser: AuthUser = {
        id: `demo-${Date.now()}`,
        email,
        fullName: email.split('@')[0] || 'Marco',
      };
      setStoredDemoUser(demoUser);
      setUser(demoUser);
      setIsLoading(false);
      return { error: null };
    }
  };

  // Sign Up with email, password & name
  const signUp = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<{
    error: string | null;
    message?: string;
    isEmailConfirmationRequired?: boolean;
    createdUserId?: string;
  }> => {
    setIsLoading(true);

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });

        if (error) {
          setIsLoading(false);
          return { error: translateAuthError(error.message) };
        }

        if (data.user) {
          const userId = data.user.id;

          // If Supabase has email confirmation enabled, session is null
          if (!data.session) {
            setIsLoading(false);
            return {
              error: null,
              isEmailConfirmationRequired: true,
              createdUserId: userId,
              message: `Registrazione completata per ${email}! Supabase ha inviato un link di conferma alla tua email. Conferma l'indirizzo prima di accedere, oppure premi "Accedi subito" per entrare immediatamente.`,
            };
          }

          setSupabaseUser(data.user);
          const newUser: AuthUser = {
            id: userId,
            email: data.user.email || email,
            fullName: fullName.trim(),
          };
          setUser(newUser);
          setStoredDemoUser(newUser);
        }

        setIsLoading(false);
        return { error: null };
      } catch (err: any) {
        setIsLoading(false);
        return { error: translateAuthError(err.message || 'Errore durante la registrazione') };
      }
    } else {
      // Demo / Mock sign up
      await new Promise(r => setTimeout(r, 450));
      const demoUser: AuthUser = {
        id: `demo-${Date.now()}`,
        email,
        fullName: fullName || email.split('@')[0],
      };
      setStoredDemoUser(demoUser);
      setUser(demoUser);
      setIsLoading(false);
      return { error: null };
    }
  };

  // Resend confirmation email
  const resendConfirmation = async (email: string): Promise<{ error: string | null; message?: string }> => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: 'Supabase non è configurato.' };
    }
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      });
      if (error) {
        return { error: translateAuthError(error.message) };
      }
      return { error: null, message: 'Nuova email di conferma inviata con successo! Controlla la casella di posta.' };
    } catch (err: any) {
      return { error: translateAuthError(err.message || 'Errore durante il reinvio') };
    }
  };

  // Direct login (bypasses unconfirmed status or rate limit for testing)
  const signInDirectly = (email: string, fullName?: string, userId?: string) => {
    const directUser: AuthUser = {
      id: userId || `user-${Date.now()}`,
      email: email.trim(),
      fullName: fullName?.trim() || email.split('@')[0],
    };
    setStoredDemoUser(directUser);
    setUser(directUser);
  };

  // Sign out
  const signOut = async () => {
    setIsLoading(true);
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Errore durante signOut:', err);
      }
    }
    setStoredDemoUser(null);
    setUser(null);
    setSupabaseUser(null);
    setSession(null);
    setIsLoading(false);
  };

  // Quick Demo sign in
  const signInDemo = () => {
    const demoUser: AuthUser = {
      id: 'demo-user-123',
      email: 'marco.infermiere@chronos.app',
      fullName: 'Marco V.',
    };
    setStoredDemoUser(demoUser);
    setUser(demoUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        session,
        isLoading,
        isConfigured: isSupabaseConfigured,
        signIn,
        signUp,
        resendConfirmation,
        signOut,
        signInDemo,
        signInDirectly,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
