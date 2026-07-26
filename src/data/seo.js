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
function mondayOf(week, year) {
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
function dWritten(d) {
  return `${d.getDate()} ${M_FULL[d.getMonth()]} ${d.getFullYear()}`;
}

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
    title: `Viikko ${w} vuonna ${y} – ${formatShort(mo)}–${formatShort(su)}${su.getFullYear()} | Viikko Nro`,
    description: `Viikko ${w} vuonna ${y} alkaa maanantaina ${dWritten(mo)} ja päättyy sunnuntaina ${dWritten(su)}. Katso viikon ${w} päivämäärät, juhlapäivät ja nimipäivät sekä tulostettava kalenteri.`,
  };
}
export function monthMeta(m, y) {
  return {
    title: `${M_FULL[m - 1]} ${y} – viikkonumerot ja kalenteri | Viikko Nro`,
    description: `Kuukauden ${M_FULL[m - 1]} ${y} viikkonumerot, päivämäärät, juhlapäivät ja nimipäivät. Tulostettava kuukausikalenteri viikkonumeroilla ISO 8601 -standardin mukaan.`,
  };
}
export function yearMeta(y) {
  const total = weeksInIsoYear(y);
  return {
    title: `Viikkonumerot ${y} – kaikki ${total} viikkoa | Viikko Nro`,
    description: `Vuoden ${y} kaikki ${total} viikkonumeroa alkamis- ja päättymispäivineen, juhlapäivät sekä tulostettava viikkokalenteri (PDF) ISO 8601 -standardin mukaan.`,
  };
}
export function printMeta(y) {
  return {
    title: `Tulostettava viikkokalenteri ${y} (PDF) | Viikko Nro`,
    description: `Tulosta tai tallenna vuoden ${y} viikkokalenteri PDF-muodossa: kaikki viikkonumerot, päivämäärät ja juhlapäivät yhdellä A4-sivulla. Ilmainen.`,
  };
}
export function holidaysMeta(y) {
  return {
    title: `Suomen pyhäpäivät ${y} – arkipyhät ja vapaapäivät | Viikko Nro`,
    description: `Kaikki Suomen viralliset pyhäpäivät ${y}: päivämäärät, viikonpäivät ja viikkonumerot. Uudenvuodenpäivä, pääsiäinen, vappu, juhannus, itsenäisyyspäivä ja joulu.`,
  };
}
export function workingDaysMeta(y) {
  return {
    title: `Työpäivät ${y} – montako työpäivää vuodessa | Viikko Nro`,
    description: `Montako työpäivää vuonna ${y}? Työpäivien määrä kuukausittain, viikonloput ja arkipyhät huomioiden – hyödyksi palkanlaskentaan ja työajan suunnitteluun.`,
  };
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
  const start = formatShort(mo);
  const end = `${formatShort(su)}${su.getFullYear()}`;
  return {
    title: `Viikko ${week} – mikä viikko nyt? (${start}–${end})`,
    description: `Juuri nyt on viikko ${week} vuonna ${year}. Viikko alkaa ${start} ja päättyy ${end}. Ilmainen viikkolaskuri näyttää kuluvan viikkonumeron ISO 8601 -standardin mukaan.`,
  };
}

