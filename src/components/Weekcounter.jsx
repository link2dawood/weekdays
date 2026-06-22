import React, { useEffect, useState } from "react";

// ISO 8601 week number
function isoWeek(date) {
  var t = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  var day = (t.getDay() + 6) % 7; // Mon=0 .. Sun=6
  t.setDate(t.getDate() - day + 3); // Thursday of this week
  var firstThu = t.valueOf();
  t.setMonth(0, 1);
  if (t.getDay() !== 4) {
    t.setMonth(0, 1 + ((4 - t.getDay() + 7) % 7));
  }
  // console.log(1 + Math.round((firstThu - t.valueOf()) / 604800000));
  return 1 + Math.round((firstThu - t.valueOf()) / 604800000);
}
// ISO week-numbering year (can differ from calendar year at boundaries)
function isoYear(date) {
  var t = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  var day = (t.getDay() + 6) % 7;
  t.setDate(t.getDate() - day + 3); // Thursday decides the year
  return t.getFullYear();
}
function weeksInIsoYear(y) {
  return isoWeek(new Date(y, 11, 28)); // Dec 28 is always in the last week
}
// Monday of a given ISO week/year
function mondayOf(week, year) {
  var simple = new Date(year, 0, 1 + (week - 1) * 7);
  var dow = (simple.getDay() + 6) % 7;
  simple.setDate(simple.getDate() - dow);
  // adjust so that this week actually contains its Thursday in target year
  if (isoWeek(simple) !== week || isoYear(simple) !== year) {
    // fallback: walk from Jan 4
    var jan4 = new Date(year, 0, 4);
    var j = (jan4.getDay() + 6) % 7;
    var firstMon = new Date(year, 0, 4 - j);
    simple = new Date(firstMon);
    simple.setDate(firstMon.getDate() + (week - 1) * 7);
  }
  return simple;
}
function formatShort(date) {
  // console.log(date.getDate() + "." + (date.getMonth() + 1) + ".");
  return date.getDate() + "." + (date.getMonth() + 1) + ".";
}
function formatLong(date) {
  return (
    date.getDate() +
    ". " +
    date.toLocaleString("default", { month: "long" }) +
    ", " +
    date.getFullYear()
  );
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

function getWeekdayName(date) {
  return WEEKDAYS[date.getDay()];
}
function getDate(date) {
  return formatLong(date);
}

const Weekcounter = () => {
  const [dateInfo, setDateInfo] = useState({
    weekNow: 0,
    yearNow: 0,
    totalWeeks: 0,
    formattedDate: "",
    dateRange: "",
  });
  const [pct, setPct] = useState(0);
  const [comb, setComb] = useState(0);
  // Array state to hold values for our dynamic list elements
  const [weeksArray, setWeeksArray] = useState([]);

  useEffect(() => {
    const now = new Date();
    var wkNow = isoWeek(now);
    var yrNow = isoYear(now);
    var totalWeeks = weeksInIsoYear(yrNow);

    const monday = mondayOf(wkNow, yrNow);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    // Compute the full custom text output string
    const dateString = getWeekdayName(now) + " " + getDate(now);

    //Generate dynamic custom Range string
    const options = { month: "long", day: "numeric" };
    const startStr = monday.toLocaleDateString("en-US", options);
    const endStr = sunday.toLocaleDateString("en-US", options);
    const dynamicRangeText = `${startStr} – ${endStr}, ${yrNow}`;

    // Calculate percentage of year passed
    const computedPct = Math.round((wkNow / totalWeeks) * 100);
    setPct(computedPct);
    setDateInfo({
      weekNow: wkNow,
      yearNow: yrNow,
      totalWeeks: totalWeeks,
      formattedDate: dateString,
      dateRange: dynamicRangeText,
    });
    // Generate the array for rendering weeks
    const tempWeeks = [];
    for (let w = 1; w <= totalWeeks; w++) {
      let statusClass = "";
      if (w < wkNow) statusClass = "past";
      else if (w === wkNow) statusClass = "now";
      tempWeeks.push({
        weekNum: w,
        className: statusClass,
      });
    }
    setWeeksArray(tempWeeks);
  }, []);

  return (
    <div>
      <div className="wrap">
        <div>
          <div className="eyebrow">Week number tool</div>
        </div>
        <div className="hero">
          <h1>What week is it now?</h1>
          <div className="hero-card">
            <div>
              <div className="now-label">Right now is</div>
              <div className="week-big">
                <span className="vk">Week</span>
                <span id="weekNow">{dateInfo.weekNow}</span>
              </div>
              <div className="meta">
                <div className="date" id="dateNow">
                  {dateInfo.formattedDate}
                </div>
                <div className="range" id="rangeNow">
                  {dateInfo.dateRange}
                </div>
              </div>
            </div>
            <div className="progress-block">
              <div className="progress-head">
                <span>
                  Year <b id="yearNow">{dateInfo.yearNow}</b>
                </span>
                <span>
                  <b id="weekOf">
                    Week {dateInfo.weekNow} / {dateInfo.totalWeeks}
                  </b>
                </span>
              </div>
              <div className="comb" id="comb" aria-hidden="true">
                {weeksArray.map((item) => (
                  <i key={item.weekNum} className={item.className}></i>
                ))}
              </div>
              <div className="comb" id="comb" aria-hidden="true"></div>
              <div className="comb-foot">
                <span id="pct">{pct}% year-to-date</span>
                <span>52/53 weeks</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Weekcounter;
