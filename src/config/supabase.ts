import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://vefukqmdywobusdnjqkx.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlZnVrcW1keXdvYnVzZG5qcWt4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1OTQwMDMsImV4cCI6MjA3MjE3MDAwM30.DRkLlfuIqLZ4z9iDjUG0q9rjWmo1qJPLC6FOu5YdOI8';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return supabaseUrl !== 'https://your-project.supabase.co' && supabaseKey !== 'your-anon-key';
};