import React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  isoWeek,
  isoYear,
  fmtFullFi,
  M_GENITIVE,
  mondayOf,
  dFull,
  weeksInIsoYear,
  dayOfYear,
  daysRemainingInYear,
  quarterOf,
} from "../components/dateUtils";
import SEO from "../components/SEO";
import { canonicalFor, weekMeta } from "../data/seo";
import { holidaysInWeek } from "../data/holidays";
import { nameDaysForWeek } from "../data/nameDays";
import { schoolHolidaysInWeek } from "../data/schoolHolidays";
import { sunTimesForWeek, formatHelsinkiTime, HELSINKI } from "../data/sunTimes";

// Prerendered range for all week/month/hub pages (mirrors seo.js sitemapEntries:
// floor 2020, rolling ceiling = build year + 9). Used to guard the "related"
// links so a boundary week that spills into an out-of-range year is never
// linked to a page that would 404.
const YEAR_MIN = 2020;
const YEAR_MAX = new Date().getFullYear() + 9;

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const SCHOOL_PERIOD_LABELS = {
  syysloma: "Syysloma",
  joululoma: "Joululoma",
  hiihtoloma: "Hiihtoloma",
  kesaloma: "Kesäloma",
};

function schoolPeriodLabel(p) {
  const region = p.type === "hiihtoloma" ? ` (${p.regionName})` : "";
  const estimate = p.estimated ? " (arvioitu ajankohta)" : "";
  return `${SCHOOL_PERIOD_LABELS[p.type]}${region}${estimate}`;
}

