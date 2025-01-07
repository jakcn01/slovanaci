import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Loading from './Loading.js';
import Attancdance from './Attandance.js';
import SharedTeamsTable from './SharedTeams.js';
import { GetTeamPlayerDataByPlayer } from '../api/teamPlayerApi.js';
import { GetPlayerData } from '../api/playersApi.js';
import { GetMatchesData } from '../api/matchesApi.js';
import { GetGoalsData } from '../api/goalsApi.js';
import { GetMatchDatesData } from '../api/matchDatesApi.js';
import { calculatePlayerGoals, getPlayerStats } from '../helpers/matchHelpers.js';

const PlayerProfile = () => {
  const { id } = useParams(); // Get the player's ID from the URL
  const [player, setPlayer] = useState(null);
  const [goalsCount, setGoalsCount] = useState(0); // State to store the goals count
  const [score, setScore] = useState({goalsByTeam: 0, goalsAgainstTeam: 0}); // State to store the goals count
  const [matchDates, setMatchDates] = useState(null);
  const [playerMatches, setPlayerMatches] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state
  
  // Fetch player data and goals based on ID
  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        setLoading(true); // Reset loading state on id change
        const playerData = await GetPlayerData(id);
        setPlayer(playerData); // Set player data
        
        const teamPlayersData = await GetTeamPlayerDataByPlayer(id)
        const matchesData = await GetMatchesData();
        const playersMatches = matchesData.filter(x => teamPlayersData.some(y =>  y.TeamId === x.Team1.Id) || teamPlayersData.find(y =>  y.TeamId === x.Team2.Id))
        const playerAttandance = [...new Set(playersMatches.map(x => {return x.MatchDateId.MatchDate}))]
        setPlayerMatches(playerAttandance)
        setScore(getPlayerStats(playersMatches, id))

        const goalsData = await GetGoalsData();
        const totalGoals = calculatePlayerGoals(id, goalsData);
        setGoalsCount(totalGoals); // Set goals count
        
        const matchDatesData = await GetMatchDatesData(); 
        setMatchDates(matchDatesData)
        
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
                <div className="left-half-column">
                    <h2>Statistiky</h2>
                    {player.Nickname !== null ? <p>Přezdívka: {player.Nickname}</p> : null}
                    {player.FavoritePosition !== null ? <p>Preferovaná pozice: {player.FavoritePosition}</p> : null}
                    <p>Vstřelených gólů: {goalsCount}</p>
                    <p>Celkové skóre: {score.goalsByTeam}:{score.goalsAgainstTeam}</p>
                    <Attancdance matchDates={matchDates} playerMatches={playerMatches}/>
                </div>
                <div className='right-half-column max-w-600'>
                  <SharedTeamsTable playerId={id} /> 
                </div>
            </div>
        </div>
   )
};

export default PlayerProfile;
