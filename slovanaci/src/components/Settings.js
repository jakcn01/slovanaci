import React, { useEffect, useState } from 'react';
import { FaPlus, FaSave } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { AddSeason, GetSeasonsData, SetCurrentSeason } from '../api/seasonsApi';
import { GetSettingsData, UpdateSetting } from '../api/settingsApi';
import { SettingTypes, settingDefinitions } from '../const/settings';
import AdminTabs from './AdminTabs';
import Loading from './Loading';
import '../css/Settings.css';

const Settings = () => {
  const [seasons, setSeasons] = useState([]);
  const [settings, setSettings] = useState([]);
  const [values, setValues] = useState({});
  const [seasonId, setSeasonId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [newName, setNewName] = useState('');

  const fetchSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const [seasonData, settingsData] = await Promise.all([GetSeasonsData(), GetSettingsData()]);
      setSeasons(seasonData);
      setSeasonId(String(seasonData.find(season => season.IsCurrent)?.Id ?? ''));
      setSettings(settingsData);
      setValues(Object.fromEntries(settingsData.map(setting => [setting.id, setting.Value ?? ''])));
    } catch (err) {
      setError(err.message || 'Nepodařilo se načíst nastavení.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
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

  const handleActivate = async (event) => {
    event.preventDefault();
    if (saving || !seasonId) return;
    setSaving(true);
    try {
      await SetCurrentSeason(Number(seasonId));
      setSeasons(current => current.map(season => ({ ...season, IsCurrent: String(season.Id) === seasonId })));
      toast.success('Aktuální sezóna byla změněna.');
    } catch (err) {
      toast.error(err.message || 'Sezónu se nepodařilo změnit.');
      await fetchSettings();
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSetting = async (event, setting) => {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const updated = await UpdateSetting(setting, values[setting.id]);
      setSettings(current => current.map(item => item.id === updated.id ? updated : item));
      setValues(current => ({ ...current, [updated.id]: updated.Value ?? '' }));
      toast.success('Nastavení bylo uloženo.');
    } catch (err) {
      toast.error(err.message || 'Nastavení se nepodařilo uložit.');
    } finally {
      setSaving(false);
    }
  };

  const renderEditor = (setting) => {
    const inputId = `setting-${setting.id}`;
    const value = values[setting.id];
    const onChange = event => setValues(current => ({
      ...current,
      [setting.id]: setting.Type === SettingTypes.Bool ? String(event.target.checked) : event.target.value,
    }));
    if (setting.Type === SettingTypes.Enum) {
      const options = settingDefinitions[setting.id]?.options ?? [];
      return (
        <select id={inputId} value={value} onChange={onChange} disabled={saving || !options.length} required>
          {!options.some(option => option.value === value) && <option value={value} disabled>{value || 'Vyberte hodnotu'}</option>}
          {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      );
    }
    if (setting.Type === SettingTypes.Bool) {
      return <input id={inputId} type="checkbox" checked={value === 'true'} onChange={onChange} disabled={saving} />;
    }
    const isNumber = setting.Type === SettingTypes.Int || setting.Type === SettingTypes.Number;
    return (
      <input id={inputId} type={isNumber ? 'number' : 'text'} value={value} onChange={onChange}
        step={setting.Type === SettingTypes.Int ? '1' : 'any'} required={isNumber}
        disabled={saving || !Object.values(SettingTypes).includes(setting.Type)} />
    );
  };

  return (
    <main className="edit-seasons-container">
      <AdminTabs />
      <h1>Nastavení</h1>
      {loading ? <Loading /> : error ? (
        <div role="alert">
          <p>{error}</p>
          <button type="button" onClick={fetchSettings}>Zkusit znovu</button>
        </div>
      ) : (
        <div aria-busy={saving}>
          <form className="setting-row" onSubmit={handleActivate}>
            <label htmlFor="active-season">Aktuální sezóna</label>
            <select id="active-season" value={seasonId} onChange={event => setSeasonId(event.target.value)} disabled={saving || !seasons.length} required>
              <option value="" disabled>{seasons.length ? 'Vyberte sezónu' : 'Žádné sezóny'}</option>
              {seasons.map(season => <option key={season.Id} value={String(season.Id)}>{season.Name}</option>)}
            </select>
            <button type="submit" title="Uložit aktuální sezónu" aria-label="Uložit aktuální sezónu"
              disabled={saving || !seasonId || seasons.some(season => String(season.Id) === seasonId && season.IsCurrent)}>
              <FaSave aria-hidden="true" />
            </button>
          </form>
          <form className="setting-row" onSubmit={handleAddSeason}>
            <label htmlFor="new-season-name">Nová sezóna</label>
            <input id="new-season-name" type="text" value={newName}
              onChange={event => setNewName(event.target.value)}
              placeholder="Název sezóny" required disabled={saving} />
            <button type="submit" title="Přidat sezónu" aria-label="Přidat sezónu"
              disabled={saving || !newName.trim()}>
              <FaPlus aria-hidden="true" />
            </button>
          </form>
          {settings.map(setting => (
            <form key={setting.id} className="setting-row" onSubmit={event => handleSaveSetting(event, setting)}>
              <label htmlFor={`setting-${setting.id}`}>{setting.Name}</label>
              {renderEditor(setting)}
              <button type="submit" title={`Uložit: ${setting.Name}`} aria-label={`Uložit: ${setting.Name}`}
                disabled={saving || values[setting.id] === (setting.Value ?? '') || !Object.values(SettingTypes).includes(setting.Type) ||
                  (setting.Type === SettingTypes.Enum && !settingDefinitions[setting.id]?.options.length)}>
                <FaSave aria-hidden="true" />
              </button>
            </form>
          ))}
        </div>
      )}
    </main>
  );
};

export default Settings;