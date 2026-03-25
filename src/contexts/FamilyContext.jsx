import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';

const FamilyContext = createContext(null);

export function useFamily() {
  const context = useContext(FamilyContext);
  if (!context) throw new Error('useFamily must be used within FamilyProvider');
  return context;
}

export function FamilyProvider({ children }) {
  const { userProfile, loading: authLoading } = useAuth();
  const [family, setFamily] = useState(null);
  const [loading, setLoading] = useState(authLoading);

  useEffect(() => {
    if (authLoading) return;
    let isActive = true;
    let channel = null;

    const run = async () => {
      if (!userProfile?.family_id) {
        if (isActive) {
          setFamily(null);
          setLoading(false);
        }
        return;
      }

      if (isActive) setLoading(true);

      const { data, error } = await supabase
        .from('families')
        .select('*')
        .eq('family_id', userProfile.family_id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching family:', error.message);
        if (isActive) setFamily(null);
      } else {
        if (isActive) setFamily(data || null);
      }
      if (isActive) setLoading(false);

      channel = supabase
        .channel(`family-${userProfile.family_id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'families',
            filter: `family_id=eq.${userProfile.family_id}`
          },
          (payload) => {
            if (!isActive) return;
            if (payload.eventType === 'DELETE') {
              setFamily(null);
            } else {
              setFamily(payload.new || null);
            }
          }
        )
        .subscribe();
    };

    run();

    return () => {
      isActive = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [authLoading, userProfile?.family_id]);

  const members = family?.members
    ? Object.entries(family.members).map(([id, data]) => ({ id, ...data }))
    : [];

  const value = {
    family,
    members,
    loading,
    settings: family?.settings || { currency: 'INR' }
  };

  return (
    <FamilyContext.Provider value={value}>
      {children}
    </FamilyContext.Provider>
  );
}
