import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import Loading from './Loading';
import MatchResult from './MatchResult';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const { data: matchesData, error: matchesError } = await supabase
          .from('Matches')
          .select(`
            Id,
            Team1 (
              TeamColor (Color),
              Team_Players (
                Id,
                Player:PlayerId (Id, Name),
                Goals (GoalCount, MatchId)
                )
              ),
            Team2 (
              TeamColor (Color),
              Team_Players (
                Id,
                Player:PlayerId (Id, Name),
                Goals (GoalCount, MatchId)
              )
            ),
            MatchOrder,
            MatchDates:MatchDates (
              MatchDate
            )
          `)
          .order('MatchOrder', { ascending: true });;
        if (matchesError) throw matchesError;
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