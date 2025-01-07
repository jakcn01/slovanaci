import React, { useState, useEffect } from 'react';
import Loading from './Loading';
import MatchResult from './MatchResult';
import { GetExtendedMatchesData } from '../api/matchesApi';
import { GetMatchDatesData } from '../api/matchDatesApi';
import DropdownFilter from './DropdownFilter.js';
import { formatDate } from '../helpers/dateHelpers.js';

const Matches = () => {
  const [matchDates, setMatchDates] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state
  const [filter, setFilter] = useState('0'); // Filter state for match type

  
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const matchesData = await GetExtendedMatchesData();
        const matchDatesData = await GetMatchDatesData();
        const sortedMatchDates = matchDatesData.sort((a, b) => new Date(b.MatchDate) - new Date(a.MatchDate));
        
        const filterOptions = sortedMatchDates.map(matchDate => {
          return { value: matchDate.Id.toString(), label: formatDate(matchDate.MatchDate) }
        })
        
        if (filter === '0' && filterOptions.length !== 0)
        {
          setFilter(filterOptions[0].value)
        }
        setMatches(matchesData.filter(x => x.MatchDates.Id.toString() === filter));
        setMatchDates(filterOptions)
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
  }, [filter]);
  

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div>Error: {error}</div>; // Display error message
  }
  
  return (
    <div className='all-matches-container'>
      <h1>Výsledky zápasů</h1>
      <DropdownFilter
                label="Datum: "
                options={matchDates}
                selectedValue={filter}
                onChange={setFilter}
            /> 
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