import React, { useContext } from "react";
import { AuthContext } from "../context/AuthProvider";
import { Link } from 'react-router-dom';
import { signOut } from "../api/authApi";

const Navbar = () => {
  const { user } = useContext(AuthContext);

  return (
    <nav className="navbar">
      <ul className='navbar-menu'>
        <li>
          <Link to="/">Slovaňáci</Link>  {/* "/" works fine with HashRouter */}
        </li>
        <li>
          <Link to="/matches">Zápasy</Link>  {/* Links are cleaner now */}
        </li>
        <li>
          <Link to="/players">Hráči</Link>
        </li>
        <li>
          <Link to="/goal-scorers">Střelci</Link>
        </li>
        <li>
        {user ? (
            <Link onClick={signOut}>Logout</Link>
          ) : (
            <Link to="/login">Login</Link>
          )}
      </li> 
      </ul>
    </nav>
  );
};

export default Navbar;
