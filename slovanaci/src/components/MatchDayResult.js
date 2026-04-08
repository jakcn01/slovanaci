import React, { useState, useEffect } from 'react';
import Loading from './Loading';
import MatchResult from './MatchResult';
import { GetExtendedMatchesData } from '../api/matchesApi';
import { GetAllMatchDatesData } from '../api/matchDatesApi';
import { formatDate } from '../helpers/dateHelpers';
import { GetTeamsForMatchDate } from '../api/teamsApi';
import { getPlayerTotalGoals, calculateStandings, getTeamName } from '../helpers/matchHelpers';
import { GetTeamPlayerDataByTeam } from '../api/teamPlayerApi';

const MatchDayResult = ({matchDayDateId = null}) => {
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [date, setDate] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state
  const [standings, setStandings] = useState(null); 

  useEffect(() => {
    const fetchMatches = async () => {
      const matchDates = await GetAllMatchDatesData();

      if (matchDayDateId === null) {
        const sortedMatchDates = matchDates.sort((a, b) => new Date(a.MatchDate) - new Date(b.MatchDate));
        const lastDate = sortedMatchDates[sortedMatchDates.length - 1];
        setDate(lastDate);
      }
      else
      {
        const selectedDate = matchDates.find(x => x.Id == matchDayDateId);
        setDate(selectedDate);
      }


      try {
        // Filter matches for the last date
        const matchesData = await GetExtendedMatchesData();
        const filteredMatches = matchesData.filter(x => x.MatchDates.MatchDate === date?.MatchDate);
        setMatches(filteredMatches);
  
        // If matches are available, calculate standings
        if (filteredMatches.length > 0) {
          const standingsTable = calculateStandings(filteredMatches);
          setStandings(standingsTable)
          if (standingsTable.length > 0) {
            // Resolve all team data with color and players

            const teams = await GetTeamsForMatchDate(date?.Id);
            const teamDataPromises = teams.map(async x => {
              const players = await GetTeamPlayerDataByTeam(x.Id);
              return { name: getTeamName(x), players };
            });

            const resolvedTeams = await Promise.all(teamDataPromises);
            setTeams(resolvedTeams);
          }
        }
      } catch (err) {
        console.error(err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMatches();
    // Empty dependency array to ensure the effect runs only on mount
  }, [ date?.Id, date?.MatchDate, matchDayDateId]);
  
  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div>Error: {error}</div>; // Display error message
  }
  
  const header = matches.length === 1 ? "Výsledek dne" : "Výsledky dne";
  
  return matches.filter(x => x.SmallGame === true).length === 0 ? 
  (
    <div>
      <h2>{header} {formatDate(date?.MatchDate)}</h2>
      {
        matches.map(x => {
              return <MatchResult match={x} key={x.Id} />
        }) 
      }
    </div>
  ) : 
  (
    <div>
      <h2>{header} {formatDate(date?.MatchDate)}</h2>
      <div className='matches-container'>
        <div className='right-half-column'>
          <div className='stick'>
            <div className='flex-center-container'>
            <div className='max-w-600'>
              <div className='flex-center-container all-teams'>
              {
                teams.map(team => (
                  <div key={team.Id}>
                    <h2>{team.name}</h2>
                    <div className='team'>
                      <ul>
                        {team.players.map(x => (
                          <li key={x.Player.Id}>
                            {x.Player.Name}
                            {getPlayerTotalGoals(x)}
                          </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                  )
                )
              }
              </div>
            </div>
            </div>
            <div className='flex-center-container'>
              <div className='max-w-600'>
                <table>
                  <thead>
                    <tr>
                      <th>Tým</th>
                      <th className='table-center-column'>V</th>
                      <th className='table-center-column'>R</th>
                      <th className='table-center-column'>P</th>
                      <th className='table-center-column'>Body</th>
                      <th className='table-center-column'>Skóre</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings && standings.map(team => (
                      <tr key={team.teamColorId}>
                        <td>{team.teamColor}</td>
                        <td className='table-center-column'>{team.wins}</td>
                        <td className='table-center-column'>{team.draws}</td>
                        <td className='table-center-column'>{team.losses}</td>
                        <td className='table-center-column'>{team.points}</td>
                        <td className='table-center-column'>{team.goalsScored}:{team.goalsConceded}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div className='left-half-column'>
          {matches.length === 0 ? (
            <p>Pro dané datum nejsou dostupné žádné záznamy.</p>
          ) : (
            matches.map((match) => {
              return <MatchResult match={match} key={match.Id} />
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchDayResult;