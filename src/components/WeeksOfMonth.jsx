import React, { useState, useEffect } from "react";
import { isoWeek, isoYear, mondayOf } from "./dateUtils";
import { Link, useParams } from "react-router-dom";

function formatShort(date) {
  return date.getDate() + "." + (date.getMonth() + 1) + ".";
}

const WeeksOfMonth = () => {
  const [monthTitle, setMonthTitle] = useState("");
  const [weeksGrid, setWeeksGrid] = useState([]); //  state to hold month's weeks data

  useEffect(() => {
    const now = new Date();
    const currentWkNow = isoWeek(now);
    const currentYrNow = isoYear(now);

    // Generate English Month Title Layout (e.g., "Weeks of June 2026")
    const monthName = now.toLocaleString("fi-FI", { month: "long" });
    setMonthTitle(`Kuukauden viikot – ${monthName} ${now.getFullYear()}`);

    // Get the last day of the current month (e.g., 28, 30, 31)
    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
    ).getDate();

    const computedWeeks = [];
    const seen = {};

    // Loop through every day of the month to build the week layout blocks
    for (let day = 1; day <= daysInMonth; day++) {
      const d2 = new Date(now.getFullYear(), now.getMonth(), day);

      const wk2 = isoWeek(d2);
      const yr2 = isoYear(d2);
      const key = `${yr2}-${wk2}`;

      // Skip processing if this week block number has already been stored
      if (seen[key]) continue;
      seen[key] = true;

      // Extract raw Monday/Sunday calendar date ranges
      const m2 = mondayOf(wk2, yr2);
      const s2 = new Date(m2);
      s2.setDate(m2.getDate() + 6);

      // Flag whether this block matches our current active calendar track right now
      const isCurrentWeek = wk2 === currentWkNow && yr2 === currentYrNow;

      computedWeeks.push({
        id: key,
        weekNum: wk2,
        rangeText: `${formatShort(m2)}–${formatShort(s2)}`,
        isCurrent: isCurrentWeek,
      });
    }

    setWeeksGrid(computedWeeks);
  }, []);
  const NOW = new Date();
  const W_NOW = isoWeek(NOW);
  const Y_NOW = isoYear(NOW);
  return (
    <>
      <section>
        <h2 id="monthTitle">{monthTitle}</h2>

        <div className="month-list" id="monthList">
          {/* Dynamic map loop rendering elements smoothly safely using unique
          tracking keys  */}
          {weeksGrid.map((wk) => (
            <Link
              to={`/week/${wk.weekNum}/${Y_NOW}`}
              style={{ textDecoration: "none", color: "inherit" }}
              onClick={() => window.scrollTo(0, 0)}
            >
              <div
                key={wk.id}
                className={`wk ${wk.isCurrent ? "current" : ""}`}
              >
                <div className="n">Viikko {wk.weekNum}</div>
                <div className="r">{wk.rangeText}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
};

export default WeeksOfMonth;
