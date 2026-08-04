import { isoYear } from "./dateUtils";
import { Link } from "react-router-dom";
import SocialLinks from "./SocialLinks";

function Footer() {
  // Automatically outputs the correct year dynamically
  var NOW = new Date(),
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
              alt="Viikko Nro"
              width="592"
              height="122"
            />
          </div>
          <p className="footer-desc">
            Selkeä ja tarkka työkalu ISO 8601 -viikkonumeroihin ja vuosien
            kalenteriaikatauluihin. Laskelmat perustuvat aina ISO 8601
            -standardiin.
          </p>
          <SocialLinks className="footer-social" />
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
              <Link to="/kuinka-monta-viikkoa-vuodessa" onClick={() => window.scrollTo(0, 0)}>
                Viikkoja vuodessa
              </Link>
            </li>
            <li>
              <Link
                to="/mika-on-viikkonumero"
                onClick={() => window.scrollTo(0, 0)}
              >
                Mikä on viikkonumero?
              </Link>
            </li>
          </ul>
        </div>

        {/* Core Documents Column */}
        <div className="footer-links-col">
          <h3>Yritys</h3>
          <ul>
            <li>
              <Link to="/tietoa-meista" onClick={() => window.scrollTo(0, 0)}>
                Tietoa meistä
              </Link>
            </li>
            <li>
              <Link to="/ota-yhteytta" onClick={() => window.scrollTo(0, 0)}>
                Ota yhteyttä
              </Link>
            </li>
            <li>
              <Link
                to="/kayttoehdot"
                onClick={() => window.scrollTo(0, 0)}
              >
                Käyttöehdot
              </Link>
            </li>
            <li>
              <Link to="/tietosuoja" onClick={() => window.scrollTo(0, 0)}>
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
        <p className="footer-tz">Kansainvälisen ISO 8601 -standardin mukaan</p>
      </div>
    </footer>
  );
}

export default Footer;
