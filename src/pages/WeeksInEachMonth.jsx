import React from "react";
import { Link, useParams } from "react-router-dom";
import {
  M_FULL,
  M_GENITIVE,
  isoWeek,
  isoYear,
  PRERENDER_MIN_YEAR as YEAR_MIN,
  PRERENDER_MAX_YEAR as YEAR_MAX,
} from "../components/dateUtils";
import WeekCard from "../components/WeekCard";
import SEO from "../components/SEO";
import { canonicalFor, monthMeta } from "../data/seo";

const WeeksInEachMonth = ({ month: pMonth, year: pYear } = {}) => {
  const params = useParams();

  const month = pMonth ?? params.month;
  const year = pYear ?? params.year;
  const y = Number(year);
  const m = Number(month);
  var mi = m - 1;

  const getMonthWeeks = (y, mi) => {
    const dim = new Date(y, mi + 1, 0).getDate();

    const seen = {};
    const weeks = [];

    for (let dd = 1; dd <= dim; dd++) {
      const dt = new Date(y, mi, dd);

      const wy = isoYear(dt);
      const k = `${wy}-${isoWeek(dt)}`;

      if (seen[k]) continue;

      seen[k] = true;

      // A boundary week can belong to an adjacent ISO year; skip it if that
      // year is outside the prerendered range (e.g. Dec 2035 → week 1 2036),
      // so the grid never renders a WeekCard linking a page that 404s.
      if (wy < YEAR_MIN || wy > YEAR_MAX) continue;

      weeks.push({
        week: isoWeek(dt),
        year: wy,
      });
    }

    return weeks;
  };

  const weeks = getMonthWeeks(y, mi);
  // Genitive, capitalized, in "{genitive} viikot {year}" order ("Kesäkuun
  // viikot 2026") — matches how people actually search ("kesäkuun viikot",
  // "heinäkuun viikot 2026") as a literal contiguous phrase, and matches
  // monthMeta()'s title in seo.js, so the H1/lead and <title> never disagree.
  const genitiveCap = M_GENITIVE[mi].replace(/^./, (c) => c.toUpperCase());

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
        {...monthMeta(m, y)}
        canonical={canonicalFor(`/kuukausi-${month}-${year}`)}
      />
      <div className="breadcrumb">
        <Link to={"/"}>Etusivu</Link> /{" "}
        <Link to={`/vuosi-${year}`}>Viikot {year}</Link> / {M_FULL[mi]}
      </div>
      <h1 id="mh">
        {genitiveCap} viikot {year}
      </h1>
      <p className="lead">
        <strong>
          {genitiveCap} viikot {year}.
        </strong>{" "}
        Tässä kaikki {weeks.length} viikkoa, jotka kuuluvat {M_GENITIVE[mi]}{" "}
        {year} kalenteriin. Osa viikoista voi jatkua viereiseen kuukauteen.
      </p>
      <div className="grid">
        {weeks.map((w) => (
          <WeekCard key={`${w.year}-${w.week}`} w={w.week} y={w.year} />
        ))}
      </div>
      <div className="prevnext">
        {prevY >= YEAR_MIN && (
          <Link to={`/kuukausi-${prevM}-${prevY}`}>
            <span className="lbl">Edellinen</span>
            {M_FULL[prevM - 1]} {prevY}
          </Link>
        )}
        {nextY <= YEAR_MAX && (
          <Link className="nx" to={`/kuukausi-${nextM}-${nextY}`}>
            <span className="lbl">Seuraava</span>
            {M_FULL[nextM - 1]} {nextY}
          </Link>
        )}
      </div>

      <section className="related">
        <h2>Katso myös</h2>

        <h3>Kuukaudet {y}</h3>
        <div className="pills">
          {M_FULL.map((name, i) =>
            i + 1 === m ? null : (
              <Link
                key={i}
                className="pill"
                to={`/kuukausi-${i + 1}-${y}`}
                onClick={() => window.scrollTo(0, 0)}
              >
                {name}
              </Link>
            ),
          )}
        </div>

        <h3>Vuosi {y}</h3>
        <ul className="links">
          <li>
            <Link to={`/vuosi-${y}`} onClick={() => window.scrollTo(0, 0)}>
              Kaikki viikot vuonna {y}
            </Link>
          </li>
          <li>
            <Link to={`/kalenteri-${y}`} onClick={() => window.scrollTo(0, 0)}>
              Vuoden {y} kalenteri
            </Link>
          </li>
          <li>
            <Link to={`/pyhapaivat-${y}`} onClick={() => window.scrollTo(0, 0)}>
              Pyhäpäivät ja liputuspäivät {y}
            </Link>
          </li>
          <li>
            <Link to={`/tyopaivat-${y}`} onClick={() => window.scrollTo(0, 0)}>
              Työpäivät ja arkipäivät {y}
            </Link>
          </li>
          <li>
            <Link to={`/tulosta-${y}`} onClick={() => window.scrollTo(0, 0)}>
              Tulostettava viikkolista {y}
            </Link>
          </li>
        </ul>
      </section>
    </section>
  );
};

export default WeeksInEachMonth;
