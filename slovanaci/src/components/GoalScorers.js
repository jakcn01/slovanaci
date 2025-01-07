import { useState, useEffect } from 'react';
import Loading from './Loading';
import { GetGoalsData } from '../api/goalsApi';
import { GetSimplePlayerData } from '../api/playersApi';
import { calculatePlayerGoals, createPlusMinus } from '../helpers/matchHelpers';
import { useNavigate } from 'react-router-dom';
import { GetAllTeamPlayerData } from '../api/teamPlayerApi.js';
import { GetMatchesData } from '../api/matchesApi.js';
import DropdownFilter from './DropdownFilter.js';

const GoalScorers = () => {
    const [players, setPlayers] = useState(null);
    const [playerGoals, setPlayerGoals] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('small'); // Filter state for match type
    const [sortConfig, setSortConfig] = useState({ key: 'Goals', direction: 'desc' }); // Default sort
    const navigate = useNavigate();
    const filterOptions = [
        { value: 'all', label: 'Vše' },
        { value: 'small', label: 'Turnájky' },
        { value: 'big', label: 'Zápasy' },
    ];
    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                setLoading(true);
                const playersData = await GetSimplePlayerData();
                const goalsData = await GetGoalsData();
                const teamPlayersData = await GetAllTeamPlayerData();
                const matchesData = await GetMatchesData();

                setPlayers(playersData);

                const filteredMatches = filterMatches(matchesData, filter); // Apply filter
                const filteredGoals = filterGoals(goalsData, filter); // Apply filter

                const playerGoals = playersData.map(player => ({
                    Id: player.Id,
                    Goals: calculatePlayerGoals(player.Id, filteredGoals),
                    PlusMinus: createPlusMinus(
                        filteredMatches.filter(
                            x =>
                                teamPlayersData.some(y => y.TeamId === x.Team1.Id) ||
                                teamPlayersData.find(y => y.TeamId === x.Team2.Id)
                        ),
                        player.Id
                    )
                }));

                const rankedPlayerGoals = rankPlayersByGoals(playerGoals);
                setPlayerGoals(rankedPlayerGoals);
            } catch (err) {
                console.error(err);
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPlayers();
    }, [filter]); // Rerun when the filter changes

    const filterMatches = (matches, filter) => {
        if (filter === 'small') return matches.filter(match => match.SmallGame);
        if (filter === 'big') return matches.filter(match => !match.SmallGame);
        return matches; // All matches
    };

    const filterGoals = (goals, filter) => {
        if (filter === 'small') return goals.filter(goal => goal.MatchId.SmallGame);
        if (filter === 'big') return goals.filter(goal => !goal.MatchId.SmallGame);
        return goals; // All matches
    };

    const rankPlayersByGoals = (playerGoals) => {
        playerGoals.sort((a, b) => b.Goals - a.Goals);
        return playerGoals.map((player, index) => {
            if (index > 0 && player.Goals === playerGoals[index - 1].Goals) {
                player.rank = playerGoals[index - 1].rank; // Share rank with previous
            } else {
                player.rank = index + 1; // Position starts from 1
            }
            return player;
        });
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
            <DropdownFilter
                label="Druh zápasu: "
                options={filterOptions}
                selectedValue={filter}
                onChange={setFilter}
            />
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
