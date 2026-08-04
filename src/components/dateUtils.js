export function clampYear(y, min = 2000, max = 2100) {
  return Math.min(max, Math.max(min, y));
}
export function isoYear(date) {
  var t = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  var day = (t.getDay() + 6) % 7;
  t.setDate(t.getDate() - day + 3); // Thursday decides the year
  return t.getFullYear();
}

export function isoWeek(d) {
  var t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  var day = (t.getDay() + 6) % 7;
  t.setDate(t.getDate() - day + 3);
  var firstThu = t.valueOf();
  t.setMonth(0, 1);
  if (t.getDay() !== 4) {
    t.setMonth(0, 1 + ((4 - t.getDay() + 7) % 7));
  }
  return 1 + Math.round((firstThu - t.valueOf()) / 604800000);
}

export function weeksInIsoYear(y) {
  return isoWeek(new Date(y, 11, 28));
}

export function isLeapYear(y) {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}
export function daysInYear(y) {
  return isLeapYear(y) ? 366 : 365;
}
export function dayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 1);
  return Math.round((date - start) / 86400000) + 1;
}
export function daysRemainingInYear(date) {
  return daysInYear(date.getFullYear()) - dayOfYear(date);
}
export function quarterOf(date) {
  return Math.floor(date.getMonth() / 3) + 1;
}

export function mondayOf(week, year) {
  var jan4 = new Date(year, 0, 4);
  var j = (jan4.getDay() + 6) % 7;
  var firstMon = new Date(year, 0, 4 - j);
  var m = new Date(firstMon);
  m.setDate(firstMon.getDate() + (week - 1) * 7);
  return m;
}

// Simple short date formatter helper
export function dShort(d) {
  const months = [
    "tammi",
    "helmi",
    "maalis",
    "huhti",
    "touko",
    "kesä",
    "heinä",
    "elo",
    "syys",
    "loka",
    "marras",
    "joulu",
  ];
  return d.getDate() + " " + months[d.getMonth()];
}
export var WD = [
  "Sunnuntai",
  "Maanantai",
  "Tiistai",
  "Keskiviikko",
  "Torstai",
  "Perjantai",
  "Lauantai",
];
export var M_FULL = [
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
export var M_SHORT = [
  "tammi",
  "helmi",
  "maalis",
  "huhti",
  "touko",
  "kesä",
  "heinä",
  "elo",
  "syys",
  "loka",
  "marras",
  "joulu",
];

// Prerendered year horizon, shared by every year-series page and its prev/next
// navigation. Mirrors prerender.js exactly: floor 2020, rolling ceiling =
// build year + 9 (seo.js sitemapEntries uses `year + FUTURE_HORIZON` and
// prerender passes new Date().getFullYear()). Guarding nav to this range keeps
// links off pages that were never prerendered — they'd 404 under the SPA
// fallback. Evaluated once at module load; the daily rebuild keeps it current.
export const PRERENDER_MIN_YEAR = 2020;
export const PRERENDER_MAX_YEAR = new Date().getFullYear() + 9;
// Kept as thin aliases to the canonical Finnish formatter (fmtFullFi) so every
// existing caller renders correct Finnish ("20. heinäkuuta 2026") without each
// call site having to be found and changed.
export function dWritten(d) {
  return fmtFullFi(d);
}
export function dFull(d) {
  return fmtFullFi(d);
}

export function formatShort(date) {
  // console.log(date.getDate() + "." + (date.getMonth() + 1) + ".");
  return date.getDate() + "." + (date.getMonth() + 1) + ".";
}
export function formatLong(date) {
  return (
    date.getDate() +
    ". " +
    date.toLocaleString("fi-FI", { month: "long" }) +
    "ta " +
    date.getFullYear()
  );
}
export const WEEKDAYS = [
  "Sunnuntai",
  "Maanantai",
  "Tiistai",
  "Keskiviikko",
  "Torstai",
  "Perjantai",
  "Lauantai",
];

export function getWeekdayName(date) {
  return WEEKDAYS[date.getDay()];
}
export function getDate(date) {
  return formatLong(date);
}

// ─── Centralized Finnish date formatting (single source of truth) ──────────
// getDay() is Sunday-indexed (0 = Sunday). WD/M_FULL above are the capitalized
// nominative forms (headings/labels only); the forms below carry the cases
// Finnish prose needs.

// Weekday essive ("on maanantaina"), lowercase — for prose.
export const WD_ESSIVE = [
  "sunnuntaina",
  "maanantaina",
  "tiistaina",
  "keskiviikkona",
  "torstaina",
  "perjantaina",
  "lauantaina",
];
// Month genitive ("kesäkuun viikot"), lowercase.
export const M_GENITIVE = [
  "tammikuun",
  "helmikuun",
  "maaliskuun",
  "huhtikuun",
  "toukokuun",
  "kesäkuun",
  "heinäkuun",
  "elokuun",
  "syyskuun",
  "lokakuun",
  "marraskuun",
  "joulukuun",
];
// Month partitive ("20. heinäkuuta"), lowercase.
export const M_PARTITIVE = [
  "tammikuuta",
  "helmikuuta",
  "maaliskuuta",
  "huhtikuuta",
  "toukokuuta",
  "kesäkuuta",
  "heinäkuuta",
  "elokuuta",
  "syyskuuta",
  "lokakuuta",
  "marraskuuta",
  "joulukuuta",
];

// "20. heinäkuuta 2026"
export function fmtFullFi(date) {
  return `${date.getDate()}. ${M_PARTITIVE[date.getMonth()]} ${date.getFullYear()}`;
}
// "maanantaina 20. heinäkuuta 2026" (weekday lowercase essive)
export function fmtDayWithWeekdayFi(date) {
  return `${WD_ESSIVE[date.getDay()]} ${fmtFullFi(date)}`;
}
// "Maanantai 20. heinäkuuta 2026" (weekday capitalized nominative)
export function fmtDayHeadingFi(date) {
  return `${WD[date.getDay()]} ${fmtFullFi(date)}`;
}
// "20.7.2026"
export function fmtShortFi(date) {
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
}
// Compact range for metadata: "20.–26.7.2026", "29.6.–5.7.2026", or
// "29.12.2025–4.1.2026" when the range crosses a calendar-year boundary.
export function fmtRangeCompactFi(mo, su) {
  const sameYear = mo.getFullYear() === su.getFullYear();
  if (sameYear && mo.getMonth() === su.getMonth()) {
    return `${mo.getDate()}.–${su.getDate()}.${su.getMonth() + 1}.${su.getFullYear()}`;
  }
  if (sameYear) {
    return `${mo.getDate()}.${mo.getMonth() + 1}.–${su.getDate()}.${su.getMonth() + 1}.${su.getFullYear()}`;
  }
  return `${fmtShortFi(mo)}–${fmtShortFi(su)}`;
}
// Range: "20.–26. heinäkuuta 2026" (same month); "29.6.–5.7.2026" (same year,
// different months); "29.12.2026–4.1.2027" (spanning a year boundary).
export function fmtRangeFi(mo, su) {
  const sameYear = mo.getFullYear() === su.getFullYear();
  if (sameYear && mo.getMonth() === su.getMonth()) {
    return `${mo.getDate()}.–${su.getDate()}. ${M_PARTITIVE[su.getMonth()]} ${su.getFullYear()}`;
  }
  if (sameYear) {
    return `${mo.getDate()}.${mo.getMonth() + 1}.–${su.getDate()}.${su.getMonth() + 1}.${su.getFullYear()}`;
  }
  return `${fmtShortFi(mo)}–${fmtShortFi(su)}`;
}
