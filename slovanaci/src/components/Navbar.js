import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthProvider";
import { Link } from "react-router-dom";
import { signOut } from "../api/authApi";
import "../css/Navbar.css";

const Navbar = () => {
  const { user } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-header">
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          Slovaňáci
        </Link>
        <button className="menu-toggle" onClick={toggleMenu}>
          ☰
        </button>
      </div>

      <ul className={`navbar-menu ${menuOpen ? "open" : ""}`}>
        <li><Link to="/matches" onClick={closeMenu}>Zápasy</Link></li>
        <li><Link to="/players" onClick={closeMenu}>Hráči</Link></li>
        <li><Link to="/goal-scorers" onClick={closeMenu}>Střelci</Link></li>
        <li>
          {user ? (
            <Link onClick={() => { signOut(); closeMenu(); }}>Logout</Link>
          ) : (
            <Link to="/login" onClick={closeMenu}>Login</Link>
          )}
        </li>
        {user && (
          <li><Link to="/edit-match-dates" onClick={closeMenu}>Admin</Link></li>
        )}
      </ul>

      {/* Optional overlay for dark background when menu open */}
      {menuOpen && <div className="menu-overlay" onClick={closeMenu}></div>}
    </nav>
  );
};

export default Navbar;
