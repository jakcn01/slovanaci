import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AddMatchDate } from '../api/matchDatesApi';
import { AddMatch } from '../api/matchesApi';
import { GetPlayersData } from '../api/playersApi';
import { GetSeasonsData } from '../api/seasonsApi';
import { GetTeamColors } from '../api/teamColorsApi';
import { AddTeam } from '../api/teamsApi';
import { AddTeamPlayer } from '../api/teamPlayerApi';
import AdminTabs from './AdminTabs';
import Loading from './Loading';
import '../css/TeamGenerator.css';

const shuffle = (items) => {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
};

const makeBalancedTeams = (players, teamCount, startersPerTeam, ratingField) => {
  const teamSizes = Array.from({ length: teamCount }, (_, index) =>
    Math.floor(players.length / teamCount) + (index < players.length % teamCount ? 1 : 0)
  );
  const rating = (player) => Number(player[ratingField] || 0);
  const candidates = new Map();

  for (let attempt = 0; attempt < 1500; attempt += 1) {
    const shuffledPlayers = shuffle(players);
    const teams = teamSizes.map(() => []);
    const remaining = [...teamSizes];

    shuffledPlayers.forEach((player) => {
      const availableTeams = remaining
        .map((slots, teamIndex) => ({ slots, teamIndex }))
        .filter(({ slots }) => slots > 0);
      const { teamIndex } = availableTeams[Math.floor(Math.random() * availableTeams.length)];
      teams[teamIndex].push(player);
      remaining[teamIndex] -= 1;
    });

    const sortedTeams = teams.map((team) => [...team].sort((a, b) => rating(b) - rating(a)));
    const starterAverages = sortedTeams.map((team) =>
      team.slice(0, startersPerTeam).reduce((total, player) => total + rating(player), 0)
        / startersPerTeam / 2
    );
    const rosterAverages = sortedTeams.map((team) =>
      team.reduce((total, player) => total + rating(player), 0) / team.length / 2
    );
    const spread = (values) => Math.max(...values) - Math.min(...values);
    const signature = sortedTeams
      .map((team) => team.map((player) => player.Id).sort((a, b) => a - b).join(','))
      .sort()
      .join('|');

    if (!candidates.has(signature)) {
      candidates.set(signature, {
        teams: sortedTeams,
        starterSpread: spread(starterAverages),
        rosterSpread: spread(rosterAverages),
      });
    }
  }

  const allCandidates = [...candidates.values()];
  const bestRosterSpread = Math.min(...allCandidates.map((candidate) => candidate.rosterSpread));
  const nearBestRoster = allCandidates.filter((candidate) => candidate.rosterSpread <= bestRosterSpread + 0.5);
  const bestStarterSpread = Math.min(...nearBestRoster.map((candidate) => candidate.starterSpread));
  const nearBest = nearBestRoster.filter((candidate) => candidate.starterSpread <= bestStarterSpread + 0.5);
  const chosen = nearBest[Math.floor(Math.random() * nearBest.length)];

  return chosen.teams.map((playersInTeam) => ({
    players: playersInTeam,
    starters: playersInTeam.slice(0, startersPerTeam),
    substitutes: playersInTeam.slice(startersPerTeam),
    colorId: '',
  }));
};

