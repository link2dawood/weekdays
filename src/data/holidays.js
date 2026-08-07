// Finnish public holidays (Suomen arkipyhät ja pyhäpäivät), computed for any
// year — D-01.
//
// `official` distinguishes a statutory arkipyhä (a paid day off under
// Finnish law) from a day that's widely observed but has no legal holiday
// status. Jouluaatto and juhannusaatto are the two cases that trip people
// up: nearly everything closes and most people don't work, but neither is
// actually in the legal list — verified against
// https://en.wikipedia.org/wiki/Public_holidays_in_Finland and
// https://fi.wikipedia.org/wiki/Pyh%C3%A4p%C3%A4iv%C3%A4 (checked
// 2026-07-23). The 13 official ones below match that source's "13 statutory
// public holidays" count exactly.
//
// CORRECTION (2026-08-07): this comment previously claimed "Act 272/1944 +
// Act 388/1937" jointly cover all 13 official holidays. Checked directly
// against Finlex (Finland's official statute database, Ministry of Justice)
// and that's wrong — each act specifically establishes ONE named holiday:
// 272/1944 ("Laki vapunpäivän järjestämisestä työntekijäin vapaapäiväksi")
// is Vappu's own act, and 388/1937 ("Laki itsenäisyyspäivän viettämisestä
// yleisenä juhla- ja vapaapäivänä") is Itsenäisyyspäivä's own act. The
// Christian feast days (Loppiainen, pääsiäinen, Helatorstai, Helluntai,
// Juhannuspäivä, Pyhäinpäivä, Joulupäivä, Tapaninpäivä) fall under a
// different instrument (the Church Act, kirkkolaki) instead — not
// independently re-verified per act number here, so HOLIDAY_LEGAL_BASIS
// below only cites the two specific, confirmed acts and states the rest
// generically ("established by Act of Parliament") rather than inventing
// citations for them.
//
// Juhannuspäivä (Midsummer Day) and Pyhäinpäivä (All Saints' Day) are not
// fixed dates: by law, Juhannuspäivä is the Saturday between 20–26 June
// (moved there in 1955 — it used to be a fixed date), and Pyhäinpäivä is the
// Saturday between 31 Oct–6 Nov. Confirmed against two independent 2026
// sources: Juhannuspäivä 2026 = Saturday 20 June, Pyhäinpäivä 2026 =
// Saturday 31 October — both the earliest possible Saturday in their
// windows that year.

import { mondayOf } from "../components/dateUtils.js";

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

// The Saturday within [year-month-startDay, +6 days]. Uses the Date
// constructor's own day-overflow normalization, so a window can cross a
// month boundary (e.g. pyhäinpäivä's 31 Oct–6 Nov) without special-casing.
function saturdayInWindow(year, month, startDay) {
  for (let offset = 0; offset < 7; offset++) {
    const date = new Date(year, month, startDay + offset);
    if (date.getDay() === 6) return date;
  }
  throw new Error(
    `No Saturday found in the 7-day window starting ${year}-${month + 1}-${startDay} — this should be unreachable.`,
  );
}

