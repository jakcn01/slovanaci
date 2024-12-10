import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabase'; // Import your Supabase client
import { useNavigate } from 'react-router-dom';

const SharedTeamsTable = ({ playerId }) => {
  const [sharedTeams, setSharedTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSharedTeams = async () => {
      try {
        const { data, error } = await supabase.rpc('shared_teams_stats', { player_id: playerId });
        if (error) throw error;
        setSharedTeams(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedTeams();
  }, [playerId]);

  if (loading) {
    return <div>Loading shared teams...</div>;
  }

  if (error) {
    return <div>Error fetching shared teams: {error}</div>;
  }

  return (
        <table>
          <thead>
            <tr>
              <th>Spoluhráč</th>
              <th className='shared-teams-count'>Počet společných her</th>
            </tr>
          </thead>
          <tbody>
            {sharedTeams.map(({ teammate_id, teammate_name, shared_teams_count }) => (
              <tr 
                  className='scorers-row'
                  onClick={() => {setLoading(true); navigate(`/player/${teammate_id}`)}}
                  key={teammate_name}
              >
                <td>{teammate_name}</td>
                <td className='shared-teams-count'>{shared_teams_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
  );
};

export default SharedTeamsTable;
