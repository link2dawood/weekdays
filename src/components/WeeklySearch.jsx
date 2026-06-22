import React, { useEffect, useState } from "react";

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

function isoYear(date) {
  var t = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  var day = (t.getDay() + 6) % 7;
  t.setDate(t.getDate() - day + 3);
  return t.getFullYear();
}

function mondayOf(week, year) {
  var simple = new Date(year, 0, 1 + (week - 1) * 7);
  var dow = (simple.getDay() + 6) % 7;
  simple.setDate(simple.getDate() - dow);
  if (isoWeek(simple) !== week || isoYear(simple) !== year) {
    var jan4 = new Date(year, 0, 4);
    var j = (jan4.getDay() + 6) % 7;
    var firstMon = new Date(year, 0, 4 - j);
    simple = new Date(firstMon);
    simple.setDate(firstMon.getDate() + (week - 1) * 7);
  }
  return simple;
}

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
      startRange: m.toLocaleDateString("en-US", shortDateOptions) + ".",
      endRange: s.toLocaleDateString("en-US", fullDateOptions),
    });
  }, [selectedDateStr]);

  return (
    <div>
      <section>
        <div className="sec-head">Weekly search</div>
        <h2>Check the week number of any day</h2>
        <div className="lookup">
          <label htmlFor="dpick">Choose a day</label>
          <input
            type="date"
            id="dpick"
            value={selectedDateStr}
            onChange={(e) => setSelectedDateStr(e.target.value)}
          />
          {result && (
            <div className="result" id="lookupResult">
              <span>
                The Date <strong>{result.writtenDay}</strong> is{" "}
                <span className="num">week {result.weekNum}</span>.
              </span>
              <div className="sub">
                {result.weekday} · week {result.weekNum}/ {result.isoYearNum} ·{" "}
                {result.startRange}–{result.endRange}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default WeeklySearch;