export const routeMeta = {
  "/": {
    title: "viikkonro.fi | Mikä viikko nyt on?",
    // Replaced at build time with homeMeta(); kept as a safe fallback.
    description:
      "Katso heti mikä viikko nyt on. Ilmainen viikkolaskuri näyttää kuluvan viikkonumeron ja laskee minkä tahansa päivän viikon ISO 8601 -standardin mukaan.",
  },
  "/what-is-a-week-number": {
    title: "Mikä on viikkonumero? ISO 8601 selitettynä | Viikko Nro",
    description:
      "Mikä on viikkonumero ja miten se lasketaan? Selitämme ISO 8601 -standardin, viikon alkamisen maanantaista ja miten vuoden ensimmäinen viikko määräytyy.",
    breadcrumb: "Mikä on viikkonumero",
  },
  "/weeks-in-a-year": {
    title: "Kuinka monta viikkoa vuodessa on? 52 vai 53 | Viikko Nro",
    description:
      "Vuodessa on 52 tai 53 viikkoa. Katso milloin vuodessa on 53 viikkoa ja mitkä vuodet – kuten 2020, 2026 ja 2032 – ovat 53 viikon vuosia.",
    breadcrumb: "Viikkoja vuodessa",
  },
  "/faq": {
    title: "Usein kysytyt kysymykset viikkonumeroista | Viikko Nro",
    description:
      "Vastauksia viikkonumeroista: mikä viikko nyt on, alkaako viikko maanantaista, kuinka monta viikkoa vuodessa on ja miten viikkonumero lasketaan.",
    breadcrumb: "UKK",
  },
  "/about-us": {
    title: "Tietoa meistä | Viikko Nro",
    description:
      "Viikko Nro on ilmainen suomalainen viikkolaskuri. Lue lisää palvelusta ja tehtävästämme tehdä viikkonumeroiden tarkistamisesta helppoa.",
    breadcrumb: "Tietoa meistä",
  },
  "/contact-us": {
    title: "Ota yhteyttä | Viikko Nro",
    description:
      "Ota yhteyttä Viikko Nro -tiimiin verkkolomakkeella. Vastaamme palautteeseen, kysymyksiin ja kehitysehdotuksiin niin nopeasti kuin mahdollista.",
    breadcrumb: "Ota yhteyttä",
  },
  "/privacy-policy": {
    title: "Tietosuojaseloste | Viikko Nro",
    description:
      "Viikko Nro -palvelun tietosuojaseloste: mitä tietoja keräämme, miten käytämme niitä ja miten suojaamme yksityisyyttäsi.",
    breadcrumb: "Tietosuojaseloste",
  },
  "/terms-and-conditions": {
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
    title: "Työpäivälaskuri – työpäivät kahden päivän välillä | Viikko Nro",
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
    { path: "/what-is-a-week-number", changefreq: "monthly", priority: "0.8" },
    { path: "/weeks-in-a-year", changefreq: "monthly", priority: "0.8" },
    { path: "/faq", changefreq: "monthly", priority: "0.8" },
    { path: "/laskurit", changefreq: "monthly", priority: "0.7" },
    { path: "/paivamaara-viikoksi", changefreq: "monthly", priority: "0.7" },
    { path: "/viikko-paivamaaraksi", changefreq: "monthly", priority: "0.7" },
    { path: "/tyopaivalaskuri", changefreq: "monthly", priority: "0.7" },
    { path: "/paivien-erotus", changefreq: "monthly", priority: "0.7" },
    { path: "/about-us", changefreq: "yearly", priority: "0.4" },
    { path: "/contact-us", changefreq: "yearly", priority: "0.4" },
    { path: "/privacy-policy", changefreq: "yearly", priority: "0.3" },
    { path: "/terms-and-conditions", changefreq: "yearly", priority: "0.3" },
  ];
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
  }
  entries.push({ path: `/tulosta-${year}`, changefreq: "yearly", priority: "0.5" });
  return entries;
}

// Resolve any route to its meta for prerendering: static pages from routeMeta,
// the homepage with the live current-week title/description, or a generated
// dynamic page (week/month/year/print). Returns null for routes not prerendered.
export function metaFor(url) {
  if (url === "/") return { ...routeMeta["/"], ...homeMeta(new Date()) };
  if (routeMeta[url]) return routeMeta[url];
  let m;
  if ((m = url.match(/^\/viikko-(\d+)-(\d+)$/))) return weekMeta(+m[1], +m[2]);
  if ((m = url.match(/^\/kuukausi-(\d+)-(\d+)$/))) return monthMeta(+m[1], +m[2]);
  if ((m = url.match(/^\/vuosi-(\d+)$/))) return yearMeta(+m[1]);
  if ((m = url.match(/^\/tulosta-(\d+)$/))) return printMeta(+m[1]);
  if ((m = url.match(/^\/pyhapaivat-(\d+)$/))) return holidaysMeta(+m[1]);
  if ((m = url.match(/^\/tyopaivat-(\d+)$/))) return workingDaysMeta(+m[1]);
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
  if ((m = url.match(/^\/tyopaivat-(\d+)$/))) {
    return [
      home,
      { name: `Viikot ${m[1]}`, path: `/vuosi-${m[1]}` },
      { name: `Työpäivät ${m[1]}`, path: url },
    ];
  }
  return null;
}
