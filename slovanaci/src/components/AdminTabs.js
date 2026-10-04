import React from 'react';
import { NavLink } from 'react-router-dom';
import '../css/AdminTabs.css';

const AdminTabs = () => (
  <nav className="admin-tabs" aria-label="Administrace">
    <NavLink to="/edit-match-dates" className={({ isActive }) => isActive ? 'active' : ''}>
      Herní dny
    </NavLink>
    <NavLink to="/edit-players" className={({ isActive }) => isActive ? 'active' : ''}>
      Hráči
    </NavLink>
    <NavLink to="/team-generator" className={({ isActive }) => isActive ? 'active' : ''}>
      Generátor týmů
    </NavLink>
  </nav>
);

export default AdminTabs;