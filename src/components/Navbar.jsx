import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { isoWeek, isoYear } from "./dateUtils";

const NOW = new Date();
const W_NOW = isoWeek(NOW);
const Y_NOW = isoYear(NOW);

const Navbar = () => {
  const [weekNow, setWeekNow] = useState();
  const NOW = new Date();
  const W_NOW = isoWeek(NOW);
  const Y_NOW = isoYear(NOW);
  useEffect(() => {
    const now = new Date();
    var wkNow = isoWeek(now);
    setWeekNow(wkNow);
  }, []);
  return (
    <>
      <header className="nav">
        <div className="wrap row">
          <Link className="brand" to="/">
            <span className="dot"></span>Week Now
          </Link>
          <nav>
            <Link id="navYear" to={`/year/${Y_NOW}`}>
              This year's weeks
            </Link>
            <Link id="navPrint" to="/">
              Printable
            </Link>
            <Link to="/what-is-a-week-number">About weeks</Link>
            <Link to="/faq">FAQ</Link>
          </nav>
          <Link className="badge" id="navBadge" href="/">
            Wk {weekNow}
          </Link>
        </div>
      </header>
    </>
  );
};

export default Navbar;
