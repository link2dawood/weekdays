import React from "react";
import { Link, useParams } from "react-router-dom";
import { M_FULL, isoWeek, isoYear } from "../components/dateUtils";
import WeekCard from "../components/WeekCard";
import SEO from "../components/SEO";

const WeeksInEachMonth = () => {
  const { month, year } = useParams();

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
      <SEO
        title={`${M_FULL[mi]} ${year} – viikkonumerot ja päivämäärät | Viikko Nro`}
        description={`Kaikki viikkonumerot, jotka osuvat kuukauteen ${M_FULL[mi]} ${year}, ISO 8601 -standardin mukaan.`}
      />
      <div className="breadcrumb">
        <Link to={"/"}>Etusivu</Link> /{" "}
        <Link to={`/year/${year}`}>Viikot {year}</Link> / {M_FULL[mi]}
      </div>
      <h2 id="mh">
        Viikot – {M_FULL[mi]} {year}{" "}
      </h2>
      <p className="lead">
        Nämä viikkonumerot osuvat kuukauteen {M_FULL[mi]} {year} . Osa viikoista
        voi jatkua viereiseen kuukauteen.
      </p>
      <div className="grid">
        {weeks.map((w) => (
          <WeekCard key={`${w.year}-${w.week}`} w={w.week} y={w.year} />
        ))}
      </div>
      <div className="prevnext">
        <Link to={`/month/${prevM}/${prevY}`}>
          <span className="lbl">Edellinen</span>
          {M_FULL[prevM - 1]} {prevY}
        </Link>
        <Link className="nx" to={`/month/${nextM}/${nextY}`}>
          <span className="lbl">Seuraava</span>
          {M_FULL[nextM - 1]} {nextY}
        </Link>
      </div>
    </section>
  );
};

export default WeeksInEachMonth;
