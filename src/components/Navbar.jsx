import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { isoWeek, isoYear } from "./dateUtils";

const Navbar = () => {
  const [weekNow, setWeekNow] = useState();
  const [isOpen, setIsOpen] = useState(false); // Controls mobile menu visibility

  const NOW = new Date();
  const Y_NOW = isoYear(NOW);
  const year = Y_NOW;

  useEffect(() => {
    const now = new Date();
    const wkNow = isoWeek(now);
    setWeekNow(wkNow);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Closes the menu when a link is clicked on mobile
  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <header className="nav">
      <div className="wrap row">
        <Link className="brand" to="/" onClick={closeMenu}>
          <span className="dot"></span>Week Now
        </Link>

        {/* Hamburger Menu Toggle Button */}
        <button
          className={`menu-toggle ${isOpen ? "is-open" : ""}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>

        {/* Navigation Links Grid Block */}
        <nav className={`nav-links ${isOpen ? "mobile-open" : ""}`}>
          <Link id="navYear" to={`/year/${Y_NOW}`} onClick={closeMenu}>
            This year's weeks
          </Link>
          <Link id="navPrint" to={`/print/${year}`} onClick={closeMenu}>
            Printable
          </Link>
          <Link to="/what-is-a-week-number" onClick={closeMenu}>
            About weeks
          </Link>
          <Link to="/about-us" onClick={closeMenu}>
            About us
          </Link>
          <Link to="/contact-us" onClick={closeMenu}>
            Contact us
          </Link>
        </nav>

        {/* Badge Indicator Block */}
        <Link
          className="badge"
          id="navBadge"
          to={`/year/${Y_NOW}`}
          onClick={closeMenu}
        >
          Wk {weekNow}
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
