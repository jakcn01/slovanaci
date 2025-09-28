import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://qoscktdoybwgfrsnyzhh.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvc2NrdGRveWJ3Z2Zyc255emhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwODc1NzksImV4cCI6MjA3NDY2MzU3OX0.aJi0JipxfVSUtWBzblnvIPEteijRTawOKem77TyIbr0';
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);