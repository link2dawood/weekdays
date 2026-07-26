import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  isoWeek,
  isoYear,
  mondayOf,
  dWritten,
  getWeekdayName,
} from "../components/dateUtils";
import SEO from "../components/SEO";
import { canonicalFor, routeMeta } from "../data/seo";

function pad(n) {
  return n < 10 ? "0" + n : "" + n;
}
function toInput(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Pure function of the input string (computed in render, not an effect) so the
// result is present in the prerendered HTML once a date is set. Same approach
// as WeeklySearch — hydration-safe because the input starts empty on both SSR
// and first client render, then the effect fills in today's date.
function compute(str) {
  if (!str) return null;
  const p = str.split("-");
  if (p.length !== 3) return null;
  const d = new Date(+p[0], +p[1] - 1, +p[2]);
  if (Number.isNaN(d.getTime())) return null;
  const w = isoWeek(d);
  const y = isoYear(d);
  const mo = mondayOf(w, y);
  const su = new Date(mo);
  su.setDate(mo.getDate() + 6);
  return {
    w,
    y,
    weekday: getWeekdayName(d),
    written: dWritten(d),
    range: `${dWritten(mo)} – ${dWritten(su)}`,
  };
}

const DateToWeek = () => {
  const [str, setStr] = useState("");
  useEffect(() => {
    setStr(toInput(new Date()));
  }, []);
  const r = compute(str);

  return (
    <section className="app">
      <SEO
        {...routeMeta["/paivamaara-viikoksi"]}
        canonical={canonicalFor("/paivamaara-viikoksi")}
      />
      <div className="breadcrumb">
        <Link to="/">Etusivu</Link> / <Link to="/laskurit">Laskurit</Link> /
        Päivämäärästä viikkoon
      </div>
      <h1>Päivämäärästä viikkonumeroon</h1>
      <p className="lead">
        Valitse päivämäärä, niin näet mihin viikkonumeroon se kuuluu ISO 8601
        -standardin mukaan.
      </p>

      <div className="lookup">
        <label htmlFor="dpick">Päivämäärä</label>
        <input
          type="date"
          id="dpick"
          value={str}
          onChange={(e) => setStr(e.target.value)}
        />
        {r && (
          <div className="result">
            <div className="main-text">
              <strong>{r.written}</strong> ({r.weekday}) on{" "}
              <span className="num">viikolla {r.w}</span>.
            </div>
            <div className="sub">
              Viikko {r.w}/{r.y} · {r.range} ·{" "}
              <Link className="open-link" to={`/viikko-${r.w}-${r.y}`}>
                avaa viikko {r.w}
              </Link>
            </div>
          </div>
        )}
      </div>

      <h2>Miten viikkonumero määräytyy?</h2>
      <p>
        Suomessa ja koko Euroopassa viikot numeroidaan ISO 8601 -standardin
        mukaan: viikko alkaa maanantaista ja vuoden ensimmäinen viikko on se,
        johon osuu vuoden ensimmäinen torstai. Siksi alkuvuoden päivä voi vielä
        kuulua edellisen vuoden viimeiseen viikkoon.
      </p>
      <p>
        Katso myös <Link to="/viikko-paivamaaraksi">viikosta päivämääräksi</Link>,{" "}
        <Link to="/paivien-erotus">päivien erotus</Link> ja{" "}
        <Link to="/laskurit">kaikki laskurit</Link>.
      </p>
    </section>
  );
};

export default DateToWeek;
