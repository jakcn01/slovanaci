import React, { useState, useEffect } from 'react';
import Loading from './Loading';
import MatchResult from './MatchResult';
import { GetExtendedMatchesData } from '../api/matchesApi';
import { GetMatchDatesData } from '../api/matchDatesApi';
import { GetSeasonsData } from '../api/seasonApi';
import { formatDate } from '../helpers/dateHelpers';
import { calculateStandings } from '../helpers/matchHelpers';
import { GetTeamPlayerDataByTeam } from '../api/teamPlayerApi';

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
        const seasons = await GetSeasonsData();
        const currentSeasonId = seasons[seasons.length - 1].Id
        const matchesData = await GetExtendedMatchesData(currentSeasonId);
        const matchDates = await GetMatchDatesData(currentSeasonId);
        setLastDate(matchDates.sort(x => x.MatchDate)[matchDates.length - 1].MatchDate);
        setMatches(matchesData.filter(x => x.MatchDates.MatchDate === lastDate));
        
        const standingsTable = calculateStandings(matches);
        if (standingsTable.length !== 0)
        {
            const teamPlayers = await GetTeamPlayerDataByTeam(standingsTable[0].teamId)
            setWinningTeamName(standingsTable[0].teamColor)
            setWinners(teamPlayers)
        }
        }
        catch (err) {
            console.error(err);
            setError(err);
        }
        finally {
          if (winners && winningTeamName)
            setLoading(false)
        }
    }
    fetchMatches();
}, [lastDate, matches, winners, winningTeamName]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div>Error: {error}</div>; // Display error message
  }
  
  const header = matches.length === 1 ? "Poslední výsledek" : "Výsledky posledního dne";
  
  return (
    <div className='matches-container'>
        <h2>{header}</h2>
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