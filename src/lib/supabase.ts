import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('YOUR_SUPABASE')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

export function getBackendStatus() {
  return {
    isSupabaseConfigured,
    mode: isSupabaseConfigured ? 'Supabase Cloud PostgreSQL' : 'Local SQLite Database (Active)',
    message: isSupabaseConfigured
      ? 'Connected to Supabase Cloud PostgreSQL database.'
      : 'Using built-in persistent SQLite database. Supabase credentials (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) can be configured in .env whenever cloud deployment is desired.'
  };
}
