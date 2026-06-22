import React from "react";
import { Link } from "react-router-dom";
import { isoWeek, isoYear } from "../components/dateUtils";
const WhatWeek = () => {
  const NOW = new Date();
  const W_NOW = isoWeek(NOW);
  const Y_NOW = isoYear(NOW);
  return (
    <section className="app">
      <div class="breadcrumb">
        <Link to="/">Home</Link> / What is a week number
      </div>
      <h1>What is a week number?</h1>
      <div className="prose">
        <p>
          A week number tells you which week of the year is currently running.
          Weeks are numbered using the <strong>ISO 8601 standard</strong>, which
          is used widely across Europe and in business worldwide.
        </p>

        <p>The rules are simple:</p>

        <ul>
          <li>
            A week always starts on <strong>Monday</strong> and ends on Sunday.
          </li>

          <li>
            The first week of the year is the one containing the year’s first{" "}
            <strong>Thursday</strong>. In practice this is always the week that
            includes <strong>4 January</strong>.
          </li>

          <li>
            Because of this, the last week of a year can include early January
            days, and the first week can include late December days.
          </li>
        </ul>

        <p>
          For example, 29 December 2025 already belongs to week 1 of 2026,
          because that week’s Thursday falls in January.
        </p>
      </div>
      <p>
        <Link className="btn" to={`/year/${Y_NOW}`}>
          See the weeks of {Y_NOW}
        </Link>
      </p>
    </section>
  );
};

export default WhatWeek;
