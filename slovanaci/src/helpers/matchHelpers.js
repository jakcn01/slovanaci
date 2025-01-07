export const calculateTeamGoals = (players, oponents, match) => {
    const goalsByYourTeam = players
      .reduce((sum, player) => sum + (player.Goals ? player.Goals.reduce((goalSum, g) => g.MatchId === match.Id && g.OwnGoal == false ? goalSum + g.GoalCount : goalSum, 0) : 0), 0);
    const goalsByOponentTeam = oponents
      .reduce((sum, player) => sum + (player.Goals ? player.Goals.reduce((goalSum, g) => g.MatchId === match.Id && g.OwnGoal == true ? goalSum + g.GoalCount : goalSum, 0) : 0), 0);
    return goalsByOponentTeam + goalsByYourTeam
    };

// Calculate standings from matches data
export const calculateStandings = (matchesData) => {
  const standings = {};

  matchesData.forEach(match => {
      const team1Id = match.Team1.Id;
      const team2Id = match.Team2.Id;

      const team1Goals = calculateTeamGoals(match.Team1.Team_Players,match.Team2.Team_Players, match);
      const team2Goals = calculateTeamGoals(match.Team2.Team_Players,match.Team1.Team_Players, match);

      if (!standings[team1Id]) standings[team1Id] = { wins: 0, draws: 0, losses: 0, points: 0, goalsScored: 0, goalsConceded: 0, teamColor: match.Team1.TeamColor.Color };
      if (!standings[team2Id]) standings[team2Id] = { wins: 0, draws: 0, losses: 0, points: 0, goalsScored: 0, goalsConceded: 0, teamColor: match.Team2.TeamColor.Color  };

      standings[team1Id].goalsScored += team1Goals;
      standings[team1Id].goalsConceded += team2Goals;
      standings[team2Id].goalsScored += team2Goals;
      standings[team2Id].goalsConceded += team1Goals;

      if (team1Goals > team2Goals) {
          standings[team1Id].points += 3;
          standings[team1Id].losses += 1;
          standings[team2Id].wins += 1;
      } else if (team1Goals < team2Goals) {
          standings[team2Id].points += 3;
          standings[team1Id].wins += 1;
          standings[team2Id].losses += 1;
      } else {
          standings[team1Id].draws += 1;
          standings[team2Id].draws += 1;
          standings[team1Id].points += 1;
          standings[team2Id].points += 1;
      }
  });

  // Convert standings to an array and sort by points, then goal difference
  return Object.keys(standings).map(teamId => ({
      teamId,
      teamColor: standings[teamId].teamColor,
      points: standings[teamId].points,
      wins: standings[teamId].wins,
      draws: standings[teamId].draws,
      losses: standings[teamId].losses,
      goalsScored: standings[teamId].goalsScored,
      goalsConceded: standings[teamId].goalsConceded,
      goalDifference: standings[teamId].goalsScored - standings[teamId].goalsConceded
  }))
  .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference);
};

export const calculatePlayerGoals = (playerId, goals) => {
    const notOwnGoals = goals.filter(goal => goal.OwnGoal == false);
    return notOwnGoals.reduce((sum, goal) => goal.TeamPlayerId.PlayerId == playerId ? sum + goal.GoalCount : sum, 0);
}

export const getPlayerStats = (matches, id) => {
    let goalsByTeam = 0;
    let goalsAgainstTeam = 0;
  
    matches.forEach(match => {
      // Check Team1
      const team1Goals = match.Team1.Team_Players.flatMap(p => p.Goals); // All goals by Team1
      const team2Goals = match.Team2.Team_Players.flatMap(p => p.Goals); // All goals by Team2
  
      const isPlayerInTeam1 = match.Team1.Team_Players.some(p => p.PlayerId == id );
      const isPlayerInTeam2 = match.Team2.Team_Players.some(p => p.PlayerId == id );
  
      if (isPlayerInTeam1) {
        goalsByTeam += team1Goals.reduce((sum, goal) => goal.MatchId === match.Id && goal.OwnGoal == false ? sum + goal.GoalCount : sum, 0);
        goalsAgainstTeam += team1Goals.reduce((sum, goal) => goal.MatchId === match.Id && goal.OwnGoal == true ? sum + goal.GoalCount : sum, 0);
        goalsAgainstTeam += team2Goals.reduce((sum, goal) => goal.MatchId === match.Id && goal.OwnGoal == false ? sum + goal.GoalCount : sum, 0);
        goalsByTeam += team2Goals.reduce((sum, goal) => goal.MatchId === match.Id && goal.OwnGoal == true ? sum + goal.GoalCount : sum, 0);
      }

      else if (isPlayerInTeam2) {
        goalsByTeam += team2Goals.reduce((sum, goal) => goal.MatchId === match.Id && goal.OwnGoal == false ? sum + goal.GoalCount : sum, 0);
        goalsAgainstTeam += team2Goals.reduce((sum, goal) => goal.MatchId === match.Id && goal.OwnGoal == true ? sum + goal.GoalCount : sum, 0);
        goalsAgainstTeam += team1Goals.reduce((sum, goal) => goal.MatchId === match.Id && goal.OwnGoal == false ? sum + goal.GoalCount : sum, 0);
        goalsByTeam += team1Goals.reduce((sum, goal) => goal.MatchId === match.Id && goal.OwnGoal == true ? sum + goal.GoalCount : sum, 0);
      }
    });
    return { goalsByTeam, goalsAgainstTeam };
  }

export const createPlusMinus = (matches, id) =>
  {
    const stats = getPlayerStats(matches, id)
    return stats.goalsByTeam - stats.goalsAgainstTeam;
  }
  