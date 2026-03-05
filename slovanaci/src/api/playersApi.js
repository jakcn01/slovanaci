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
    const { data: playersData, error: playersError } = await supabase.from('Players').select('*').order('Name', { ascending: true });;
    if (playersError) throw playersError;
    return playersData;
}

export const GetSimplePlayerData = async () => {
    const { data: playersData, error: playersError } = await supabase.from('Players').select('Id, Name');
    if (playersError) throw playersError;
    return playersData;
}


export const GetSimplePlayerDataForSeason = async (seasonId, type) => {

  // 1️⃣ Get match date IDs for the season
  const { data: matchDates, error: mdError } = await supabase
    .from('MatchDates')
    .select('Id')
    .eq('SeasonId', seasonId)

    const matchDateIds = matchDates.map(md => md.Id)
    
    // 2️⃣ Get matches played in those match dates
    const { data: matches, error: matchesError } = await supabase
    .from('Matches')
    .select('Team1, Team2, SmallGame')
    .in('MatchDateId', matchDateIds)
    
    if (matchesError) throw matchesError
    if (!matches?.length) return []
    let filteredMatches = matches ?? [];

    if (type === 'small') {
        filteredMatches = matches.filter(game => game.SmallGame);
    } else if (type === 'big') {
        filteredMatches = matches.filter(game => !game.SmallGame);
    }
    
  // 3️⃣ Collect all team IDs (Team1 + Team2)
  const teamIds = [
    ...new Set(
      filteredMatches.flatMap(m => [m.Team1, m.Team2])
    )
  ]

  // 4️⃣ Get team_players for those teams
  const { data: teamPlayers, error: tpError } = await supabase
    .from('Team_Players')
    .select('PlayerId')
    .in('TeamId', teamIds)

  if (tpError) throw tpError
  if (!teamPlayers?.length) return []

  const playerIds = [
    ...new Set(teamPlayers.map(tp => tp.PlayerId))
  ]

  // 5️⃣ Fetch players
  const { data: players, error: playersError } = await supabase
    .from('Players')
    .select('Id, Name')
    .in('Id', playerIds)

  if (playersError) throw playersError

  return players ?? []
}
