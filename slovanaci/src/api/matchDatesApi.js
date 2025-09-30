import { supabase } from './supabase.js'; // Import your Supabase client

export const GetMatchDatesData = async (seasonId) => {
    const { data: matchDatesData, error: matchDatesError } = await supabase
        .from('MatchDates')
        .select('*')
        .eq('SeasonId', seasonId); // Ensures only correct season matches are included
    if (matchDatesError) throw matchDatesError; // Handle goals error
    return matchDatesData;
}

export const GetAllMatchDatesData = async () => {
    const { data: matchDatesData, error: matchDatesError } = await supabase
        .from('MatchDates')
        .select('*');
    if (matchDatesError) throw matchDatesError; // Handle goals error
    return matchDatesData;
}

export const GetMatchDateById = async (id) => {
  const { data, error } = await supabase
    .from('MatchDates')
    .select('*')
    .eq('Id', id)
    .single();
  if (error) throw error;
  return data;
};

export const UpdateMatchDate = async (id, matchDate, seasonId) => {
  const { data, error } = await supabase
    .from('MatchDates')
    .update({ MatchDate: matchDate, SeasonId: seasonId })
    .eq('Id', id)
    .select()
    .single();
 if (error) throw error;
  return data;
};

export const AddMatchDate = async (seasonId, matchDate) => {
  const { data, error } = await supabase
    .from('MatchDates')
    .insert([{ SeasonId: seasonId, MatchDate: matchDate }])
    .select()
    .single();

  if (error) throw error;
  return data;
};