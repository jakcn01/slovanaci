import React from "react";
import { formatDate } from "../helpers/dateHelpers";
import { calculatePercentage } from "../helpers/calculateHelpers"
import { getPlayerGoalsFinalString } from "../helpers/matchHelpers"

const Attandance = ({ matchDates, playerMatches, teamPlayerData}) => {
    const wasThere = (matchDate) => 
    {
        return playerMatches.some(x => x === matchDate.toString())
    }
    console.log("teamPlayerData", teamPlayerData)
    return (
        <div>
            <h2>Účast</h2>
            <p>Účast: {calculatePercentage(playerMatches.length, matchDates.length)}%</p>
            <ul>
                {matchDates.map(x => {
                    return (
                        <li key={x.Id}>
                            <span>{formatDate(x.MatchDate)} - {wasThere(x.MatchDate) ? "Byl" : "Nebyl"}{getPlayerGoalsFinalString(teamPlayerData.find(x => x.TeamId.MatchDateID === x.Id))}</span>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

export default Attandance;