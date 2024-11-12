import { supabase } from './supabase.js'; // Import your Supabase client

export const GetPlayerData = async (id) => {
    const { data: playerData, error: playerError } = await supabase
        .from('Players') // Assuming your table name is 'players'
        .select('*') // Select all columns
        .eq('Id', id) // Match the player's ID
        .single(); // Get a single row
    if (playerError) throw playerError; // Handle player error
    return playerData;
}

export const GetPlayersData = async () => {
    const { data: playersData, error: playersError } = await supabase.from('Players').select('*');
    if (playersError) throw playersError;
    return playersData;
}

export const GetSimplePlayerData = async () => {
    const { data: playersData, error: playersError } = await supabase.from('Players').select('Id, Name');
    if (playersError) throw playersError;
    return playersData;
}