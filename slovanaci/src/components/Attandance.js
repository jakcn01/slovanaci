import React from "react";
import { formatDate } from "../helpers/dateHelpers";
import { calculatePercentage } from "../helpers/calculateHelpers"
const Attancdance = ({ matchDates, playerMatches}) => {
    const wasThere = (matchDate) => 
    {
        return playerMatches.some(x => x == matchDate.toString())
    }
    return (
        <div>
            <h2>Účast</h2>
            <p>Účast: {calculatePercentage(playerMatches.length, matchDates.length)}%</p>
            <ul>
                {matchDates.map(x => {
                    return (
                        <li key={x.Id}>
                            <span>{formatDate(x.MatchDate)} - {wasThere(x.MatchDate) ? "Byl" : "Nebyl"}</span>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

export default Attancdance;