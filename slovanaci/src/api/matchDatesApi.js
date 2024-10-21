import { supabase } from './supabase.js'; // Import your Supabase client

export const GetMatchDatesData = async () => {
    const { data: matchDatesData, error: matchDatesError } = await supabase
        .from('MatchDates')
        .select('*')
    if (matchDatesError) throw matchDatesError; // Handle goals error
    return matchDatesData;
}