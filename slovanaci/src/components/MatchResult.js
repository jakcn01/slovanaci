import React from 'react';

const MatchResult = ({match}) => {
    const calculateGoals = (players) => {
        return players
          .reduce((sum, player) => sum + (player.Goals ? player.Goals.reduce((goalSum, g) => g.MatchId === match.Id ? goalSum + g.GoalCount : goalSum, 0) : 0), 0);
      };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('cs-CZ'); // Formats to DD.MM.YYYY
    };

    const renderTeam = (tp) => {
        return (
            <li key={tp.Id}>
                {tp.Player.Name}
                {tp.Goals && tp.Goals.filter(x => x.MatchId === match.Id).length > 0
                ? ` - ${tp.Goals.reduce((sum, g) => g.MatchId === match.Id ? sum + g.GoalCount : sum, 0)}`
                : ''}
            </li>
        ) 
    }
    const goalsScoredColor1 = calculateGoals(match.Team1.Team_Players);
    const goalsScoredColor2 = calculateGoals(match.Team2.Team_Players);

    return (
        <div key={match.Id} className='match'>
        <h2>
            {match.Team1.TeamColor.Color} vs {match.Team2.TeamColor.Color} - {goalsScoredColor1}:{goalsScoredColor2}
        </h2>
        <h3>{formatDate(match.MatchDates.MatchDate)} - zápas {match.MatchOrder}</h3>

        <div>
            <div className='team'>
            <ul>
                {match.Team1.Team_Players.map((tp) => (
                    renderTeam(tp)
                ))}
            </ul>
        </div>
        <div className='team'>
            <ul>
                {match.Team2.Team_Players.map((tp) => (
                    renderTeam(tp)
                ))}
            </ul>
        </div>
    </div>
</div>
    );
      
}

export default MatchResult;
