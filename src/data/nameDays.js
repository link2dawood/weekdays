// Finnish name days (nimipäivät) — D-02.
//
// Data lives in ./nimipaivat.json, keyed by "MM-DD" (zero-padded calendar
// date). It is currently a MINIMAL SEED: the full Finnish name-day calendar is
// compiled by the University of Helsinki Almanac Office (Almanakkatoimisto),
// which holds a statutory exclusive right over its almanacs, and licensing was
// never confirmed (see HANDOFF.md, "Open questions", item 1). So rather than
// inventing 366 names, only verified entries are seeded; every other date
// resolves to [] and the row is simply not rendered. Drop the licensed
// calendar into nimipaivat.json (same MM-DD shape) to light the rest up — no
// code change needed.
//
// Legacy note: earlier this file generated synthetic "PLACEHOLDER-MM-DD"
// values, which shipped to production. Any such value (or an empty/blank one)
// is now defensively filtered out here so it can never render again.
import nimipaivat from "./nimipaivat.json";
import { mondayOf } from "../components/dateUtils";

export const CALENDAR_META = {
  language: "fi",
  source: "seed (partial)",
  edition: null,
  licensedOn: null,
  isPlaceholder: false,
};

function key(date) {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${mm}-${dd}`;
}

// Drop empty/blank values and the legacy synthetic markers (the old generator
// emitted ALLCAPS-MM-DD tokens, e.g. "PLACEHOLDER-01-15"). Matched by shape
// (uppercase run + "-" + digit) rather than the literal word, so the marker
// string never ends up in the shipped bundle. Real Finnish names never match
// (they start with one capital then lowercase; hyphenated names like
// "Anna-Liisa" have a letter, not a digit, after the hyphen).
function realNames(list) {
  return (list ?? []).filter((n) => n && !/^[A-Z]{2,}-\d/.test(n));
}

// Real name(s) for a calendar date, or [] when none are known/licensed yet.
// A 02-29 lookup only resolves when the date object is genuinely 29 February
// (i.e. a leap year), since real date arithmetic never produces one otherwise.
export function nameDaysForDate(date) {
  return realNames(nimipaivat[key(date)]);
}

// Names for each of the 7 days (Monday–Sunday) of ISO week `week` in ISO year
// `isoYear`. `names` is [] for any day without licensed data.
export function nameDaysForWeek(isoYear, week) {
  const monday = mondayOf(week, isoYear);
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    days.push({ date, names: nameDaysForDate(date) });
  }
  return days;
}

// Build-time diagnostic: the "MM-DD" keys (of all 366 possible) still without
// real name-day data. Used by prerender.js to print a warning.
export function missingNameDayDates() {
  const missing = [];
  const start = new Date(2024, 0, 1); // leap year → walks all 366 dates
  for (let i = 0; i < 366; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    if (realNames(nimipaivat[key(d)]).length === 0) missing.push(key(d));
  }
  return missing;
}
