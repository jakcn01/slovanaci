import { useState, useEffect } from 'react'
import { supabase } from '../supabase';
import { Link } from 'react-router-dom';
import Loading from './Loading';

const Players = () => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true); // Add loading state
    const [error, setError] = useState(null); // Add error state

    
    useEffect(() => {
      const fetchPlayers = async () => {
        try {
          const { data: playersData, error: playersError } = await supabase.from('Players').select('*');
          if (playersError) throw playersError;
          setPlayers(playersData);
        }
        catch (err) {
          console.error(err);
          setError(err);
        }
        finally {
          setLoading(false)
        }
      }
      fetchPlayers();
    }, []);
  
    if (loading) {
      return <Loading />;
    }
  
    if (error) {
      return <div>Error: {error}</div>; // Display error message
    }

    return (
      <div className='players-container'>
        <h1>Všichni hráči</h1>
        <ul className='player-list'>
          {players.map(player => (
            <li key={player.Id} className='player-item'> 
              <Link to={`/player/${player.Id}`}>
                <span className='player-name'>
                  {player.Name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  export default Players;