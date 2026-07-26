// Swedish public holidays ("röda dagar") for a calendar year. Reuses the tested
// Easter and Saturday-window math from holidays.js — Sweden's Midsommardagen is
// the same Saturday (20–26 Jun) as Finland's juhannuspäivä, and Alla helgons
// dag the same Saturday (31 Oct–6 Nov) as pyhäinpäivä.
//
// `official` marks a statutory röd dag (day off). Julafton, Nyårsafton,
// Midsommarafton and Trettondagsafton are de-facto free for most but are not
// official röda dagar.
import { easterSunday, juhannuspaiva, pyhainpaiva } from "./holidays";
import { isoWeek, isoYear, mondayOf } from "../components/dateUtils";

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function holidaysInYearSE(year) {
  const easter = easterSunday(year);
  const midsommar = juhannuspaiva(year); // Saturday 20–26 June
  return [
    { name: "Nyårsdagen", date: new Date(year, 0, 1), official: true },
    { name: "Trettondedag jul", date: new Date(year, 0, 6), official: true },
    { name: "Långfredagen", date: addDays(easter, -2), official: true },
    { name: "Påskdagen", date: easter, official: true },
    { name: "Annandag påsk", date: addDays(easter, 1), official: true },
    { name: "Första maj", date: new Date(year, 4, 1), official: true },
    { name: "Kristi himmelsfärds dag", date: addDays(easter, 39), official: true },
    { name: "Pingstdagen", date: addDays(easter, 49), official: true },
    { name: "Sveriges nationaldag", date: new Date(year, 5, 6), official: true },
    { name: "Midsommarafton", date: addDays(midsommar, -1), official: false },
    { name: "Midsommardagen", date: midsommar, official: true },
    { name: "Alla helgons dag", date: pyhainpaiva(year), official: true },
    { name: "Julafton", date: new Date(year, 11, 24), official: false },
    { name: "Juldagen", date: new Date(year, 11, 25), official: true },
    { name: "Annandag jul", date: new Date(year, 11, 26), official: true },
    { name: "Nyårsafton", date: new Date(year, 11, 31), official: false },
  ].sort((a, b) => a.date - b.date);
}

// Swedish holidays falling within ISO week `week` of ISO year `isoYear`.
export function holidaysInWeekSE(isoYearNum, week) {
  const monday = mondayOf(week, isoYearNum);
  const sunday = addDays(monday, 6);
  const years = new Set([monday.getFullYear(), sunday.getFullYear()]);
  const out = [];
  years.forEach((y) => {
    holidaysInYearSE(y).forEach((h) => {
      if (h.date >= monday && h.date <= sunday) out.push(h);
    });
  });
  return out.sort((a, b) => a.date - b.date);
}

// Convenience: ISO week + year for a holiday's date (a Jan holiday can belong to
// the previous ISO year's last week).
export function weekOf(date) {
  return { week: isoWeek(date), year: isoYear(date) };
}
