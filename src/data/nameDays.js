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
import nimipaivat from "./nimipaivat.json" with { type: "json" };
import calendarMeta from "./nimipaivat.meta.json" with { type: "json" };
import { mondayOf } from "../components/dateUtils.js";

export const CALENDAR_META = { ...calendarMeta, isPlaceholder: false };

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

// Holiday labels can appear in the calendar source but must not generate
// personal-name landing pages. Keep this separate from realNames(): existing
// week views may still show a calendar label such as Uudenvuodenpäivä.
const NON_PERSONAL_NAMES = new Set(["Uudenvuodenpäivä"]);

export function nameDaySlug(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function personalNameDayEntries() {
  return Object.entries(nimipaivat)
    .map(([dateKey, names]) => ({
      dateKey,
      names: realNames(names).filter((name) => !NON_PERSONAL_NAMES.has(name)),
    }))
    .filter((entry) => entry.names.length > 0)
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey));
}

export function nameDayDateKeys() {
  return personalNameDayEntries().map((entry) => entry.dateKey);
}

export function nameDayNames() {
  const records = new Map();
  for (const entry of personalNameDayEntries()) {
    for (const name of entry.names) {
      const slug = nameDaySlug(name);
      const existing = records.get(slug);
      if (existing && existing.name !== name) {
        throw new Error(`Nimipäivän osoitetörmäys: ${existing.name} ja ${name}`);
      }
      if (existing) existing.dateKeys.push(entry.dateKey);
      else records.set(slug, { name, slug, dateKeys: [entry.dateKey] });
    }
  }
  return [...records.values()].sort((a, b) => a.name.localeCompare(b.name, "fi"));
}

export function nameDayForSlug(slug) {
  return nameDayNames().find((entry) => entry.slug === slug) ?? null;
}

export function hasNameDayPage(name) {
  return nameDayForSlug(nameDaySlug(name))?.name === name;
}

export function nameDaysForDateKey(dateKey) {
  return (
    personalNameDayEntries().find((entry) => entry.dateKey === dateKey)?.names ?? []
  );
}

export function dateFromNameDayKey(dateKey, year) {
  const match = dateKey.match(/^(\d{2})-(\d{2})$/);
  if (!match) return null;
  const month = Number(match[1]);
  const day = Number(match[2]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return date;
}
