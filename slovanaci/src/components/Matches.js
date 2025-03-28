import React, { useState, useEffect } from 'react';
import Loading from './Loading';
import MatchResult from './MatchResult';
import { GetExtendedMatchesData } from '../api/matchesApi';
import { GetSeasonsData } from '../api/seasonsApi.js';
import { GetMatchDatesData } from '../api/matchDatesApi';
import DropdownFilter from './DropdownFilter.js';
import { formatDate } from '../helpers/dateHelpers.js';

const Matches = () => {
  const [matchDates, setMatchDates] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state
  const [matchesFilter, setMatchesFilter] = useState('0'); // Filter state for match type
  const [seasons, setSeasons] = useState([]);
  const [seasonFilter, setSeasonFilter] = useState('0'); // Filter state for match type

  
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const matchesData = await GetExtendedMatchesData();

        const matchDatesData = await GetMatchDatesData(seasonFilter);
        const sortedMatchDates = matchDatesData.sort((a, b) => new Date(b.MatchDate) - new Date(a.MatchDate));
        
        const matchFilterOptions = sortedMatchDates.map(matchDate => {
          return { value: matchDate.Id.toString(), label: formatDate(matchDate.MatchDate) }
        })
        
        if (matchesFilter === '0' && matchFilterOptions.length !== 0)
        {
          setMatchesFilter(matchFilterOptions[0].value)
        }
        
        const sortedSeasons = await GetSeasonsData();

        const seasonFilterOptions = sortedSeasons.map(season => {
          return { value: season.Id.toString(), label: season.Name }
        })

        if (seasonFilter === '0' && seasonFilterOptions.length !== 0)
        {
          setSeasonFilter(seasonFilterOptions[0].value)
        }

        setMatches(matchesData.filter(x => x.MatchDates.Id.toString() === matchesFilter && x.MatchDates.SeasonId.toString() === seasonFilter));

        setMatchDates(matchFilterOptions)
        setSeasons(seasonFilterOptions)
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
  }, [matchesFilter, seasonFilter]);
  

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
                label="Sezóna: "
                options={seasons}
                selectedValue={seasonFilter}
                onChange={setSeasonFilter}
            />
      <DropdownFilter
                label="Datum: "
                options={matchDates}
                selectedValue={matchesFilter}
                onChange={setMatchesFilter}
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