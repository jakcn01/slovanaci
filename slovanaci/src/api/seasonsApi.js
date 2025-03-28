import { supabase } from './supabase.js'; // Import your Supabase client

export const GetSeasonsData = async () => {
    const { data: matchDatesData, error: seasonsError } = await supabase
        .from('Season')
        .select('*')
        .order('Id', { ascending: true });;
    if (seasonsError) throw seasonsError; // Handle goals error
    return matchDatesData;
}