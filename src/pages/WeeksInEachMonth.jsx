import React from "react";
import { Link, useParams } from "react-router-dom";
import { M_FULL, isoWeek, isoYear } from "../components/dateUtils";
import WeekCard from "../components/WeekCard";
import Footer from "../components/Footer";

const WeeksInEachMonth = () => {
  const { month, year } = useParams();

  console.log(month, year);
  const y = Number(year);
  const m = Number(month);
  var mi = m - 1;

  const getMonthWeeks = (y, mi) => {
    const dim = new Date(y, mi + 1, 0).getDate();

    const seen = {};
    const weeks = [];

    for (let dd = 1; dd <= dim; dd++) {
      const dt = new Date(y, mi, dd);

      const k = `${isoYear(dt)}-${isoWeek(dt)}`;

      if (seen[k]) continue;

      seen[k] = true;

      weeks.push({
        week: isoWeek(dt),
        year: isoYear(dt),
      });
    }

    return weeks;
  };

  const weeks = getMonthWeeks(y, mi);

  var prevM = m - 1,
    prevY = y;
  if (prevM < 1) {
    prevM = 12;
    prevY = y - 1;
  }
  var nextM = m + 1,
    nextY = y;
  if (nextM > 12) {
    nextM = 1;
    nextY = y + 1;
  }

  return (
    <section className="app">
      <div className="breadcrumb">
        <Link to={"/"}>Home</Link> /{" "}
        <Link to={`/year/${year}`}>Weeks {year}</Link> / {M_FULL[mi]}
      </div>
      <h1>
        Weeks in {M_FULL[mi]} {year}{" "}
      </h1>
      <p className="lead">
        These week numbers fall in {M_FULL[mi]} {year} . Some weeks may continue
        into the adjacent month.
      </p>
      <div className="grid">
        {weeks.map((w) => (
          <WeekCard key={`${w.year}-${w.week}`} w={w.week} y={w.year} />
        ))}
      </div>
      <div className="prevnext">
        <Link to={`/month/${prevM}/${prevY}`}>
          <span className="lbl">Previous</span>
          {M_FULL[prevM - 1]} {prevY}
        </Link>
        <Link className="nx" to={`/month/${nextM}/${nextY}`}>
          <span className="lbl">Next</span>
          {M_FULL[nextM - 1]} {nextY}
        </Link>
      </div>
      <Footer />
    </section>
  );
};

export default WeeksInEachMonth;
