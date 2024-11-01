import React, { useState, useEffect } from 'react';
import Loading from './Loading';
import MatchResult from './MatchResult';
import { GetExtendedMatchesData } from '../api/matchesApi';
import { GetMatchDatesData } from '../api/matchDatesApi';
import { formatDate } from '../helpers/dateHelpers';
import { calculateStandings } from '../helpers/matchHelpers';
import { GetTeamPlayersData } from '../api/teamPlayerApi';

const LastMatch = () => {
  const [matches, setMatches] = useState([]);
  const [lastDate, setLastDate] = useState(null);
  const [winners, setWinners] = useState([]);
  const [winningTeamName, setWinningTeamName] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const matchesData = await GetExtendedMatchesData();
        const matchDates = await GetMatchDatesData();
        setLastDate(matchDates.sort(x => x.MatchDate)[matchDates.length - 1].MatchDate);
        setMatches(matchesData.filter(x => x.MatchDates.MatchDate === lastDate));
        
        const standingsTable = calculateStandings(matches);
        if (standingsTable.length !== 0)
        {
            const teamPlayers = await GetTeamPlayersData(standingsTable[0].teamId)
            setWinningTeamName(standingsTable[0].teamColor)
            setWinners(teamPlayers)
        }
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
}, [lastDate, matches]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div>Error: {error}</div>; // Display error message
  }
  
  const header = matches.length === 1 ? "Poslední výsledek" : "Výsledky posledního dne";
  
  return (
    <div className='matches-container'>
        <h1>{header}</h1>
        {matches.length !== 1 && 
            <>
                <h2>{formatDate(lastDate)}</h2>
                <h2>Vítězný tým: {winningTeamName}</h2>
                <ul>
                    {winners.map(x => (
                            <li key={x.Player.Id}>
                                {x.Player.Name}
                            </li>
                        )
                    )}
                </ul>
            </>
        }
        

        {matches.length === 0 ? (
            <p>Pro dané datum nejsou dostupné žádné záznamy.</p>
        ) : (
            matches.map((match) => {
                return <MatchResult match={match} showData={false} key={match.Id} />
        })
      )}
    </div>
  );
};

export default LastMatch;