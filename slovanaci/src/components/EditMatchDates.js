import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Loading from './Loading.js';
import Attancdance from './Attandance.js';
import SharedTeamsTable from './SharedTeams.js';
import { GetTeamPlayerDataByPlayer } from '../api/teamPlayerApi.js';
import { GetPlayerData } from '../api/playersApi.js';
import { GetMatchesData } from '../api/matchesApi.js';
import { GetGoalsData } from '../api/goalsApi.js';
import { AddMatchDate, GetMatchDatesData } from '../api/matchDatesApi.js';
import { calculatePlayerGoals, getPlayerStats } from '../helpers/matchHelpers.js';
import { GetSeasonsData } from '../api/seasonsApi.js';
import DropdownFilter from './DropdownFilter.js';
import { formatDate } from '../helpers/dateHelpers.js';
import "../css/EditMatchDates.css"; // add this import at the top
import { FaPencilAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

const EditMatchDates = () => {
  const [matchDates, setMatchDates] = useState(null);
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state
  const [seasons, setSeasons] = useState([]);
  const [seasonFilter, setSeasonFilter] = useState('0'); // Filter state for match type
  
    const fetchMatchDates = async () => {
        try {
        setLoading(true); // Reset loading state on id change        
        
        const matchDatesData = await GetMatchDatesData(seasonFilter); 
        setMatchDates(matchDatesData)
        const sortedSeasons = await GetSeasonsData();
                
        const seasonFilterOptions = sortedSeasons.map(season => {
            return { value: season.Id.toString(), label: season.Name }
        })

        const seasonDefaultOption = sortedSeasons.find(s => s.IsCurrent);

        if (seasonFilter === '0' && seasonFilterOptions.length !== 0)
        {
            setSeasonFilter(seasonDefaultOption.Id.toString())
        }
        
        setSeasons(seasonFilterOptions)
    } catch (err) {
        toast.error(err);
        setError(err.message); // Set error message
    } finally {
        setLoading(false); // Set loading to false after fetching
    }
  };


  // Fetch player data and goals based on ID
  useEffect(() => {
    fetchMatchDates();
  }, [seasonFilter]);

  const handleAddMatchDate = async () => {
    try {
        const today = new Date().toISOString(); // default to now
        const newDate = await AddMatchDate(seasonFilter, today);

        fetchMatchDates();
    } catch (err) {
        console.error(err);
        setError(err.message);
    }
 };


  // Render loading, error, or player details
  if (loading) {
    return <Loading />;
  }

  if (error) {
      return <div>Error: {error}</div>; // Display error message
    }
    
    return (
    <div className="edit-matchdates-container">
        <div className="filter-bar">
        <DropdownFilter
            label="Sezóna: "
            options={seasons}
            selectedValue={seasonFilter}
            onChange={setSeasonFilter}
        />
        <button className="add-btn" onClick={handleAddMatchDate}>
            ➕ Přidat nový herní den
        </button>
        </div>

        <ul className="matchdates-list">
        {matchDates.map((x) => (
            <Link to={`/edit-match-date/${x.Id}`}>
                <li key={x.Id}>
                    <span>{formatDate(x.MatchDate)}</span>
                    <FaPencilAlt className='' />
                </li>
            </Link>
        ))}
        </ul>
    </div>
    );};

export default EditMatchDates;
