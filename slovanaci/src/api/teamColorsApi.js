import { supabase } from './supabase.js';

export const GetTeamColors = async () => {
  const { data, error } = await supabase
    .from('TeamColor')
    .select('*');
  if (error) throw error;
  return data;
};


export const GetTeamColor = async (id) => {
  const { data, error } = await supabase
    .from('TeamColor')
    .select('*')
    .eq('Id', id)
    .single();
    
  if (error) throw error;
  return data;
};