const TeamGenerator = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [teamColors, setTeamColors] = useState([]);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState([]);
  const [teamCount, setTeamCount] = useState(2);
  const [playersPerTeam, setPlayersPerTeam] = useState(4);
  const [gameType, setGameType] = useState('inside');
  const [generatedTeams, setGeneratedTeams] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [playerData, colorData] = await Promise.all([GetPlayersData(), GetTeamColors()]);
        setPlayers(playerData.filter((player) => player.IsActive !== false));
        setTeamColors(colorData);
      } catch (error) {
        toast.error(error.message || 'Nepodařilo se načíst data pro generátor.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const selectedPlayers = players.filter((player) => selectedPlayerIds.includes(player.Id));
  const maxPlayersPerTeam = Math.floor(selectedPlayers.length / teamCount);
  const ratingField = gameType === 'inside' ? 'InsideRating' : 'OutsideRating';

  const updatePlayerSelection = (playerId, checked) => {
    const nextIds = checked
      ? [...selectedPlayerIds, playerId]
      : selectedPlayerIds.filter((id) => id !== playerId);
    setSelectedPlayerIds(nextIds);
    setPlayersPerTeam((current) => Math.min(current, Math.max(1, Math.floor(nextIds.length / teamCount))));
    setGeneratedTeams(null);
  };

  const handleGenerate = () => {
    if (selectedPlayers.length < teamCount * playersPerTeam) {
      toast.error(`Vyberte alespoň ${teamCount * playersPerTeam} hráčů.`);
      return;
    }
    setGeneratedTeams(makeBalancedTeams(selectedPlayers, teamCount, playersPerTeam, ratingField));
  };

  const updateTeamColor = (teamIndex, colorId) => {
    setGeneratedTeams((current) => current.map((team, index) =>
      index === teamIndex ? { ...team, colorId } : team
    ));
  };

  const handleSave = async () => {
    if (!generatedTeams || generatedTeams.some((team) => !team.colorId)) {
      toast.error('Vyberte barvu pro každý tým.');
      return;
    }
    if (new Set(generatedTeams.map((team) => team.colorId)).size !== generatedTeams.length) {
      toast.error('Každý tým musí mít jinou barvu.');
      return;
    }

    setSaving(true);
    try {
      const seasons = await GetSeasonsData();
      const currentSeason = seasons.find((season) => season.IsCurrent);
      if (!currentSeason) throw new Error('Není nastavena aktuální sezóna.');

      const matchDate = await AddMatchDate(currentSeason.Id, new Date().toISOString());
      const savedTeams = [];
      for (const team of generatedTeams) {
        const savedTeam = await AddTeam(matchDate.Id, Number(team.colorId));
        savedTeams.push(savedTeam);
        await Promise.all(team.players.map((player) => AddTeamPlayer(savedTeam.Id, player.Id)));
      }

      const pairs = [];
      for (let first = 0; first < savedTeams.length; first += 1) {
        for (let second = first + 1; second < savedTeams.length; second += 1) {
          pairs.push([savedTeams[first], savedTeams[second]]);
        }
      }
      const scheduledPairs = teamCount === 3
        ? Array.from({ length: 3 }, () => pairs).flat()
        : pairs;
      for (const [index, [team1, team2]] of scheduledPairs.entries()) {
        await AddMatch(matchDate.Id, team1.Id, team2.Id, index + 1, teamCount === 3);
      }

      toast.success('Týmy a zápasy byly uloženy.');
      navigate(`/edit-match-date/${matchDate.Id}`);
    } catch (error) {
      toast.error(error.message || 'Týmy se nepodařilo uložit.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <main className="team-generator-container">
      <AdminTabs />
      <h1>Generátor týmů</h1>
      <section className="generator-controls" aria-label="Nastavení generátoru">
        <label>
          Počet týmů
          <select value={teamCount} onChange={(event) => {
            const count = Number(event.target.value);
            setTeamCount(count);
            setPlayersPerTeam((current) => Math.min(current, Math.max(1, Math.floor(selectedPlayers.length / count))));
            setGeneratedTeams(null);
          }}>
            <option value="2">2</option>
            <option value="3">3</option>
          </select>
        </label>
        <label>
          Hráčů na hřišti za tým
          <select
            value={Math.max(1, Math.min(playersPerTeam, maxPlayersPerTeam || 1))}
            onChange={(event) => {
              setPlayersPerTeam(Number(event.target.value));
              setGeneratedTeams(null);
            }}
          >
            {Array.from({ length: Math.max(1, maxPlayersPerTeam) }, (_, index) => (
              <option key={index + 1} value={index + 1}>{index + 1}</option>
            ))}
          </select>
        </label>
        <fieldset className="game-type-control">
          <legend>Typ hry</legend>
          <label><input type="radio" name="game-type" checked={gameType === 'inside'} onChange={() => { setGameType('inside'); setGeneratedTeams(null); }} /> V hale</label>
          <label><input type="radio" name="game-type" checked={gameType === 'outside'} onChange={() => { setGameType('outside'); setGeneratedTeams(null); }} /> Venku</label>
        </fieldset>
      </section>

      <section className="generator-player-selection" aria-label="Výběr hráčů">
        <div className="generator-section-heading">
          <h2>Hráči</h2>
          <span>{selectedPlayers.length} vybráno</span>
        </div>
        <ul>
          {players.map((player) => (
            <li key={player.Id}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedPlayerIds.includes(player.Id)}
                  onChange={(event) => updatePlayerSelection(player.Id, event.target.checked)}
                />
                <span>{player.Name}</span>
                <small>{((Number(player[ratingField]) || 0) / 2).toFixed(1)} / 10</small>
              </label>
            </li>
          ))}
        </ul>
      </section>

      <div className="generator-primary-action">
        <button type="button" onClick={handleGenerate} disabled={selectedPlayers.length < teamCount * playersPerTeam}>
          Vygenerovat týmy
        </button>
      </div>

      {generatedTeams && (
        <section className="generated-teams" aria-label="Vygenerované týmy">
          <h2>Vygenerované týmy</h2>
          <div className="generated-team-grid">
            {generatedTeams.map((team, teamIndex) => (
              <article className="generated-team" key={teamIndex}>
                <div className="generated-team-heading">
                  <h3>Tým {teamIndex + 1}</h3>
                    <p className="generated-team-rating">
                    {(team.players.reduce((total, player) => total + (Number(player[ratingField]) || 0), 0) / team.players.length / 2).toFixed(1)} / 10
                    </p>
                  <select
                    aria-label={`Barva týmu ${teamIndex + 1}`}
                    value={team.colorId}
                    onChange={(event) => updateTeamColor(teamIndex, event.target.value)}
                  >
                    <option value="">Vyberte barvu</option>
                    {teamColors.filter((color) =>
                      !generatedTeams.some((other, otherIndex) => otherIndex !== teamIndex && String(other.colorId) === String(color.Id))
                    ).map((color) => (
                      <option key={color.Id} value={color.Id}>{color.Color}</option>
                    ))}
                  </select>
                </div>
                <h4>Hrají</h4>
                <ul>{team.starters.map((player) => <li key={player.Id}>{player.Name}</li>)}</ul>
                {team.substitutes.length > 0 && <>
                  <h4>Náhradníci</h4>
                  <ul>{team.substitutes.map((player) => <li key={player.Id}>{player.Name}</li>)}</ul>
                </>}
              </article>
            ))}
          </div>
          <div className="generator-primary-action">
            <button type="button" onClick={handleSave} disabled={saving || generatedTeams.some((team) => !team.colorId)}>
              {saving ? 'Ukládám…' : 'Vytvořit herní den a zápasy'}
            </button>
          </div>
        </section>
      )}
    </main>
  );
};

export default TeamGenerator;