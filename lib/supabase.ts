import { createClient } from '@supabase/supabase-js';

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Developer helper: Fallback to localStorage for easy local testing from browser inspect console
if (typeof window !== 'undefined') {
  if (!supabaseUrl) {
    supabaseUrl = localStorage.getItem('NEXT_PUBLIC_SUPABASE_URL') || '';
  }
  if (!supabaseAnonKey) {
    supabaseAnonKey = localStorage.getItem('NEXT_PUBLIC_SUPABASE_ANON_KEY') || '';
  }
}

if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== 'undefined') {
    console.warn(
      'Supabase environment variables NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY are missing. Supabase features will be unavailable.'
    );
  }
}

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
