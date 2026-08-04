// Per-route SEO metadata — the single source of truth used by prerender.js to
// give each static page its own <title>, <meta description>, Open Graph tags
// and a SELF-referencing canonical URL. Without this, every prerendered page
// would share the homepage's title + canonical, which tells search engines the
// subpages are duplicates of the homepage and suppresses their indexing.

// SITE_ORIGIN is injected two ways so this file works whether it's loaded
// through Vite (client/SSR bundles, via the `define` in vite.config.js) or
// directly by plain Node (prerender.js, which imports this file without any
// Vite transform and so only ever sees real process.env).
export const SITE_URL = process.env.SITE_ORIGIN || "https://viikkonro.fi";

// Finnish date formatters live in one place (dateUtils.js). Imported with an
// explicit .js extension so plain-Node prerender.js can resolve it too (the
// ISO-week math below stays inline — untouched — per the no-touch rule).
import {
  M_GENITIVE,
  fmtFullFi,
  fmtRangeCompactFi,
  fmtShortFi,
  WD_ESSIVE,
} from "../components/dateUtils.js";
import {
  HOLIDAY_DEFINITIONS,
  holidayPageFor,
  holidayPageMeta,
} from "./holidayPages.js";
import {
  nameDayDateKeys,
  nameDayNames,
} from "./nameDays.js";
import {
  nameDayDateMeta,
  nameDayDatePage,
  nameDayNameMeta,
  nameDayNamePage,
  todayNameDayMeta,
  todayNameDayPage,
} from "./nameDayPages.js";
import {
  schoolHolidayMeta,
  schoolHolidayPage,
  schoolHolidayYears,
} from "./schoolHolidayPages.js";
import {
  currentMonthMeta,
  currentYearMeta,
  weekdayMeta,
} from "./currentDateContent.js";
import { englishMeta } from "./englishContent.js";

// Fixed date the FAQ/explainer/calculator page COPY (not just computed data)
// was last substantively edited. Bump both by hand when that prose actually
// changes — kept fixed rather than build-time "today" so the visible
// "Päivitetty" line on each page and its dateModified in structured data
// always agree, and so a date claiming freshness doesn't roll every day just
// because the site auto-rebuilds while the words on the page haven't changed.
export const CONTENT_UPDATED = "2026-08-05";
export const CONTENT_UPDATED_FI = fmtFullFi(new Date(2026, 7, 5));

