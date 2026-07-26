import React from "react";
import { Link, useParams } from "react-router-dom";
import { M_FULL, M_GENITIVE, isoWeek, isoYear } from "../components/dateUtils";
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
        {...monthMeta(m, y)}
        canonical={canonicalFor(`/kuukausi-${month}-${year}`)}
      />
      <div className="breadcrumb">
        <Link to={"/"}>Etusivu</Link> /{" "}
        <Link to={`/vuosi-${year}`}>Viikot {year}</Link> / {M_FULL[mi]}
      </div>
      <h2 id="mh">
        Viikot – {M_FULL[mi]} {year}{" "}
      </h2>
      <p className="lead">
        Nämä viikkonumerot kuuluvat {M_GENITIVE[mi]} {year} kalenteriin. Osa
        viikoista
        voi jatkua viereiseen kuukauteen.
      </p>
      <div className="grid">
        {weeks.map((w) => (
          <WeekCard key={`${w.year}-${w.week}`} w={w.week} y={w.year} />
        ))}
      </div>
      <div className="prevnext">
        <Link to={`/kuukausi-${prevM}-${prevY}`}>
          <span className="lbl">Edellinen</span>
          {M_FULL[prevM - 1]} {prevY}
        </Link>
        <Link className="nx" to={`/kuukausi-${nextM}-${nextY}`}>
          <span className="lbl">Seuraava</span>
          {M_FULL[nextM - 1]} {nextY}
        </Link>
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
