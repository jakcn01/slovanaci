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

export const SaveGoals = async (matchId, goalsPayload) => {
  // Delete old
  await supabase.from("Goals").delete().eq("MatchId", matchId);

  if (goalsPayload.length > 0) {
    const { error } = await supabase.from("Goals").insert(goalsPayload);
    if (error) throw error;
  }
};