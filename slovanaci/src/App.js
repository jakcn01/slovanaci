import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Matches from './components/Matches';
import Players from './components/Players';
import PlayerProfile from './components/PlayerProfile';
import "./App.css";
import Home from './components/Home';
import GoalScorers from './components/GoalScorers';
import Login from './components/Login';
import EditMatchDates from './components/EditMatchDates';
import PrivateRoute from './components/PrivateRoute';
import EditMatchDate from './components/EditMatchDate';

const App = () => {
  return (
    <Router>
      <div>
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/slovanaci" replace />} />
          <Route path="/slovanaci" element={<Home />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/players" element={<Players />} />
          <Route path="/player/:id" element={<PlayerProfile />} />
          <Route path="/goal-scorers" element={<GoalScorers />} />
          <Route path="/edit-match-dates" element={<PrivateRoute><EditMatchDates /></PrivateRoute>} />
          <Route path="/edit-match-date/:id" element={<PrivateRoute><EditMatchDate /></PrivateRoute>} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