// Props come from the /:slug dispatcher (parsed "/viikko-30-2026"); the
// useParams fallback keeps the component usable under a plain param route too.
const WeekDays = ({ week: pWeek, year: pYear } = {}) => {
  const params = useParams();
  const week = pWeek ?? params.week;
  const year = pYear ?? params.year;
  const w = Number(week);
  const y = Number(year);
  const total = weeksInIsoYear(y);

  // Week 53 only exists in a 53-week year — redirect anything out of range
  // to the nearest real week rather than rendering nonsense dates.
  if (w < 1 || w > total) {
    const clamped = Math.min(Math.max(w, 1), total);
    return <Navigate to={`/viikko-${clamped}-${y}`} replace />;
  }

  const NOW = new Date();
  const W_NOW = isoWeek(NOW);
  const Y_NOW = isoYear(NOW);
  const mo = mondayOf(w, y);
  const su = new Date(mo);
  su.setDate(mo.getDate() + 6);
  var WD = [
    "Sunnuntai",
    "Maanantai",
    "Tiistai",
    "Keskiviikko",
    "Torstai",
    "Perjantai",
    "Lauantai",
  ];

  let monthLinks;

  if (mo.getMonth() === su.getMonth()) {
    monthLinks = (
      <Link to={`/kuukausi-${mo.getMonth() + 1}-${mo.getFullYear()}`}>
        {M_GENITIVE[mo.getMonth()]} {mo.getFullYear()}
      </Link>
    );
  } else {
    monthLinks = (
      <>
        <Link to={`/kuukausi-${mo.getMonth() + 1}-${mo.getFullYear()}`}>
          {M_GENITIVE[mo.getMonth()]}
        </Link>{" "}
        ja{" "}
        <Link to={`/kuukausi-${su.getMonth() + 1}-${su.getFullYear()}`}>
          {M_GENITIVE[su.getMonth()]}
        </Link>
      </>
    );
  }

  var prevW = w - 1,
    prevY = y;
  if (prevW < 1) {
    prevY = y - 1;
    prevW = weeksInIsoYear(prevY);
  }
  var nextW = w + 1,
    nextY = y;
  if (nextW > total) {
    nextY = y + 1;
    nextW = 1;
  }

  // Same week number, previous/next year (D-06) — only linked when that
  // year actually has that many weeks. Week 53 doesn't exist in every year,
  // so blindly linking /week/53/(y-1) or /week/53/(y+1) could point at a
  // year with only 52 weeks, forcing a redirect on click — exactly what D-06
  // rules out ("zero internal links to... redirect chains").
  const sameWeekPrevYearValid = w <= weeksInIsoYear(y - 1);
  const sameWeekNextYearValid = w <= weeksInIsoYear(y + 1);

  // D-01–D-04 data for this week. nameDaysForWeek/sunTimesForWeek return
  // exactly 7 entries Monday–Sunday, aligned index-for-index with the `days`
  // loop below (both built from the same mondayOf(w, y) start). Holidays and
  // school periods are sparse (not every day has one), so those are matched
  // to each day explicitly instead of by index.
  const weekNameDays = nameDaysForWeek(y, w);
  const weekHolidays = holidaysInWeek(y, w);
  const weekSchoolPeriods = schoolHolidaysInWeek(y, w);
  const weekSunTimes = sunTimesForWeek(y, w, HELSINKI);

  const days = [...Array(7)].map((_, i) => {
    const d = new Date(mo);
    d.setDate(mo.getDate() + i);
    return {
      date: d,
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
      names: weekNameDays[i]?.names ?? [],
      holidays: weekHolidays.filter((h) => sameDay(h.date, d)),
      schoolPeriods: weekSchoolPeriods.filter((p) => d >= p.startDate && d <= p.endDate),
      sun: weekSunTimes[i],
      dayOfYear: dayOfYear(d),
      daysRemaining: daysRemainingInYear(d),
      quarter: quarterOf(d),
    };
  });

  const officialHolidays = weekHolidays.filter((h) => h.official);
  const observedOnlyHolidays = weekHolidays.filter((h) => !h.official);

  // Sibling weeks of this week's (Monday's) month — a topical mesh so each of
  // the ~835 week pages links to its month-neighbours, not just prev/next.
  // Each week keeps its OWN ISO year (a boundary week can belong to an adjacent
  // year, e.g. early-January days in week 52/53 of the previous year), matching
  // WeeksOfMonth's approach. Out-of-range years and this page itself are skipped.
  const anchorMonth = mo.getMonth();
  const anchorYear = mo.getFullYear();
  const monthWeeks = [];
  const seenWeeks = {};
  const daysInAnchorMonth = new Date(anchorYear, anchorMonth + 1, 0).getDate();
  for (let dd = 1; dd <= daysInAnchorMonth; dd++) {
    const d2 = new Date(anchorYear, anchorMonth, dd);
    const wk2 = isoWeek(d2);
    const yr2 = isoYear(d2);
    const key = `${yr2}-${wk2}`;
    if (seenWeeks[key]) continue;
    seenWeeks[key] = true;
    if (yr2 < YEAR_MIN || yr2 > YEAR_MAX) continue; // never link a 404
    if (wk2 === w && yr2 === y) continue; // this page itself
    monthWeeks.push({ week: wk2, year: yr2 });
  }

  return (
    <section className="app">
      <SEO
        {...weekMeta(w, y)}
        canonical={canonicalFor(`/viikko-${week}-${year}`)}
      />
      <div className="breadcrumb">
        <Link to={"/"}>Etusivu </Link> /{" "}
        <Link to={`/vuosi-${year}`}>Viikot {year}</Link> / Viikko {week}
      </div>
      <h1>
        Viikko {week} vuonna {year}
      </h1>

      {w === 53 && (
        <div className="notice">
          <strong>Harvinainen viikko 53.</strong> Vuonna {y} on poikkeuksellisesti
          53 viikkoa — useimmissa vuosissa niitä on vain 52. Viikko 53 on vuoden{" "}
          {y} viimeinen viikko ennen seuraavan vuoden viikkoa 1.
        </div>
      )}

      <p className="lead">
        Viikko {week} alkaa <strong>maanantaina {fmtFullFi(mo)}</strong> ja
        päättyy <strong>sunnuntaina {fmtFullFi(su)}.</strong> Se kuuluu{" "}
        {monthLinks} kalenteriin.
      </p>

      {officialHolidays.length > 0 && (
        <p className="lead">
          Tällä viikolla vietetään: {officialHolidays.map((h) => h.name).join(", ")}.
        </p>
      )}
      {observedOnlyHolidays.length > 0 && (
        <p className="lead">
          {observedOnlyHolidays.map((h) => h.name).join(" ja ")}{" "}
          {observedOnlyHolidays.length === 1 ? "ei ole virallinen arkipyhä" : "eivät ole virallisia arkipyhiä"}, mutta
          {observedOnlyHolidays.length === 1 ? " sitä" : " niitä"} vietetään laajasti.
        </p>
      )}
      {weekSchoolPeriods.length > 0 && (
        <p className="lead">
          Koululoma tällä viikolla: {weekSchoolPeriods.map(schoolPeriodLabel).join(", ")}.
        </p>
      )}

      <div className="panel">
        <div className="now-label">Viikonpäivät</div>
        <div className="days">
          {days.map((day, i) => (
            <div key={i} className={`day ${day.isWeekend ? "weekend" : ""}`}>
              <div className="day-head">
                <span className="wd">{WD[day.date.getDay()]}</span>
                <span className="dt">{dFull(day.date)}</span>
              </div>
              <div className="day-extra">
                <div>
                  Vuoden {day.dayOfYear}. päivä · {day.daysRemaining} päivää vuoden
                  loppuun · {day.quarter}. neljännes
                </div>
                {day.names.length > 0 && (
                  <div>
                    {day.names.length === 1 ? "Nimipäivä" : "Nimipäivät"}:{" "}
                    {day.names.join(", ")}
                  </div>
                )}
                {day.holidays.map((h) => (
                  <div key={h.name}>
                    {h.name}
                    {!h.official && " (ei virallinen arkipyhä)"}
                  </div>
                ))}
                {day.schoolPeriods.map((p) => (
                  <div key={p.type + (p.region || "")}>{schoolPeriodLabel(p)}</div>
                ))}
                <div>
                  {day.sun.polarNight
                    ? "Aurinko ei nouse Helsingissä tänään (kaamos)."
                    : day.sun.polarDay
                      ? "Aurinko ei laske Helsingissä tänään (yötön yö)."
                      : `Aurinko Helsingissä: ${formatHelsinkiTime(day.sun.sunrise)}–${formatHelsinkiTime(day.sun.sunset)} (${Math.floor(day.sun.daylightMinutes / 60)} h ${day.sun.daylightMinutes % 60} min valoisaa${
                          day.sun.deltaMinutesFromPreviousDay !== 0
                            ? `, ${day.sun.deltaMinutesFromPreviousDay > 0 ? "+" : "−"}${Math.abs(day.sun.deltaMinutesFromPreviousDay)} min edelliseen päivään verrattuna`
                            : ""
                        })`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="note-soft">
        Ajat lasketaan <Link to="/kaupunki/helsinki">Helsingin</Link> sijainnin
        mukaan.
      </p>

      <div className="prevnext" onClick={() => window.scrollTo(0, 0)}>
        <Link to={`/viikko-${prevW}-${prevY}`}>
          <span className="lbl">Edellinen</span>Viikko {prevW}, {prevY}
        </Link>
        <Link to={`/viikko-${nextW}-${nextY}`}>
          <span className="lbl">Seuraava</span>Viikko {nextW}, {nextY}
        </Link>
      </div>

      {(sameWeekPrevYearValid || sameWeekNextYearValid) && (
        <div className="prevnext" onClick={() => window.scrollTo(0, 0)}>
          {sameWeekPrevYearValid && (
            <Link to={`/viikko-${w}-${y - 1}`}>
              <span className="lbl">Viikko {w} viime vuonna</span>Viikko {w}, {y - 1}
            </Link>
          )}
          {sameWeekNextYearValid && (
            <Link to={`/viikko-${w}-${y + 1}`}>
              <span className="lbl">Viikko {w} ensi vuonna</span>Viikko {w}, {y + 1}
            </Link>
          )}
        </div>
      )}

      <section className="related">
        <h2>Katso myös</h2>

        {monthWeeks.length > 0 && (
          <>
            <h3>
              Muut {M_GENITIVE[anchorMonth]} {anchorYear} viikot
            </h3>
            <div className="pills">
              {monthWeeks.map((mw) => (
                <Link
                  key={`${mw.year}-${mw.week}`}
                  className="pill"
                  to={`/viikko-${mw.week}-${mw.year}`}
                  onClick={() => window.scrollTo(0, 0)}
                >
                  Viikko {mw.week}
                  {mw.year !== y ? ` / ${mw.year}` : ""}
                </Link>
              ))}
            </div>
          </>
        )}

        <h3>Vuosi {y}</h3>
        <ul className="links">
          <li>
            <Link to={`/vuosi-${y}`} onClick={() => window.scrollTo(0, 0)}>
              Kaikki viikot vuonna {y}
            </Link>
          </li>
          <li>
            <Link to={`/kalenteri-${y}`} onClick={() => window.scrollTo(0, 0)}>
              Vuoden {y} kalenteri
            </Link>
          </li>
          <li>
            <Link to={`/pyhapaivat-${y}`} onClick={() => window.scrollTo(0, 0)}>
              Pyhäpäivät ja liputuspäivät {y}
            </Link>
          </li>
          <li>
            <Link to={`/tyopaivat-${y}`} onClick={() => window.scrollTo(0, 0)}>
              Työpäivät ja arkipäivät {y}
            </Link>
          </li>
          <li>
            <Link to={`/tulosta-${y}`} onClick={() => window.scrollTo(0, 0)}>
              Tulostettava viikkolista {y}
            </Link>
          </li>
        </ul>
      </section>
    </section>
  );
};

export default WeekDays;
