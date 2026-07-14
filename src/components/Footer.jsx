import React from "react";
import { isoWeek, isoYear } from "./dateUtils";
import { Link } from "react-router-dom";

function Footer() {
  // Automatically outputs the correct year dynamically
  var NOW = new Date(),
    W_NOW = isoWeek(NOW),
    Y_NOW = isoYear(NOW);
  const currentYear = Y_NOW;

  return (
    <footer className="site-footer">
      <div className="footer-container">
        {/* Brand/Description Column */}
        <div className="footer-brand-col">
          <div className="brand-dark">
            <img
              src="/logo-horizontal-dark-cropped.svg"
              alt="logo-horizontal-dark"
            />
          </div>
          <p className="footer-desc">
            Selkeä ja tarkka digitaalinen apuvälineesi ISO 8601 -viikkonumeroiden,
            kalenteriaikataulujen ja vuosittaisten lukujen seurantaan. Aina
            laskettu ehdottoman teknisellä tarkkuudella.
          </p>
        </div>

        {/* Navigation Links Column */}
        <div className="footer-links-col">
          <h3>Palvelu</h3>
          <ul>
            <li>
              <Link to="/" onClick={() => window.scrollTo(0, 0)}>
                Etusivu{" "}
              </Link>
            </li>
            <li>
              <Link to="/weeks-in-a-year" onClick={() => window.scrollTo(0, 0)}>
                Viikkoja vuodessa
              </Link>
            </li>
            <li>
              <Link
                to="/what-is-a-week-number"
                onClick={() => window.scrollTo(0, 0)}
              >
                Mikä on viikkonumero?
              </Link>
            </li>
            <li>
              <Link to="/faq" onClick={() => window.scrollTo(0, 0)}>
                Usein kysytyt kysymykset
              </Link>
            </li>
          </ul>
        </div>

        {/* Core Documents Column */}
        <div className="footer-links-col">
          <h3>Yritys</h3>
          <ul>
            <li>
              <Link to="/about-us" onClick={() => window.scrollTo(0, 0)}>
                Tietoa meistä
              </Link>
            </li>
            <li>
              <Link to="/contact-us" onClick={() => window.scrollTo(0, 0)}>
                Asiakastuki
              </Link>
            </li>
            <li>
              <Link
                to="/terms-and-conditions"
                onClick={() => window.scrollTo(0, 0)}
              >
                Käyttöehdot
              </Link>
            </li>
            <li>
              <Link to="/privacy-policy" onClick={() => window.scrollTo(0, 0)}>
                Tietosuojaseloste
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Horizontal Baseline Rule */}
      <hr className="footer-divider" />

      {/* Baseline Copyright and Info Row */}
      <div className="footer-baseline">
        <p>&copy; {currentYear} Viikko Nro. Kaikki oikeudet pidätetään.</p>
        <p className="footer-tz">Yleismaailmallinen ISO-aikamalli</p>
      </div>
    </footer>
  );
}

export default Footer;
