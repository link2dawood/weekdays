import React from "react";
import { useParams, Link } from "react-router-dom";
import {
  isoWeek,
  isoYear,
  weeksInIsoYear,
  mondayOf,
  dFull,
} from "../components/dateUtils";
import SEO from "../components/SEO";

const PrintCalendar = () => {
  const { year } = useParams();
  const selectedYear = Number(year);

  const YEAR_MIN = 2020,
    YEAR_MAX = 2035;

  const years = [];
  for (let y = YEAR_MIN; y <= YEAR_MAX; y++) {
    years.push(y);
  }

  const NOW = new Date();
  const W_NOW = isoWeek(NOW);
  const Y_NOW = isoYear(NOW);

  const total = weeksInIsoYear(selectedYear);

  const weeks = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <section className="app">
      <SEO
        title={`Tulostettava viikkokalenteri ${selectedYear} – kaikki viikot | Viikko Nro`}
        description={`Tulosta vuoden ${selectedYear} viikkokalenteri: kaikki viikot ja niiden alkamis- ja päättymispäivät yhdellä sivulla.`}
      />
      <div className="breadcrumb">
        <Link to="/">Etusivu</Link> / Tulostettava {selectedYear}
      </div>

      <h1>Tulostettava viikkokalenteri {selectedYear}</h1>

      <p className="lead">
        Kaikki vuoden {selectedYear} viikot ja päivämäärät. Tulosta tai tallenna
        PDF-tiedostona.
      </p>
      <div className="noprint">
        <div className="pills">
          {years.map((y) => (
            <Link
              key={y}
              to={`/print/${y}`}
              className={`pill ${y === selectedYear ? "active" : ""}`}
            >
              {y}
            </Link>
          ))}
        </div>
        <p>
          <button className="btn" onClick={() => window.print()}>
            Tulosta / tallenna PDF
          </button>
        </p>
      </div>
      <table className="ptable">
        <thead>
          <tr>
            <th>Viikko</th>
            <th>Alkaa (ma)</th>
            <th>Päättyy (su)</th>
          </tr>
        </thead>
        <tbody>
          {weeks.map((w) => {
            const mo = mondayOf(w, selectedYear);
            const su = new Date(mo);
            su.setDate(mo.getDate() + 6);

            const isCurrent = w === W_NOW && selectedYear === Y_NOW;

            return (
              <tr key={w} className={isCurrent ? "now" : ""}>
                <td>
                  <b>Viikko {w}</b>
                </td>

                <td>{dFull(mo)}</td>

                <td>{dFull(su)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
};

export default PrintCalendar;
