import React from "react";
import { formatDate } from "../helpers/dateHelpers";

const Attancdance = ({ matchDates, playerMatches}) => {
    const wasThere = (matchDate) => 
    {
        return playerMatches.some(x => playerMatches == matchDate.toString())
    }
    return (
        <div>
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