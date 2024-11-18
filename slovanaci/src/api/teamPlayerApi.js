import { supabase } from './supabase.js';

export const GetTeamPlayerDataByPlayer = async (playerId) => {
    const { data: teamPlayersData, error: teamPlayersError } = await supabase
    .from('Team_Players')
    .select('Id, PlayerId, TeamId')
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
