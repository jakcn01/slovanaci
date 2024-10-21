import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
import Loading from './Loading';
import { GetPlayersData } from '../api/playersApi';

const Players = () => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true); // Add loading state
    const [error, setError] = useState(null); // Add error state

    
    useEffect(() => {
      const fetchPlayers = async () => {
        try {
          const playersData = await GetPlayersData();
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
      return <div>Error: {error}</div>;
    }

    return (
      <div className='players-container'>
        <h1>Všichni hráči</h1>
        <ul className='player-list'>
          {players.map(player => (
            <Link key={player.Id} to={`/player/${player.Id}`}>
              <li className='player-item'> 
                <span className='player-name'>
                  {player.Name}
                </span>
              </li>
            </Link>
          ))}
        </ul>
      </div>
    );
  };
  
  export default Players;