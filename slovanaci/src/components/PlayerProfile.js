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
import { GetSeasonsData } from '../api/seasonApi.js';
import { calculatePlayerGoals, getPlayerStats } from '../helpers/matchHelpers.js';

const PlayerProfile = () => {
  const { id } = useParams(); // Get the player's ID from the URL
  const [player, setPlayer] = useState(null);
  const [goalsCount, setGoalsCount] = useState(0);
  const [score, setScore] = useState({ goalsByTeam: 0, goalsAgainstTeam: 0 });
  const [matchDates, setMatchDates] = useState(null);
  const [playerMatches, setPlayerMatches] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);

  // Fetch player data and initialize seasons
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const playerData = await GetPlayerData(id);
        setPlayer(playerData);

        const seasonsData = await GetSeasonsData();
        setSeasons(seasonsData);
        const currentSeason = seasonsData[seasonsData.length - 1];
        setSelectedSeason(currentSeason.Id); // Default to the last season
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    };

    fetchInitialData();
  }, [id]);

  // Fetch season-specific data when season or player changes
  useEffect(() => {
    if (!selectedSeason) return; // Wait until a season is selected

    const fetchSeasonData = async () => {
      setLoading(true);

      try {
        const teamPlayersData = await GetTeamPlayerDataByPlayer(id);
        const matchesData = await GetMatchesData(selectedSeason);
        const playersMatches = matchesData.filter(
          (x) =>
            teamPlayersData.some((y) => y.TeamId === x.Team1.Id) ||
            teamPlayersData.some((y) => y.TeamId === x.Team2.Id)
        );
        const playerAttendance = [
          ...new Set(playersMatches.map((x) => x.MatchDateId.MatchDate)),
        ];
        setPlayerMatches(playerAttendance);
        setScore(getPlayerStats(playersMatches, id));

        const goalsData = await GetGoalsData();
        const totalGoals = calculatePlayerGoals(id, goalsData);
        setGoalsCount(totalGoals);

        const matchDatesData = await GetMatchDatesData(selectedSeason);
        setMatchDates(matchDatesData);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSeasonData();
  }, [id, selectedSeason]);

  const handleSeasonChange = (e) => {
    setSelectedSeason(e.target.value);
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className='player-profile-container'>
      <h1>{player.Name}</h1>

      {/* Season Dropdown */}
      <div className="season-select">
        <label htmlFor="season">Vyberte sezónu:</label>
        <select
          id="season"
          value={selectedSeason || ''}
          onChange={handleSeasonChange}
        >
          {seasons.map((season) => (
            <option key={season.Id} value={season.Id}>
              {season.Name}
            </option>
          ))}
        </select>
      </div>

      <div className="player-details">
        <div className="player-info-container">
          <h2>Statistiky</h2>
          {player.Nickname && <p>Přezdívka: {player.Nickname}</p>}
          {player.FavoritePosition && <p>Preferovaná pozice: {player.FavoritePosition}</p>}
          <p>Vstřelených gólů: {goalsCount}</p>
          <p>Celkové skóre: {score.goalsByTeam}:{score.goalsAgainstTeam}</p>
          <Attancdance matchDates={matchDates} playerMatches={playerMatches} />
        </div>
        <div className='shared-teams-container'>
          <SharedTeamsTable playerId={id} />
        </div>
      </div>
    </div>
  );
};

export default PlayerProfile;
