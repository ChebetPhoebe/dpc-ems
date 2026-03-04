import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.https://yrwtcvqaehowvwcbusjv.supabase.co;
const supabaseAnonKey = process.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlyd3RjdnFhZWhvd3Z3Y2J1c2p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI2MDczNzMsImV4cCI6MjA4ODE4MzM3M30.G2zk3URMbQUwGRir8Sg2JtXOyYnjCUKOXnFQBFCXRMc;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});