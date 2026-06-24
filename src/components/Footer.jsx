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
            Your clean, precise digital companion for tracking ISO-8601 week
            numbers, calendar schedules, and annual metrics. Always calculated
            with absolute technical accuracy.
          </p>
        </div>

        {/* Navigation Links Column */}
        <div className="footer-links-col">
          <h3>Platform</h3>
          <ul>
            <li>
              <Link to="/" onClick={() => window.scrollTo(0, 0)}>
                Home{" "}
              </Link>
            </li>
            <li>
              <Link to="/weeks-in-a-year" onClick={() => window.scrollTo(0, 0)}>
                Weeks in a Year
              </Link>
            </li>
            <li>
              <Link
                to="/what-is-a-week-number"
                onClick={() => window.scrollTo(0, 0)}
              >
                What is a Week Number?
              </Link>
            </li>
            <li>
              <Link to="/faq" onClick={() => window.scrollTo(0, 0)}>
                Frequently Asked Questions
              </Link>
            </li>
          </ul>
        </div>

        {/* Core Documents Column */}
        <div className="footer-links-col">
          <h3>Company</h3>
          <ul>
            <li>
              <Link to="/about-us" onClick={() => window.scrollTo(0, 0)}>
                About Us
              </Link>
            </li>
            <li>
              <Link to="/contact-us" onClick={() => window.scrollTo(0, 0)}>
                Contact Support
              </Link>
            </li>
            <li>
              <Link
                to="/terms-and-conditions"
                onClick={() => window.scrollTo(0, 0)}
              >
                Terms &amp; Conditions
              </Link>
            </li>
            <li>
              <Link to="/privacy-policy" onClick={() => window.scrollTo(0, 0)}>
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Horizontal Baseline Rule */}
      <hr className="footer-divider" />

      {/* Baseline Copyright and Info Row */}
      <div className="footer-baseline">
        <p>&copy; {currentYear} Week Now. All rights reserved.</p>
        <p className="footer-tz">Standard Universal ISO Timing Model</p>
      </div>
    </footer>
  );
}

export default Footer;
