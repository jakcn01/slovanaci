import { GetMatchById, GetTeamMatchesCount } from "../api/matchesApi";
import { calculatePercentage } from "./calculateHelpers";

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
      const team1Id = match.Team1.TeamColor.Id;
      const team2Id = match.Team2.TeamColor.Id;

      const team1Goals = calculateTeamGoals(match.Team1.Team_Players,match.Team2.Team_Players, match);
      const team2Goals = calculateTeamGoals(match.Team2.Team_Players,match.Team1.Team_Players, match);

      if (!standings[team1Id]) standings[team1Id] = { wins: 0, draws: 0, losses: 0, points: 0, goalsScored: 0, goalsConceded: 0, teamColor: match.Team1.TeamColor.Color, teamIds: [] };
      if (!standings[team2Id]) standings[team2Id] = { wins: 0, draws: 0, losses: 0, points: 0, goalsScored: 0, goalsConceded: 0, teamColor: match.Team2.TeamColor.Color, teamIds: [] };

      standings[team1Id].goalsScored += team1Goals;
      standings[team1Id].goalsConceded += team2Goals;
      standings[team2Id].goalsScored += team2Goals;
      standings[team2Id].goalsConceded += team1Goals;

      if (standings[team1Id].teamIds.indexOf(match.Team1.Id) === -1) standings[team1Id].teamIds.push(match.Team1.Id);
      if (standings[team2Id].teamIds.indexOf(match.Team2.Id) === -1) standings[team2Id].teamIds.push(match.Team2.Id);

      if (team1Goals > team2Goals) {
          standings[team1Id].points += 3;
          standings[team2Id].losses += 1;
          standings[team1Id].wins += 1;
      } else if (team1Goals < team2Goals) {
          standings[team2Id].points += 3;
          standings[team2Id].wins += 1;
          standings[team1Id].losses += 1;
      } else {
          standings[team1Id].draws += 1;
          standings[team2Id].draws += 1;
          standings[team1Id].points += 1;
          standings[team2Id].points += 1;
      }
  });

  // Convert standings to an array and sort by points, then goal difference
  return Object.keys(standings).map(teamColorId => ({
      teamColorId,
      teamIds: standings[teamColorId].teamIds,
      teamColor: standings[teamColorId].teamColor,
      points: standings[teamColorId].points,
      wins: standings[teamColorId].wins,
      draws: standings[teamColorId].draws,
      losses: standings[teamColorId].losses,
      goalsScored: standings[teamColorId].goalsScored,
      goalsConceded: standings[teamColorId].goalsConceded,
      goalDifference: standings[teamColorId].goalsScored - standings[teamColorId].goalsConceded
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
  
    let playerAllMatchesCount = 0;
    let playerAllWinsCount = 0;

    let playerSmallMatchesCount = 0;
    let playerSmallWinsCount = 0;

    let playerBigMatchesCount = 0;
    let playerBigWinsCount = 0;

    matches.forEach(match => {
      // Check Team1
      const team1Goals = match.Team1.Team_Players.flatMap(p => p.Goals); // All goals by Team1
      const team2Goals = match.Team2.Team_Players.flatMap(p => p.Goals); // All goals by Team2
  
      const isPlayerInTeam1 = match.Team1.Team_Players.some(p => p.PlayerId == id );
      const isPlayerInTeam2 = match.Team2.Team_Players.some(p => p.PlayerId == id );
  
      const goalsByTeam1 = team1Goals.reduce((sum, goal) => goal.MatchId === match.Id && goal.OwnGoal == false ? sum + goal.GoalCount : sum, 0);
      const goalsByTeam2 = team2Goals.reduce((sum, goal) => goal.MatchId === match.Id && goal.OwnGoal == false ? sum + goal.GoalCount : sum, 0);
      const ownGoalsByTeam1 = team1Goals.reduce((sum, goal) => goal.MatchId === match.Id && goal.OwnGoal == true ? sum + goal.GoalCount : sum, 0);
      const ownGoalsByTeam2 = team2Goals.reduce((sum, goal) => goal.MatchId === match.Id && goal.OwnGoal == true ? sum + goal.GoalCount : sum, 0);

      const team1goals = goalsByTeam1 + ownGoalsByTeam2;
      const team2goals = goalsByTeam2 + ownGoalsByTeam1;

      if (isPlayerInTeam1) {
        goalsByTeam += team1goals;
        goalsAgainstTeam += team2goals;
        if (team1goals > team2goals) {
          playerAllWinsCount += 1;
          if (match.SmallGame === true) {
            playerSmallWinsCount += 1;
          }
          else {
            playerBigWinsCount += 1;
          }
        }
        if (match.SmallGame === true) {
          playerSmallMatchesCount += 1;
        } else {
          playerBigMatchesCount += 1;
        }
        playerAllMatchesCount += 1;
      }
      else if (isPlayerInTeam2) {
        goalsByTeam += team2goals;
        goalsAgainstTeam += team1goals;
        if (team2goals > team1goals) {
          playerAllWinsCount += 1;
          if (match.SmallGame === true) {
            playerSmallWinsCount += 1;
          }
          else {
            playerBigWinsCount += 1;
          }
        }
        if (match.SmallGame === true) {
          playerSmallMatchesCount += 1;
        } else {
          playerBigMatchesCount += 1;
        }
        playerAllMatchesCount += 1;
      }
    });
    const allWinrate = calculatePercentage(playerAllWinsCount, playerAllMatchesCount);
    const smallWinrate = calculatePercentage(playerSmallWinsCount, playerSmallMatchesCount);
    const bigWinrate = calculatePercentage(playerBigWinsCount, playerBigMatchesCount);
    return { goalsByTeam, goalsAgainstTeam, allWinrate, smallWinrate, bigWinrate };
  }

export const createPlusMinus = (matches, id) =>
  {
    const stats = getPlayerStats(matches, id)
    return stats.goalsByTeam - stats.goalsAgainstTeam;
  }
  
export const getPlayerGoals = (tp, matchId, ownGoal = false) => {
  
  if (tp.constructor === Array)
  {
    return tp.reduce((sum, t) => sum + getPlayerGoals(t, matchId, ownGoal), 0)
  }
  
  if (matchId == null)
  {
    return tp.Goals.reduce((sum, g) => g.OwnGoal == ownGoal ? sum + g.GoalCount : sum, 0)
  } 
  
  return tp.Goals.reduce((sum, g) => g.MatchId === matchId ? g.OwnGoal == ownGoal ? sum + g.GoalCount : sum : sum, 0)
}
  
export const getPlayerGoalsString = (tp, matchId, ownGoal = false) => {
  const goalsCount = getPlayerGoals(tp, matchId, ownGoal)
  if (ownGoal === true)
  {
    return goalsCount === 0 ? "" :` [vl. ${goalsCount}]`;
  }
  return goalsCount !== 0 ? ` ${goalsCount}` : ''
}

export const getPlayerGoalsFinalString = (tp, matchId) => {
  if (tp)
  {
    return getPlayerGoalsString(tp, matchId) + getPlayerGoalsString(tp, matchId, true)
  }
  return ""
}

export const getPlayerTotalGoals = (tp) => {
  const goals = tp.Goals.filter(x => x.OwnGoal === false);
  const ownGoals = tp.Goals.filter(x => x.OwnGoal === true);
  
  const goalsCount = goals.reduce((sum, g) => sum + g.GoalCount, 0);
  const ownGoalsCount = ownGoals.reduce((sum, g) => sum + g.GoalCount, 0);

  return goalsCount > 0 ? ` ${goalsCount}` : '' + ownGoalsCount > 0 ? ` [vl. ${ownGoalsCount}]` : '';
}

export const getTeamName = (team) => {
  if (team.TeamName) {
    return team.TeamName;
  }
  return team.TeamColor?.Color;
}

export const getPlayerMatchDates = (matches, playerId) => {
  const playerMatches = matches.filter(match => 
    match.Team1.Team_Players.some(p => p.PlayerId == playerId) ||
    match.Team2.Team_Players.some(p => p.PlayerId == playerId)
  );

  const uniqueDates = [
    ...new Map(
      playerMatches.map(m => [m.MatchDateId.Id, m.MatchDateId.MatchDate])
    ).values()
  ];

  return uniqueDates;
};

export const getPlayerWinrate = async (matchDatesData, teamPlayerData) => {
  let wins = 0;
  let totalMatches = 0;
  for (const md of matchDatesData) {
    const thisMatchTeamData = teamPlayerData.filter(tp => tp.TeamId.MatchDateID.MatchDate === md.MatchDate);
    if (thisMatchTeamData.length === 0) continue; // Skip if no match data for this date
    const isWinnerResult = await isWinner(thisMatchTeamData);
    if (isWinnerResult === true) {
      wins++;
    }
    totalMatches++;
  }

  return calculatePercentage(wins, totalMatches);
}

export const isWinner = async (matchTeamData) => {
  if (matchTeamData.length === 0 || matchTeamData.every(tp => tp.TeamId.Winners === null)) return null; // No data to determine winner
  if (matchTeamData.every(tp => tp.TeamId.Winners === true)) return true;
  if (matchTeamData.every(tp => tp.TeamId.Winners === false)) return false;

  let loserMatchesCount = 0;
  let winnerMatchesCount = 0;

  for (const tp of matchTeamData) {
    const count = await GetTeamMatchesCount(tp.TeamId.Id);
    if (tp.TeamId.Winners === true) winnerMatchesCount += count;
    else loserMatchesCount += count;
  }

  if (winnerMatchesCount > loserMatchesCount) return true;
  if (loserMatchesCount > winnerMatchesCount) return false;

  return null; // Mixed data, cannot determine winner
}
