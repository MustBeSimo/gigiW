'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User, Session } from '@supabase/supabase-js';
import { useRouter, useSearchParams } from 'next/navigation';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        setLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session) {
          setSession(session);
          setUser(session.user);

          // Initialize user profile if needed
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert(
              { 
                id: session.user.id,
                email: session.user.email,
                full_name: session.user.user_metadata?.full_name,
                avatar_url: session.user.user_metadata?.avatar_url,
                updated_at: new Date().toISOString()
              },
              { onConflict: 'id' }
            );
          if (profileError) console.error('Error updating profile:', profileError);

          // Check and handle code parameter in URL
          const urlParams = new URLSearchParams(window.location.search);
          const code = urlParams.get('code');
          if (code) {
            // Clean URL without reloading the page
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('code');
            window.history.replaceState({}, '', newUrl.toString());
          }
        }
      } catch (error) {
        console.error('Error in auth:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (session?.user) {
          // Update profile on auth state change
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert(
              { 
                id: session.user.id,
                email: session.user.email,
                full_name: session.user.user_metadata?.full_name,
                avatar_url: session.user.user_metadata?.avatar_url,
                updated_at: new Date().toISOString()
              },
              { onConflict: 'id' }
            );
          if (profileError) console.error('Error updating profile:', profileError);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          skipBrowserRedirect: false // Ensure browser handles redirect
        }
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      console.log('Starting sign out process...');
      
      // Reset user state immediately for better UX
      setUser(null);
      setSession(null);
      
      // Call the server-side API to clear cookies properly
      try {
        await fetch('/api/auth/signout', { method: 'POST' });
        console.log('Server-side sign out successful');
      } catch (serverError) {
        console.warn('Server-side sign out failed, continuing with client-side:', serverError);
      }
      
      // Then sign out on the client side
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Client-side sign out error:', error);
        // Don't throw here - continue with logout process
      }
      
      console.log('Sign out completed successfully');
      
      // Force reload to ensure all state is cleared
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if there's an error, reset the state and redirect
      setUser(null);
      setSession(null);
      window.location.href = '/';
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 