import React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import {
  isoWeek,
  isoYear,
  dWritten,
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

const WeekDays = () => {
  const { week, year } = useParams();
  const w = Number(week);
  const y = Number(year);
  const total = weeksInIsoYear(y);

  // Week 53 only exists in a 53-week year — redirect anything out of range
  // to the nearest real week rather than rendering nonsense dates.
  if (w < 1 || w > total) {
    const clamped = Math.min(Math.max(w, 1), total);
    return <Navigate to={`/week/${clamped}/${y}`} replace />;
  }

  const NOW = new Date();
  const W_NOW = isoWeek(NOW);
  const Y_NOW = isoYear(NOW);
  const mo = mondayOf(w, y);
  const su = new Date(mo);
  su.setDate(mo.getDate() + 6);
  var M_FULL = [
    "Tammikuu",
    "Helmikuu",
    "Maaliskuu",
    "Huhtikuu",
    "Toukokuu",
    "Kesäkuu",
    "Heinäkuu",
    "Elokuu",
    "Syyskuu",
    "Lokakuu",
    "Marraskuu",
    "Joulukuu",
  ];
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
      <Link to={`/month/${mo.getMonth() + 1}/${mo.getFullYear()}`}>
        {M_FULL[mo.getMonth()]} {mo.getFullYear()} viikot
      </Link>
    );
  } else {
    monthLinks = (
      <>
        <Link to={`/month/${mo.getMonth() + 1}/${mo.getFullYear()}`}>
          {M_FULL[mo.getMonth()]}
        </Link>{" "}
        ja{" "}
        <Link to={`/month/${su.getMonth() + 1}/${su.getFullYear()}`}>
          {M_FULL[su.getMonth()]}
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

  return (
    <section className="app">
      <SEO
        {...weekMeta(w, y)}
        canonical={canonicalFor(`/week/${week}/${year}`)}
      />
      <div className="breadcrumb">
        <Link to={"/"}>Etusivu </Link> /{" "}
        <Link to={`/year/${year}`}>Viikot {year}</Link> / Viikko {week}
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
        Viikko {week} alkaa <strong>maanantaina {dWritten(mo)}</strong> ja
        päättyy <strong>sunnuntaina {dWritten(su)}.</strong> Se sijoittuu {""}
        {mo.getMonth() === su.getMonth()
          ? "kuukauteen"
          : "kuukausiin"}{" "}
        {monthLinks}.
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
              <span className="wd">{WD[day.date.getDay()]}</span>
              <span className="dt">{dFull(day.date)}</span>
              <div className="day-extra">
                <div>
                  Vuoden {day.dayOfYear}. päivä · {day.daysRemaining} päivää vuoden
                  loppuun · {day.quarter}. neljännes
                </div>
                {day.names.length > 0 && <div>Nimipäivä: {day.names.join(", ")}</div>}
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
                    ? "Aurinko ei nouse tänään (kaamos)."
                    : day.sun.polarDay
                      ? "Aurinko ei laske tänään (yötön yö)."
                      : `Aurinko: ${formatHelsinkiTime(day.sun.sunrise)}–${formatHelsinkiTime(day.sun.sunset)} (${Math.floor(day.sun.daylightMinutes / 60)}h ${day.sun.daylightMinutes % 60}min valoisaa${day.sun.deltaMinutesFromPreviousDay !== 0 ? `, ${day.sun.deltaMinutesFromPreviousDay > 0 ? "+" : ""}${day.sun.deltaMinutesFromPreviousDay} min edelliseen päivään verrattuna` : ""})`}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="prevnext" onClick={() => window.scrollTo(0, 0)}>
        <Link to={`/week/${prevW}/${prevY}`}>
          <span className="lbl">Edellinen</span>Viikko {prevW}, {prevY}
        </Link>
        <Link to={`/week/${nextW}/${nextY}`}>
          <span className="lbl">Seuraava</span>Viikko {nextW}, {nextY}
        </Link>
      </div>

      {(sameWeekPrevYearValid || sameWeekNextYearValid) && (
        <div className="prevnext" onClick={() => window.scrollTo(0, 0)}>
          {sameWeekPrevYearValid && (
            <Link to={`/week/${w}/${y - 1}`}>
              <span className="lbl">Viikko {w} viime vuonna</span>Viikko {w}, {y - 1}
            </Link>
          )}
          {sameWeekNextYearValid && (
            <Link to={`/week/${w}/${y + 1}`}>
              <span className="lbl">Viikko {w} ensi vuonna</span>Viikko {w}, {y + 1}
            </Link>
          )}
        </div>
      )}
    </section>
  );
};

export default WeekDays;
