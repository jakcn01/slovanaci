import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { GetPlayersData } from "../api/playersApi";
import { GetMatchDateById, UpdateMatchDate } from "../api/matchDatesApi";
import { AddTeamPlayer, DeleteTeamPlayer } from "../api/teamPlayerApi";
import { GetTeamColors } from "../api/teamColorsApi";
import { AddTeam, DeleteTeam, GetTeamsForMatchDate } from "../api/teamsApi";
import { AddMatch, DeleteMatch, GetMatchesForMatchDate } from "../api/matchesApi";
import DropdownFilter from "./DropdownFilter";

const EditMatchDate = () => {
  const { id } = useParams(); // from URL
  const [matchDate, setMatchDate] = useState(null);
  const [selectedColor, setSelectedColor] = useState("0");
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teamColors, setTeamColors] = useState([]);
  const [selectedTeam1, setSelectedTeam1] = useState("0");
  const [selectedTeam2, setSelectedTeam2] = useState("0");

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const md = await GetMatchDateById(id);
        setMatchDate(md);

        const t = await GetTeamsForMatchDate(id);
        setTeams(t);

        const m = await GetMatchesForMatchDate(id);
        setMatches(m);

        const c = await GetTeamColors();
        setTeamColors(c);
        
        const p = await GetPlayersData();
        setAllPlayers(p);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleDateChange = async (e) => {
    try {
      // input returns "YYYY-MM-DD"
      const picked = e.target.value;
      const iso = new Date(picked + 'T00:00:00Z').toISOString();
      
      const updated = await UpdateMatchDate(id, iso, matchDate.SeasonId);
      setMatchDate(updated);
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  // Add new team
  const handleAddTeam = async () => {
    if (teamColors.length === 0) return;

    const teamColorId = prompt(
      "Pick team color ID:\n" +
        teamColors.map((c) => `${c.Id}: ${c.Color}`).join("\n")
    );
    if (!teamColorId) return;

    const newTeam = await AddTeam(id, parseInt(teamColorId, 10));
    setTeams((prev) => [...prev, newTeam]);
  };

  // Add new match
  const handleAddMatch = async () => {
    if (teams.length < 2) {
      alert("Need at least 2 teams");
      return;
    }
    const team1Id = prompt("Team1 Id?");
    const team2Id = prompt("Team2 Id?");
    if (!team1Id || !team2Id) return;
    const newMatch = await AddMatch(id, team1Id, team2Id);
    setMatches((prev) => [...prev, newMatch]);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>Edit Match Date</h2>

      {/* Date */}
      <label>
        Match Date:
        <input
          type="date"
          value={matchDate.MatchDate.split("T")[0]}
          onChange={handleDateChange}
        />
      </label>

      {/* Teams */}
      <h3>Add Team</h3>
      <DropdownFilter
        label="Select team color: "
        options={teamColors.map(c => ({ value: c.Id.toString(), label: c.Color }))}
        selectedValue={selectedColor}
        onChange={setSelectedColor}
      />

      <button
        onClick={async () => {
          if (selectedColor === "0") return;
          const newTeam = await AddTeam(id, parseInt(selectedColor, 10));
          setTeams(prev => [...prev, newTeam]);
          setSelectedColor("0"); // reset
        }}
      >
        ➕ Add Team
      </button>

      <ul>
        {teams.map((team) => (
          <li key={team.Id}>
            <strong>{team.TeamColor?.Color}</strong>{" "}
            <button onClick={async () => {
              try {
                await DeleteTeam(team.Id);
                setTeams(prev => prev.filter(t => t.Id !== team.Id));
              } catch (err) {
                console.error("Failed to delete team:", err.message);
              }
            }}>
              ❌ Remove
            </button>
            {/* Add Player Dropdown */}
<DropdownFilter
  label="Select player: "
  options={allPlayers.map(p => ({ value: p.Id.toString(), label: p.Name }))}
  selectedValue={team.selectedPlayer || "0"}
  onChange={(val) => {
    // store selected player temporarily in team state
    setTeams(prev =>
      prev.map(t =>
        t.Id === team.Id ? { ...t, selectedPlayer: val } : t
      )
    );
  }}
/>
<button
  onClick={async () => {
    const selected = team.selectedPlayer;
    if (!selected || selected === "0") return;
    try {
      const newTP = await AddTeamPlayer(team.Id, parseInt(selected, 10));
      console.log(newTP);
      setTeams(prev =>
        prev.map(t =>
          t.Id === team.Id
            ? { ...t, Team_Players: [...(t.Team_Players || []), newTP], selectedPlayer: "0" }
            : t
        )
      );
    } catch (err) {
      console.error("Failed to add player:", err.message);
    }
  }}
>
  ➕ Add Player
</button>

{/* Existing Players */}
<ul>
  {team.Team_Players?.map((tp) => (
    <li key={tp.Id}>
      {console.log(tp)}
      {tp.Players?.Name}
      <button
        onClick={async () => {
          try {
            await DeleteTeamPlayer(tp.Id);
            setTeams(prev =>
              prev.map(t =>
                t.Id === team.Id
                  ? {
                      ...t,
                      Team_Players: t.Team_Players.filter(p => p.Id !== tp.Id),
                    }
                  : t
              )
            );
          } catch (err) {
            console.error("Failed to delete player:", err.message);
          }
        }}
      >
        ❌ Remove
      </button>
    </li>
  ))}
</ul>

          </li>
        ))}
      </ul>

      {/* Matches */}
      <h3>Matches</h3>
<h3>Add Match</h3>
<DropdownFilter
  label="Team 1:"
  options={teams.map(t => ({
    value: t.Id.toString(),
    label: t.TeamColor?.Color || `Team ${t.Id}`
  }))}
  selectedValue={selectedTeam1}
  onChange={setSelectedTeam1}
/>

<DropdownFilter
  label="Team 2:"
  options={teams.map(t => ({
    value: t.Id.toString(),
    label: t.TeamColor?.Color || `Team ${t.Id}`
  }))}
  selectedValue={selectedTeam2}
  onChange={setSelectedTeam2}
/>

<button
  onClick={async () => {
    if (selectedTeam1 === "0" || selectedTeam2 === "0" || selectedTeam1 === selectedTeam2) {
      alert("Please select two different teams");
      return;
    }

    try {
      const newMatch = await AddMatch(
        id, // MatchDateId
        parseInt(selectedTeam1, 10),
        parseInt(selectedTeam2, 10)
      );

      // Append the new match to UI
      setMatches(prev => [...prev, newMatch]);

      // Reset
      setSelectedTeam1("0");
      setSelectedTeam2("0");
    } catch (err) {
      console.error("Failed to add match:", err.message);
    }
  }}
>
  ➕ Add Match
</button>
      <ul>
        {matches.map((m) => (
          <li key={m.Id}>
            {m.Team1?.TeamColor?.Color} vs {m.Team2?.TeamColor?.Color} 
                  <button
                      onClick={async () => {
                        try {
                          await DeleteMatch(m.Id);
                          setMatches(prev => prev.filter(t => t.Id !== m.Id));
                        } catch (err) {
                          console.error("Failed to delete player:", err.message);
                        }
                      }}
                    >
                      ❌ Remove
                    </button>
                    <Link to={`/edit-match/${m.Id}`}>✏️ Edit</Link>
                  </li>
        ))}
      </ul>

    </div>
  );
};

export default EditMatchDate;
