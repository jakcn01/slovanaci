import React, { useEffect, useState } from 'react';
import { FaRegStar, FaStar, FaStarHalfAlt } from 'react-icons/fa';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { GetPlayerData, UpdatePlayer } from '../api/playersApi';
import AdminTabs from './AdminTabs';
import Loading from './Loading';
import '../css/EditPlayer.css';

const RatingInput = ({ id, label, value, onChange }) => (
  <div className="player-rating-field">
    <label htmlFor={id}>{label}</label>
    <div className="rating-control">
      <input
        id={id}
        type="range"
        min="0"
        max="10"
        step="0.5"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <output htmlFor={id}>{value.toFixed(1)} / 10</output>
      <div className="rating-stars" aria-label={`${value} z 10 hvězdiček`}>
        {Array.from({ length: 10 }, (_, index) => {
          const position = index + 1;
          if (value >= position) return <FaStar key={position} />;
          if (value >= position - 0.5) return <FaStarHalfAlt key={position} />;
          return <FaRegStar key={position} />;
        })}
      </div>
    </div>
  </div>
);

const EditPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        setPlayer(await GetPlayerData(id));
      } catch (error) {
        toast.error(error.message || 'Nepodařilo se načíst hráče.');
      } finally {
        setLoading(false);
      }
    };
    fetchPlayer();
  }, [id]);

  const updateField = (field, value) => {
    setPlayer((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const name = player.Name.trim();
    if (!name) {
      toast.error('Jméno hráče nesmí být prázdné.');
      return;
    }

    setSaving(true);
    try {
      await UpdatePlayer(id, {
        Name: name,
        Nickname: player.Nickname?.trim(),
        FavoritePosition: player.FavoritePosition?.trim(),
        InsideRating: Math.round(Number(player.InsideRating)),
        OutsideRating: Math.round(Number(player.OutsideRating)),
        IsActive: player.IsActive,
      });
      toast.success('Hráč byl upraven.');
      navigate('/edit-players');
    } catch (error) {
      toast.error(error.message || 'Hráče se nepodařilo upravit.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;
  if (!player) {
    return (
      <main className="edit-player-container">
        <AdminTabs />
        <p>Hráče se nepodařilo najít.</p>
        <Link to="/edit-players">Zpět na seznam hráčů</Link>
      </main>
    );
  }

  return (
    <main className="edit-player-container">
      <AdminTabs />
      <div className="edit-player-heading">
        <h1>Úprava hráče</h1>
        <Link to="/edit-players">Zpět na seznam</Link>
      </div>
      <form className="edit-player-form" onSubmit={handleSubmit}>
        <label htmlFor="player-name">Jméno</label>
        <input
          id="player-name"
          value={player.Name || ''}
          onChange={(event) => updateField('Name', event.target.value)}
          maxLength={100}
          required
        />

        <label htmlFor="player-nickname">Přezdívka</label>
        <input
          id="player-nickname"
          value={player.Nickname || ''}
          onChange={(event) => updateField('Nickname', event.target.value)}
          maxLength={100}
        />

        <label htmlFor="player-position">Preferovaná pozice</label>
        <input
          id="player-position"
          value={player.FavoritePosition || ''}
          onChange={(event) => updateField('FavoritePosition', event.target.value)}
          maxLength={100}
        />

        <RatingInput
          id="inside-rating"
          label="Hodnocení v hale"
          value={Number(player.InsideRating || 0) / 2}
          onChange={(value) => updateField('InsideRating', value * 2)}
        />
        <RatingInput
          id="outside-rating"
          label="Hodnocení venku"
          value={Number(player.OutsideRating || 0) / 2}
          onChange={(value) => updateField('OutsideRating', value * 2)}
        />

        <label className="active-player-toggle" htmlFor="player-active">
          <input
            id="player-active"
            type="checkbox"
            checked={Boolean(player.IsActive)}
            onChange={(event) => updateField('IsActive', event.target.checked)}
          />
          Aktivní hráč
        </label>

        <div className="edit-player-actions">
          <button type="submit" disabled={saving}>{saving ? 'Ukládám…' : 'Uložit změny'}</button>
          <Link to="/edit-players">Zrušit</Link>
        </div>
      </form>
    </main>
  );
};

export default EditPlayer;