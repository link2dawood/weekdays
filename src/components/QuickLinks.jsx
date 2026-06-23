import React from "react";
import { Link } from "react-router-dom";
import { isoWeek, isoYear } from "./dateUtils";
const QuickLinks = () => {
  const NOW = new Date();
  const W_NOW = isoWeek(NOW);
  const Y_NOW = isoYear(NOW);
  return (
    <>
      <section>
        <h2>Quick links</h2>
        <div className="quicklinks">
          <Link
            className="ql"
            to={`/print/${Y_NOW}`}
            onClick={() => window.scrollTo(0, 0)}
          >
            <b>Printable week calendar</b>
            <span>Print the whole year's weeks</span>
          </Link>
          <Link className="ql" to="/what-is-a-week-number">
            <b>What is a week number?</b>
            <span>How weeks are calculated</span>
          </Link>
          <Link className="ql" to="/weeks-in-a-year">
            <b>How many weeks in a year?</b>
            <span>52 or 53 weeks</span>
          </Link>
          <Link className="ql" to="/faq">
            <b>FAQ</b>
            <span>Answers about weeks</span>
          </Link>
        </div>
      </section>
    </>
  );
};

export default QuickLinks;
