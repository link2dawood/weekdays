import React from "react";
import { Link, useParams } from "react-router-dom";
import {
  isoWeek,
  isoYear,
  dShort,
  mondayOf,
  M_FULL,
} from "../components/dateUtils";
import SEO from "../components/SEO";
import { canonicalFor, yearMeta } from "../data/seo";

const YearCalendar = ({ year: pYear } = {}) => {
  const params = useParams();
  const year = pYear ?? params.year;
  const selectedYear = Number(year);
  // console.log(year);
  const YEAR_MIN = 2020,
    YEAR_MAX = 2035;

  const years = [];
  for (let y = YEAR_MIN; y <= YEAR_MAX; y++) {
    years.push(y);
  }

  const NOW = new Date();
  const W_NOW = isoWeek(NOW);
  const Y_NOW = isoYear(NOW);

  function weeksInIsoYear(y) {
    return isoWeek(new Date(y, 11, 28));
  }

  const weeks = Array.from(
    { length: weeksInIsoYear(selectedYear) },
    (_, i) => i + 1,
  );

  function WeekCard({ w, y }) {
    const mo = mondayOf(w, y);
    const su = new Date(mo);
    su.setDate(mo.getDate() + 6);

    const isCurrent = w === W_NOW && y === Y_NOW;

    return (
      <Link
        className={`wk ${isCurrent ? "current" : ""}`}
        to={`/viikko-${w}-${y}`}
      >
        <div className="n">Viikko {w}</div>
        <div className="r">
          {dShort(mo)} – {dShort(su)}
        </div>
      </Link>
    );
  }

  return (
    <section className="app">
      <SEO
        {...yearMeta(selectedYear)}
        canonical={canonicalFor(`/vuosi-${year}`)}
      />
      <div className="breadcrumb">
        <Link to="/">Etusivu</Link> / Viikot {year}
      </div>

      <h1>Viikkonumerot {year}</h1>

      <p className="lead">
        Vuodessa {year} on <strong>{weeks.length} viikkoa</strong>. Napsauta
        viikkoa nähdäksesi sen päivämäärät.
      </p>

      <div className="pills">
        {years.map((y) => (
          <Link
            key={y}
            to={`/vuosi-${y}`}
            className={`pill ${y === selectedYear ? "active" : ""}`}
          >
            {y}
          </Link>
        ))}
      </div>

      <div className="grid">
        {weeks.map((w) => (
          <WeekCard key={w} w={w} y={selectedYear} />
        ))}
      </div>
      <h2 id="mh">Viikot kuukausittain {year} </h2>
      <div className="pills">
        {M_FULL.map((month, index) => (
          <Link key={index} className="pill" to={`/kuukausi-${index + 1}-${year}`}>
            {month}
          </Link>
        ))}
      </div>
      <div className="prevnext">
        <Link to={`/vuosi-${selectedYear - 1}`}>
          <span className="lbl">Edellinen</span>Viikot {selectedYear - 1}
        </Link>
        <Link className="nx" to={`/vuosi-${selectedYear + 1}`}>
          <span className="lbl">Seuraava</span>Viikot {selectedYear + 1}
        </Link>
      </div>
      <p>
        <Link
          to={`/tulosta-${year}`}
          className="btn"
          onClick={() => window.scrollTo(0, 0)}
        >
          Tulostettava kalenteri {selectedYear}
        </Link>
      </p>
      <p className="hub-links">
        Katso myös <Link to={`/pyhapaivat-${year}`}>pyhäpäivät {year}</Link> ja{" "}
        <Link to={`/tyopaivat-${year}`}>työpäivät {year}</Link>.
      </p>
    </section>
  );
};

export default YearCalendar;
