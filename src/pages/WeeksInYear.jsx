import React from "react";
import { Link } from "react-router-dom";
import { isoWeek, isoYear } from "../components/dateUtils";
import Footer from "../components/Footer";

const WeeksInYear = () => {
  const YEAR_MIN = 2020,
    YEAR_MAX = 2035;

  const years = [];
  for (let y = YEAR_MIN; y <= YEAR_MAX; y++) {
    years.push(y);
  }

  const NOW = new Date();
  const W_NOW = isoWeek(NOW);
  const Y_NOW = isoYear(NOW);

  return (
    <>
      <section className="app">
        <div className="breadcrumb">
          <Link to="/">Home</Link> / Weeks in a year
        </div>
        <h1>How many weeks are in a year?</h1>
        <div className="prose">
          <p>
            Most years have <strong>52 weeks</strong>. Roughly every five or six
            years, however, a year has <strong>53 weeks</strong>.
          </p>
          <p>
            A year has 53 weeks when it starts on a <strong>Thursday</strong>,
            or when a <strong>leap year</strong> starts on a Wednesday. For
            example, 2020 and 2026 both have 53 weeks.
          </p>
          <p>
            This tool handles the difference automatically, so the week number
            you see is always correct.
          </p>
        </div>
        <div className="pills">
          {years.map((y) => (
            <Link
              key={y}
              to={`/year/${y}`}
              className={`pill ${y === Y_NOW ? "active" : ""}`}
            >
              {y}
            </Link>
          ))}
        </div>

        <Footer />
      </section>
    </>
  );
};

export default WeeksInYear;
