import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { dWritten } from "../components/dateUtils";
import SEO from "../components/SEO";
import { canonicalFor, routeMeta } from "../data/seo";
import { holidaysInYear } from "../data/holidays";

function pad(n) {
  return n < 10 ? "0" + n : "" + n;
}
function toInput(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function parse(str) {
  if (!str) return null;
  const p = str.split("-");
  if (p.length !== 3) return null;
  const d = new Date(+p[0], +p[1] - 1, +p[2]);
  return Number.isNaN(d.getTime()) ? null : d;
}

// Working days (Mon–Fri minus official Finnish public holidays) between two
// dates, inclusive. Deterministic given the two inputs.
function compute(fromStr, toStr) {
  const a = parse(fromStr);
  const b = parse(toStr);
  if (!a || !b || a > b) return null;

  const officialSet = new Set();
  for (let y = a.getFullYear(); y <= b.getFullYear(); y++) {
    holidaysInYear(y)
      .filter((h) => h.official)
      .forEach((h) => officialSet.add(h.date.toDateString()));
  }

  let working = 0;
  let holidays = 0;
  let weekend = 0;
  let total = 0;
  const d = new Date(a);
  while (d <= b) {
    total += 1;
    const dow = d.getDay();
    if (dow === 0 || dow === 6) weekend += 1;
    else if (officialSet.has(d.toDateString())) holidays += 1;
    else working += 1;
    d.setDate(d.getDate() + 1);
  }
  return { working, holidays, weekend, total, from: dWritten(a), to: dWritten(b) };
}

const WorkingDaysBetween = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  useEffect(() => {
    const now = new Date();
    const end = new Date(now);
    end.setDate(end.getDate() + 30);
    setFrom(toInput(now));
    setTo(toInput(end));
  }, []);
  const r = compute(from, to);

  return (
    <section className="app">
      <SEO
        {...routeMeta["/tyopaivalaskuri"]}
        canonical={canonicalFor("/tyopaivalaskuri")}
      />
      <div className="breadcrumb">
        <Link to="/">Etusivu</Link> / <Link to="/laskurit">Laskurit</Link> /
        Työpäivälaskuri
      </div>
      <h1>Työpäivälaskuri</h1>
      <p className="lead">
        Laske työpäivien määrä kahden päivämäärän välillä. Viikonloput ja Suomen
        viralliset arkipyhät vähennetään automaattisesti.
      </p>

      <div className="lookup">
        <div className="two-fields">
          <div>
            <label htmlFor="from">Alkupäivä</label>
            <input
              type="date"
              id="from"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="to">Loppupäivä</label>
            <input
              type="date"
              id="to"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
        </div>
        {r && (
          <>
            <div className="result">
              <div className="main-text">
                Aikavälillä on <span className="num">{r.working} työpäivää</span>.
              </div>
              <div className="sub">
                {r.from} – {r.to}
              </div>
            </div>
            <div className="stat-row">
              <div className="stat-box">
                <div className="n">{r.working}</div>
                <div className="l">Työpäivää</div>
              </div>
              <div className="stat-box">
                <div className="n">{r.weekend}</div>
                <div className="l">Viikonlopun päivää</div>
              </div>
              <div className="stat-box">
                <div className="n">{r.holidays}</div>
                <div className="l">Arkipyhää (ma–pe)</div>
              </div>
              <div className="stat-box">
                <div className="n">{r.total}</div>
                <div className="l">Päivää yhteensä</div>
              </div>
            </div>
          </>
        )}
      </div>

      <p className="note-soft">
        Työpäivä = maanantai–perjantai, joista on vähennetty viralliset
        arkipyhät. Molemmat päivämäärät lasketaan mukaan.
      </p>
      <p>
        Katso myös <Link to="/paivien-erotus">päivien erotus</Link> ja{" "}
        <Link to="/laskurit">kaikki laskurit</Link>.
      </p>
    </section>
  );
};

export default WorkingDaysBetween;
