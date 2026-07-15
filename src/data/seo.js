// Per-route SEO metadata — the single source of truth used by prerender.js to
// give each static page its own <title>, <meta description>, Open Graph tags
// and a SELF-referencing canonical URL. Without this, every prerendered page
// would share the homepage's title + canonical, which tells search engines the
// subpages are duplicates of the homepage and suppresses their indexing.

import { isoWeek, isoYear, mondayOf, formatLong } from "../components/dateUtils.js";

export const SITE_URL = "https://viikkonro.fi";

// The home description names the CURRENT week and the Monday it starts on, e.g.
// "Viikko 29 alkaa maanantaina 13. heinäkuuta 2026. …". It is computed at build
// time by prerender.js, and the deploy workflow rebuilds every Monday so the
// week stays correct. An ISO week always starts on Monday, hence "maanantaina".
export function homeDescription(now = new Date()) {
  const week = isoWeek(now);
  const year = isoYear(now);
  const monday = mondayOf(week, year);
  return `Viikko ${week} alkaa maanantaina ${formatLong(monday)}. Tarkista kuluvan viikon numero ja etsi päivämäärien tai viikkojen mukaan osoitteessa Viikkonro.fi.`;
}

export const routeMeta = {
  "/": {
    title: "viikkonro.fi | Mikä viikko nyt on?",
    // Replaced at build time with homeDescription(); kept as a safe fallback.
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
      "Ota yhteyttä Viikko Nro -tiimiin. Lähetä meille viesti palautetta, kysymyksiä tai ehdotuksia varten.",
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
      "Viikko Nro -palvelun käyttöehdot ja vastuuvapauslauseke.",
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
    entries.push({
      path: `/year/${y}`,
      changefreq: y === year ? "weekly" : "yearly",
      priority: y === year ? "0.7" : "0.6",
    });
  }
  entries.push({ path: `/print/${year}`, changefreq: "yearly", priority: "0.5" });
  return entries;
}
