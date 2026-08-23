// ============================================================
// UniPulse — Supabase Client Configuration
// ============================================================

import { createClient } from '@supabase/supabase-js';

const defaultUrl = 'https://fqagwknpeevhlfbfeghi.supabase.co';
const defaultKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxYWd3a25wZWV2aGxmYmZlZ2hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc0NDc0ODYsImV4cCI6MjEwMzAyMzQ4Nn0.T1YI4UfV7W6EqjO828AeiySlPEOGrqxenxAhtBOhDxw';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || defaultUrl;
const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  defaultKey;

export const isSupabaseConfigured = true;

export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 20,
      },
    },
  }
);
