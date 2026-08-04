import { isoWeek, isoYear, mondayOf, weeksInIsoYear } from "../components/dateUtils.js";

export const SV_WEEKDAYS = ["söndag", "måndag", "tisdag", "onsdag", "torsdag", "fredag", "lördag"];
export const SV_MONTHS = ["januari", "februari", "mars", "april", "maj", "juni", "juli", "augusti", "september", "oktober", "november", "december"];

export function formatSwedishDate(date) {
  return `${date.getDate()} ${SV_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

function formatNumericDate(date) {
  return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
}

export function swedishWeekFacts(week, year) {
  const w = Number(week);
  const y = Number(year);
  const total = weeksInIsoYear(y);
  if (!Number.isInteger(w) || !Number.isInteger(y) || w < 1 || w > total) return null;
  const monday = mondayOf(w, y);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return { date, weekday: SV_WEEKDAYS[date.getDay()] };
  });
  return { week: w, year: y, total, monday, sunday, days };
}

export function currentSwedishWeek(now = new Date()) {
  return {
    ...swedishWeekFacts(isoWeek(now), isoYear(now)),
    calendarYear: now.getFullYear(),
  };
}

export function swedishHomeMeta(now = new Date()) {
  const fact = currentSwedishWeek(now);
  return {
    title: `Vilken vecka är det nu? Vecka ${fact.week} år ${fact.year} | Viikko Nro`,
    description: `Nu är det vecka ${fact.week} år ${fact.year}. Veckan börjar måndag ${formatSwedishDate(fact.monday)} och slutar söndag ${formatSwedishDate(fact.sunday)} enligt ISO 8601. Se veckans alla datum här.`,
  };
}

export function swedishYearMeta(year) {
  const total = weeksInIsoYear(Number(year));
  return {
    title: `Veckonummer ${year} – alla ${total} veckor med datum | Viikko Nro`,
    description: `Se alla ${total} veckonummer ${year} med start- och slutdatum. Veckorna följer ISO 8601, börjar på måndag och kan öppnas som detaljerade veckosidor här.`,
  };
}

export function swedishWeekMeta(week, year) {
  const fact = swedishWeekFacts(week, year);
  if (!fact) return null;
  return {
    title: `Vecka ${fact.week} ${fact.year} – ${formatNumericDate(fact.monday)}–${formatNumericDate(fact.sunday)} | Viikko Nro`,
    description: `Vecka ${fact.week} år ${fact.year} börjar måndag ${formatSwedishDate(fact.monday)} och slutar söndag ${formatSwedishDate(fact.sunday)}. Se alla sju datum och närliggande veckor online enligt ISO 8601.`,
  };
}

export const swedishHomeFaqs = [
  { q: "Vilken vecka är det nu?", a: "Det aktuella veckonumret visas högst upp på sidan och beräknas enligt ISO 8601." },
  { q: "När börjar veckan i Finland?", a: "Veckan börjar på måndag och slutar på söndag." },
  { q: "Hur bestäms vecka 1?", a: "Vecka 1 är den vecka som innehåller årets första torsdag, och därmed alltid den 4 januari." },
  { q: "Har alla år 52 veckor?", a: "Nej. De flesta år har 52 ISO-veckor, men vissa år har 53." },
];

export function swedishYearFaqs(year) {
  const total = weeksInIsoYear(Number(year));
  return [
    { q: `Hur många veckor har år ${year}?`, a: `År ${year} har ${total} ISO-veckor.` },
    { q: `När börjar vecka 1 år ${year}?`, a: `Vecka 1 år ${year} börjar ${formatSwedishDate(mondayOf(1, Number(year)))}.` },
    { q: "Varför kan vecka 1 börja i december?", a: "ISO-veckoåret följer årets första torsdag, så vecka 1 kan börja under föregående kalenderår." },
  ];
}

export function swedishWeekFaqs(week, year) {
  const fact = swedishWeekFacts(week, year);
  return [
    { q: `När är vecka ${week} år ${year}?`, a: `Vecka ${week} pågår från ${formatSwedishDate(fact.monday)} till ${formatSwedishDate(fact.sunday)}.` },
    { q: `Vilket datum börjar vecka ${week}?`, a: `Veckan börjar måndag ${formatSwedishDate(fact.monday)}.` },
    { q: `Vilket datum slutar vecka ${week}?`, a: `Veckan slutar söndag ${formatSwedishDate(fact.sunday)}.` },
  ];
}
