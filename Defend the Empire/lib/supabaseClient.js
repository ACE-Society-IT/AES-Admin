import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://dvynsvvmqaibybjdsukb.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2eW5zdnZtcWFpYnliamRzdWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM5NTg1NDIsImV4cCI6MjEwOTUzNDU0Mn0.F_J9N24gb-MDT4NkOoLufVWasvvGiAosRNRZUNiEJQE";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

