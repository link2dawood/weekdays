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
    title: "Mikä viikko nyt on? · Viikkonumero ja viikkolaskuri",
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
    { path: "/about-us", changefreq: "yearly", priority: "0.4" },
    { path: "/contact-us", changefreq: "yearly", priority: "0.4" },
    { path: "/privacy-policy", changefreq: "yearly", priority: "0.3" },
    { path: "/terms-and-conditions", changefreq: "yearly", priority: "0.3" },
  ];
  for (let y = year - 1; y <= year + 1; y++) {
    const current = y === year;
    entries.push({
      path: `/year/${y}`,
      changefreq: current ? "weekly" : "yearly",
      priority: current ? "0.7" : "0.6",
    });
    for (let w = 1; w <= weeksInIsoYear(y); w++) {
      entries.push({
        path: `/week/${w}/${y}`,
        changefreq: current ? "weekly" : "yearly",
        priority: current ? "0.6" : "0.4",
      });
    }
    for (let m = 1; m <= 12; m++) {
      entries.push({
        path: `/month/${m}/${y}`,
        changefreq: current ? "monthly" : "yearly",
        priority: current ? "0.6" : "0.4",
      });
    }
  }
  entries.push({ path: `/print/${year}`, changefreq: "yearly", priority: "0.5" });
  return entries;
}
