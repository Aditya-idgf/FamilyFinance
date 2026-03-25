import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cpthqvrnzccshopkhjhf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwdGhxdnJuemNjc2hvcGtoamhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyODQyNjIsImV4cCI6MjA4OTg2MDI2Mn0.jFUxkjC-La_zzijkBlxNU4M1iaYTEwfFYJ4W_gu9b8w';

// Singleton — prevent multiple clients from HMR / StrictMode
let client = null;

export function getSupabase() {
  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // Use localStorage instead of navigator.locks to avoid lock contention
        storageKey: 'ff-auth-token',
        flowType: 'pkce',
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
      }
    });
  }
  return client;
}

export const supabase = getSupabase();
