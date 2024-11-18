import { useState, useEffect } from 'react';
import Loading from './Loading';
import { GetGoalsData } from '../api/goalsApi';
import { GetSimplePlayerData } from '../api/playersApi';
import { calculatePlayerGoals, getPlayerStats, createPlusMinus } from '../helpers/matchHelpers';
import { useNavigate } from 'react-router-dom';
import { GetAllTeamPlayerData } from '../api/teamPlayerApi.js';
import { GetMatchesData } from '../api/matchesApi.js';

const GoalScorers = () => {
    
    const [players, setPlayers] = useState(null);
    const [playerGoals, setPlayerGoals] = useState(null);
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const playersData = await GetSimplePlayerData();
                const goalsData = await GetGoalsData();
                const teamPlayersData = await GetAllTeamPlayerData()
                const matchesData = await GetMatchesData();
                
                setPlayers(playersData);
                const playerGoals = playersData.map(player => ({
                    Id: player.Id, 
                    Goals: calculatePlayerGoals(player.Id, goalsData),
                    PlusMinus: createPlusMinus(matchesData.filter(x => teamPlayersData.some(y =>  y.TeamId === x.Team1.Id) || teamPlayersData.find(y =>  y.TeamId === x.Team2.Id)), player.Id)
                }));

            

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
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Hráč</th>
                        <th className='scorer-goals-header'>G</th>
                        <th className='scorer-goals-header'>+/-</th>
                    </tr>
                </thead>
                <tbody>
                    {playerGoals.map(playerGoal => {
                        const player = players.find(player => player.Id === playerGoal.Id);
                        return (
                                <tr key={player.Id} className='scorers-row' onClick={() => navigate(`/player/${player.Id}`)} >
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
