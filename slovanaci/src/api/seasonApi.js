import { supabase } from './supabase.js'; // Import your Supabase client

export const GetSeasonsData = async () => {
    const { data: seasonsData, error: seasonsError } = await supabase
        .from('Season') // Your Goals table
        .select('*')
        .order('Id');
    if (seasonsError) throw seasonsError;

    return seasonsData;
}