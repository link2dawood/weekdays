import React from "react";
import { Link } from "react-router-dom";
import { isoWeek, isoYear } from "../../components/dateUtils";
import { svDate, svWeekday } from "../../i18n/sv";
import { holidaysInYearSE } from "../../data/holidays-se";
import SEO from "../../components/SEO";
import { canonicalFor, svHolidaysMeta } from "../../data/seo";

const SvHolidays = ({ year } = {}) => {
  const y = Number(year);
  const holidays = holidaysInYearSE(y);
  const officialCount = holidays.filter((h) => h.official).length;

  return (
    <section className="app">
      <SEO {...svHolidaysMeta(y)} canonical={canonicalFor(`/sv/helgdagar-${year}`)} />
      <div className="breadcrumb">
        <Link to="/sv">Hem</Link> / <Link to={`/sv/veckor-${year}`}>Veckor {year}</Link> /
        Röda dagar {year}
      </div>
      <h1>Röda dagar {year} i Sverige</h1>
      <p className="lead">
        År {year} har Sverige <strong>{officialCount} röda dagar</strong>{" "}
        (helgdagar) samt några de-facto lediga dagar. Nedan alla med datum,
        veckodag och veckonummer.
      </p>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Helgdag</th>
              <th>Datum</th>
              <th>Veckodag</th>
              <th>Vecka</th>
              <th>Typ</th>
            </tr>
          </thead>
          <tbody>
            {holidays.map((h) => {
              const wk = isoWeek(h.date);
              const wy = isoYear(h.date);
              return (
                <tr key={h.name}>
                  <td>{h.name}</td>
                  <td>{svDate(h.date)}</td>
                  <td>{svWeekday(h.date)}</td>
                  <td>
                    <Link to={`/sv/vecka-${wk}-${wy}`}>Vecka {wk}</Link>
                  </td>
                  <td>
                    {h.official ? (
                      <span className="tag">Röd dag</span>
                    ) : (
                      <span className="tag observed">De facto ledig</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p>
        Se även <Link to={`/sv/veckor-${year}`}>alla veckor {year}</Link>. På
        finska: <Link to={`/pyhapaivat-${year}`}>pyhäpäivät {year}</Link>.
      </p>
    </section>
  );
};

export default SvHolidays;
