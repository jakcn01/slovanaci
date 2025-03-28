import { supabase } from './supabase.js'; // Import your Supabase client

export const GetGoalsData = async (seasonId) => {
    const { data: goalsData, error: goalsError } = await supabase
        .from('Goals')
        .select(`
            GoalCount,
            TeamPlayerId ( PlayerId ),
            OwnGoal,
            MatchId!inner (
                SmallGame,
                MatchDateId!inner ( SeasonId )
            )
        `)
        .eq('MatchId.MatchDateId.SeasonId', seasonId); // Ensures only correct season matches are included

    if (goalsError) throw goalsError;
    
    return goalsData ?? []; // Return empty array if no valid data
};

