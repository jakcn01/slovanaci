import React, { useEffect, useState } from 'react';
import { FaPlus, FaPencilAlt } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AddPlayer, GetPlayersData } from '../api/playersApi';
import Loading from './Loading';
import AdminTabs from './AdminTabs';
import '../css/EditPlayers.css';

const EditPlayers = () => {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPlayers = async () => {
    try {
      setPlayers(await GetPlayersData());
    } catch (error) {
      toast.error(error.message || 'Nepodařilo se načíst hráče.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const handleAddPlayer = async (event) => {
    event.preventDefault();
    const name = newName.trim();
    if (!name) return;

    setSaving(true);
    try {
      const player = await AddPlayer({
        Name: name,
        Nickname: '',
        FavoritePosition: '',
        InsideRating: 0,
        OutsideRating: 0,
        IsActive: true,
      });
      setNewName('');
      navigate(`/edit-player/${player.Id}`);
    } catch (error) {
      toast.error(error.message || 'Hráče se nepodařilo přidat.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <main className="edit-players-container">
      <AdminTabs />
      <h1>Správa hráčů</h1>
      <form className="add-player-form" onSubmit={handleAddPlayer}>
        <label htmlFor="new-player-name">Nový hráč</label>
        <input
          id="new-player-name"
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          placeholder="Jméno hráče"
          maxLength={100}
          required
        />
        <button type="submit" disabled={saving || !newName.trim()} aria-label="Přidat hráče">
          <FaPlus /> Přidat
        </button>
      </form>
      <ul className="admin-player-list">
        {players.map((player) => (
          <li key={player.Id}>
            <span>{player.Name}</span>
            <Link to={`/edit-player/${player.Id}`} aria-label={`Upravit hráče ${player.Name}`}>
            <FaPencilAlt className='' />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default EditPlayers;