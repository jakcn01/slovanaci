import React, { useState, useEffect } from 'react';
import { supabase } from '../api/supabase'; // Import your Supabase client

const SharedTeamsTable = ({ playerId }) => {
  const [sharedTeams, setSharedTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
              <th>Počet společných her</th>
            </tr>
          </thead>
          <tbody>
            {sharedTeams.map(({ teammate_name, shared_teams_count }) => (
              <tr key={teammate_name}>
                <td>{teammate_name}</td>
                <td>{shared_teams_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
  );
};

export default SharedTeamsTable;
