import { createClient } from "@supabase/supabase-js";

const DEFAULT_URL = 'https://dvynsvvmqaibybjdsukb.supabase.co';
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2eW5zdnZtcWFpYnliamRzdWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM5NTg1NDIsImV4cCI6MjEwOTUzNDU0Mn0.F_J9N24gb-MDT4NkOoLufVWasvvGiAosRNRZUNiEJQE';

const supabaseUrl =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  import.meta.env?.VITE_SUPABASE_URL ||
  DEFAULT_URL;

const supabaseAnonKey =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  import.meta.env?.VITE_SUPABASE_ANON_KEY ||
  DEFAULT_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
