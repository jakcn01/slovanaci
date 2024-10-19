import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
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
      </ul>
    </nav>
  );
};

export default Navbar;
