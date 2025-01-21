import React from 'react';
import { formatDate } from '../helpers/dateHelpers';
import { calculateTeamGoals } from '../helpers/matchHelpers';

const MatchResult = ({match, showData = true}) => {
    const renderTeamPlayer = (tp) => {
        const goalsCount = tp.Goals.reduce((sum, g) => g.MatchId === match.Id && g.OwnGoal == false ? sum + g.GoalCount : sum, 0)
        const goalsString = goalsCount === 0 ? ` - ${goalsCount}` : ''
        const ownGoalsCount = tp.Goals.reduce((sum, g) => g.MatchId === match.Id && g.OwnGoal == true ? sum + g.GoalCount : sum, 0)
        const ownGoalsString = ownGoalsCount === 0 ? "" :` [vl. ${ownGoalsCount}]`;
        return (
            <li key={tp.Id}>
                {tp.Player.Name}
                {tp.Goals && tp.Goals.filter(x => x.MatchId === match.Id).length > 0
                ? goalsString + ownGoalsString
                : ''}
            </li>
        ) 
    }
    const goalsScoredColor1 = calculateTeamGoals(match.Team1.Team_Players,match.Team2.Team_Players, match);
    const goalsScoredColor2 = calculateTeamGoals(match.Team2.Team_Players,match.Team1.Team_Players, match);

    return (
        <div key={match.Id} className='match'>
        <h2>
            {match.Team1.TeamColor.Color} vs {match.Team2.TeamColor.Color} - {goalsScoredColor1}:{goalsScoredColor2}
        </h2>
        {showData && <h3>{formatDate(match.MatchDates.MatchDate)} - zápas {match.MatchOrder}</h3>}

        <div>
            <div className='team'>
            <ul>
                {match.Team1.Team_Players.map((tp) => (
                    renderTeamPlayer(tp)
                ))}
            </ul>
        </div>
        <div className='team'>
            <ul>
                {match.Team2.Team_Players.map((tp) => (
                    renderTeamPlayer(tp)
                ))}
            </ul>
        </div>
    </div>
</div>
    );
      
}

export default MatchResult;
