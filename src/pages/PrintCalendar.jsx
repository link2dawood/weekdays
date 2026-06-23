import React from "react";
import { useParams, Link } from "react-router-dom";
import {
  isoWeek,
  isoYear,
  weeksInIsoYear,
  mondayOf,
  dFull,
} from "../components/dateUtils";
import Footer from "../components/Footer";

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
      <div className="breadcrumb">
        <Link to="/">Home</Link> / Printable {selectedYear}
      </div>

      <h1>Printable week calendar {selectedYear}</h1>

      <p className="lead">
        All weeks and dates for {selectedYear}. Press print or save as PDF.
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
            Print / save as PDF
          </button>
        </p>
      </div>
      <table className="ptable">
        <thead>
          <tr>
            <th>Week</th>
            <th>Starts (Mon)</th>
            <th>Ends (Sun)</th>
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
                  <b>Week {w}</b>
                </td>

                <td>{dFull(mo)}</td>

                <td>{dFull(su)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Footer />
    </section>
  );
};

export default PrintCalendar;