// Mirrors src/components/dateUtils.jsx's isoWeek/weeksInIsoYear exactly.
// Duplicated (not imported) because prerender.js runs this file as plain
// Node ESM, which can't load a .jsx module.
function isoWeek(d) {
  const t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = (t.getDay() + 6) % 7;
  t.setDate(t.getDate() - day + 3);
  const firstThu = t.valueOf();
  t.setMonth(0, 1);
  if (t.getDay() !== 4) {
    t.setMonth(0, 1 + ((4 - t.getDay() + 7) % 7));
  }
  return 1 + Math.round((firstThu - t.valueOf()) / 604800000);
}
function weeksInIsoYear(y) {
  return isoWeek(new Date(y, 11, 28));
}
function isoYear(date) {
  const t = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = (t.getDay() + 6) % 7;
  t.setDate(t.getDate() - day + 3);
  return t.getFullYear();
}
export function mondayOf(week, year) {
  const jan4 = new Date(year, 0, 4);
  const j = (jan4.getDay() + 6) % 7;
  const firstMon = new Date(year, 0, 4 - j);
  const m = new Date(firstMon);
  m.setDate(firstMon.getDate() + (week - 1) * 7);
  return m;
}
function formatShort(d) {
  return `${d.getDate()}.${d.getMonth() + 1}.`;
}
const M_FULL = [
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

// Per-route <title>/<description> for the DYNAMIC pages. These are the single
// source of truth used by BOTH the page components (their <SEO> tag) and
// prerender.js (the static <head> it writes), so the crawlable HTML and the
// client-hydrated title never diverge. Each output is unique per route, which
// is what turns the ~200 week/month/year URLs from homepage-duplicates into
// real, individually indexable pages.
export function weekMeta(w, y) {
  const mo = mondayOf(w, y);
  const su = new Date(mo);
  su.setDate(mo.getDate() + 6);
  return {
    title: `Viikko ${w} (vk ${w}, vko ${w}) · ${fmtRangeCompactFi(mo, su)} | Viikko Nro`,
    // Short dates (fmtFullFi ran ~190 chars → truncated in SERPs). ~148 chars
    // keeps every keyword term within Google's snippet limit.
    description: `Viikko ${w} vuonna ${y} alkaa maanantaina ${formatShort(mo)} ja päättyy sunnuntaina ${formatShort(su)}${su.getFullYear()}. Katso päivämäärät, juhla- ja nimipäivät sekä tulostettava kalenteri.`,
  };
}
export function monthMeta(m, y) {
  // Genitive + "viikot" + year, IN THAT ORDER ("Kesäkuun viikot 2026") —
  // matches how people actually search ("kesäkuun viikot",
  // "heinäkuun viikot 2026") as a literal contiguous phrase. Year-before-viikot
  // ("Kesäkuun 2026 viikot") looks similar but doesn't match either query, since
  // "2026" then breaks up the "kesäkuun viikot" substring. The old nominative
  // "Kesäkuu 2026 – ... kalenteri" title never contained the phrase at all.
  const genitiveCap = M_GENITIVE[m - 1].replace(/^./, (c) => c.toUpperCase());
  return {
    title: `${genitiveCap} viikot ${y} – viikkonumerot | Viikko Nro`,
    description: `${genitiveCap} ${y} viikkonumerot, päivämäärät, juhlapäivät ja nimipäivät. Tulostettava kuukausikalenteri viikkonumeroilla ISO 8601 -standardin mukaan.`,
  };
}
export function yearMeta(y) {
  const total = weeksInIsoYear(y);
  return {
    title: `Viikkonumerot ${y} — kaikki ${total} viikkoa päivämäärineen`,
    description: `Katso viikkonumerot ${y}: kaikki ${total} viikkoa päivämäärineen. Selaa viikkoja, juhlapäiviä ja nimipäiviä tai avaa tulostettava viikkokalenteri.`,
  };
}
export function printMeta(y) {
  const total = weeksInIsoYear(y);
  return {
    title: `Viikot PDF ${y} – tulostettava viikkolista | Viikko Nro`,
    description: `Tulosta vuoden ${y} kaikki ${total} ISO-viikkoa päivämäärineen tai tallenna viikkolista PDF-muodossa. Lataa tiedot myös Excel-yhteensopivana CSV-tiedostona.`,
  };
}
export function holidaysMeta(y) {
  return {
    title: `Suomen pyhäpäivät ${y} – arkipyhät | Viikko Nro`,
    description: `Suomen viralliset pyhäpäivät ${y}: päivämäärät, viikonpäivät ja viikkonumerot. Uudenvuodenpäivä, pääsiäinen, vappu, juhannus, itsenäisyyspäivä ja joulu.`,
  };
}
export function workingDaysMeta(y) {
  return {
    title: `Työpäivät ${y} – montako työpäivää vuodessa | Viikko Nro`,
    description: `Montako työpäivää vuonna ${y}? Työpäivien määrä kuukausittain, viikonloput ja arkipyhät huomioiden – hyödyksi palkanlaskentaan ja työajan suunnitteluun.`,
  };
}

// Full-year calendar pages. `half` = null | 1 | 2; `print` = print-optimized.
export function calendarMeta(y, half, print) {
  if (print) {
    const total = weeksInIsoYear(y);
    return {
      title: `Tulostettava viikkokalenteri ${y} (PDF) | Viikko Nro`,
      description: `Tulostettava viikkokalenteri ${y} A4-vaakamuodossa: kaikki ${total} viikkoa, päivämäärät ja juhlapäivät. Tulosta, tallenna PDF tai lataa Excel-yhteensopiva CSV.`,
      robots: "index, follow",
    };
  }
  if (half === 1) {
    return {
      title: `Kalenteri ${y}, 1. vuosipuolisko | Viikko Nro`,
      description: `Vuoden ${y} kevätpuolen kalenteri: tammikuu–kesäkuu. Viikkonumerot, juhlapäivät ja tulostettava PDF.`,
    };
  }
  if (half === 2) {
    return {
      title: `Kalenteri ${y}, 2. vuosipuolisko | Viikko Nro`,
      description: `Vuoden ${y} syyspuolen kalenteri: heinäkuu–joulukuu. Viikkonumerot, juhlapäivät ja tulostettava PDF.`,
    };
  }
  const total = weeksInIsoYear(y);
  return {
    title: `Viikkokalenteri ${y} – ${total} viikkoa ja PDF | Viikko Nro`,
    description: `Avaa viikkokalenteri ${y}: kaikki ${total} viikkoa, viikkonumerot ja juhlapäivät. Tulosta kalenteri tai tallenna se PDF-muodossa yhdellä painikkeella.`,
  };
}

// Shared by CalendarYear.jsx and prerender.js so the visible calendar FAQ and
// its FAQPage JSON-LD always contain exactly the same questions and answers.
export function calendarFaqs(y) {
  const total = weeksInIsoYear(y);
  return [
    {
      q: `Mikä on viikkokalenteri ${y} yhdellä lauseella?`,
      a: `Viikkokalenteri ${y} näyttää vuoden kaikki ${total} ISO-viikkoa, päivämäärät, viikkonumerot ja Suomen juhlapäivät yhdessä näkymässä.`,
    },
    {
      q: `Kuinka monta viikkoa vuodessa ${y} on?`,
      a: `Vuodessa ${y} on ${total} ISO-viikkoa. Viikko alkaa maanantaina ja päättyy sunnuntaina.`,
    },
    {
      q: `Miten viikkokalenteri ${y} tulostetaan tai tallennetaan PDF-muodossa?`,
      a: `Paina kalenterin Tulosta / tallenna PDF -painiketta ja valitse selaimen tulostusikkunasta tulostin tai PDF-tallennus. Kalenteri sovitetaan A4-vaakasivulle.`,
    },
    {
      q: `Mitä viikkonäkymä ${y} näyttää?`,
      a: `Viikkonäkymä näyttää jokaisen kuukauden päivät, maanantaisin alkavat viikkonumerot sekä Suomen juhla- ja liputuspäivät. Viikkonumerosta voi avata viikon oman sivun.`,
    },
    {
      q: `Voiko viikkokalenterista avata yksittäisen viikon päivämäärät?`,
      a: `Kyllä. Napsauta kalenterissa maanantain vieressä näkyvää viikkonumeroa, niin saat viikon kaikki seitsemän päivämäärää sekä juhla- ja nimipäivät.`,
    },
  ];
}

// Home page title/description carry the actual current week and date range
// (what F-04 calls "distinguishing data"), computed the same way at build
// time (prerender.js, for crawlers) and at hydration (Home.jsx render body —
// deliberately NOT inside an effect, so it's correct during SSR too, unlike
// Weekcounter's useLayoutEffect-based state which renders as 0 server-side).
export function homeMeta(now) {
  const week = isoWeek(now);
  const year = isoYear(now);
  const mo = mondayOf(week, year);
  const su = new Date(mo);
  su.setDate(mo.getDate() + 6);
  // The live week and compact start date distinguish every weekly build while
  // leaving room for both the exact head query and the full "viikkonumero"
  // keyword. Even a two-digit week/date remains below 60 characters.
  const startDate = formatShort(mo);
  // The direct-answer sentence rendered as the homepage's on-page lead
  // paragraph (Weekcounter.jsx). The meta description below targets the exact
  // head query while drawing its dates from these same computed values.
  const lead = `Juuri nyt on viikko ${week} (viikkonumero ${week}) vuonna ${year}. Viikko alkaa ${WD_ESSIVE[mo.getDay()]} ${fmtShortFi(mo)} ja päättyy ${WD_ESSIVE[su.getDay()]} ${fmtShortFi(su)}.`;
  return {
    title: `Mikä viikko nyt on? Viikkonumero ${week} (${startDate}) | Viikko Nro`,
    // Lead with the short-query term while retaining "viikko", "kuluva viikko"
    // and "viikon numero" naturally inside the 140–160-character budget.
    description: `Katso viikkonumero heti: nyt on viikko ${week} vuonna ${year}. Kuluva viikko alkaa ${WD_ESSIVE[mo.getDay()]} ${formatShort(mo)} ja päättyy ${WD_ESSIVE[su.getDay()]} ${formatShort(su)} Tarkista muun päivän viikon numero.`,
    lead,
  };
}

export const routeMeta = {
  "/": {
    // Brand-last ("| Viikko Nro"), matching every other page's convention.
    // Replaced at build time with homeMeta(); kept as a safe fallback.
    title: "Mikä viikko nyt on? Viikkonumero | Viikko Nro",
    description:
      "Katso viikkonumero heti ja selvitä mikä viikko nyt on. Viikkolaskuri näyttää kuluvan viikon sekä minkä tahansa päivämäärän viikon numeron ISO 8601:n mukaan.",
  },
  "/en": {
    ...englishMeta(),
    breadcrumb: "English",
  },
  "/mika-on-viikkonumero": {
    title: "Mikä on viikkonumero? ISO 8601 -viikkolaskenta selitettynä",
    description:
      "Viikkonumero on 1–53 välinen luku vuoden kuluvasta viikosta. Suomessa noudatetaan ISO 8601:tä: viikko alkaa maanantaista, 4. tammikuuta on aina viikolla 1.",
    breadcrumb: "Mikä on viikkonumero",
  },
  "/viikko-alkaa-maanantaista": {
    title: "Viikko alkaa maanantaista – ISO 8601 -sääntö | Viikko Nro",
    description:
      "Lue, miksi viikko alkaa maanantaista Suomessa. ISO 8601 määrää viikon ensimmäiseksi päiväksi maanantain ja viikon 1 ensimmäisen torstain perusteella.",
    breadcrumb: "Viikko alkaa maanantaista",
  },
  "/kuinka-monta-viikkoa-vuodessa": {
    title: "Kuinka monta viikkoa vuodessa on? 52 vai 53 | Viikko Nro",
    description:
      "Katso, montako viikkoa vuodessa on: tavallisesti 52, joskus 53. Vuonna 2026 on 53 viikkoa. Lue ISO 8601 -sääntö ja tarkista 53 viikon vuodet.",
    breadcrumb: "Viikkoja vuodessa",
  },
  "/mika-kuukausi-nyt": {
    ...currentMonthMeta(),
    breadcrumb: "Mikä kuukausi nyt on",
  },
  "/mika-vuosi-nyt": {
    ...currentYearMeta(),
    breadcrumb: "Mikä vuosi nyt on",
  },
  "/viikonpaiva": {
    ...weekdayMeta,
    breadcrumb: "Viikonpäivälaskuri",
  },
  "/ukk": {
    title: "Usein kysytyt kysymykset viikkonumeroista | Viikko Nro",
    description:
      "Vastauksia viikkonumeroista: mikä viikko nyt on, alkaako viikko maanantaista, kuinka monta viikkoa vuodessa on ja miten viikkonumero lasketaan.",
    breadcrumb: "UKK",
  },
  "/tietoa-meista": {
    title: "Tietoa meistä | Viikko Nro",
    description:
      "Viikko Nro on ilmainen suomalainen viikkolaskuri. Lue lisää palvelusta ja tehtävästämme tehdä viikkonumeroiden tarkistamisesta helppoa.",
    breadcrumb: "Tietoa meistä",
  },
  "/ota-yhteytta": {
    title: "Ota yhteyttä | Viikko Nro",
    description:
      "Ota yhteyttä Viikko Nro -tiimiin verkkolomakkeella. Vastaamme palautteeseen, kysymyksiin ja kehitysehdotuksiin niin nopeasti kuin mahdollista.",
    breadcrumb: "Ota yhteyttä",
  },
  "/tietosuoja": {
    title: "Tietosuojaseloste | Viikko Nro",
    description:
      "Viikko Nro -palvelun tietosuojaseloste: mitä tietoja keräämme, miten käytämme niitä ja miten suojaamme yksityisyyttäsi.",
    breadcrumb: "Tietosuojaseloste",
  },
  "/kayttoehdot": {
    title: "Käyttöehdot | Viikko Nro",
    description:
      "Viikko Nro -palvelun käyttöehdot: palvelun käyttö, vastuunrajoitukset ja sovellettava lainsäädäntö selkeästi selitettynä ennen palvelun käyttöä.",
    breadcrumb: "Käyttöehdot",
  },
  "/laskurit": {
    title: "Viikkolaskurit ja päivämäärätyökalut | Viikko Nro",
    description:
      "Ilmaiset laskurit: päivämäärästä viikkonumeroon, viikosta päivämääräksi, työpäivät ja päivien erotus. Nopeita työkaluja ISO 8601 -viikkoihin.",
    breadcrumb: "Laskurit",
  },
  "/paivamaara-viikoksi": {
    title: "Päivämäärästä viikkonumeroon – viikkolaskuri | Viikko Nro",
    description:
      "Selvitä minkä tahansa päivämäärän viikkonumero ISO 8601 -standardin mukaan. Syötä päivä ja näe heti viikko, viikonpäivä ja viikon päivämäärät.",
    breadcrumb: "Päivämäärästä viikkoon",
  },
  "/viikko-paivamaaraksi": {
    title: "Viikosta päivämääräksi – viikon päivämäärät | Viikko Nro",
    description:
      "Syötä viikkonumero ja vuosi, niin näet viikon alkamis- ja päättymispäivän sekä kaikki viikonpäivät. ISO 8601 -viikkolaskuri.",
    breadcrumb: "Viikosta päivämääräksi",
  },
  "/tyopaivalaskuri": {
    title: "Työpäivälaskuri – työpäivien määrä | Viikko Nro",
    description:
      "Laske työpäivien määrä kahden päivämäärän välillä, viikonloput ja Suomen arkipyhät huomioiden. Hyödyksi palkanlaskentaan ja projektien suunnitteluun.",
    breadcrumb: "Työpäivälaskuri",
  },
  "/paivien-erotus": {
    title: "Päivien erotus – montako päivää välissä | Viikko Nro",
    description:
      "Laske montako päivää, viikkoa ja työpäivää kahden päivämäärän välillä on. Ilmainen päivälaskuri.",
    breadcrumb: "Päivien erotus",
  },
};

// Self-referencing canonical URL for a route ("/" keeps its trailing slash,
// subpaths have none — matching sitemap.xml).
export function canonicalFor(path) {
  return path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;
}

// Sitemap entries, generated at build time so year pages and <lastmod> stay
// current without hand-editing. `year` is the current full year.
export function sitemapEntries(year) {
  const entries = [
    { path: "/", changefreq: "daily", priority: "1.0" },
    { path: "/en", changefreq: "daily", priority: "0.4" },
    { path: "/mika-on-viikkonumero", changefreq: "monthly", priority: "0.8" },
    { path: "/viikko-alkaa-maanantaista", changefreq: "monthly", priority: "0.7" },
    { path: "/kuinka-monta-viikkoa-vuodessa", changefreq: "monthly", priority: "0.8" },
    { path: "/mika-kuukausi-nyt", changefreq: "daily", priority: "0.8" },
    { path: "/mika-vuosi-nyt", changefreq: "daily", priority: "0.8" },
    { path: "/viikonpaiva", changefreq: "monthly", priority: "0.7" },
    { path: "/ukk", changefreq: "monthly", priority: "0.8" },
    { path: "/laskurit", changefreq: "monthly", priority: "0.7" },
    { path: "/paivamaara-viikoksi", changefreq: "monthly", priority: "0.7" },
    { path: "/viikko-paivamaaraksi", changefreq: "monthly", priority: "0.7" },
    { path: "/tyopaivalaskuri", changefreq: "monthly", priority: "0.7" },
    { path: "/paivien-erotus", changefreq: "monthly", priority: "0.7" },
    { path: "/tietoa-meista", changefreq: "yearly", priority: "0.4" },
    { path: "/ota-yhteytta", changefreq: "yearly", priority: "0.4" },
    { path: "/tietosuoja", changefreq: "yearly", priority: "0.3" },
    { path: "/kayttoehdot", changefreq: "yearly", priority: "0.3" },
  ];
  for (const schoolYear of schoolHolidayYears) {
    entries.push({
      path: `/koululomat-${schoolYear}`,
      changefreq: schoolYear >= year ? "monthly" : "yearly",
      priority: schoolYear >= year ? "0.8" : "0.6",
    });
  }
  for (const item of nameDayNames()) {
    entries.push({
      path: `/nimipaiva/${item.slug}`,
      changefreq: "yearly",
      priority: "0.6",
    });
  }
  for (const dateKey of nameDayDateKeys()) {
    entries.push({
      path: `/nimipaivat/${dateKey}`,
      changefreq: "yearly",
      priority: "0.5",
    });
  }
  if (todayNameDayPage().available) {
    entries.push({
      path: "/nimipaivat/tanaan",
      changefreq: "daily",
      priority: "0.8",
    });
  }
  // Historical floor 2020 (matches the year-picker's YEAR_MIN) through a rolling
  // +9-year horizon (≈2035 today). Every week/month/year page across that span
  // is prerendered and indexable; the top edge auto-advances on each rebuild, so
  // there's no hardcoded end year to maintain.
  const FUTURE_HORIZON = 9;
  for (let y = 2020; y <= year + FUTURE_HORIZON; y++) {
    const current = y === year;
    entries.push({
      path: `/vuosi-${y}`,
      changefreq: current ? "weekly" : "yearly",
      priority: current ? "0.7" : "0.6",
    });
    for (let w = 1; w <= weeksInIsoYear(y); w++) {
      entries.push({
        path: `/viikko-${w}-${y}`,
        changefreq: current ? "weekly" : "yearly",
        priority: current ? "0.6" : "0.4",
      });
    }
    for (let m = 1; m <= 12; m++) {
      entries.push({
        path: `/kuukausi-${m}-${y}`,
        changefreq: current ? "monthly" : "yearly",
        priority: current ? "0.6" : "0.4",
      });
    }
    entries.push({
      path: `/pyhapaivat-${y}`,
      changefreq: current ? "monthly" : "yearly",
      priority: current ? "0.7" : "0.5",
    });
    entries.push({
      path: `/tyopaivat-${y}`,
      changefreq: current ? "monthly" : "yearly",
      priority: current ? "0.7" : "0.5",
    });
    entries.push({
      path: `/tulosta-${y}`,
      changefreq: current ? "monthly" : "yearly",
      priority: current ? "0.7" : "0.5",
    });
    for (const holiday of HOLIDAY_DEFINITIONS) {
      entries.push({
        path: `/pyhat-${y}/${holiday.slug}`,
        changefreq: current ? "monthly" : "yearly",
        priority: current ? "0.7" : "0.5",
      });
    }
  }
  // Full-year calendar pages: 2020 .. year+9 (rolling) × {full, half 1, half 2,
  // print}. Auto-advances every rebuild so the indexed set never freezes.
  for (let cy = 2020; cy <= year + 9; cy++) {
    const cur = cy === year;
    entries.push({
      path: `/kalenteri-${cy}`,
      changefreq: cur ? "weekly" : "yearly",
      priority: cur ? "0.7" : "0.5",
    });
    entries.push({ path: `/kalenteri-${cy}-alkuvuosi`, changefreq: "yearly", priority: "0.3" });
    entries.push({ path: `/kalenteri-${cy}-loppuvuosi`, changefreq: "yearly", priority: "0.3" });
    entries.push({
      path: `/tulostettava-kalenteri-${cy}`,
      changefreq: "yearly",
      priority: "0.3",
    });
  }

  return entries;
}

// Resolve any route to its meta for prerendering: static pages from routeMeta,
// the homepage with the live current-week title/description, or a generated
// dynamic page (week/month/year/print). Returns null for routes not prerendered.
export function metaFor(url) {
  if (url === "/") return { ...routeMeta["/"], ...homeMeta(new Date()) };
  if (url === "/en") return { ...routeMeta[url], ...englishMeta() };
  if (url === "/mika-kuukausi-nyt") return { ...routeMeta[url], ...currentMonthMeta() };
  if (url === "/mika-vuosi-nyt") return { ...routeMeta[url], ...currentYearMeta() };
  if (routeMeta[url]) return routeMeta[url];
  let m;
  if (url === "/nimipaivat/tanaan") return todayNameDayMeta();
  if ((m = url.match(/^\/nimipaiva\/([a-z0-9-]+)$/))) return nameDayNameMeta(m[1]);
  if ((m = url.match(/^\/nimipaivat\/(\d{2}-\d{2})$/))) return nameDayDateMeta(m[1]);
  if ((m = url.match(/^\/viikko-(\d+)-(\d+)$/))) return weekMeta(+m[1], +m[2]);
  if ((m = url.match(/^\/kuukausi-(\d+)-(\d+)$/))) return monthMeta(+m[1], +m[2]);
  if ((m = url.match(/^\/vuosi-(\d+)$/))) return yearMeta(+m[1]);
  if ((m = url.match(/^\/tulosta-(\d+)$/))) return printMeta(+m[1]);
  if ((m = url.match(/^\/pyhapaivat-(\d+)$/))) return holidaysMeta(+m[1]);
  if ((m = url.match(/^\/pyhat-(\d+)\/([a-z0-9-]+)$/)))
    return holidayPageMeta(+m[1], m[2]);
  if ((m = url.match(/^\/tyopaivat-(\d+)$/))) return workingDaysMeta(+m[1]);
  if ((m = url.match(/^\/koululomat-(\d+)$/))) return schoolHolidayMeta(+m[1]);
  if ((m = url.match(/^\/kalenteri-(\d+)-(alkuvuosi|loppuvuosi)$/)))
    return calendarMeta(+m[1], m[2] === "alkuvuosi" ? 1 : 2, false);
  if ((m = url.match(/^\/kalenteri-(\d+)$/))) return calendarMeta(+m[1], null, false);
  if ((m = url.match(/^\/tulostettava-kalenteri-(\d+)$/)))
    return calendarMeta(+m[1], null, true);
  return null;
}

// Ordered breadcrumb trail for a route (home is position 1). Powers the
// BreadcrumbList JSON-LD and mirrors the visible "Etusivu / …" breadcrumb on
// each page, including the 3-level trails on week/month pages.
export function breadcrumbTrail(url) {
  const home = { name: "Etusivu", path: "/" };
  if (routeMeta[url] && routeMeta[url].breadcrumb) {
    return [home, { name: routeMeta[url].breadcrumb, path: url }];
  }
  let m;
  if (url === "/nimipaivat/tanaan") {
    return [home, { name: "Nimipäivä tänään", path: url }];
  }
  if ((m = url.match(/^\/nimipaiva\/([a-z0-9-]+)$/))) {
    const page = nameDayNamePage(m[1]);
    if (!page) return null;
    return [home, { name: "Nimipäivät", path: "/nimipaivat/tanaan" }, { name: page.name, path: url }];
  }
  if ((m = url.match(/^\/nimipaivat\/(\d{2}-\d{2})$/))) {
    const page = nameDayDatePage(m[1]);
    if (!page) return null;
    return [home, { name: "Nimipäivät", path: "/nimipaivat/tanaan" }, { name: fmtFullFi(page.date), path: url }];
  }
  if ((m = url.match(/^\/vuosi-(\d+)$/))) {
    return [home, { name: `Viikot ${m[1]}`, path: url }];
  }
  if ((m = url.match(/^\/viikko-(\d+)-(\d+)$/))) {
    return [
      home,
      { name: `Viikot ${m[2]}`, path: `/vuosi-${m[2]}` },
      { name: `Viikko ${m[1]}`, path: url },
    ];
  }
  if ((m = url.match(/^\/kuukausi-(\d+)-(\d+)$/))) {
    return [
      home,
      { name: `Viikot ${m[2]}`, path: `/vuosi-${m[2]}` },
      { name: M_FULL[+m[1] - 1], path: url },
    ];
  }
  if ((m = url.match(/^\/tulosta-(\d+)$/))) {
    return [home, { name: `Tulostettava ${m[1]}`, path: url }];
  }
  if ((m = url.match(/^\/pyhapaivat-(\d+)$/))) {
    return [
      home,
      { name: `Viikot ${m[1]}`, path: `/vuosi-${m[1]}` },
      { name: `Pyhäpäivät ${m[1]}`, path: url },
    ];
  }
  if ((m = url.match(/^\/pyhat-(\d+)\/([a-z0-9-]+)$/))) {
    const page = holidayPageFor(+m[1], m[2]);
    if (!page) return null;
    return [
      home,
      { name: `Pyhäpäivät ${m[1]}`, path: `/pyhapaivat-${m[1]}` },
      { name: page.displayName, path: url },
    ];
  }
  if ((m = url.match(/^\/tyopaivat-(\d+)$/))) {
    return [
      home,
      { name: `Viikot ${m[1]}`, path: `/vuosi-${m[1]}` },
      { name: `Työpäivät ${m[1]}`, path: url },
    ];
  }
  if ((m = url.match(/^\/koululomat-(\d+)$/))) {
    const page = schoolHolidayPage(+m[1]);
    if (!page) return null;
    return [home, { name: `Koululomat ${m[1]}`, path: url }];
  }
  const kalenteri = { name: "Kalenteri", path: `/kalenteri-${isoYear(new Date())}` };
  if ((m = url.match(/^\/kalenteri-(\d+)(?:-([12]))?$/))) {
    const suffix = m[2]
      ? m[2] === "1"
        ? ", 1. vuosipuolisko"
        : ", 2. vuosipuolisko"
      : "";
    return [home, kalenteri, { name: `${m[1]}${suffix}`, path: url }];
  }
  if ((m = url.match(/^\/tulostettava-kalenteri-(\d+)$/))) {
    return [home, kalenteri, { name: `Tulostettava ${m[1]}`, path: url }];
  }
  return null;
}
