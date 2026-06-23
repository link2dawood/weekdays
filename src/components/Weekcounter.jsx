import React, { useEffect, useState } from "react";
import {
  isoWeek,
  isoYear,
  weeksInIsoYear,
  mondayOf,
  formatLong,
  formatShort,
  WEEKDAYS,
  getWeekdayName,
  getDate,
} from "./dateUtils";

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
    <>
      <div className="wrap">
        <div>
          <div className="eyebrow">Week number tool</div>
        </div>
        <div className="hero">
          <h1>What week is it now?</h1>
          <div className="hero-card">
            <div>
              <div className="now-label">Right now it is</div>
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
    </>
  );
};

export default Weekcounter;
