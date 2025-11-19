import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./NavBar.css";

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="top-nav">
      <div className="nav-logo">MoviePals</div>

      {/* Desktop Menu */}
      <div className="nav-items">
        <Link to="/search" className="nav-link">Search</Link>
        <Link to="/ratings" className="nav-link">My Ratings</Link>
        <Link to="/favorites" className="nav-link">Favorites</Link>
        <Link to="/profile" className="nav-link">Profile</Link>
        <Link to="/logout" className="nav-link">Logout</Link>
      </div>

      {/* Hamburger */}
      <div className="nav-menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="mobile-nav-dropdown">
          <Link to="/search" className="nav-link">Search</Link>
          <Link to="/ratings" className="nav-link">My Ratings</Link>
          <Link to="/favorites" className="nav-link">Favorites</Link>
          <Link to="/profile" className="nav-link">Profile</Link>
          <Link to="/logout" className="nav-link">Logout</Link>
        </div>
      )}
    </div>
  );
}

export default NavBar;
