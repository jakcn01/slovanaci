import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yomeekarxicwjanpyddx.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvbWVla2FyeGljd2phbnB5ZGR4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkwMTk2NzIsImV4cCI6MjA0NDU5NTY3Mn0.J3XgzIS9V2dsbbo3veU8XmnuHQTzOvyyFtOmuuFwvBk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);