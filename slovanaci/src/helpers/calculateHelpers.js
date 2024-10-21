export const calculatePercentage = (part, total) =>{
    if (total === 0) {
        return 0; // Avoid division by zero
    }
    return Math.round((part / total) * 100);
  }

export const calculateGoals = (players, match) => {
    return players
      .reduce((sum, player) => sum + (player.Goals ? player.Goals.reduce((goalSum, g) => g.MatchId === match.Id ? goalSum + g.GoalCount : goalSum, 0) : 0), 0);
  };
