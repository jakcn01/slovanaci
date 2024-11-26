import { supabase } from './supabase.js'; // Import your Supabase client

export const GetMatchDatesData = async (seasonId) => {
    const { data: matchDatesData, error: matchDatesError } = await supabase
        .from('MatchDates')
        .select('*')
        .eq('SeasonId', seasonId);
        if (matchDatesError) throw matchDatesError; // Handle goals error
    return matchDatesData;
}