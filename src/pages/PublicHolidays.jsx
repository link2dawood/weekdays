import React from "react";
import { Link, useParams } from "react-router-dom";
import { isoWeek, isoYear, getWeekdayName, dWritten } from "../components/dateUtils";
import SEO from "../components/SEO";
import { canonicalFor, holidaysMeta } from "../data/seo";
import { holidaysInYear } from "../data/holidays";

// Finnish public-holidays hub for a year (/pyhapaivat-2026). Content-rich page
// targeting "pyhäpäivät <vuosi>" searches — a higher-volume query cluster than
// pure week-number lookups. Props come from the /:slug dispatcher; useParams is
// the fallback. Fully deterministic (no `new Date()`), so hydration is safe.
const PublicHolidays = ({ year: pYear } = {}) => {
  const params = useParams();
  const year = pYear ?? params.year;
  const y = Number(year);
  const holidays = holidaysInYear(y);
  const officialCount = holidays.filter((h) => h.official).length;

  return (
    <section className="app">
      <SEO {...holidaysMeta(y)} canonical={canonicalFor(`/pyhapaivat-${year}`)} />
      <div className="breadcrumb">
        <Link to="/">Etusivu</Link> /{" "}
        <Link to={`/vuosi-${year}`}>Viikot {year}</Link> / Pyhäpäivät {year}
      </div>

      <h1>Suomen pyhäpäivät {year}</h1>

      <p className="lead">
        Vuonna {year} Suomessa on{" "}
        <strong>{officialCount} virallista pyhäpäivää</strong> (arkipyhää) sekä
        muutama laajasti vietetty vapaapäivä. Alla kaikki pyhäpäivät
        päivämäärineen, viikonpäivineen ja viikkonumeroineen.
      </p>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Pyhäpäivä</th>
              <th>Päivämäärä</th>
              <th>Viikonpäivä</th>
              <th>Viikko</th>
              <th>Tyyppi</th>
            </tr>
          </thead>
          <tbody>
            {holidays.map((h) => {
              const wk = isoWeek(h.date);
              const wkY = isoYear(h.date);
              return (
                <tr key={h.name}>
                  <td>{h.name}</td>
                  <td>{dWritten(h.date)}</td>
                  <td>{getWeekdayName(h.date)}</td>
                  <td>
                    <Link to={`/viikko-${wk}-${wkY}`}>Viikko {wk}</Link>
                  </td>
                  <td>
                    {h.official ? (
                      <span className="tag">Virallinen arkipyhä</span>
                    ) : (
                      <span className="tag observed">Vietetään</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p>
        Katso myös <Link to={`/tyopaivat-${year}`}>työpäivät vuonna {year}</Link>,{" "}
        <Link to={`/vuosi-${year}`}>vuoden {year} viikkonumerot</Link>,{" "}
        <Link to={`/kalenteri-${year}`}>vuoden {year} kalenteri</Link> ja{" "}
        <Link to={`/tulosta-${year}`}>tulostettava viikkolista</Link>.
      </p>

      <div className="prevnext">
        <Link to={`/pyhapaivat-${y - 1}`}>
          <span className="lbl">Edellinen</span>Pyhäpäivät {y - 1}
        </Link>
        <Link className="nx" to={`/pyhapaivat-${y + 1}`}>
          <span className="lbl">Seuraava</span>Pyhäpäivät {y + 1}
        </Link>
      </div>
    </section>
  );
};

export default PublicHolidays;
