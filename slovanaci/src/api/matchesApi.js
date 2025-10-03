import { supabase } from './supabase.js'; // Import your Supabase client

export const GetMatchesData = async (seasonId) => {
    const { data: matchesData, error: matchesError } = await supabase
        .from('Matches')
        .select(
            `Id,
            Team1 ( 
                Id, 
                Team_Players ( 
                    PlayerId, 
                    Goals ( GoalCount, MatchId, OwnGoal ) 
                ) 
            ),
            Team2 ( 
                Id, 
                Team_Players ( 
                    PlayerId, 
                    Goals ( GoalCount, MatchId, OwnGoal ) 
                ) 
            ),
            SmallGame,
            MatchDateId!inner ( MatchDate, SeasonId )`
        )
        .eq('MatchDateId.SeasonId', seasonId); // Ensures only correct season matches are included

    if (matchesError) throw matchesError;
    
    return matchesData ?? []; // Return empty array if no valid data
};

export const GetExtendedMatchesData = async () => {
    const { data: matchesData, error: matchesError } = await supabase
        .from('Matches')
        .select(`
        Id,
        Team1 (
            Id,
            TeamColor (Color),
            Team_Players (
            Id,
            Player:PlayerId (Id, Name),
            Goals (GoalCount, MatchId, OwnGoal)
            )
            ),
        Team2 (
            Id,
            TeamColor (Color),
            Team_Players (
            Id,
            Player:PlayerId (Id, Name),
            Goals (GoalCount, MatchId, OwnGoal)
            )
        ),
        MatchOrder,
        MatchDates:MatchDates (
            MatchDate, Id, SeasonId
        )
        `)
        .order('MatchOrder', { ascending: true });;
    if (matchesError) throw matchesError;
    return matchesData;
}

export const GetMatchesForMatchDate = async (matchDateId) => {
  const { data, error } = await supabase
    .from('Matches')
    .select('Id, Team1:Team1 (Id, TeamColor:TeamColorId (Id, Color)), Team2:Team2 (Id, TeamColor:TeamColorId (Id, Color))')
    .eq('MatchDateId', matchDateId);
  if (error) throw error;
  return data;
};

export const AddMatch = async (matchDateId, team1Id, team2Id) => {
  const { data, error } = await supabase
    .from('Matches')
    .insert([{ MatchDateId: matchDateId, Team1: team1Id, Team2: team2Id }])
    .select('Id, Team1:Team1 (Id, TeamColor:TeamColorId (Id, Color)), Team2:Team2 (Id, TeamColor:TeamColorId (Id, Color))')
    .single();

  if (error) throw error;
  return data;
};

export const DeleteMatch = async (Id) => {
  const { error } = await supabase
    .from("Matches")
    .delete()
    .eq("Id", Id);

  if (error) throw error;
  return true;
};
export const GetMatchById = async (matchId) => {
  const { data, error } = await supabase
    .from("Matches")
    .select(`
      Id,
      OutsidePitch,
      SmallGame,
      Team1:Team1 (
        Id,
        TeamColor:TeamColorId (Id, Color),
        Team_Players (
          Id,
          Player:PlayerId (Id, Name),
          Goals:Goals (
            Id,
            GoalCount,
            OwnGoal,
            MatchId
          )
        )
      ),
      Team2:Team2 (
        Id,
        TeamColor:TeamColorId (Id, Color),
        Team_Players (
          Id,
          Player:PlayerId (Id, Name),
          Goals:Goals (
            Id,
            GoalCount,
            OwnGoal,
            MatchId
          )
        )
      )
    `)
    .eq("Id", matchId)
    .eq("Team1.Team_Players.Goals.MatchId", matchId)
    .eq("Team2.Team_Players.Goals.MatchId", matchId)
    .single();

  if (error) throw error;
  return data;
};


export const UpdateMatch = async (matchId, updates) => {
  const { error } = await supabase
    .from("Matches")
    .update(updates)
    .eq("Id", matchId);

  if (error) throw error;
};