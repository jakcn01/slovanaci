import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabase.js'; // Import your Supabase client
import Loading from './Loading.js';

const PlayerProfile = () => {
  const { id } = useParams(); // Get the player's ID from the URL
  const [player, setPlayer] = useState(null);
  const [goalsCount, setGoalsCount] = useState(0); // State to store the goals count
  const [score, setScore] = useState({goalsByTeam: 0, goalsAgainstTeam: 0}); // State to store the goals count
  const [attandance, setAttandance] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state

  function calculatePercentage(part, total) {
    if (total === 0) {
        return 0; // Avoid division by zero
    }
    return Math.round((part / total) * 100);
  }

  
  // Fetch player data and goals based on ID
  useEffect(() => {
    
    function getPlayerStats(matches) {
      let goalsByTeam = 0;
      let goalsAgainstTeam = 0;
    
      matches.forEach(match => {
        // Check Team1
        const team1Goals = match.Team1.Team_Players.flatMap(p => p.Goals); // All goals by Team1
        const team2Goals = match.Team2.Team_Players.flatMap(p => p.Goals); // All goals by Team2
    
        const isPlayerInTeam1 = match.Team1.Team_Players.some(p => p.PlayerId == id );
    
        if (isPlayerInTeam1) {
          goalsByTeam += team1Goals.reduce((sum, goal) => goal.MatchId === match.Id ? sum + goal.GoalCount : sum, 0);
          goalsAgainstTeam += team2Goals.reduce((sum, goal) => goal.MatchId === match.Id ? sum + goal.GoalCount : sum, 0);
        }
  
        else {
          goalsByTeam += team2Goals.reduce((sum, goal) => goal.MatchId === match.Id ? sum + goal.GoalCount : sum, 0);
          goalsAgainstTeam += team1Goals.reduce((sum, goal) => goal.MatchId === match.Id ? sum + goal.GoalCount : sum, 0);
        }
      });
      return { goalsByTeam, goalsAgainstTeam };
    }
    
    const fetchPlayerData = async () => {
      try {
        // Fetch player data
        const { data: playerData, error: playerError } = await supabase
          .from('Players') // Assuming your table name is 'players'
          .select('*') // Select all columns
          .eq('Id', id) // Match the player's ID
          .single(); // Get a single row
        if (playerError) throw playerError; // Handle player error
        setPlayer(playerData); // Set player data

        // Fetch Matches_Players for the player
        const { data: teamPlayersData, error: teamPlayersError } = await supabase
          .from('Team_Players') // Your Matches_Players table
          .select('Id, PlayerId, TeamId') // Fetch MatchPlayerId
          .eq('PlayerId', id); // Match the player's ID in Matches_Players
        if (teamPlayersError) throw teamPlayersError; // Handle matches error
        
        const { data: goalsData, error: goalsError } = await supabase
        .from('Goals') // Your Goals table
        .select('GoalCount, TeamPlayerId (PlayerId)')
        if (goalsError) throw goalsError;
        const totalGoals = goalsData.reduce((sum, goal) => goal.TeamPlayerId.PlayerId == id ? sum + goal.GoalCount : sum, 0);
        setGoalsCount(totalGoals); // Set goals count
        
        
        const { data: matchesData, error: matchesError } = await supabase
          .from('Matches')
          .select(`Id,
            Team1 ( Id, Team_Players (PlayerId, Goals ( GoalCount , MatchId))),
            Team2 ( Id, Team_Players (PlayerId, Goals ( GoalCount , MatchId))),
            MatchDateId (MatchDate)
            `
          )
        if (matchesError) throw matchesError; // Handle goals error
        const { data: matchDatesData, error: matchDatesError } = await supabase
        .from('MatchDates')
        .select('*')
        if (matchDatesError) throw matchDatesError; // Handle goals error

        const playersMatches = matchesData.filter(x => teamPlayersData.find(y =>  y.TeamId === x.Team1.Id)|| teamPlayersData.find(y =>  y.TeamId === x.Team2.Id))
        const playerAttandance = [...new Set(playersMatches.map(x => x.MatchDate))]
        setAttandance(calculatePercentage(playerAttandance.length, matchDatesData.length))


        setScore(getPlayerStats(playersMatches))
      } catch (err) {
        console.error(err);
        setError(err.message); // Set error message
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchPlayerData();
  }, [id]);

  // Render loading, error, or player details
  if (loading) {
    return <Loading />;
  }

  if (error) {
      return <div>Error: {error}</div>; // Display error message
    }
    
    return (
        <div className='player-profile-container'>
            <h1>{player.Name}</h1>
            <div className="player-details">
                <div className="player-info">
                    {player.Nickname !== null ? <p>Přezdívka: {player.Nickname}</p> : null}
                    {player.FavoritePosition !== null ? <p>Preferovaná pozice: {player.FavoritePosition}</p> : null}
                    <p>Vstřelených gólů: {goalsCount}</p>
                    <p>Účast: {attandance}%</p>
                    <p>Celkové skóre: {score.goalsByTeam}:{score.goalsAgainstTeam}</p>
                </div>
            </div>
        </div>
   )
};

export default PlayerProfile;
