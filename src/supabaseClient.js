import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.https://yrwtcvqaehowvwcbusjv.supabase.co;
const supabaseAnonKey = process.env.sb_publishable_p8unsLXu8VnecrXHUmBzmA_9mtr_taZ;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});