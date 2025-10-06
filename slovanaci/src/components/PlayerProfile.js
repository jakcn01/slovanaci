import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Loading from './Loading.js';
import Attandance from './Attandance.js';
import SharedTeamsTable from './SharedTeams.js';
import { GetTeamPlayerDataByPlayer } from '../api/teamPlayerApi.js';
import { GetPlayerData } from '../api/playersApi.js';
import { GetMatchesData } from '../api/matchesApi.js';
import { GetGoalsData } from '../api/goalsApi.js';
import { GetMatchDatesData } from '../api/matchDatesApi.js';
import { calculatePlayerGoals, getPlayerStats } from '../helpers/matchHelpers.js';
import { GetSeasonsData } from '../api/seasonsApi.js';
import DropdownFilter from './DropdownFilter.js';

const PlayerProfile = () => {
  const { id } = useParams(); // Get the player's ID from the URL
  const [player, setPlayer] = useState(null);
  const [goalsCount, setGoalsCount] = useState(0); // State to store the goals count
  const [score, setScore] = useState({goalsByTeam: 0, goalsAgainstTeam: 0}); // State to store the goals count
  const [playerStats, setPlayerStats] = useState(); 
  const [matchDates, setMatchDates] = useState(null);
  const [playerMatches, setPlayerMatches] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state
  const [seasons, setSeasons] = useState([]);
  const [seasonFilter, setSeasonFilter] = useState('0'); // Filter state for match type
  
  // Fetch player data and goals based on ID
  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        setLoading(true); // Reset loading state on id change
        const playerData = await GetPlayerData(id);
        setPlayer(playerData); // Set player data
        
        const teamPlayersData = await GetTeamPlayerDataByPlayer(id)
        const matchesData = await GetMatchesData(seasonFilter);
        const playersMatches = matchesData.filter(m => 
          teamPlayersData.some(tp => tp.TeamId.Id === m.Team1.Id) || 
          teamPlayersData.some(tp => tp.TeamId.Id === m.Team2.Id))
        const playerAttandance = [...new Set(playersMatches.map(x => {return x.MatchDateId.MatchDate}))]
        setPlayerStats(teamPlayersData)
        
        setPlayerMatches(playerAttandance)
        setScore(getPlayerStats(playersMatches, id))
        
        const goalsData = await GetGoalsData(seasonFilter);
        const totalGoals = calculatePlayerGoals(id, goalsData);
        setGoalsCount(totalGoals); // Set goals count
        
        const matchDatesData = await GetMatchDatesData(seasonFilter); 
        setMatchDates(matchDatesData)
        const sortedSeasons = await GetSeasonsData();
                
        const seasonFilterOptions = sortedSeasons.map(season => {
            return { value: season.Id.toString(), label: season.Name }
        })

        const seasonDefaultOption = sortedSeasons.find(s => s.IsCurrent);

        if (seasonFilter === '0' && seasonFilterOptions.length !== 0)
        {
            setSeasonFilter(seasonDefaultOption.Id.toString())
        }
        
        setSeasons(seasonFilterOptions)
      } catch (err) {
        console.error(err);
        setError(err.message); // Set error message
      } finally {
        setLoading(false); // Set loading to false after fetching
      }
    };

    fetchPlayerData();
  }, [id, seasonFilter]);

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
                    <DropdownFilter
                              label="Sezóna: "
                              options={seasons}
                              selectedValue={seasonFilter}
                              onChange={setSeasonFilter}
                          />
                    <h2>Statistiky</h2>
                    {player.Nickname !== null ? <p>Přezdívka: {player.Nickname}</p> : null}
                    {player.FavoritePosition !== null ? <p>Preferovaná pozice: {player.FavoritePosition}</p> : null}
                    <p>Vstřelených gólů: {goalsCount}</p>
                    <p>Celkové skóre: {score.goalsByTeam}:{score.goalsAgainstTeam}</p>
                    <Attandance matchDates={matchDates} playerMatches={playerMatches} teamPlayerData={playerStats}/>
                </div>
                <div className='right-half-column max-w-600'>
                  <SharedTeamsTable playerId={id} seasonId={seasonFilter}/> 
                </div>
            </div>
        </div>
   )
};

export default PlayerProfile;
