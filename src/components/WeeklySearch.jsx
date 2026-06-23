import React, { useEffect, useState } from "react";
import { isoWeek, isoYear, mondayOf } from "./dateUtils";
import { Link } from "react-router-dom";
// FORMATTING HELPERS
function pad(n) {
  return n < 10 ? "0" + n : "" + n;
}

function getFormattedDateInputString(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
const WeeklySearch = () => {
  const [selectedDateStr, setSelectedDateStr] = useState(() =>
    getFormattedDateInputString(new Date()),
  );
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!selectedDateStr) return;
    const parts = selectedDateStr.split("-");
    if (parts.length !== 3) {
      setResult(null);
      return;
    }
    const d = new Date(+parts[0], +parts[1] - 1, +parts[2]);

    const wk = isoWeek(d);
    const yr = isoYear(d);
    const m = mondayOf(wk, yr);
    const s = new Date(m);
    s.setDate(m.getDate() + 6);

    const fullDateOptions = { day: "numeric", month: "long", year: "numeric" };
    const shortDateOptions = { day: "numeric", month: "numeric" };

    setResult({
      writtenDay: d.toLocaleDateString("en-US", fullDateOptions),
      weekday: WEEKDAYS[d.getDay()],
      weekNum: wk,
      isoYearNum: yr,
      rangeText:
        m.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
        }) +
        "–" +
        s.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    });
  }, [selectedDateStr]);

  return (
    <>
      <section>
        {/* <div className="sec-head">Weekly search</div> */}
        <h2>Check the week number of any date</h2>
        <div className="lookup">
          <label htmlFor="dpick">Pick a Date</label>
          <input
            type="date"
            id="dpick"
            value={selectedDateStr}
            onChange={(e) => setSelectedDateStr(e.target.value)}
          />
          {result && (
            <div className="result" id="lookupResult">
              <div className="main-text">
                <strong>{result.writtenDay}</strong> is in{" "}
                <span className="num">week {result.weekNum}</span>.
              </div>

              <div className="sub">
                {result.weekday} · week {result.weekNum}/{result.isoYearNum} ·{" "}
                {result.rangeText}.{" "}
                <span>
                  <Link
                    className="open-link"
                    to={`/week/${result.weekNum}/${result.isoYearNum}`}
                  >
                    open week {result.weekNum}
                  </Link>
                </span>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default WeeklySearch;
