import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { dWritten } from "../components/dateUtils";
import SEO from "../components/SEO";
import { canonicalFor, routeMeta } from "../data/seo";

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

function compute(fromStr, toStr) {
  const a = parse(fromStr);
  const b = parse(toStr);
  if (!a || !b) return null;
  const ms = Math.abs(b - a);
  const days = Math.round(ms / 86400000);
  return {
    days,
    weeks: Math.floor(days / 7),
    remDays: days % 7,
    from: dWritten(a < b ? a : b),
    to: dWritten(a < b ? b : a),
  };
}

const DaysBetween = () => {
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
        {...routeMeta["/paivien-erotus"]}
        canonical={canonicalFor("/paivien-erotus")}
      />
      <div className="breadcrumb">
        <Link to="/">Etusivu</Link> / <Link to="/laskurit">Laskurit</Link> /
        Päivien erotus
      </div>
      <h1>Päivien erotus</h1>
      <p className="lead">
        Laske montako päivää ja viikkoa kahden päivämäärän välillä on.
      </p>

      <div className="lookup">
        <div className="two-fields">
          <div>
            <label htmlFor="from">Ensimmäinen päivä</label>
            <input
              type="date"
              id="from"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="to">Toinen päivä</label>
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
                Päivien välissä on <span className="num">{r.days} päivää</span>.
              </div>
              <div className="sub">
                {r.from} – {r.to} · {r.weeks} viikkoa
                {r.remDays > 0 ? ` ja ${r.remDays} päivää` : ""}
              </div>
            </div>
          </>
        )}
      </div>

      <p>
        Tarvitsetko vain arkipäivät? Käytä{" "}
        <Link to="/tyopaivalaskuri">työpäivälaskuria</Link>. Katso myös{" "}
        <Link to="/laskurit">kaikki laskurit</Link>.
      </p>
    </section>
  );
};

export default DaysBetween;
