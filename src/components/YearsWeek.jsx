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
        <h2>Browse the year's weeks</h2>
        <p className="lead">
          All week numbers, year by year, with their dates.
        </p>
        <div className="pills">
          {years.map((year) => (
            <Link
              key={year}
              to={`/year/${year}`}
              className={`pill ${year === Y_NOW ? "active" : ""}`}
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
