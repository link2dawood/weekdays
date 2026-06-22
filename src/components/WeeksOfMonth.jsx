// import React, { useState, useEffect } from "react";

// function isoWeek(date) {
//   var t = new Date(date.getFullYear(), date.getMonth(), date.getDate());
//   var day = (t.getDay() + 6) % 7;
//   t.setDate(t.getDate() - day + 3);
//   var firstThu = t.valueOf();
//   t.setMonth(0, 1);
//   if (t.getDay() !== 4) {
//     t.setMonth(0, 1 + ((4 - t.getDay() + 7) % 7));
//   }
//   return 1 + Math.round((firstThu - t.valueOf()) / 604800000);
// }

// function isoYear(date) {
//   var t = new Date(date.getFullYear(), date.getMonth(), date.getDate());
//   var day = (t.getDay() + 6) % 7;
//   t.setDate(t.getDate() - day + 3);
//   return t.getFullYear();
// }

// function mondayOf(week, year) {
//   var simple = new Date(year, 0, 1 + (week - 1) * 7);
//   var dow = (simple.getDay() + 6) % 7;
//   simple.setDate(simple.getDate() - dow);
//   return simple;
// }

// function formatShort(date) {
//   return date.getDate() + "." + (date.getMonth() + 1) + ".";
// }

// const WeeksOfMonth = () => {
//   const [monthTitle, setMonthTitle] = useState("");

//   useEffect(() => {
//     const now = new Date();
//     console.log(now);
//     const currentWkNow = isoWeek(now);
//     const currentYrNow = isoYear(now);

//     //  Generate English Month Title Layout (e.g., "Weeks of June 2026")
//     const monthName = now.toLocaleString("en-US", { month: "long" });
//     setMonthTitle(`Weeks of ${monthName} ${now.getFullYear()}`);
//   });
//   return (
//     <div>
//       <section>
//         <div className="sec-head" id="monthEyebrow">
//           Weeks of the month
//         </div>
//         <h2 id="monthTitle">{monthTitle}</h2>
//         <div className="month-list" id="monthList"></div>
//       </section>
//     </div>
//   );
// };

// export default WeeksOfMonth;
import React, { useState, useEffect } from "react";

// --- CORE UTILITIES ---
function isoWeek(date) {
  var t = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  var day = (t.getDay() + 6) % 7;
  t.setDate(t.getDate() - day + 3);
  var firstThu = t.valueOf();
  t.setMonth(0, 1);
  if (t.getDay() !== 4) {
    t.setMonth(0, 1 + ((4 - t.getDay() + 7) % 7));
  }
  return 1 + Math.round((firstThu - t.valueOf()) / 604800000);
}

// ISO week-numbering year
function isoYear(date) {
  var t = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  var day = (t.getDay() + 6) % 7;
  t.setDate(t.getDate() - day + 3); // Thursday decides the year
  return t.getFullYear();
}

// Monday of a given ISO week/year
function mondayOf(week, year) {
  var simple = new Date(year, 0, 1 + (week - 1) * 7);
  var dow = (simple.getDay() + 6) % 7;
  simple.setDate(simple.getDate() - dow);
  return simple;
}

function formatShort(date) {
  return date.getDate() + "." + (date.getMonth() + 1) + ".";
}

const WeeksOfMonth = () => {
  const [monthTitle, setMonthTitle] = useState("");
  const [weeksGrid, setWeeksGrid] = useState([]); // Array state to hold month's weeks data

  useEffect(() => {
    const now = new Date();
    const currentWkNow = isoWeek(now);
    const currentYrNow = isoYear(now);

    // Generate English Month Title Layout (e.g., "Weeks of June 2026")
    const monthName = now.toLocaleString("en-US", { month: "long" });
    setMonthTitle(`Weeks of ${monthName} ${now.getFullYear()}`);

    // Get the last day of the current month (e.g., 28, 30, 31)
    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
    ).getDate();
    console.log(daysInMonth);

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
  return (
    <div>
      <section>
        <div className="sec-head" id="monthEyebrow">
          Weeks of the month
        </div>
        <h2 id="monthTitle">{monthTitle}</h2>

        <div className="month-list" id="monthList">
          {/* Dynamic map loop rendering elements smoothly safely using unique tracking keys */}
          {weeksGrid.map((wk) => (
            <div key={wk.id} className={`wk ${wk.isCurrent ? "current" : ""}`}>
              <div className="n">Week {wk.weekNum}</div>
              <div className="r">{wk.rangeText}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default WeeksOfMonth;
