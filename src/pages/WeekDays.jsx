import React from "react";
import { Link, useParams } from "react-router-dom";
import {
  isoWeek,
  isoYear,
  dWritten,
  mondayOf,
  dFull,
  weeksInIsoYear,
} from "../components/dateUtils";
import SEO from "../components/SEO";

const WeekDays = () => {
  const { week, year } = useParams();
  // console.log(week, year);
  const w = Number(week);
  const y = Number(year);

  const NOW = new Date();
  const W_NOW = isoWeek(NOW);
  const Y_NOW = isoYear(NOW);
  const mo = mondayOf(week, year);
  // console.log(mo);
  const su = new Date(mo);
  su.setDate(mo.getDate() + 6);
  // console.log(su);
  var total = weeksInIsoYear(y);
  var M_FULL = [
    "Tammikuu",
    "Helmikuu",
    "Maaliskuu",
    "Huhtikuu",
    "Toukokuu",
    "Kesäkuu",
    "Heinäkuu",
    "Elokuu",
    "Syyskuu",
    "Lokakuu",
    "Marraskuu",
    "Joulukuu",
  ];
  var WD = [
    "Sunnuntai",
    "Maanantai",
    "Tiistai",
    "Keskiviikko",
    "Torstai",
    "Perjantai",
    "Lauantai",
  ];

  let monthLinks;

  if (mo.getMonth() === su.getMonth()) {
    monthLinks = (
      <Link to={`/month/${mo.getMonth() + 1}/${mo.getFullYear()}`}>
        {M_FULL[mo.getMonth()]} {mo.getFullYear()} viikot
      </Link>
    );
  } else {
    monthLinks = (
      <>
        <Link to={`/month/${mo.getMonth() + 1}/${mo.getFullYear()}`}>
          {M_FULL[mo.getMonth()]}
        </Link>{" "}
        ja{" "}
        <Link to={`/month/${su.getMonth() + 1}/${su.getFullYear()}`}>
          {M_FULL[su.getMonth()]}
        </Link>
      </>
    );
  }

  var prevW = w - 1,
    prevY = y;
  if (prevW < 1) {
    prevY = y - 1;
    prevW = weeksInIsoYear(prevY);
  }
  var nextW = w + 1,
    nextY = y;
  if (nextW > total) {
    nextY = y + 1;
    nextW = 1;
  }
  return (
    <section className="app">
      <SEO
        title={`Viikko ${week}, ${year} – päivämäärät ja viikonpäivät | Viikko Nro`}
        description={`Viikko ${week} vuonna ${year} alkaa maanantaina ${dWritten(mo)} ja päättyy sunnuntaina ${dWritten(su)}.`}
      />
      <div className="breadcrumb">
        <Link to={"/"}>Etusivu </Link> /{" "}
        <Link to={`/year/${year}`}>Viikot {year}</Link> / Viikko {week}
      </div>
      <h1>
        Viikko {week} vuonna {year}
      </h1>
      <p className="lead">
        Viikko {week} alkaa <strong>maanantaina {dWritten(mo)}</strong> ja
        päättyy <strong>sunnuntaina {dWritten(su)}.</strong> Se sijoittuu {""}
        {mo.getMonth() === su.getMonth()
          ? "kuukauteen"
          : "kuukausiin"}{" "}
        {monthLinks}.
      </p>

      <div className="panel">
        <div className="now-label">Viikonpäivät</div>
        <div className="days">
          {[...Array(7)].map((_, i) => {
            const d = new Date(mo);
            d.setDate(mo.getDate() + i);

            const isWeekend = d.getDay() === 0 || d.getDay() === 6;

            return (
              <div key={i} className={`day ${isWeekend ? "weekend" : ""}`}>
                <span className="wd">{WD[d.getDay()]}</span>
                <span className="dt">{dFull(d)}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="prevnext" onClick={() => window.scrollTo(0, 0)}>
        <Link to={`/week/${prevW}/${prevY}`}>
          <span className="lbl">Edellinen</span>Viikko {prevW}, {prevY}
        </Link>
        <Link to={`/week/${nextW}/${nextY}`}>
          <span className="lbl">Seuraava</span>Viikko {nextW}, {nextY}
        </Link>
      </div>
    </section>
  );
};

export default WeekDays;
