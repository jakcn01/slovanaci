import { supabase } from './supabase.js';

export const GetTeamColors = async () => {
  const { data, error } = await supabase
    .from('TeamColor')
    .select('*');
  if (error) throw error;
  return data;
};