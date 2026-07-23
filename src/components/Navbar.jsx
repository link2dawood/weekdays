import React, { useState } from "react";
import { Link } from "react-router-dom";
import { isoWeek, isoYear } from "./dateUtils";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  // Computed directly in the render body, not an effect: an effect never
  // runs during SSR/prerendering, so the badge would show blank ("Vk ") on
  // every prerendered page (Navbar is rendered on all of them) until the
  // client hydrates.
  const NOW = new Date();
  const Y_NOW = isoYear(NOW);
  const year = Y_NOW;
  const weekNow = isoWeek(NOW);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
    window.scrollTo(0, 0);
  };

  return (
    <header className="nav">
      <div className="wrap row">
        {/* Brand Text Block */}
        <Link className="brand" to="/" onClick={closeMenu}>
          {/* <span className="dot"></span>Week Now */}
          <img
            src="/logo-horizontal-cropped.svg"
            alt="Viikko Nro"
            width="592"
            height="122"
          />
        </Link>

        {/* Hamburger Menu Toggle Button */}
        <button
          className={`menu-toggle ${isOpen ? "is-open" : ""}`}
          onClick={toggleMenu}
          aria-label="Avaa navigointivalikko"
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </button>

        {/* Navigation Links Grid Block */}
        <nav className={`nav-links ${isOpen ? "mobile-open" : ""}`}>
          <Link id="navYear" to={`/year/${Y_NOW}`} onClick={closeMenu}>
            Tämän vuoden viikot
          </Link>
          <Link id="navPrint" to={`/print/${year}`} onClick={closeMenu}>
            Tulostettava
          </Link>
          <Link to="/what-is-a-week-number" onClick={closeMenu}>
            Tietoa viikoista
          </Link>
          <Link to="/about-us" onClick={closeMenu}>
            Tietoa meistä
          </Link>
          <Link to="/contact-us" onClick={closeMenu}>
            Ota yhteyttä
          </Link>
        </nav>

        {/* Badge Indicator Block */}
        <Link
          className="badge"
          id="navBadge"
          to={`/year/${Y_NOW}`}
          onClick={closeMenu}
        >
          Vk {weekNow}
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
