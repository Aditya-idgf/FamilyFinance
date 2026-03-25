import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const delay = useCallback((ms) => new Promise((resolve) => setTimeout(resolve, ms)), []);

  const fetchProfile = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Profile fetch error:', error.message);
      return null;
    }
    return data;
  }, []);

  const fetchProfileWithRetry = useCallback(async (userId, retries = 4, waitMs = 400) => {
    for (let attempt = 0; attempt <= retries; attempt += 1) {
      const profile = await fetchProfile(userId);
      if (profile) return profile;
      if (attempt < retries) {
        await delay(waitMs * (attempt + 1));
      }
    }
    return null;
  }, [delay, fetchProfile]);

  // ...
  const ensureProfile = useCallback(async (authUser, fallbackName) => {
    if (!authUser?.id) return null;

    let profile = await fetchProfileWithRetry(authUser.id, 1, 100);
    if (profile) return profile;

    const { error: upsertError } = await supabase.from('profiles').upsert({
      id: authUser.id,
      email: authUser.email,
      name: fallbackName || authUser.user_metadata?.name || authUser.email?.split('@')?.[0] || 'User',
      family_id: null
    }, { onConflict: 'id' });

    if (upsertError) {
      console.warn('Profile upsert error:', upsertError.message);
      return null;
    }

    profile = await fetchProfileWithRetry(authUser.id, 1, 100);
    return profile;
  }, [fetchProfileWithRetry]);

  useEffect(() => {
    let mounted = true;
    let initTimedOut = false;

    const initTimeout = setTimeout(() => {
      if (!mounted) return;
      initTimedOut = true;
      console.warn('Auth init timeout; forcing loading=false');
      setLoading(false);
    }, 5000);

    const syncProfile = async (authUser) => {
      if (!mounted || !authUser?.id) return;
      setProfileLoading(true);
      try {
        const profile = await ensureProfile(authUser);
        if (mounted) setUserProfile(profile);
      } catch (err) {
        console.error('Profile sync error:', err);
      } finally {
        if (mounted) setProfileLoading(false);
      }
    };

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session?.user) {
          if (mounted) setUser(session.user);
          if (mounted) setLoading(false);
          syncProfile(session.user);
        } else if (mounted) {
          setUser(null);
          setUserProfile(null);
          setLoading(false);
        }
      } catch (err) {
        console.error('Session init error:', err);
        if (mounted) setLoading(false);
      } finally {
        if (!initTimedOut) clearTimeout(initTimeout);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'INITIAL_SESSION') return; // Handled by initAuth

        try {
          if (session?.user) {
            if (mounted) setUser(session.user);
            if (mounted) setLoading(false);
            syncProfile(session.user);
          } else {
            if (mounted) {
              setUser(null);
              setUserProfile(null);
              setProfileLoading(false);
              setLoading(false);
            }
          }
        } catch (err) {
          console.error('Auth state change error:', err);
          if (mounted) setLoading(false);
        } finally {
          if (!initTimedOut) clearTimeout(initTimeout);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(initTimeout);
      subscription.unsubscribe();
    };
  }, [ensureProfile]);

  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data?.user) {
      const profile = await ensureProfile(data.user);
      if (profile) setUserProfile(profile);
    }
    return data;
  };

  const register = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });
    if (error) throw error;

    const userId = data?.user?.id;
    if (!userId) {
      return {
        ...data,
        needsEmailVerification: true,
        hasSession: false,
        profileReady: false
      };
    }

    const hasSession = Boolean(data.session);
    const profile = await ensureProfile(
      { id: userId, email, user_metadata: { name } },
      name
    );

    if (profile) {
      // Ensure name is correct
      if (profile.name !== name) {
        await supabase.from('profiles').update({ name }).eq('id', userId);
        profile.name = name;
      }
      setUserProfile(profile);
    } else {
      setUserProfile({ id: userId, name, email, family_id: null });
    }

    return {
      ...data,
      needsEmailVerification: !hasSession,
      hasSession,
      profileReady: Boolean(profile)
    };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      const profile = await ensureProfile(user);
      if (profile) setUserProfile(profile);
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, profileLoading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
