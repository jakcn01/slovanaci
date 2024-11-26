import { supabase } from './supabase.js'; // Import your Supabase client

export const GetMatchesData = async (seasonId) => {
    const { data: matchesData, error: matchesError } = await supabase
        .from('Matches')
        .select(
            `Id,
            Team1 ( Id, Team_Players (PlayerId, Goals ( GoalCount , MatchId))),
            Team2 ( Id, Team_Players (PlayerId, Goals ( GoalCount , MatchId))),
            MatchDateId (MatchDate, SeasonId)`)
            .eq('MatchDateId', seasonId)
    if (matchesError) throw matchesError;
    return matchesData;
}

export const GetExtendedMatchesData = async (seasonId) => {
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
            Goals (GoalCount, MatchId)
            )
            ),
        Team2 (
            Id,
            TeamColor (Color),
            Team_Players (
            Id,
            Player:PlayerId (Id, Name),
            Goals (GoalCount, MatchId)
            )
        ),
        MatchOrder,
        MatchDates:MatchDates (
            MatchDate,
            SeasonId
        )
        `)
        .eq('MatchDates.SeasonId', seasonId)
        .order('MatchOrder', { ascending: true });;
    if (matchesError) throw matchesError;
    return matchesData;
}