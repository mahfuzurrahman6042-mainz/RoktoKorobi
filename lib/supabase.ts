import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Initialize Supabase client with lazy loading
declare global {
  // eslint-disable-next-line no-var
  var __supabaseClient: SupabaseClient | undefined;
}

function createSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key are required. Please check your environment variables.');
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
}

// Use global to persist client across hot reloads in development
function getSupabaseClient(): SupabaseClient {
  if (typeof globalThis.__supabaseClient === 'undefined') {
    globalThis.__supabaseClient = createSupabaseClient();
  }
  return globalThis.__supabaseClient;
}

export const supabase = getSupabaseClient();