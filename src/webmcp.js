// WebMCP (experimental, Chrome Early-Preview): expose the site's real tools —
// the week/date calculators — to in-browser AI agents via
// navigator.modelContext.provideContext(). This is honest: every tool maps to
// an actual calculator the site already offers.
//
// Progressive enhancement only. It is feature-detected and runs client-side
// (from main.jsx), so in every current browser — where navigator.modelContext
// does not exist — it is a complete no-op and cannot affect normal users.
import {
  isoWeek,
  isoYear,
  mondayOf,
  weeksInIsoYear,
} from "./components/dateUtils";
import { holidaysInYear } from "./data/holidays";

function pad(n) {
  return n < 10 ? "0" + n : "" + n;
}
function fmt(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function parseDate(s) {
  const p = String(s).split("-");
  if (p.length !== 3) return null;
  const d = new Date(+p[0], +p[1] - 1, +p[2]);
  return Number.isNaN(d.getTime()) ? null : d;
}
function text(t) {
  return { content: [{ type: "text", text: t }] };
}

export function registerWebMCPTools() {
  if (
    typeof navigator === "undefined" ||
    !navigator.modelContext ||
    typeof navigator.modelContext.provideContext !== "function"
  ) {
    return; // no WebMCP in this browser — nothing to do
  }

  navigator.modelContext.provideContext({
    tools: [
      {
        name: "date_to_week",
        description:
          "Palauttaa annetun päivämäärän ISO 8601 -viikkonumeron ja -vuoden (Suomi/EU, viikko alkaa maanantaista).",
        inputSchema: {
          type: "object",
          properties: {
            date: { type: "string", description: "Päivämäärä muodossa YYYY-MM-DD" },
          },
          required: ["date"],
        },
        async execute({ date }) {
          const d = parseDate(date);
          if (!d) return text("Virheellinen päivämäärä. Käytä muotoa YYYY-MM-DD.");
          const w = isoWeek(d);
          const y = isoYear(d);
          return text(
            `${date} kuuluu viikkoon ${w}/${y}. Lisätiedot: https://viikkonro.fi/viikko-${w}-${y}`,
          );
        },
      },
      {
        name: "week_to_date",
        description:
          "Palauttaa annetun viikkonumeron ja vuoden alkamis- ja päättymispäivän (maanantai–sunnuntai).",
        inputSchema: {
          type: "object",
          properties: {
            week: { type: "integer", description: "Viikkonumero 1–53" },
            year: { type: "integer", description: "Vuosi, esim. 2026" },
          },
          required: ["week", "year"],
        },
        async execute({ week, year }) {
          const w = Number(week);
          const y = Number(year);
          if (!w || !y || w < 1 || w > weeksInIsoYear(y))
            return text("Virheellinen viikko tai vuosi.");
          const mo = mondayOf(w, y);
          const su = new Date(mo);
          su.setDate(mo.getDate() + 6);
          return text(
            `Viikko ${w}/${y}: ${fmt(mo)} – ${fmt(su)}. Lisätiedot: https://viikkonro.fi/viikko-${w}-${y}`,
          );
        },
      },
      {
        name: "working_days_between",
        description:
          "Laskee työpäivät (ma–pe, pois lukien Suomen viralliset arkipyhät) kahden päivämäärän välillä, molemmat mukaan lukien.",
        inputSchema: {
          type: "object",
          properties: {
            from: { type: "string", description: "Alkupäivä YYYY-MM-DD" },
            to: { type: "string", description: "Loppupäivä YYYY-MM-DD" },
          },
          required: ["from", "to"],
        },
        async execute({ from, to }) {
          const a = parseDate(from);
          const b = parseDate(to);
          if (!a || !b || a > b) return text("Virheelliset päivämäärät.");
          const set = new Set();
          for (let y = a.getFullYear(); y <= b.getFullYear(); y++) {
            holidaysInYear(y)
              .filter((h) => h.official)
              .forEach((h) => set.add(h.date.toDateString()));
          }
          let wd = 0;
          const d = new Date(a);
          while (d <= b) {
            const dow = d.getDay();
            if (dow !== 0 && dow !== 6 && !set.has(d.toDateString())) wd += 1;
            d.setDate(d.getDate() + 1);
          }
          return text(`Työpäiviä ${from} – ${to}: ${wd}.`);
        },
      },
      {
        name: "days_between",
        description:
          "Laskee päivien ja viikkojen määrän kahden päivämäärän välillä.",
        inputSchema: {
          type: "object",
          properties: {
            from: { type: "string", description: "Ensimmäinen päivä YYYY-MM-DD" },
            to: { type: "string", description: "Toinen päivä YYYY-MM-DD" },
          },
          required: ["from", "to"],
        },
        async execute({ from, to }) {
          const a = parseDate(from);
          const b = parseDate(to);
          if (!a || !b) return text("Virheelliset päivämäärät.");
          const days = Math.round(Math.abs(b - a) / 86400000);
          return text(
            `${days} päivää (${Math.floor(days / 7)} viikkoa ja ${days % 7} päivää).`,
          );
        },
      },
    ],
  });
}
