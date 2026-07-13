import React, { useEffect, useState } from "react";
import { isoWeek, isoYear } from "./dateUtils";
import { Link } from "react-router-dom";
const YearsWeek = () => {
  var YEAR_MIN = 2020,
    YEAR_MAX = 2035;

  const years = [];
  for (var y = YEAR_MIN; y <= YEAR_MAX; y++) {
    years.push(y);
  }
  var NOW = new Date(),
    W_NOW = isoWeek(NOW),
    Y_NOW = isoYear(NOW);

  return (
    <>
      <section>
        <h2 className="mh">Selaa vuoden viikkoja</h2>
        <p className="lead">
          Kaikki viikkonumerot vuosi kerrallaan päivämäärineen.
        </p>
        <div className="pills">
          {years.map((year) => (
            <Link
              key={year}
              to={`/year/${year}`}
              className={`pill ${year === Y_NOW ? "active" : ""}`}
              onClick={() => window.scrollTo(0, 0)}
            >
              {year}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
};

export default YearsWeek;
