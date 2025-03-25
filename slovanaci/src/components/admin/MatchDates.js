import { useState, useEffect } from 'react';
import { GetMatchDatesData, CreateMatchDate } from './../../api/matchDatesApi';
import { PencilIcon, XCircleIcon } from '@heroicons/react/24/solid';

const MatchDates = () => {
    const [matchDates, setMatchDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState('');

    useEffect(() => {
        fetchMatchDates();
    }, []);

    const fetchMatchDates = async () => {
        try {
            const data = await GetMatchDatesData();
            setMatchDates(data);
        } catch (error) {
            console.error('Error fetching match dates:', error.message);
        }
    };

    const handleCreateMatchDate = async () => {
        if (!selectedDate) {
            alert('Please select a date');
            return;
        }

        try {
            await CreateMatchDate(selectedDate);
            setSelectedDate('');
            fetchMatchDates(); // Refresh list after adding
        } catch (error) {
            console.error('Error creating match date:', error.message);
        }
        console.log(matchDates);
    };

    return (
        <div className="max-w-lg mx-auto p-4 bg-white shadow-md rounded-lg">
            <h2 className="text-xl font-bold mb-4">Match Dates</h2>

            {/* Date Picker & Create Button */}
            <div className="flex items-center gap-2 mb-4">
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border p-2 rounded w-full"
                />
                <button
                    onClick={handleCreateMatchDate}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Nový herní den
                </button>
            </div>

            {/* Match Dates List */}
            <ul className="space-y-2">
                
                {matchDates.map((match) => (
                    <li
                        key={match.id}
                        className="flex justify-between items-center p-2 bg-gray-100 rounded-lg shadow"
                    >
                        <span>{match.MatchDate}</span>
                        <div className="flex space-x-2">
                            {/* Edit Icon
                            <a href={`/edit/${match.id}`} className="text-blue-500 hover:text-blue-700">
                                <PencilIcon className="w-5 h-5" />
                            </a>
                            <a href={`/delete/${match.id}`} className="text-red-500 hover:text-red-700">
                                <XCircleIcon className="w-5 h-5" />
                            </a> */}
                            {/* Delete Icon */}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default MatchDates;
