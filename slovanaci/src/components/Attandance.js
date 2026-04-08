import React, { useEffect, useState } from "react";
import { formatDate } from "../helpers/dateHelpers";
import { calculatePercentage } from "../helpers/calculateHelpers"
import { getPlayerGoalsFinalString, isWinner } from "../helpers/matchHelpers"
import "../css/Attandance.css"

const Attandance = ({ matchDates, playerMatches, teamPlayerData}) => {
    const [winnerResults, setWinnerResults] = useState({});

    useEffect(() => {
        const resolveWinners = async () => {
            const results = {};
            for (const m of matchDates) {
                const matchTeamData = teamPlayerData.filter(tp => tp.TeamId.MatchDateID.MatchDate === m.MatchDate);
                results[m.MatchDate] = await isWinner(matchTeamData);
            }
            setWinnerResults(results);
        };
        resolveWinners();
    }, [matchDates, teamPlayerData]);

    const wasThere = (matchDate) => 
    {
        return playerMatches.some(x => x === matchDate.toString())
    }
    return (
        <div>
            <h2>Účast</h2>
            <p>Účast: {calculatePercentage(playerMatches.length, matchDates.length)}%</p>
            <ul>
                {matchDates.map((m) => {
                    const matchTeamData = teamPlayerData.filter(tp => tp.TeamId.MatchDateID.MatchDate === m.MatchDate);
                    const isWinnerResult = winnerResults[m.MatchDate];
                    const colorClass = isWinnerResult === true ? "win"
                                     : isWinnerResult === false ? "loss" 
                                     : "draw";
                    return (
                        <li
                            key={m.Id}
                            className={`attendance-item ${colorClass}`}
                        >
                            <span>
                                <b>
                                    {formatDate(m.MatchDate)} - {wasThere(m.MatchDate) ? "✓" : "✗"}
                                </b>
                                {getPlayerGoalsFinalString(matchTeamData)}
                            </span>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

export default Attandance;