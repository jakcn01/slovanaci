import React, { useState, useEffect } from 'react';
import Loading from './Loading';
import MatchResult from './MatchResult';
import { GetExtendedMatchesData } from '../api/matchesApi';
import { GetAllMatchDatesData } from '../api/matchDatesApi';
import { formatDate } from '../helpers/dateHelpers';
import { GetTeamsForMatchDate } from '../api/teamsApi';
import { calculateStandings, getTeamName } from '../helpers/matchHelpers';
import { GetTeamPlayerDataByMatchDateId, GetTeamPlayerDataByTeam } from '../api/teamPlayerApi';

const LastMatch = () => {
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [lastDate, setLastDate] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state
  const [standings, setStandings] = useState(null); 

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const matchesData = await GetExtendedMatchesData();
        const matchDates = await GetAllMatchDatesData();
        
        // Calculate the last date
        const sortedMatchDates = matchDates.sort((a, b) => new Date(a.MatchDate) - new Date(b.MatchDate));
        const lastDate = sortedMatchDates[sortedMatchDates.length - 1].MatchDate;
        const lastDateId = sortedMatchDates[sortedMatchDates.length - 1].Id;
        setLastDate(lastDate);
  
        // Filter matches for the last date
        const filteredMatches = matchesData.filter(x => x.MatchDates.MatchDate === lastDate);
        setMatches(filteredMatches);
  
        // If matches are available, calculate standings
        if (filteredMatches.length > 0) {
          const standingsTable = calculateStandings(filteredMatches);
          setStandings(standingsTable)
          if (standingsTable.length > 0) {
            // Resolve all team data with color and players

            const teams = await GetTeamsForMatchDate(lastDateId);
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
  }, []);
  
  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div>Error: {error}</div>; // Display error message
  }
  
  const header = matches.length === 1 ? "Poslední výsledek" : "Výsledky posledního dne";
  
  return matches.length === 1 ? 
  (
    <MatchResult match={matches[0]} showData={false} />
  ) : 
  (
    <div>
      <h2>{header}</h2>
      <h2>{formatDate(lastDate)}</h2>
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
                      <tr key={team.teamId}>
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
              return <MatchResult match={match} showData={false} key={match.Id} />
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default LastMatch;