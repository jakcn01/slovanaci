import { supabase } from './supabase.js';

export const GetTeamPlayerDataByPlayer = async (playerId) => {
    const { data: teamPlayersData, error: teamPlayersError } = await supabase
    .from('Team_Players')
    .select('Id, PlayerId, TeamId (MatchDateID), Goals (GoalCount, MatchId, OwnGoal)')
    .eq('PlayerId', playerId);
    
    if (teamPlayersError) throw teamPlayersError;

    return teamPlayersData;
}

export const GetTeamPlayerDataByTeam = async (teamId) => {
    const { data: teamPlayersData, error: teamPlayersError } = await supabase
    .from('Team_Players')
    .select('Id, Player:PlayerId (Id, Name), TeamId')
    .eq('TeamId', teamId);
    
    if (teamPlayersError) throw teamPlayersError;

    return teamPlayersData;
}

export const GetAllTeamPlayerData = async () => {
    const { data: teamPlayersData, error: teamPlayersError } = await supabase
    .from('Team_Players')
    .select('Id, PlayerId, TeamId');
    
    if (teamPlayersError) throw teamPlayersError;

    return teamPlayersData;
}


export const AddTeamPlayer = async (teamId, playerId) => {
  const { data, error } = await supabase
    .from('Team_Players')
    .insert([{ TeamId: teamId, PlayerId: playerId }])
    .select('Id, PlayerId, Players(Id, Name)') // <-- include the Players relation
    .single();
  if (error) throw error;
  return data;
};

export const DeleteTeamPlayer = async (Id) => {
  const { error } = await supabase
    .from("Team_Players")
    .delete()
    .eq("Id", Id);

  if (error) throw error;
  return true;
};