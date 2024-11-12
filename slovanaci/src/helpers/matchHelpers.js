export const calculateTeamGoals = (players, match) => {
    return players
      .reduce((sum, player) => sum + (player.Goals ? player.Goals.reduce((goalSum, g) => g.MatchId === match.Id ? goalSum + g.GoalCount : goalSum, 0) : 0), 0);
  };

// Calculate standings from matches data
export const calculateStandings = (matchesData) => {
  const standings = {};

  matchesData.forEach(match => {
      const team1Id = match.Team1.Id;
      const team2Id = match.Team2.Id;

      const team1Goals = calculateTeamGoals(match.Team1.Team_Players, match);
      const team2Goals = calculateTeamGoals(match.Team2.Team_Players, match);

      if (!standings[team1Id]) standings[team1Id] = { points: 0, goalsScored: 0, goalsConceded: 0, teamColor: match.Team1.TeamColor.Color };
      if (!standings[team2Id]) standings[team2Id] = { points: 0, goalsScored: 0, goalsConceded: 0, teamColor: match.Team2.TeamColor.Color  };

      standings[team1Id].goalsScored += team1Goals;
      standings[team1Id].goalsConceded += team2Goals;
      standings[team2Id].goalsScored += team2Goals;
      standings[team2Id].goalsConceded += team1Goals;

      if (team1Goals > team2Goals) {
          standings[team1Id].points += 3;
      } else if (team1Goals < team2Goals) {
          standings[team2Id].points += 3;
      } else {
          standings[team1Id].points += 1;
          standings[team2Id].points += 1;
      }
  });

  // Convert standings to an array and sort by points, then goal difference
  return Object.keys(standings).map(teamId => ({
      teamId,
      teamColor: standings[teamId].teamColor,
      points: standings[teamId].points,
      goalsScored: standings[teamId].goalsScored,
      goalsConceded: standings[teamId].goalsConceded,
      goalDifference: standings[teamId].goalsScored - standings[teamId].goalsConceded
  }))
  .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
};

export const calculatePlayerGoals = (playerId, goals) => {
    return goals.reduce((sum, goal) => goal.TeamPlayerId.PlayerId == playerId ? sum + goal.GoalCount : sum, 0);
}