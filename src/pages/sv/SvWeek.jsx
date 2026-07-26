import React from "react";
import { Link } from "react-router-dom";
import { mondayOf, weeksInIsoYear } from "../../components/dateUtils";
import { svDate, svWeekday } from "../../i18n/sv";
import { holidaysInWeekSE } from "../../data/holidays-se";
import SEO from "../../components/SEO";
import { canonicalFor, svWeekMeta } from "../../data/seo";

const SvWeek = ({ week, year } = {}) => {
  const w = Number(week);
  const y = Number(year);
  const mo = mondayOf(w, y);
  const su = new Date(mo);
  su.setDate(mo.getDate() + 6);
  const holidays = holidaysInWeekSE(y, w);
  const officials = holidays.filter((h) => h.official);
  const days = [...Array(7)].map((_, i) => {
    const d = new Date(mo);
    d.setDate(mo.getDate() + i);
    return d;
  });

  let prevW = w - 1;
  let prevY = y;
  if (prevW < 1) {
    prevY = y - 1;
    prevW = weeksInIsoYear(prevY);
  }
  let nextW = w + 1;
  let nextY = y;
  if (nextW > weeksInIsoYear(y)) {
    nextY = y + 1;
    nextW = 1;
  }

  return (
    <section className="app">
      <SEO {...svWeekMeta(w, y)} canonical={canonicalFor(`/sv/vecka-${week}-${year}`)} />
      <div className="breadcrumb">
        <Link to="/sv">Hem</Link> / <Link to={`/sv/veckor-${year}`}>Veckor {year}</Link> /
        Vecka {week}
      </div>
      <h1>
        Vecka {week} år {year}
      </h1>
      <p className="lead">
        Vecka {week} börjar <strong>måndag {svDate(mo)}</strong> och slutar{" "}
        <strong>söndag {svDate(su)}</strong>. Veckonummer enligt ISO 8601.
      </p>
      {officials.length > 0 && (
        <p className="lead">
          Röda dagar denna vecka: {officials.map((h) => h.name).join(", ")}.
        </p>
      )}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Veckodag</th>
              <th>Datum</th>
              <th>Helgdag</th>
            </tr>
          </thead>
          <tbody>
            {days.map((d, i) => {
              const hs = holidays.filter(
                (h) => h.date.toDateString() === d.toDateString(),
              );
              return (
                <tr key={i}>
                  <td>{svWeekday(d)}</td>
                  <td>{svDate(d)}</td>
                  <td>{hs.map((h) => h.name).join(", ")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="prevnext">
        <Link to={`/sv/vecka-${prevW}-${prevY}`}>
          <span className="lbl">Föregående</span>Vecka {prevW}
        </Link>
        <Link className="nx" to={`/sv/vecka-${nextW}-${nextY}`}>
          <span className="lbl">Nästa</span>Vecka {nextW}
        </Link>
      </div>

      <p>
        Se även <Link to={`/sv/veckor-${year}`}>alla veckor {year}</Link> och{" "}
        <Link to={`/sv/helgdagar-${year}`}>röda dagar {year}</Link>. På finska:{" "}
        <Link to={`/viikko-${week}-${year}`}>viikko {week}</Link>.
      </p>
    </section>
  );
};

export default SvWeek;
