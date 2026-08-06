// Content data for /suomi-vs-usa-viikkonumerot. Plain .js (not .jsx) so
// prerender.js can import it directly, same reason dateUtils.js is plain JS —
// see CLAUDE.md. All week/date math is deterministic (no `new Date()` calls
// here), so SSR and client hydration always agree.
import { isoWeek, isoYear, WD } from "../components/dateUtils.js";

// The common Yhdysvalloissa käytetty (US) week-numbering convention —
// Sunday-first, week 1 = the week containing 1 January. This is NOT a formal
// government standard the way ISO 8601 is an international one; it's the
// de-facto convention behind Microsoft Excel's default WEEKNUM() (return_type
// 1), most US calendar apps, and US federal fiscal reporting. Named
// "usWeekNumber" rather than e.g. "americanIsoWeek" to avoid implying it's
// ISO-derived — it explicitly is not.
export function usWeekNumber(date) {
  const year = date.getFullYear();
  const jan1 = new Date(year, 0, 1);
  const jan1Day = jan1.getDay(); // 0 = Sunday
  const week1Start = new Date(year, 0, 1 - jan1Day);
  const diffDays = Math.round((date - week1Start) / 86400000);
  return Math.floor(diffDays / 7) + 1;
}

// Real (not hypothetical) comparison rows — every date below is a genuine
// calendar date already reachable elsewhere on the site (each ISO week links
// to its own /viikko-<w>-<y> page). Picked to show both outcomes: some dates
// agree between the two systems, some diverge by a full week in either
// direction — the divergence direction depends on which weekday 1 January
// falls on, not on any single fixed offset.
export function finlandVsUsaExamples() {
  const dates = [
    new Date(2023, 0, 1),
    new Date(2024, 0, 1),
    new Date(2025, 0, 1),
    new Date(2026, 0, 1),
    new Date(2027, 0, 1),
    new Date(2025, 11, 29),
    new Date(2026, 11, 31),
  ];
  return dates.map((date) => {
    const isoW = isoWeek(date);
    const isoY = isoYear(date);
    const usW = usWeekNumber(date);
    const usY = date.getFullYear();
    return {
      date,
      weekday: WD[date.getDay()],
      isoWeek: isoW,
      isoYear: isoY,
      usWeek: usW,
      usYear: usY,
      differs: !(isoW === usW && isoY === usY),
    };
  });
}

// Shared by FinlandVsUsa.jsx (visible <details> list) and prerender.js's
// FAQPage JSON-LD — same visible/schema-parity discipline as every other FAQ
// set in this codebase (calendarFaqs(), monthFaqs(), etc.).
export function finlandVsUsaFaqs() {
  return [
    {
      q: "Miksi Suomen viikkonumero eroaa Yhdysvaltain viikkonumerosta?",
      a: "Suomessa käytetään ISO 8601 -standardia, jossa viikko alkaa maanantaista ja viikko 1 on se, johon vuoden ensimmäinen torstai osuu. Yhdysvalloissa yleisesti käytetty tapa (mm. Microsoft Excelin oletusarvo) aloittaa viikon sunnuntaista, ja viikko 1 on aina se, joka sisältää 1. tammikuuta. Kaksi eri sääntöä tuottavat eri numeron samalle päivälle riippuen siitä, mille viikonpäivälle 1. tammikuuta osuu.",
    },
    {
      q: "Onko Yhdysvalloissa virallinen viikkonumerostandardi kuten ISO 8601?",
      a: "Ei samalla tavalla. ISO 8601 on kansainvälinen standardi, jonka Suomi ja suuri osa Eurooppaa noudattavat sekä viikkonumeroissa että päivämäärien kirjoitusasussa. Yhdysvalloissa ei ole vastaavaa yhtä lakisääteistä viikkonumerointia — käytännössä yleisin tapa on ohjelmistojen (esim. Excel, Outlook) oletusarvo, jossa viikko alkaa sunnuntaista ja viikko 1 sisältää 1. tammikuuta.",
    },
    {
      q: "Voiko sama päivä kuulua eri vuoden viikkoon Suomessa ja Yhdysvalloissa?",
      a: "Kyllä. Esimerkiksi 1.1.2023 kuuluu ISO 8601:n mukaan vielä vuoden 2022 viikkoon 52, mutta yhdysvaltalaisittain se on jo vuoden 2023 viikko 1. Vastaavasti 29.12.2025 kuuluu ISO:n mukaan jo vuoden 2026 viikkoon 1, mutta yhdysvaltalaisittain se on vielä vuoden 2025 viikko 53.",
    },
    {
      q: "Mistä tietää, kumpaa viikkonumerointia kalenteri käyttää?",
      a: "Kalenterin alueasetus ratkaisee: suomalainen tai eurooppalainen asetus näyttää ISO 8601 -viikon, yhdysvaltalainen asetus näyttää sunnuntaista alkavan viikon. Jos kalenterin ensimmäinen sarake on sunnuntai, se ei todennäköisesti näytä ISO-viikkonumeroa.",
    },
  ];
}
