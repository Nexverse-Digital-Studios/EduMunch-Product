// This file will be auto-configured when you connect to Lovable Cloud
// For now, this provides a mock client for demo purposes

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is configured
export const isSupabaseConfigured = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

// Create a real client only if configured, otherwise null
export const supabase: SupabaseClient | null = isSupabaseConfigured 
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
