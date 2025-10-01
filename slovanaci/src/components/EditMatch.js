import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SaveGoals } from "../api/goalsApi";
import { GetMatchById, UpdateMatch } from "../api/matchesApi";
import "../css/EditMatch.css";
import { FaPlus, FaMinus } from "react-icons/fa";

const EditMatch = () => {
  const { id } = useParams();
  const [match, setMatch] = useState(null);
  const [goals, setGoals] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        setLoading(true);
        const m = await GetMatchById(id);
        setMatch(m);

        const initialGoals = {};
        const fillGoals = (teamPlayers) => {
          teamPlayers.forEach((tp) => {
            initialGoals[tp.Id] = {
              normal: tp.Goals?.find((g) => !g.OwnGoal)?.GoalCount || 0,
              own: tp.Goals?.find((g) => g.OwnGoal)?.GoalCount || 0,
              trackOwn: (tp.Goals?.find((g) => g.OwnGoal)?.GoalCount || 0) > 0,
            };
          });
        };
        fillGoals(m.Team1?.Team_Players || []);
        fillGoals(m.Team2?.Team_Players || []);
        setGoals(initialGoals);
      } catch (err) {
        console.error("Error loading match:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMatch();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!match) return <p>Match not found.</p>;

  const handleSave = async () => {
    try {
      await UpdateMatch(match.Id, {
        OutsidePitch: match.OutsidePitch,
        SmallGame: match.SmallGame,
      });

      const payload = [];
      for (const [tpId, { normal, own }] of Object.entries(goals)) {
        if (normal > 0) payload.push({ MatchId: match.Id, TeamPlayerId: parseInt(tpId), GoalCount: normal, OwnGoal: false });
        if (own > 0) payload.push({ MatchId: match.Id, TeamPlayerId: parseInt(tpId), GoalCount: own, OwnGoal: true });
      }

      await SaveGoals(match.Id, payload);
      alert("Match saved ✅");
    } catch (err) {
      console.error("Save failed:", err.message);
      alert("Save failed: " + err.message);
    }
  };

  const renderPlayerRow = (tp) => {
    const current = goals[tp.Id] || { normal: 0, own: 0, trackOwn: false };
    return (
      <li key={tp.Id}>
        <div className="player-name">
            {tp.Player?.Name}
        </div>
        <div className="goal-controls">
            <FaMinus onClick={() => setGoals(prev => ({ ...prev, [tp.Id]: { ...current, normal: Math.max(0, current.normal - 1) } }))} />
            <span>{current.normal}</span>
            <FaPlus onClick={() => setGoals(prev => ({ ...prev, [tp.Id]: { ...current, normal: current.normal + 1 } }))}/>
        </div>

        <div className="own-goal-section">
          <label>
            <input type="checkbox" checked={current.trackOwn || false} onChange={(e) => setGoals(prev => ({ ...prev, [tp.Id]: { ...current, trackOwn: e.target.checked } }))}/>
            Vlastňák?
          </label>
          {current.trackOwn && (
            <div className="goal-controls">

                <FaMinus onClick={() =>
                    setGoals(prev => ({ ...prev, [tp.Id]: { ...current, own: Math.max(0, current.own - 1) } }))}/>

                <span>{current.own}</span>
                <FaPlus onClick={() =>
                    setGoals(prev => ({ ...prev, [tp.Id]: { ...current, own: current.own + 1 } }))
                }/>
            </div>
          )}
        </div>
      </li>
    );
  };

  const renderTeamColumn = (team) => (
    <div className="team-column">
      <h3>{team.TeamColor?.Color}</h3>
      <ul>{team.Team_Players.map(renderPlayerRow)}</ul>
    </div>
  );

  return (
    <div className="edit-match-container">
      <h1>{match.Team1?.TeamColor?.Color} vs {match.Team2?.TeamColor?.Color}</h1>

      <div className="top-bar">
        <div className="match-details">
          <label>
            <input type="checkbox" checked={match.OutsidePitch || false} onChange={(e) => setMatch(prev => ({ ...prev, OutsidePitch: e.target.checked }))} />
            Venkovní hřiště
          </label>
          <label>
            <input type="checkbox" checked={match.SmallGame || false} onChange={(e) => setMatch(prev => ({ ...prev, SmallGame: e.target.checked }))} />
            Turnájkový zápas
          </label>
        </div>
        <button className="save-button" onClick={handleSave}>Uložit</button>
      </div>

      <div className="teams-container">
        {renderTeamColumn(match.Team1)}
        {renderTeamColumn(match.Team2)}
      </div>
    </div>
  );
};

export default EditMatch;
