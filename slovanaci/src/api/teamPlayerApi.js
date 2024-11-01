import { supabase } from './supabase.js';

export const GetTeamPlayerData = async (playerId) => {
    const { data: teamPlayersData, error: teamPlayersError } = await supabase
    .from('Team_Players')
    .select('Id, PlayerId, TeamId')
    .eq('PlayerId', playerId);
    
    if (teamPlayersError) throw teamPlayersError;

    return teamPlayersData;
}

export const GetTeamPlayersData = async (teamId) => {
    const { data: teamPlayersData, error: teamPlayersError } = await supabase
    .from('Team_Players')
    .select('Id, Player:PlayerId (Id, Name), TeamId')
    .eq('TeamId', teamId);
    
    if (teamPlayersError) throw teamPlayersError;

    return teamPlayersData;
}