import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function isoWeek(date) {
  var t = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  var day = (t.getDay() + 6) % 7; // Mon=0 .. Sun=6
  t.setDate(t.getDate() - day + 3); // Thursday of this week
  var firstThu = t.valueOf();
  t.setMonth(0, 1);
  if (t.getDay() !== 4) {
    t.setMonth(0, 1 + ((4 - t.getDay() + 7) % 7));
  }
  return 1 + Math.round((firstThu - t.valueOf()) / 604800000);
}

const Navbar = () => {
  const [weekNow, setWeekNow] = useState();

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
            <Link id="navYear" to="/year/:current">
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
