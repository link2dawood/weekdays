import React from "react";

function Footer() {
  // Automatically outputs the correct year dynamically
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-container">
        {/* Brand/Description Column */}
        <div className="footer-brand-col">
          <div className="footer-logo">
            <span>📅</span> Week Now
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
              <a href="#/">Home Dashboard</a>
            </li>
            <li>
              <a href="#/weeks-in-a-year">Weeks in a Year</a>
            </li>
            <li>
              <a href="#/what-is-a-week-number">What is a Week Number?</a>
            </li>
            <li>
              <a href="#/faq">Frequently Asked Questions</a>
            </li>
          </ul>
        </div>

        {/* Core Documents Column */}
        <div className="footer-links-col">
          <h3>Company</h3>
          <ul>
            <li>
              <a href="#/about">About Us</a>
            </li>
            <li>
              <a href="#/contact">Contact Support</a>
            </li>
            <li>
              <a href="#/terms">Terms &amp; Conditions</a>
            </li>
            <li>
              <a href="#/privacy">Privacy Policy</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Horizontal Baseline Rule */}
      <hr className="footer-divider" />

      {/* Baseline Copyright and Info Row */}
      <div className="footer-baseline">
        <p>&copy; {currentYear} WeekTracker. All rights reserved.</p>
        <p className="footer-tz">Standard Universal ISO Timing Model</p>
      </div>
    </footer>
  );
}

export default Footer;
