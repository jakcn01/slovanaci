import React, { useEffect, useState } from 'react';
import { FaCheck, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { AddSeason, GetSeasonsData, SetCurrentSeason } from '../api/seasonsApi';
import AdminTabs from './AdminTabs';
import Loading from './Loading';
import '../css/EditSeasons.css';

const EditSeasons = () => {
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [newName, setNewName] = useState('');

  const fetchSeasons = async () => {
    setError('');
    try {
      setSeasons(await GetSeasonsData());
    } catch (err) {
      setError(err.message || 'Nepodařilo se načíst sezóny.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeasons();
  }, []);

  const handleAddSeason = async (event) => {
    event.preventDefault();
    if (saving || !newName.trim()) return;
    setSaving(true);
    try {
      const season = await AddSeason(newName);
      setSeasons(current => [...current, season]);
      setNewName('');
      toast.success('Sezóna byla přidána.');
    } catch (err) {
      toast.error(err.message || 'Sezónu se nepodařilo přidat.');
    } finally {
      setSaving(false);
    }
  };

  const handleActivate = async (seasonId) => {
    if (saving) return;
    setSaving(true);
    try {
      await SetCurrentSeason(seasonId);
      toast.success('Aktuální sezóna byla změněna.');
    } catch (err) {
      toast.error(err.message || 'Sezónu se nepodařilo změnit.');
    } finally {
      await fetchSeasons();
      setSaving(false);
    }
  };

  return (
    <main className="edit-seasons-container">
      <AdminTabs />
      <h1>Správa sezón</h1>
      <form className="add-season-form" onSubmit={handleAddSeason}>
        <label htmlFor="new-season-name">Nová sezóna</label>
        <input
          id="new-season-name"
          type="text"
          value={newName}
          onChange={event => setNewName(event.target.value)}
          placeholder="Název sezóny"
          required
          disabled={saving}
        />
        <button type="submit" disabled={loading || saving || !!error || !newName.trim()}>
          <FaPlus aria-hidden="true" /> Přidat
        </button>
      </form>
      {loading ? <Loading /> : error ? (
        <div role="alert">
          <p>{error}</p>
          <button type="button" onClick={fetchSeasons}>Zkusit znovu</button>
        </div>
      ) : (
        <ul className="admin-season-list" aria-busy={saving}>
          {seasons.map(season => (
            <li key={season.Id} className={season.IsCurrent ? 'current-season' : ''}>
              <span className="season-name">{season.Name}</span>
              {season.IsCurrent ? (
                <span className="current-season-label">Aktuální</span>
              ) : (
                <button
                  type="button"
                  title={`Nastavit sezónu ${season.Name} jako aktuální`}
                  aria-label={`Nastavit sezónu ${season.Name} jako aktuální`}
                  disabled={saving}
                  onClick={() => handleActivate(season.Id)}
                >
                  <FaCheck aria-hidden="true" />
                </button>
              )}
            </li>
          ))}
          {seasons.length === 0 && <li>Žádné sezóny.</li>}
        </ul>
      )}
    </main>
  );
};

export default EditSeasons;