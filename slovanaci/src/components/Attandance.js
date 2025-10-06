import React from "react";
import { formatDate } from "../helpers/dateHelpers";
import { calculatePercentage } from "../helpers/calculateHelpers"
import { getPlayerGoalsFinalString } from "../helpers/matchHelpers"

const Attandance = ({ matchDates, playerMatches, teamPlayerData}) => {
    const wasThere = (matchDate) => 
    {
        return playerMatches.some(x => x === matchDate.toString())
    }
    return (
        <div>
            <h2>Účast</h2>
            <p>Účast: {calculatePercentage(playerMatches.length, matchDates.length)}%</p>
            <ul>
                {matchDates.map(m => {
                    return (
                        <li key={m.Id}>
                            <span>
                                <b>
                                    {formatDate(m.MatchDate)} - {wasThere(m.MatchDate) ? "✓" : "✗"}
                                </b>
                                {getPlayerGoalsFinalString(teamPlayerData.filter(tp => tp.TeamId.MatchDateID.MatchDate === m.MatchDate))}
                            </span>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

export default Attandance;