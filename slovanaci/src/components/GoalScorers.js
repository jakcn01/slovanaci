import { useState, useEffect } from 'react';
import Loading from './Loading';
import { GetGoalsData } from '../api/goalsApi';
import { GetSimplePlayerData } from '../api/playersApi';
import { calculatePlayerGoals } from '../helpers/matchHelpers';

const GoalScorers = () => {
    const [players, setPlayers] = useState(null);
    const [playerGoals, setPlayerGoals] = useState(null);
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const playersData = await GetSimplePlayerData();
                const goalsData = await GetGoalsData();
                setPlayers(playersData);
                const playerGoals = playersData.map(player => ({
                    Id: player.Id, 
                    Goals: calculatePlayerGoals(player.Id, goalsData)
                }));
                
                // Sort players by goals in descending order
                playerGoals.sort((a, b) => b.Goals - a.Goals);
                
                // Assign ranks
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
        
        fetchPlayers();
    }, []);

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        <div className='scorers-container'>
            <h1>Střelci</h1>
            <table className='scorer-table'>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Hráč</th>
                        <th>G</th>
                    </tr>
                </thead>
                <tbody>
                    {playerGoals.map(playerGoal => {
                        const player = players.find(player => player.Id === playerGoal.Id);
                        return (
                            <tr key={player.Id} className='scorer-row'>
                                <td className='scorer-position'>{playerGoal.rank}</td>
                                <td className='scorer-name'>{player.Name}</td>
                                <td className='scorer-goals'>{playerGoal.Goals}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default GoalScorers;
