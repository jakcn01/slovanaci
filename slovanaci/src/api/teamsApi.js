import { supabase } from './supabase.js';
import { GetTeamColor } from './teamColorsApi.js';

export const GetTeamsForMatchDate = async (matchDateId) => {
  const { data, error } = await supabase
    .from('Teams')
    .select('Id, TeamColorId, TeamName, TeamColor(Color), Team_Players(*, Players(*))')
    .eq('MatchDateID', matchDateId);
  if (error) throw error;
  return data;
};

export const AddTeam = async (matchDateId, teamColorId, teamName = "") => {
  
  if (teamName === "") {
    const tc = await GetTeamColor(teamColorId);
    teamName = tc.Color;
  }

  const { data, error } = await supabase
    .from("Teams")
    .insert([{ MatchDateID: matchDateId, TeamColorId: teamColorId, TeamName: teamName}])
    .select("Id, TeamName, TeamColorId, TeamColor(Color), Team_Players(Id, PlayerId, Players(Name))")
    .single();

  if (error) throw error;
  return data;
};

export const DeleteTeam = async (teamId) => {
  const { error } = await supabase
    .from("Teams")
    .delete()
    .eq("Id", teamId);

  if (error) throw error;
  return true;
};