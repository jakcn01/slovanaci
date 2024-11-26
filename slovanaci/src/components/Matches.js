import React, { useState, useEffect } from 'react';
import Loading from './Loading';
import MatchResult from './MatchResult';
import { GetExtendedMatchesData } from '../api/matchesApi';
import { GetSeasonsData } from '../api/seasonApi';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const seasons = await GetSeasonsData();
        const currentSeasonId = seasons[seasons.length - 2].Id
        const matchesData = await GetExtendedMatchesData(currentSeasonId); 
        setMatches(matchesData);
      }
      catch (err) {
        console.error(err);
        setError(err);
      }
      finally {
        setLoading(false)
      }
    }
    fetchMatches();
  }, []);


  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div>Error: {error}</div>; // Display error message
  }
  
  return (
    <div className='matches-container'>
      <h1>Výsledky zápasů</h1>
      {matches.length === 0 ? (
        <p>Pro dané datum nejsou dostupné žádné záznamy.</p>
      ) : (
        matches.map((match) => {
          return <MatchResult match={match} key={match.Id} />
        })
      )}
    </div>
  );
};

export default Matches;