import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaPlus, FaTimes, FaPencilAlt } from "react-icons/fa"; // icons
import { GetPlayersData } from "../api/playersApi";
import { GetMatchDateById, UpdateMatchDate } from "../api/matchDatesApi";
import { AddTeamPlayer, DeleteTeamPlayer } from "../api/teamPlayerApi";
import { GetTeamColors } from "../api/teamColorsApi";
import { AddTeam, DeleteTeam, GetTeamsForMatchDate } from "../api/teamsApi";
import { AddMatch, DeleteMatch, GetMatchesForMatchDate } from "../api/matchesApi";
import DropdownFilter from "./DropdownFilter";
import "../css/EditMatchDate.css"; // import CSS
import { toast } from "react-toastify";
import Loading from "./Loading";

const EditMatchDate = () => {
  const { id } = useParams(); 
  const [matchDate, setMatchDate] = useState(null);
  const [selectedColor, setSelectedColor] = useState("0");
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [allPlayers, setAllPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teamColors, setTeamColors] = useState([]);
  const [selectedTeam1, setSelectedTeam1] = useState("0");
  const [selectedTeam2, setSelectedTeam2] = useState("0");

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
        toast.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleDateChange = async (e) => {
    try {
      const picked = e.target.value;
      const iso = new Date(picked + 'T00:00:00Z').toISOString();
      const updated = await UpdateMatchDate(id, iso, matchDate.SeasonId);
      setMatchDate(updated);
    } catch (err) {
      toast.error("Uložení se nezdařilo!", err);
      console.log(err.message);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="edit-match-date">
      <h2>Upravit herní den</h2>

      {/* Date */}
      <label>
        Datum:
        <input
          type="date"
          value={matchDate.MatchDate.split("T")[0]}
          onChange={handleDateChange}
        />
      </label>

      {/* Teams */}
      <h3>Týmy</h3>
      <div className="team-controls">
        <DropdownFilter
          label="Barva nového týmu:"
          options={teamColors.map(c => ({ value: c.Id.toString(), label: c.Color }))}
          selectedValue={selectedColor}
          onChange={setSelectedColor}
        />

          <FaPlus 
            className="icon-btn add"
            onClick={async () => {
              if (selectedColor === "0") return;
              const newTeam = await AddTeam(id, parseInt(selectedColor, 10));
              setTeams(prev => [...prev, newTeam]);
              setSelectedColor("0");
            }}
          
          />
      </div>

      <div className="team-grid">
        {teams.map((team) => (
          <div key={team.Id} className="team-card">
            <div className="team-header">
              <strong>{team.TeamColor?.Color}</strong>
              
                <FaTimes 
                className="icon-btn remove"
                onClick={async () => {
                  try {
                    await DeleteTeam(team.Id);
                    setTeams(prev => prev.filter(t => t.Id !== team.Id));
                  } catch (err) {
                    toast.error("Odstranění se nezdařilo! V týmu nesmí být žádný hráč.", err.message);
                    console.log(err.message);
                  }
                }}
              />
                
            </div>

            {/* Add Player Dropdown */}
            <div className="team-player-controls">
              <DropdownFilter
                label="Nový hráč: "
                options={allPlayers.map(p => ({ value: p.Id.toString(), label: p.Name }))}
                selectedValue={team.selectedPlayer || "0"}
                onChange={(val) => {
                  setTeams(prev =>
                    prev.map(t =>
                      t.Id === team.Id ? { ...t, selectedPlayer: val } : t
                    )
                  );
                }}
              />
              <FaPlus 
                className="icon-btn add"
                onClick={async () => {
                  const selected = team.selectedPlayer;
                  if (!selected || selected === "0") return;
                  try {
                    const newTP = await AddTeamPlayer(team.Id, parseInt(selected, 10));
                    setTeams(prev =>
                      prev.map(t =>
                        t.Id === team.Id
                          ? { ...t, Team_Players: [...(t.Team_Players || []), newTP], selectedPlayer: "0" }
                          : t
                      )
                    );
                  } catch (err) {
                    toast.error("Uložení se nezdařilo!", err.message);
                    console.log(err.message);
                  }
                }}
              />
                
                
            </div>

            {/* Existing Players */}
            <ul className="player-list">
              {team.Team_Players?.map((tp) => (
                <li key={tp.Id} className="player-item">
                    <span>
                      {tp.Players?.Name}
                    </span>
                    <FaTimes 
                    className="icon-btn remove small"
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
                        toast.error("Uložení se nezdařilo! Hráč nesmí mít přiřazené žádné góly.", err.message);
                      }
                    }}
                  
                    
                    />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Matches */}
      <h3>Zápasy</h3>
      <div className="match-controls">
        <DropdownFilter
          label="Tým 1:"
          options={teams.map(t => ({
            value: t.Id.toString(),
            label: t.TeamColor?.Color || `Team ${t.Id}`
          }))}
          selectedValue={selectedTeam1}
          onChange={setSelectedTeam1}
        />

        <DropdownFilter
          label="Tým 2:"
          options={teams.map(t => ({
            value: t.Id.toString(),
            label: t.TeamColor?.Color || `Team ${t.Id}`
          }))}
          selectedValue={selectedTeam2}
          onChange={setSelectedTeam2}
        />

          <FaPlus
            className="icon-btn add"
            onClick={async () => {
              if (selectedTeam1 === "0" || selectedTeam2 === "0" || selectedTeam1 === selectedTeam2) {
                toast.error("Vyberte dva různé týmy.");
                return;
              }
              try {
                const newMatch = await AddMatch(
                  id,
                  parseInt(selectedTeam1, 10),
                  parseInt(selectedTeam2, 10)
                );
                setMatches(prev => [...prev, newMatch]);
                setSelectedTeam1("0");
                setSelectedTeam2("0");
              } catch (err) {
                toast.error("Uložení se nezdařilo!", err.message);
                console.log(err.message);
              }
            }}
          
          />
      </div>

      <ul className="match-list">
        {matches.map((m) => (
          <li key={m.Id} className="match-card">
            <div className="match-header">
              <span>{m.Team1?.TeamColor?.Color} vs {m.Team2?.TeamColor?.Color}</span>
              <div className="match-actions">
                  <FaTimes 
                    className="icon-btn remove"
                    onClick={async () => {
                      try {
                        await DeleteMatch(m.Id);
                        setMatches(prev => prev.filter(t => t.Id !== m.Id));
                      } catch (err) {
                        toast.error("Uložení se nezdařilo! Zápas musí mít nastavené skóre 0:0.", err.message);
                        console.log(err.message);
                      }
                    }}
                  />
                <Link to={`/edit-match/${m.Id}`} className="icon-btn edit">
                  <FaPencilAlt />
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EditMatchDate;
