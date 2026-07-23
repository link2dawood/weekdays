import React, { useState } from "react";
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
  "Sunnuntai",
  "Maanantai",
  "Tiistai",
  "Keskiviikko",
  "Torstai",
  "Perjantai",
  "Lauantai",
];

// Pure function of the selected date string — computed directly in the
// render body (not an effect), so the default result (today's date) is
// present in the SSR/prerendered HTML, including its link to that week.
// An effect-based version would render with no result at all until the
// client hydrates, exactly like Weekcounter's original "Viikko 0" bug.
function computeResult(selectedDateStr) {
  if (!selectedDateStr) return null;
  const parts = selectedDateStr.split("-");
  if (parts.length !== 3) return null;
  const d = new Date(+parts[0], +parts[1] - 1, +parts[2]);

  const wk = isoWeek(d);
  const yr = isoYear(d);
  const m = mondayOf(wk, yr);
  const s = new Date(m);
  s.setDate(m.getDate() + 6);

  const fullDateOptions = { day: "numeric", month: "long", year: "numeric" };

  return {
    writtenDay: d.toLocaleDateString("fi-FI", fullDateOptions),
    weekday: WEEKDAYS[d.getDay()],
    weekNum: wk,
    isoYearNum: yr,
    rangeText:
      m.toLocaleDateString("fi-FI", {
        day: "2-digit",
        month: "short",
      }) +
      "–" +
      s.toLocaleDateString("fi-FI", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
  };
}

const WeeklySearch = () => {
  const [selectedDateStr, setSelectedDateStr] = useState(() =>
    getFormattedDateInputString(new Date()),
  );
  const result = computeResult(selectedDateStr);

  return (
    <>
      <section>
        {/* <div className="sec-head">Weekly search</div> */}
        <h2 id="mh">Tarkista minkä tahansa päivän viikkonumero</h2>
        <div className="lookup">
          <label htmlFor="dpick">Valitse päivämäärä</label>
          <input
            type="date"
            id="dpick"
            value={selectedDateStr}
            onChange={(e) => setSelectedDateStr(e.target.value)}
          />
          {result && (
            <div className="result" id="lookupResult">
              <div className="main-text">
                <strong>{result.writtenDay}</strong> on{" "}
                <span className="num">viikolla {result.weekNum}</span>.
              </div>

              <div className="sub">
                {result.weekday} · viikko {result.weekNum}/{result.isoYearNum} ·{" "}
                {result.rangeText}.{" "}
                <span>
                  <Link
                    className="open-link"
                    to={`/week/${result.weekNum}/${result.isoYearNum}`}
                  >
                    avaa viikko {result.weekNum}
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
