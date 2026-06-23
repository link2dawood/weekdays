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
import Footer from "../components/Footer";

const WeekDays = () => {
  const { week, year } = useParams();
  // console.log(week, year);
  const w = Number(week);
  const y = Number(year);
  console.log(w, y);

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
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  var WD = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  let monthLinks;

  if (mo.getMonth() === su.getMonth()) {
    monthLinks = (
      <Link to={`/month/${mo.getMonth() + 1}/${mo.getFullYear()}`}>
        {M_FULL[mo.getMonth()]} {mo.getFullYear()} weeks
      </Link>
    );
  } else {
    monthLinks = (
      <>
        <Link to={`/month/${mo.getMonth() + 1}/${mo.getFullYear()}`}>
          {M_FULL[mo.getMonth()]}
        </Link>{" "}
        and{" "}
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
  console.log(prevW, y, nextW, y);
  return (
    <section className="app">
      <div className="breadcrumb">
        <Link to={"/"}>Home </Link> /{" "}
        <Link to={`/year/${year}`}>Weeks {year}</Link> / Week {week}
      </div>
      <h1>
        Week {week} in {year}
      </h1>
      <p className="lead">
        Week {week} starts on <strong>Monday {dWritten(mo)}</strong> and ends on{" "}
        <strong>Sunday{dWritten(su)}.</strong> It falls in {""}
        {mo.getMonth() === su.getMonth()
          ? "the month of"
          : "the months of"}{" "}
        {monthLinks}.
      </p>

      <div className="panel">
        <div className="now-label">Days of the week</div>
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
          <span className="lbl">Previous</span>Week {prevW}, {prevY}
        </Link>
        <Link to={`/week/${nextW}/${nextY}`}>
          <span className="lbl">Next</span>Week {nextW}, {nextY}
        </Link>
      </div>
      <Footer />
    </section>
  );
};

export default WeekDays;
