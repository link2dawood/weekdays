import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  isoWeek,
  isoYear,
  mondayOf,
  weeksInIsoYear,
  dWritten,
  getWeekdayName,
} from "../components/dateUtils";
import SEO from "../components/SEO";
import { canonicalFor, routeMeta } from "../data/seo";

function compute(weekStr, yearStr) {
  const w = Number(weekStr);
  const y = Number(yearStr);
  if (!w || !y || w < 1 || w > weeksInIsoYear(y)) return null;
  const mo = mondayOf(w, y);
  const su = new Date(mo);
  su.setDate(mo.getDate() + 6);
  const days = [...Array(7)].map((_, i) => {
    const d = new Date(mo);
    d.setDate(mo.getDate() + i);
    return { name: getWeekdayName(d), written: dWritten(d) };
  });
  return { w, y, start: dWritten(mo), end: dWritten(su), days };
}

const WeekToDate = () => {
  const [week, setWeek] = useState("");
  const [year, setYear] = useState("");
  useEffect(() => {
    const now = new Date();
    setWeek(String(isoWeek(now)));
    setYear(String(isoYear(now)));
  }, []);
  const r = compute(week, year);

  return (
    <section className="app">
      <SEO
        {...routeMeta["/viikko-paivamaaraksi"]}
        canonical={canonicalFor("/viikko-paivamaaraksi")}
      />
      <div className="breadcrumb">
        <Link to="/">Etusivu</Link> / <Link to="/laskurit">Laskurit</Link> /
        Viikosta päivämääräksi
      </div>
      <h1>Viikosta päivämääräksi</h1>
      <p className="lead">
        Syötä viikkonumero ja vuosi, niin näet viikon alkamis- ja
        päättymispäivän sekä kaikki viikonpäivät.
      </p>

      <div className="lookup">
        <div className="two-fields">
          <div>
            <label htmlFor="wk">Viikko</label>
            <input
              type="number"
              id="wk"
              min="1"
              max="53"
              value={week}
              onChange={(e) => setWeek(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="yr">Vuosi</label>
            <input
              type="number"
              id="yr"
              min="2000"
              max="2100"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </div>
        </div>
        {r && (
          <div className="result">
            <div className="main-text">
              <span className="num">Viikko {r.w}/{r.y}</span> alkaa{" "}
              <strong>{r.start}</strong> ja päättyy <strong>{r.end}</strong>.
            </div>
            <div className="sub">
              <Link className="open-link" to={`/viikko-${r.w}-${r.y}`}>
                avaa viikko {r.w} kaikkine tietoineen
              </Link>
            </div>
            <div className="table-wrap" style={{ marginTop: "14px" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Viikonpäivä</th>
                    <th>Päivämäärä</th>
                  </tr>
                </thead>
                <tbody>
                  {r.days.map((d) => (
                    <tr key={d.name}>
                      <td>{d.name}</td>
                      <td>{d.written}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <p>
        Katso myös{" "}
        <Link to="/paivamaara-viikoksi">päivämäärästä viikkonumeroon</Link> ja{" "}
        <Link to="/laskurit">kaikki laskurit</Link>.
      </p>
    </section>
  );
};

export default WeekToDate;
