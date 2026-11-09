import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || 'https://dvynsvvmqaibybjdsukb.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2eW5zdnZtcWFpYnliamRzdWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM5NTg1NDIsImV4cCI6MjEwOTUzNDU0Mn0.F_J9N24gb-MDT4NkOoLufVWasvvGiAosRNRZUNiEJQE';
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env?.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2eW5zdnZtcWFpYnliamRzdWtiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5Mzk1ODU0MiwiZXhwIjoyMTA5NTM0NTQyfQ.T60Fc5XGuQJ0Z-DdP8YjRkHGRjbaZB29UcK6K6K5oHc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

export default supabase;