// Anonymous Gregorian algorithm (aka Meeus/Jones/Butcher) for Easter Sunday.
export function easterSunday(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3 = March, 4 = April
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

export function juhannuspaiva(year) {
  return saturdayInWindow(year, 5, 20); // June (0-indexed) 20–26
}

export function juhannusaatto(year) {
  return addDays(juhannuspaiva(year), -1);
}

export function pyhainpaiva(year) {
  return saturdayInWindow(year, 9, 31); // October (0-indexed) 31 – November 6
}

// All holidays whose calendar date falls in the given (calendar, not ISO)
// year. Order follows the calendar year, Easter-derived ones inserted at
// their actual position.
export function holidaysInYear(year) {
  const easter = easterSunday(year);
  return [
    { name: "Uudenvuodenpäivä", date: new Date(year, 0, 1), official: true },
    { name: "Loppiainen", date: new Date(year, 0, 6), official: true },
    { name: "Pitkäperjantai", date: addDays(easter, -2), official: true },
    { name: "1. pääsiäispäivä", date: easter, official: true },
    { name: "2. pääsiäispäivä", date: addDays(easter, 1), official: true },
    { name: "Vappu", date: new Date(year, 4, 1), official: true },
    { name: "Helatorstai", date: addDays(easter, 39), official: true },
    { name: "Helluntai", date: addDays(easter, 49), official: true },
    { name: "Juhannusaatto", date: juhannusaatto(year), official: false },
    { name: "Juhannuspäivä", date: juhannuspaiva(year), official: true },
    { name: "Pyhäinpäivä", date: pyhainpaiva(year), official: true },
    { name: "Itsenäisyyspäivä", date: new Date(year, 11, 6), official: true },
    { name: "Jouluaatto", date: new Date(year, 11, 24), official: false },
    { name: "Joulupäivä", date: new Date(year, 11, 25), official: true },
    { name: "Tapaninpäivä", date: new Date(year, 11, 26), official: true },
  ].sort((x, y) => x.date - y.date);
}

// Holidays falling within ISO week `week` of ISO year `isoYear`. Checks both
// the Monday's and the Sunday's calendar year (holidays are calendar-year
// dates, but an ISO week can straddle a year boundary — e.g. ISO week 1 of
// a given year typically starts in late December of the previous year).
export function holidaysInWeek(isoYear, week) {
  const monday = mondayOf(week, isoYear);
  const sunday = addDays(monday, 6);

  const years = new Set([monday.getFullYear(), sunday.getFullYear()]);
  const candidates = [...years].flatMap((y) => holidaysInYear(y));

  return candidates
    .filter((h) => h.date >= monday && h.date <= sunday)
    .sort((x, y) => x.date - y.date);
}

// Legal basis for the two official holidays with an independently confirmed,
// specific Finlex citation (checked 2026-08-07 — see the CORRECTION note
// above). Deliberately doesn't cover the other 11 official holidays: most of
// those fall under the Church Act rather than a dedicated act of their own,
// and no citation is stated here for any holiday this wasn't independently
// verified for, rather than reusing these two acts for holidays they don't
// actually govern (the mistake the original code comment made).
export const HOLIDAY_LEGAL_BASIS = {
  "Vappu": {
    act: "272/1944",
    actName: "Laki vapunpäivän järjestämisestä työntekijäin vapaapäiväksi",
    url: "https://www.finlex.fi/en/legislation/1944/272",
  },
  "Itsenäisyyspäivä": {
    act: "388/1937",
    actName: "Laki itsenäisyyspäivän viettämisestä yleisenä juhla- ja vapaapäivänä",
    url: "https://www.finlex.fi/en/legislation/1937/388",
  },
};

// Why a holiday's date moves (or doesn't) year to year — three groups, drawn
// directly from how holidaysInYear() above actually computes each date, not
// a second, hand-maintained classification that could drift from it.
const EASTER_DERIVED = new Set([
  "Pitkäperjantai",
  "1. pääsiäispäivä",
  "2. pääsiäispäivä",
  "Helatorstai",
  "Helluntai",
]);
const SATURDAY_WINDOW = new Set(["Juhannusaatto", "Juhannuspäivä", "Pyhäinpäivä"]);

export function holidayDateRuleKey(name) {
  if (EASTER_DERIVED.has(name)) return "easter";
  if (SATURDAY_WINDOW.has(name)) return "saturday-window";
  return "fixed";
}

export function holidayDateRuleExplanation(name) {
  const key = holidayDateRuleKey(name);
  if (key === "easter") {
    return "Päivämäärä lasketaan pääsiäisestä, joten se vaihtelee vuosittain samalla tavalla kuin pääsiäinen.";
  }
  if (key === "saturday-window") {
    return "Päivämäärä on lain mukaan aina tietylle viikolle osuva lauantai, joten se vaihtelee vuosittain.";
  }
  return "Päivämäärä on kiinteä kalenteripäivä, joka pysyy samana joka vuosi.";
}
