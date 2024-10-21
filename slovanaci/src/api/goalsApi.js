import { supabase } from './supabase.js'; // Import your Supabase client

export const GetGoalsData = async () => {
    const { data: goalsData, error: goalsError } = await supabase
        .from('Goals') // Your Goals table
        .select('GoalCount, TeamPlayerId (PlayerId)')
    if (goalsError) throw goalsError;

    return goalsData;
}