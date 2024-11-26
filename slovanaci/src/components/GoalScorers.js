import { useState, useEffect } from 'react';
import Loading from './Loading';
import { GetGoalsData } from '../api/goalsApi';
import { GetSimplePlayerData } from '../api/playersApi';
import { calculatePlayerGoals, createPlusMinus } from '../helpers/matchHelpers';
import { useNavigate } from 'react-router-dom';
import { GetAllTeamPlayerData } from '../api/teamPlayerApi.js';
import { GetMatchesData } from '../api/matchesApi.js';
import { GetSeasonsData } from '../api/seasonApi.js';

const GoalScorers = () => {
    const [players, setPlayers] = useState(null);
    const [playerGoals, setPlayerGoals] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: 'Goals', direction: 'desc' });
    const [seasons, setSeasons] = useState([]);
    const [selectedSeason, setSelectedSeason] = useState(null); // Track selected season
    const navigate = useNavigate();

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const playersData = await GetSimplePlayerData();
                setPlayers(playersData);

                const seasonsData = await GetSeasonsData();
                setSeasons(seasonsData);
                setSelectedSeason(seasonsData[seasonsData.length - 1].Id); // Default to last season
            } catch (err) {
                console.error(err);
                setError(err.message);
            }
        };

        fetchInitialData();
    }, []);

    useEffect(() => {
        if (!selectedSeason) return; // Wait until a season is selected

        const fetchSeasonData = async () => {
            setLoading(true);

            try {
                const goalsData = await GetGoalsData();
                const teamPlayersData = await GetAllTeamPlayerData();
                const matchesData = await GetMatchesData(selectedSeason);

                const seasonMatches = matchesData.filter(match => match.SeasonId === selectedSeason);
                const playerGoals = players.map(player => ({
                    Id: player.Id,
                    Goals: calculatePlayerGoals(player.Id, goalsData.filter(goal => 
                        seasonMatches.some(match => match.Id === goal.MatchId)
                    )),
                    PlusMinus: createPlusMinus(seasonMatches, player.Id),
                }));

                playerGoals.sort((a, b) => b.Goals - a.Goals);

                const rankedPlayerGoals = playerGoals.map((player, index) => {
                    if (index > 0 && player.Goals === playerGoals[index - 1].Goals) {
                        player.rank = playerGoals[index - 1].rank; // Share rank with previous
                    } else {
                        player.rank = index + 1; // Position starts from 1
                    }
                    return player;
                });

                setPlayerGoals(rankedPlayerGoals);
            } catch (err) {
                console.error(err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchSeasonData();
    }, [players, selectedSeason]);

    const handleSeasonChange = (e) => {
        setSelectedSeason(e.target.value);
    };

    const handleSort = (key) => {
        let direction = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });

        const sortedData = [...playerGoals].sort((a, b) => {
            if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
            if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
            return 0;
        });

        setPlayerGoals(sortedData);
    };

    const getSortSymbol = (key) => {
        if (sortConfig.key === key) {
            return sortConfig.direction === 'asc' ? '▲' : '▼';
        }
        return null;
    };

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div className='scorers-container'>
            <h1>Střelci</h1>

            {/* Season Dropdown */}
            <div className="season-select">
                <label htmlFor="season">Vyberte sezónu:</label>
                <select
                    id="season"
                    value={selectedSeason || ''}
                    onChange={handleSeasonChange}
                >
                    {seasons.map(season => (
                        <option key={season.Id} value={season.Id}>
                            {season.Name}
                        </option>
                    ))}
                </select>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Hráč</th>
                        <th className='scorer-goals-header sorting-button' onClick={() => handleSort('Goals')}>
                            G {getSortSymbol('Goals')}
                        </th>
                        <th className='scorer-goals-header sorting-button' onClick={() => handleSort('PlusMinus')}>
                            +/- {getSortSymbol('PlusMinus')}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {playerGoals.map(playerGoal => {
                        const player = players.find(player => player.Id === playerGoal.Id);
                        return (
                            <tr
                                key={player.Id}
                                className='scorers-row'
                                onClick={() => navigate(`/player/${player.Id}`)}
                            >
                                <td className='scorer-position'>{playerGoal.rank}</td>
                                <td className='scorer-name'>{player.Name}</td>
                                <td className='scorer-goals'>{playerGoal.Goals}</td>
                                <td className='scorer-goals'>{playerGoal.PlusMinus}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default GoalScorers;
