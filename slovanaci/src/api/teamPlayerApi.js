import { supabase } from './supabase.js';

export const GetTeamPlayerData = async (id) => {
    const { data: teamPlayersData, error: teamPlayersError } = await supabase
    .from('Team_Players')
    .select('Id, PlayerId, TeamId')
    .eq('PlayerId', id);
    
    if (teamPlayersError) throw teamPlayersError;

    return teamPlayersData;
}