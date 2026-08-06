// Post-build prerendering: renders every route in sitemapEntries() (not just
// static pages, but every /viikko-*, /kuukausi-*, /vuosi-*, /kalenteri-* etc.
// across the rolling 2020..currentYear+9 horizon) to real HTML and writes it
// into dist/<route>.html. This makes full page text (headings, FAQ, article
// copy, per-week/month/year facts) crawlable by search + AI/generative engines
// even when they don't run JavaScript — while the client still hydrates into
// the normal SPA. Vercel has no rewrites configured (see vercel.json), so any
// path outside this prerendered horizon isn't a client-rendered SPA guess —
// it's a real 404 (Vercel's static-output convention of serving dist/404.html,
// written near the bottom of this file).
//
// No headless browser is used, so the build stays fast and small.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import React from "react";
import { ImageResponse } from "@vercel/og";
import {
  metaFor,
  canonicalFor,
  SITE_URL,
  sitemapEntries,
  breadcrumbTrail,
  calendarFaqs,
  calendarMeta,
  CONTENT_UPDATED,
  mondayOf,
  monthFaqs,
  monthlyWorkingDayFaqs,
  monthStats,
  quarterFaqs,
  quarterStats,
  workingDaysFaqs,
  yearFaqs,
  yearStats,
} from "./src/data/seo.js";
import { faqs, faqCategories, featuredFaqs } from "./src/data/faqs.js";
import {
  fmtShortFi,
  getWeekdayName,
  isoWeek,
  isoYear,
  quarterOf,
  seasonIndexOf,
  SEASON_KEYS_EN,
  weeksInIsoYear,
  M_FULL,
  M_SLUG,
  PRERENDER_MIN_YEAR,
  PRERENDER_MAX_YEAR,
} from "./src/components/dateUtils.js";
import { holidaysInYear } from "./src/data/holidays.js";
import { flagDayFaqs, flagDaysInYear } from "./src/data/flagDayPages.js";
import {
  holidayFaqs,
  holidayLinkPath,
  holidayPageFor,
  holidayPageMeta,
  holidayWeekLinks,
} from "./src/data/holidayPages.js";
import {
  nameDayDateMeta,
  nameDayDatePage,
  nameDayFaqs,
  nameDayNameMeta,
  nameDayNamePage,
  todayNameDayMeta,
  todayNameDayPage,
} from "./src/data/nameDayPages.js";
import { weeksInYearFaqs } from "./src/data/weeksInYearContent.js";
import {
  whatWeekFaqs,
  weekStartsMondayFaqs,
} from "./src/data/isoWeekContent.js";
import { finlandVsUsaFaqs } from "./src/data/finlandVsUsaContent.js";
import {
  printableCalendarFaqs,
  printListFaqs,
} from "./src/data/printCalendarContent.js";
import {
  SCHOOL_HOLIDAY_SOURCES,
  schoolHolidayFaqs,
  schoolHolidayPage,
} from "./src/data/schoolHolidayPages.js";
import {
  currentMonthFaqs,
  currentMonthMeta,
  currentYearFaqs,
  currentYearMeta,
  weekdayFaqs,
  weekdayMeta,
} from "./src/data/currentDateContent.js";
import { englishFaqs } from "./src/data/englishContent.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "dist");
const serverDir = path.resolve(__dirname, "dist-server");

// Prerender EVERY URL in the sitemap, not just the static pages. The
// week/month/year pages are content-rich (holidays, name days, sun times,
// per-day details) — they just weren't prerendered, so crawlers saw the SPA
// home shell and treated ~200 URLs as duplicates of the homepage. Rendering
// them gives each unique, indexable HTML that matches its sitemap entry.
const currentYear = new Date().getFullYear();
const sitemapRoutes = sitemapEntries(currentYear).map((e) => e.path);
// Keep the honest noindex fallback available even while today's date is not
// covered by the partial seed. It joins the sitemap automatically once the
// authorized full dataset supplies names for the current date.
const routes = [...new Set([...sitemapRoutes, "/nimipaivat/tanaan"])];

// Indexable window: keep the high-intent recent + near-future years in Google's
// index and noindex the long tail, so ~1,100 near-identical template pages
// across 16 years don't become the site's dominant "content at scale" signal
// (which caps a thin calculator site's ranking). Rolling currentYear-2 ..
// currentYear+4 = 2024..2030 today. Out-of-window pages are still prerendered
// (so they stay navigable) but carry noindex and are dropped from the sitemap.
const INDEX_MIN_YEAR = currentYear - 2;
const INDEX_MAX_YEAR = currentYear + 4;
const isIndexable = (p) => {
  // Named-holiday pages are the deliberately expanded content cluster: all
  // 15 holidays across the complete 2020..current+9 publishing horizon are
  // indexable and included in the sitemap.
  if (/^\/pyhat-\d{4}\/[a-z0-9-]+$/.test(p)) return true;
  const m = p.match(/-(\d{4})(?:-(?:alkuvuosi|loppuvuosi))?$/);
  if (!m) return true; // static pages have no year → always indexable
  const y = Number(m[1]);
  return y >= INDEX_MIN_YEAR && y <= INDEX_MAX_YEAR;
};

let template = fs.readFileSync(path.join(distDir, "index.html"), "utf-8");

// The three site-wide entities are authored in index.html, but every
// prerendered page needs them in the same graph as its page entity. Extracting
// them avoids maintaining a second copy while leaving one JSON-LD block per
// generated document.
const globalJsonLdMatch = template.match(
  /<script type="application\/ld\+json">([\s\S]*?)<\/script>/,
);
if (!globalJsonLdMatch) throw new Error("global JSON-LD graph missing from index.html");
const globalJsonLd = JSON.parse(globalJsonLdMatch[1]);
const globalJsonLdNodes = globalJsonLd["@graph"];
template = template.replace(globalJsonLdMatch[0], "");

// Inline the render-blocking stylesheet into <head> so the first paint doesn't
// wait on a separate CSS request — every prerendered page ships its styles
// inline. The client SPA doesn't re-fetch CSS on route changes, so the tradeoff
// (styles not shared-cached across pages) only costs the first page load.
template = template.replace(
  /<link\b[^>]*\bhref="(\/assets\/[^"]+\.css)"[^>]*>/g,
  (_m, href) => {
    const css = fs.readFileSync(path.join(distDir, href.slice(1)), "utf-8");
    return `<style>${css}</style>`;
  },
);

// pathToFileURL is required on Windows: a bare "C:\..." path passed to
// import() is misparsed as a URL with scheme "c", not a filesystem path.
const { render } = await import(
  pathToFileURL(path.join(serverDir, "entry-server.js")).href
);

const escapeAttr = (s) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Give a page its own title, description, canonical and Open Graph/Twitter tags.
// Whitespace-tolerant so it works whether Vite keeps the tags multi-line or not.
function applyMeta(html, { title, description, url }) {
  const t = escapeAttr(title);
  const d = escapeAttr(description);
  const u = escapeAttr(url);
  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${t}</title>`)
    .replace(
      /<meta\s+name="description"[^>]*>/,
      `<meta name="description" content="${d}" />`,
    )
    .replace(
      /<link\s+rel="canonical"[^>]*>/,
      `<link rel="canonical" href="${u}" />`,
    )
    .replace(
      /<meta\s+property="og:title"[^>]*>/,
      `<meta property="og:title" content="${t}" />`,
    )
    .replace(
      /<meta\s+property="og:description"[^>]*>/,
      `<meta property="og:description" content="${d}" />`,
    )
    .replace(
      /<meta\s+property="og:url"[^>]*>/,
      `<meta property="og:url" content="${u}" />`,
    )
    .replace(
      /<meta\s+name="twitter:title"[^>]*>/,
      `<meta name="twitter:title" content="${t}" />`,
    )
    .replace(
      /<meta\s+name="twitter:description"[^>]*>/,
      `<meta name="twitter:description" content="${d}" />`,
    );
}

// Every page node points back to the shared site and publisher entities, so a
// parser can traverse the document graph without guessing entity identity.
function pageNode(url, type = "WebPage", extra = {}) {
  const canonical = canonicalFor(url);
  const trail = breadcrumbTrail(url);
  return {
    "@type": type,
    "@id": `${canonical}#webpage`,
    url: canonical,
    name: metaFor(url).title.replace(/\s*\|\s*Viikko Nro$/, ""),
    isPartOf: { "@id": `${SITE_URL}/#website` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "fi-FI",
    ...(trail && trail.length >= 2 ? { breadcrumb: { "@id": `${canonical}#breadcrumb` } } : {}),
    ...extra,
  };
}

// Speakable targets ONLY the single rendered sentence that states the page's
// direct answer, via the ".answer-sentence" class added around that exact
// text in the matching JSX (WeekDays.jsx, WorkingDays.jsx; named-holiday
// pages are handled inline in namedHolidayNodes, which builds its own
// WebPage node above). Scoped to just these two URL shapes rather than the
// generic fallback pageNode() every page gets, because month/year/calendar
// pages don't have one unambiguous single-sentence answer the way these do.
function speakableExtra(url) {
  if (
    /^\/viikko-\d+-\d+$/.test(url) ||
    /^\/tyopaivat-\d+$/.test(url)
  ) {
    return {
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: [".answer-sentence"],
      },
    };
  }
  return {};
}

// Week -> Holiday structured-data links (the other half of the bidirectional
// linking system — namedHolidayNodes() above handles Holiday -> Week/Month).
// Reuses holidaysInWeekForPrerender() (already computed for weekFaqNodes())
// and holidayLinkPath() (already used by WeekDays.jsx's visible holiday
// mentions), so this can't reference a holiday page that isn't also linked
// in the rendered HTML, or vice versa.
function weekHolidayMentionsExtra(url) {
  const m = url.match(/^\/viikko-(\d+)-(\d+)$/);
  if (!m) return {};
  const officialHolidays = holidaysInWeekForPrerender(+m[2], +m[1]).filter((h) => h.official);
  const mentions = officialHolidays
    .map((h) => holidayLinkPath(h.name, h.date))
    .filter(Boolean)
    .map((path) => ({ "@id": `${canonicalFor(path)}#webpage` }));
  return mentions.length > 0 ? { mentions } : {};
}

// Reusable schema.org/Dataset builder — every dataset below (one per page
// type that has a real /data/* feed backing it) is one call to this instead
// of a hand-repeated object literal, so creator/publisher/license/language
// can't drift between them and adding a 7th (or 8th) family is a single
// call, not a copy-pasted block. `distributionUrl` accepts either one URL
// or an array, since one dataset (workingDay) legitimately has no feed
// family of its own and distributes via two existing ones instead of
// inventing a URL that isn't real.
function datasetSchema({ id, name, description, distributionUrl, temporalCoverage, license, dateModified }) {
  const urls = Array.isArray(distributionUrl) ? distributionUrl : [distributionUrl];
  return {
    "@type": "Dataset",
    "@id": `${SITE_URL}/#dataset-${id}`,
    name,
    description,
    creator: { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    license,
    dateModified,
    inLanguage: "fi-FI",
    temporalCoverage,
    distribution: urls.map((contentUrl) => ({
      "@type": "DataDownload",
      contentUrl,
      encodingFormat: "application/json",
    })),
  };
}

// schema.org/Dataset description of the static JSON feeds generated under
// /data/* below (STEP 2). Each dataset's distribution points at that family's
// manifest file (a real, complete list of every generated URL — see the feed
// generation block near the end of this file), not a single example file, so
// the contentUrl is an honest description of "the whole dataset" rather than
// one arbitrary row of it. "Update frequency" has no dedicated schema.org
// Dataset property (checked against Google's supported Dataset fields before
// writing this — there isn't one), so it's stated in plain language inside
// `description` instead of invented as a non-standard JSON-LD key.
function datasetNodes() {
  const temporalCoverage = `2020-01-01/${currentYear + 9}-12-31`;
  const license = `${SITE_URL}/kayttoehdot`;
  const common = { temporalCoverage, license, dateModified: CONTENT_UPDATED };

  const weekDataset = datasetSchema({
    ...common,
    id: "week",
    name: "Suomen ISO 8601 -viikkonumerodata",
    description:
      "Koneluettava JSON-data jokaiselle ISO 8601 -viikolle Suomessa: alkamis- ja päättymispäivä, työpäivien määrä, juhlapyhät, vuosineljännes ja vuodenaika. Päivittyy kerran vuorokaudessa.",
    distributionUrl: `${SITE_URL}/data/week/index.json`,
  });
  const monthDataset = datasetSchema({
    ...common,
    id: "month",
    name: "Suomen kuukausittainen viikkodata",
    description:
      "Koneluettava JSON-data jokaiselle kalenterikuukaudelle Suomessa: kuukauden sisältämät ISO-viikot, työpäivien ja viikonloppupäivien määrä sekä arkipyhät. Päivittyy kerran vuorokaudessa.",
    distributionUrl: `${SITE_URL}/data/month/index.json`,
  });
  const yearDataset = datasetSchema({
    ...common,
    id: "year",
    name: "Suomen vuosittainen viikko- ja työpäivädata",
    description:
      "Koneluettava JSON-data jokaiselle vuodelle Suomessa: viikkojen määrä (52 tai 53), työpäivien ja viikonloppupäivien määrä, arkipyhät sekä vuoden ensimmäinen ja viimeinen ISO-viikko. Päivittyy kerran vuorokaudessa.",
    distributionUrl: `${SITE_URL}/data/year/index.json`,
  });
  const quarterDataset = datasetSchema({
    ...common,
    id: "quarter",
    name: "Suomen vuosineljännesdata",
    description:
      "Koneluettava JSON-data jokaiselle vuosineljännekselle (Q1-Q4): alkamis- ja päättymispäivä, kuukaudet, viikkoväli, työpäivien ja viikonloppupäivien määrä sekä arkipyhät. Päivittyy kerran vuorokaudessa.",
    distributionUrl: `${SITE_URL}/data/quarter/index.json`,
  });
  const holidayDataset = datasetSchema({
    ...common,
    id: "holidays",
    name: "Suomen pyhäpäivädata",
    description:
      "Koneluettava JSON-data Suomen virallisista pyhäpäivistä ja laajasti vietetyistä vapaapäivistä: nimi, päivämäärä, viikonpäivä, ISO-viikko ja virallinen asema jokaiselle vuodelle. Päivittyy kerran vuorokaudessa.",
    distributionUrl: `${SITE_URL}/data/holidays/index.json`,
  });
  // No feed family of its own — workingDays/weekendDays already live inside
  // the week and year feeds, so this distributes via both rather than
  // inventing a fifth endpoint. The month-level granularity is covered
  // separately by monthlyWorkingDaysDataset below, which does have its own
  // feed family.
  const workingDayDataset = datasetSchema({
    ...common,
    id: "workingdays",
    name: "Suomen työpäivädata",
    description:
      "Koneluettava JSON-data työpäivien, viikonloppupäivien ja arkipyhien määristä viikko- ja vuositasolla Suomessa, arkipyhien vaikutus työpäivien määrään huomioiden. Päivittyy kerran vuorokaudessa.",
    distributionUrl: [`${SITE_URL}/data/week/index.json`, `${SITE_URL}/data/year/index.json`],
  });
  const monthlyWorkingDaysDataset = datasetSchema({
    ...common,
    id: "monthly-workingdays",
    name: "Suomen kuukausittainen työpäivädata",
    description:
      "Koneluettava JSON-data työpäivien ja viikonloppupäivien määrästä kuukausitasolla Suomessa, arkipyhät huomioiden. Päivittyy kerran vuorokaudessa.",
    distributionUrl: `${SITE_URL}/data/monthly-working-days/index.json`,
  });

  return [
    weekDataset,
    monthDataset,
    yearDataset,
    quarterDataset,
    holidayDataset,
    workingDayDataset,
    monthlyWorkingDaysDataset,
  ];
}

function jsonLdBlock(nodes) {
  const data = {
    "@context": "https://schema.org",
    "@graph": nodes,
  };
  // Escape "<" so a string value containing "</script>" can never terminate
  // this tag early — JSON.stringify only escapes quotes/backslashes/control
  // chars, not "<". < is valid inside a JSON string and decodes back to
  // "<" for every consumer (browsers, schema validators), so this is lossless.
  const json = JSON.stringify(data, null, 2).replace(/</g, "\\u003c");
  return `<script type="application/ld+json">\n${json}\n    </script>\n  `;
}

function breadcrumbNode(url) {
  const trail = breadcrumbTrail(url);
  if (!trail || trail.length < 2) return null;
  return {
    "@type": "BreadcrumbList",
    "@id": `${canonicalFor(url)}#breadcrumb`,
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: canonicalFor(t.path),
    })),
  };
}

// FAQPage structured data generated from src/data/faqs.js. Injected only on
// /ukk, whose visible list matches it exactly (Google requires the two agree).
function faqNodes() {
  return [{
    "@type": "FAQPage",
    "@id": `${SITE_URL}/ukk#faq`,
    inLanguage: "fi-FI",
    dateModified: CONTENT_UPDATED,
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }];
}

// The homepage renders only the curated featured questions. Keep this as a
// separate FAQPage entity so its structured data matches exactly what users
// can expand on that page instead of claiming all /ukk answers are present.
function homepageFaqNodes() {
  return [{
    "@type": "FAQPage",
    "@id": `${SITE_URL}/#faq`,
    inLanguage: "fi-FI",
    dateModified: CONTENT_UPDATED,
    mainEntity: featuredFaqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  }];
}

function englishPageNodes() {
  const url = canonicalFor("/en");
  const meta = metaFor("/en");
  return [
      pageNode("/en", "WebPage", {
        name: "What is the current week number?",
        description: meta.description,
        inLanguage: "en",
        datePublished: "2026-08-04",
        dateModified: CONTENT_UPDATED,
      }),
      {
        "@type": "FAQPage",
        "@id": url + "#faq",
        inLanguage: "en",
        dateModified: CONTENT_UPDATED,
        mainEntity: englishFaqs.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ];
}

function languageAlternateLinks(url) {
  if (["/", "/en"].includes(url)) {
    return (
      '<link rel="alternate" hreflang="fi" href="' + canonicalFor("/") + '" />' +
      '<link rel="alternate" hreflang="en" href="' + canonicalFor("/en") + '" />' +
      '<link rel="alternate" hreflang="x-default" href="' + canonicalFor("/") + '" />'
    );
  }
  return "";
}

// Declares each week/year/holidays page's JSON twin the same way an RSS feed
// is declared — a standard <link rel="alternate"> pointer, not a new
// discovery mechanism — so an agent that has already fetched the HTML page
// can find its machine-readable equivalent without guessing the /data/ URL
// pattern. Deliberately scoped to exactly the three route families STEP 2
// generates feeds for.
function jsonFeedAlternateLink(url) {
  let m;
  if ((m = url.match(/^\/viikko-(\d+)-(\d+)$/))) {
    return `<link rel="alternate" type="application/json" href="${SITE_URL}/data/week/${m[2]}/${m[1]}.json" />`;
  }
  if ((m = url.match(/^\/vuosi-(\d+)$/))) {
    return `<link rel="alternate" type="application/json" href="${SITE_URL}/data/year/${m[1]}.json" />`;
  }
  if ((m = url.match(/^\/pyhapaivat-(\d+)$/))) {
    return `<link rel="alternate" type="application/json" href="${SITE_URL}/data/holidays/${m[1]}.json" />`;
  }
  if ((m = url.match(/^\/q([1-4])-(\d+)$/))) {
    return `<link rel="alternate" type="application/json" href="${SITE_URL}/data/quarter/${m[2]}/${m[1]}.json" />`;
  }
  if ((m = url.match(/^\/tyopaivat-([a-z]+)-(\d+)$/))) {
    const mi = M_SLUG.indexOf(m[1]);
    if (mi === -1) return "";
    return `<link rel="alternate" type="application/json" href="${SITE_URL}/data/monthly-working-days/${m[2]}/${mi + 1}.json" />`;
  }
  if ((m = url.match(/^\/kuukausi-(\d+)-(\d+)$/))) {
    return `<link rel="alternate" type="application/json" href="${SITE_URL}/data/month/${m[2]}/${m[1]}.json" />`;
  }
  return "";
}

function currentDateIntentNodes(url) {
  const now = new Date();
  const configs = {
    "/mika-kuukausi-nyt": {
      headline: "Mikä kuukausi nyt on?",
      meta: currentMonthMeta(now),
      faq: currentMonthFaqs(now),
    },
    "/mika-vuosi-nyt": {
      headline: "Mikä vuosi nyt on?",
      meta: currentYearMeta(now),
      faq: currentYearFaqs(now),
    },
    "/viikonpaiva": {
      headline: "Mikä viikonpäivä oli?",
      meta: weekdayMeta,
      faq: weekdayFaqs,
      steps: [
        "Valitse päivämäärä kentästä.",
        "Lue tuloksesta viikonpäivä suomeksi.",
        "Tarkista samalla päivän ISO-viikkonumero ja viikkovuosi.",
      ],
    },
  };
  const config = configs[url];
  if (!config) return [];
  const canonical = canonicalFor(url);
  const graph = [
    pageNode(url, "WebPage", {
      name: config.headline,
      description: config.meta.description,
      datePublished: "2026-08-04",
      dateModified: CONTENT_UPDATED,
    }),
    {
      "@type": "Article",
      "@id": canonical + "#article",
      headline: config.headline,
      description: config.meta.description,
      inLanguage: "fi-FI",
      datePublished: "2026-08-04",
      dateModified: CONTENT_UPDATED,
      author: { "@id": SITE_URL + "/#organization" },
      publisher: { "@id": SITE_URL + "/#organization" },
      mainEntityOfPage: { "@id": canonical + "#webpage" },
    },
    {
      "@type": "FAQPage",
      "@id": canonical + "#faq",
      inLanguage: "fi-FI",
      dateModified: CONTENT_UPDATED,
      mainEntity: config.faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ];
  if (config.steps) {
    graph.push({
      "@type": "HowTo",
      "@id": canonical + "#howto",
      name: "Näin selvität päivämäärän viikonpäivän",
      dateModified: CONTENT_UPDATED,
      step: config.steps.map((item, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        text: item,
      })),
    });
  }
  return graph;
}

// Article + FAQPage structured data for the /mika-on-viikkonumero explainer.
// BreadcrumbList is added separately, so it is not repeated
// here. The FAQ entries mirror the page's visible <details> list exactly.
function mikaOnViikkonumeroNodes() {
  const faq = whatWeekFaqs;
  const url = canonicalFor("/mika-on-viikkonumero");
  const meta = metaFor("/mika-on-viikkonumero");
  return [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: "Mikä on viikkonumero? ISO 8601 -viikkolaskenta selitettynä",
        description: meta.description,
        inLanguage: "fi-FI",
        datePublished: "2026-01-01",
        dateModified: CONTENT_UPDATED,
        author: { "@id": `${SITE_URL}/#organization` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        mainEntityOfPage: { "@id": `${url}#webpage` },
        about: [
          { "@type": "Thing", name: "ISO 8601" },
          { "@type": "Thing", name: "Viikkonumero" },
          { "@type": "Thing", name: "Kalenteri" },
        ],
      },
      pageNode("/mika-on-viikkonumero", "WebPage", {
        description: meta.description,
        datePublished: "2026-01-01",
        dateModified: CONTENT_UPDATED,
        mainEntity: { "@id": `${url}#article` },
      }),
      {
        "@type": "FAQPage",
        "@id": `${SITE_URL}/mika-on-viikkonumero#faq`,
        inLanguage: "fi-FI",
        dateModified: CONTENT_UPDATED,
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
      {
        "@type": "HowTo",
        "@id": `${url}#howto`,
        name: "Näin lasket viikkonumeron käsin",
        description:
          "Kolmen vaiheen menetelmä päivämäärän ISO 8601 -viikkonumeron laskemiseen.",
        inLanguage: "fi-FI",
        mainEntityOfPage: { "@id": `${url}#webpage` },
        step: [
          "Etsi tarkasteltavan päivän sisältävän viikon torstai.",
          "Katso, mihin vuoteen torstai kuuluu – se on ISO-viikkovuosi.",
          "Laske, kuinka mones torstai se on kyseisenä vuonna – se on viikkonumero.",
        ].map((text, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          text,
        })),
      },
    ];
}

function weekStartsMondayNodes() {
  const path = "/viikko-alkaa-maanantaista";
  const url = canonicalFor(path);
  const meta = metaFor(path);
  return [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: "Miksi viikko alkaa maanantaista?",
        description: meta.description,
        inLanguage: "fi-FI",
        datePublished: "2026-08-04",
        dateModified: CONTENT_UPDATED,
        author: { "@id": `${SITE_URL}/#organization` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        mainEntityOfPage: { "@id": `${url}#webpage` },
        about: [
          { "@type": "Thing", name: "ISO 8601" },
          { "@type": "Thing", name: "Viikon ensimmäinen päivä" },
          { "@type": "Thing", name: "ISO-viikkovuosi" },
        ],
      },
      pageNode(path, "WebPage", {
        description: meta.description,
        datePublished: "2026-08-04",
        dateModified: CONTENT_UPDATED,
        mainEntity: { "@id": `${url}#article` },
      }),
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        inLanguage: "fi-FI",
        datePublished: "2026-08-04",
        dateModified: CONTENT_UPDATED,
        mainEntity: weekStartsMondayFaqs.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ];
}

// Article + WebPage + FAQPage for /suomi-vs-usa-viikkonumerot — same shape as
// weekStartsMondayNodes() above, including its own explicit pageNode() (not
// the generic fallback) so the Article <-> WebPage reference is reciprocal.
// Speakable is set directly here, same as namedHolidayNodes()'s own pageNode.
function finlandVsUsaNodes() {
  const path = "/suomi-vs-usa-viikkonumerot";
  const url = canonicalFor(path);
  const meta = metaFor(path);
  const faq = finlandVsUsaFaqs();
  return [
    {
      "@type": "Article",
      "@id": `${url}#article`,
      headline: "Suomi vs. USA: miksi viikkonumero eroaa?",
      description: meta.description,
      inLanguage: "fi-FI",
      datePublished: "2026-08-05",
      dateModified: CONTENT_UPDATED,
      author: { "@id": `${SITE_URL}/#organization` },
      publisher: { "@id": `${SITE_URL}/#organization` },
      mainEntityOfPage: { "@id": `${url}#webpage` },
      about: [
        { "@type": "Thing", name: "ISO 8601" },
        { "@type": "Thing", name: "Viikkonumero" },
        { "@type": "Thing", name: "Yhdysvaltain viikkonumerointi" },
      ],
    },
    pageNode(path, "WebPage", {
      description: meta.description,
      datePublished: "2026-08-05",
      dateModified: CONTENT_UPDATED,
      mainEntity: { "@id": `${url}#article` },
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: [".answer-sentence"],
      },
    }),
    {
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      inLanguage: "fi-FI",
      datePublished: "2026-08-05",
      dateModified: CONTENT_UPDATED,
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ];
}

function printIntentNodes(pathname) {
  const listMatch = pathname.match(/^\/tulosta-(\d+)$/);
  const calendarMatch = pathname.match(/^\/tulostettava-kalenteri-(\d+)$/);
  if (!listMatch && !calendarMatch) return [];

  const year = Number((listMatch || calendarMatch)[1]);
  const faqsForPage = listMatch
    ? printListFaqs(year)
    : printableCalendarFaqs(year);
  const url = canonicalFor(pathname);
  const meta = metaFor(pathname);
  return [
      pageNode(pathname, "WebPage", {
        description: meta.description,
        datePublished: "2026-08-04",
        dateModified: CONTENT_UPDATED,
        author: { "@id": `${SITE_URL}/#organization` },
        mainEntity: { "@id": `${url}#faq` },
      }),
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        inLanguage: "fi-FI",
        datePublished: "2026-08-04",
        dateModified: CONTENT_UPDATED,
        mainEntity: faqsForPage.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ];
}

function schoolHolidayNodes(year) {
  const pathname = `/koululomat-${year}`;
  const url = canonicalFor(pathname);
  const meta = metaFor(pathname);
  const page = schoolHolidayPage(year);
  if (!meta || !page) return [];
  const faq = schoolHolidayFaqs(year);
  const citations = page.sourceKeys.map(
    (key) => SCHOOL_HOLIDAY_SOURCES[key].url,
  );
  return [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: `Koululomat ${year} – hiihto- ja syyslomat`,
        description: meta.description,
        inLanguage: "fi-FI",
        datePublished: "2026-08-04",
        dateModified: CONTENT_UPDATED,
        author: { "@id": `${SITE_URL}/#organization` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        mainEntityOfPage: { "@id": `${url}#webpage` },
        citation: citations,
        about: [
          { "@type": "Thing", name: `Koululomat ${year}` },
          { "@type": "Thing", name: "Hiihtoloma" },
          { "@type": "Thing", name: "Syysloma" },
        ],
      },
      pageNode(pathname, "WebPage", {
        description: meta.description,
        datePublished: "2026-08-04",
        dateModified: CONTENT_UPDATED,
        mainEntity: { "@id": `${url}#article` },
      }),
      // STEP 7 safeguard: even though a non-CONFIRMED page never reaches this
      // function (schoolHolidayMeta() sets robots:"noindex" for it, which
      // the dispatch loop's isIndexable/meta.robots check already skips this
      // whole function for), don't ALSO rely on that being the only gate —
      // schoolHolidayFaqs() itself returns [] for anything but Tier A, so
      // skip emitting an empty FAQPage rather than trust a single check.
      ...(faq.length > 0
        ? [
            {
              "@type": "FAQPage",
              "@id": `${url}#faq`,
              inLanguage: "fi-FI",
              datePublished: "2026-08-04",
              dateModified: CONTENT_UPDATED,
              mainEntity: faq.map((item) => ({
                "@type": "Question",
                name: item.q,
                acceptedAnswer: { "@type": "Answer", text: item.a },
              })),
            },
          ]
        : []),
    ];
}

// Article + FAQPage data for the expanded weeks-per-year explainer. FAQs are
// shared with the visible page so schema and rendered answers stay identical.
function weeksInYearNodes() {
  const url = canonicalFor("/kuinka-monta-viikkoa-vuodessa");
  const meta = metaFor("/kuinka-monta-viikkoa-vuodessa");
  const faq = weeksInYearFaqs(currentYear);
  return [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: "Kuinka monta viikkoa vuodessa on?",
        description: meta.description,
        inLanguage: "fi-FI",
        datePublished: "2026-01-01",
        dateModified: CONTENT_UPDATED,
        author: { "@id": `${SITE_URL}/#organization` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        mainEntityOfPage: { "@id": `${url}#webpage` },
        about: [
          { "@type": "Thing", name: "ISO 8601" },
          { "@type": "Thing", name: "Viikkovuosi" },
          { "@type": "Thing", name: "Viikko 53" },
        ],
      },
      pageNode("/kuinka-monta-viikkoa-vuodessa", "WebPage", {
        description: meta.description,
        datePublished: "2026-01-01",
        dateModified: CONTENT_UPDATED,
        mainEntity: { "@id": `${url}#article` },
      }),
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        inLanguage: "fi-FI",
        datePublished: "2026-01-01",
        dateModified: CONTENT_UPDATED,
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ];
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

// ISO date-only string ("2026-08-03") — shared by holidaysEventNodes()'s
// Event dates and the /data/* JSON feeds below, so both formats can never
// drift apart on the same date.
function ymd(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Event structured data for a year's public holidays, injected only on
// /pyhapaivat-<year>, whose visible table lists these same holidays with the
// same dates. "Country" is a valid schema.org Place subtype, so a national
// holiday can carry a real (if coarse) location without inventing a venue.
function holidaysEventNodes(year) {
  return [{
    "@type": "ItemList",
    "@id": `${SITE_URL}/pyhapaivat-${year}#events`,
    name: `Suomen pyhäpäivät ${year}`,
    itemListElement: holidaysInYear(year).map((h, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Event",
        name: h.name,
        startDate: ymd(h.date),
        endDate: ymd(h.date),
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: { "@type": "Country", name: "Suomi" },
        description: h.official
          ? "Suomen virallinen arkipyhä."
          : "Laajasti vietetty vapaapäivä Suomessa (ei virallinen arkipyhä).",
      },
    })),
  }];
}

// CollectionPage (STEP 6/7) + FAQPage + Speakable for /liputuspaivat-<year>.
// Bundled into one function like calendarPageNodes()/quarterNodes() above.
// Each flag day is an Event ListItem (same shape as holidaysEventNodes()
// above), inside a proper CollectionPage — an upgrade over the bare ItemList
// pyhapaivat-<year> uses, per this route's explicit CollectionPage
// requirement. Reuses flagDaysInYear()/flagDayFaqs() (flagDayPages.js), so
// this can't disagree with FlagDays.jsx's visible table.
function flagDayNodes(year) {
  const path = `/liputuspaivat-${year}`;
  const url = canonicalFor(path);
  const meta = metaFor(path);
  const days = flagDaysInYear(year);
  const faq = flagDayFaqs(year);

  const itemListElement = days.map((d, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "Event",
      name: d.name,
      startDate: ymd(d.date),
      endDate: ymd(d.date),
      eventStatus: "https://schema.org/EventScheduled",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      location: { "@type": "Country", name: "Suomi" },
      description: d.holidayOverlap
        ? `${d.categoryLabel}. Osuu samalle päivälle kuin ${d.holidayOverlap}.`
        : `${d.categoryLabel}.`,
    },
  }));

  return [
    pageNode(path, "CollectionPage", {
      name: `Suomen liputuspäivät ${year}`,
      description: meta.description,
      dateModified: CONTENT_UPDATED,
      author: { "@id": `${SITE_URL}/#organization` },
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: [".answer-sentence"],
      },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: itemListElement.length,
        itemListElement,
      },
    }),
    {
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      inLanguage: "fi-FI",
      dateModified: CONTENT_UPDATED,
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ];
}

// Holidays landing within ISO week `week` of ISO year `isoYearNum`.
function holidaysInWeekForPrerender(isoYearNum, week) {
  const monday = mondayOf(week, isoYearNum);
  const sunday = addDays(monday, 6);
  const years = new Set([monday.getFullYear(), sunday.getFullYear()]);
  const candidates = [...years].flatMap((y) => holidaysInYear(y));
  return candidates
    .filter((h) => h.date >= monday && h.date <= sunday)
    .sort((x, y) => x.date - y.date);
}

// Per-week FAQPage structured data for the ~835 /viikko-<w>-<y> pages — real,
// genuinely page-specific Q&As (this week's actual dates and holidays), not a
// copy-pasted template. Google has narrowed FAQ rich results to mostly
// authoritative/health/gov sites, so this is a GEO/AI-citation play (answer
// engines citing the exact page for "what week is 3.8.2026") rather than a
// rich-snippet bet — consistent with the llms.txt/ai.txt investment already
// in this repo. Mirrors the visible <details> list added to WeekDays.jsx.
function weekFaqNodes(w, y) {
  const mo = mondayOf(w, y);
  const su = addDays(mo, 6);
  const moStr = fmtShortFi(mo);
  const suStr = fmtShortFi(su);
  const officialHolidays = holidaysInWeekForPrerender(y, w).filter((h) => h.official);

  const faq = [
    [`Mikä viikko on ${moStr}?`, `${moStr} kuuluu viikkoon ${w} vuonna ${y}.`],
    [
      `Milloin viikko ${w} vuonna ${y} alkaa ja päättyy?`,
      `Viikko ${w} vuonna ${y} alkaa maanantaina ${moStr} ja päättyy sunnuntaina ${suStr}.`,
    ],
  ];
  if (officialHolidays.length > 0) {
    faq.push([
      `Mitä juhlapäiviä viikolla ${w} vuonna ${y} on?`,
      `Viikolla ${w} vuonna ${y} vietetään: ${officialHolidays.map((h) => h.name).join(", ")}.`,
    ]);
  }

  return [{
    "@type": "FAQPage",
    "@id": `${canonicalFor(`/viikko-${w}-${y}`)}#faq`,
    inLanguage: "fi-FI",
    dateModified: CONTENT_UPDATED,
    mainEntity: faq.map(([q, a]) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  }];
}

// FAQPage structured data for the /tyopaivat-<year> hub. The FAQ entries come
// from workingDaysFaqs() in seo.js — the same function WorkingDays.jsx will
// use to render its visible <details> list, so the two can't drift (same
// discipline as calendarFaqs()).
function workingDaysFaqNodes(year) {
  const faq = workingDaysFaqs(year);
  return [{
    "@type": "FAQPage",
    "@id": `${canonicalFor(`/tyopaivat-${year}`)}#faq`,
    inLanguage: "fi-FI",
    dateModified: CONTENT_UPDATED,
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  }];
}

// FAQPage structured data for /kuukausi-<month>-<year>. Deliberately separate
// from weekCollectionNodes() below, which already supplies this same URL's
// CollectionPage node (the month's week grid, as an ItemList) — the dispatch
// loop pushes both onto the same page's @graph rather than one function
// doing both jobs, since the two were built at different times against
// different, already-shipped patterns and neither needed touching to add the
// other. The FAQ entries come from monthFaqs() in seo.js, the same function
// WeeksInEachMonth.jsx uses to render its visible <details> list.
function monthFaqNodes(month, year) {
  const faq = monthFaqs(month, year);
  return [{
    "@type": "FAQPage",
    "@id": `${canonicalFor(`/kuukausi-${month}-${year}`)}#faq`,
    inLanguage: "fi-FI",
    dateModified: CONTENT_UPDATED,
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  }];
}

// FAQPage structured data for /vuosi-<year>. Deliberately separate from
// weekCollectionNodes() below, which already supplies this same URL's
// CollectionPage node (the year's week grid, as an ItemList) — same
// dispatch-loop split as monthFaqNodes()/weekCollectionNodes() above. The FAQ
// entries come from yearFaqs() in seo.js, the same function YearCalendar.jsx
// uses to render its visible <details> list.
function yearFaqNodes(year) {
  const faq = yearFaqs(year);
  return [{
    "@type": "FAQPage",
    "@id": `${canonicalFor(`/vuosi-${year}`)}#faq`,
    inLanguage: "fi-FI",
    dateModified: CONTENT_UPDATED,
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  }];
}

// CollectionPage (daily entries, STEP 6) + FAQPage + Speakable for a single
// month's working-day page (/tyopaivat-<slug>-<year>). Bundled into one
// function (like calendarPageNodes() above) rather than split across two
// dispatch-loop pushes, since — unlike weekCollectionNodes()/monthFaqNodes()
// — nothing else on the site shares this CollectionPage with another route.
// The FAQ entries come from monthlyWorkingDayFaqs() in seo.js, the same
// function MonthlyWorkingDays.jsx renders as its visible <details> list.
function monthlyWorkingDaysNodes(month, year) {
  const path = `/tyopaivat-${M_SLUG[month - 1]}-${year}`;
  const url = canonicalFor(path);
  const meta = metaFor(path);
  const faq = monthlyWorkingDayFaqs(month, year);
  const daysInMonth = new Date(year, month, 0).getDate();
  const officialHolidayByDay = new Map(
    holidaysInYear(year)
      .filter((h) => h.official && h.date.getMonth() === month - 1)
      .map((h) => [h.date.getDate(), h.name]),
  );
  const itemListElement = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dow = new Date(year, month - 1, day).getDay();
    const holidayName = officialHolidayByDay.get(day);
    const status = holidayName
      ? "Arkipyhä"
      : dow === 0 || dow === 6
        ? "Viikonloppu"
        : "Työpäivä";
    return {
      "@type": "ListItem",
      position: day,
      item: {
        "@type": "Thing",
        name: `${day}.${month}.${year}`,
        description: holidayName ? `${status}: ${holidayName}` : status,
      },
    };
  });

  return [
    pageNode(path, "CollectionPage", {
      description: meta.description,
      dateModified: CONTENT_UPDATED,
      author: { "@id": `${SITE_URL}/#organization` },
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: [".answer-sentence"],
      },
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: itemListElement.length,
        itemListElement,
      },
    }),
    {
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      inLanguage: "fi-FI",
      dateModified: CONTENT_UPDATED,
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ];
}

// CollectionPage (STEP 6: months as hasPart, weeks as the ItemList) + FAQPage
// + Speakable for a fiscal-quarter page (/q<1-4>-<year>). Bundled into one
// function like calendarPageNodes()/monthlyWorkingDaysNodes() above, since
// nothing else on the site shares a quarter's CollectionPage. Reuses
// quarterStats() (itself built from monthStats()) for both the week ItemList
// and the FAQ, so this can't disagree with QuarterPage.jsx's visible content.
function quarterNodes(quarter, year) {
  const path = `/q${quarter}-${year}`;
  const url = canonicalFor(path);
  const meta = metaFor(path);
  const stats = quarterStats(year, quarter);
  const faq = quarterFaqs(quarter, year);

  const hasPart = stats.months.map((m) => ({
    "@type": "WebPage",
    name: `${M_FULL[m - 1]} ${year}`,
    url: canonicalFor(`/kuukausi-${m}-${year}`),
  }));
  const itemListElement = stats.weeks.map((w, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: canonicalFor(`/viikko-${w.week}-${w.year}`),
  }));

  return [
    pageNode(path, "CollectionPage", {
      name: `Q${quarter} ${year}`,
      description: meta.description,
      dateModified: CONTENT_UPDATED,
      author: { "@id": `${SITE_URL}/#organization` },
      speakable: {
        "@type": "SpeakableSpecification",
        cssSelector: [".answer-sentence"],
      },
      hasPart,
      mainEntity: {
        "@type": "ItemList",
        numberOfItems: itemListElement.length,
        itemListElement,
      },
    }),
    {
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      inLanguage: "fi-FI",
      dateModified: CONTENT_UPDATED,
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ];
}

// CollectionPage + FAQPage data for the full /kalenteri-<year> landing pages.
// The FAQ entries come from the same source as the visible <details> list.
function calendarPageNodes(year) {
  const url = canonicalFor(`/kalenteri-${year}`);
  const meta = calendarMeta(year, null, false);
  const faq = calendarFaqs(year);
  return [
      pageNode(`/kalenteri-${year}`, "CollectionPage", {
        description: meta.description,
        datePublished: "2026-08-03",
        dateModified: CONTENT_UPDATED,
        author: { "@id": `${SITE_URL}/#organization` },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: 12,
          itemListElement: Array.from({ length: 12 }, (_, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: canonicalFor(`/kuukausi-${index + 1}-${year}`),
          })),
        },
      }),
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        inLanguage: "fi-FI",
        datePublished: "2026-08-03",
        dateModified: CONTENT_UPDATED,
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ];
}

// Year and month pages are directories of week pages, so CollectionPage with
// an ItemList describes their visible linked grids more accurately than a
// generic WebPage. Full calendar pages have their own richer function above.
function weekCollectionNodes(pathname) {
  let match = pathname.match(/^\/vuosi-(\d+)$/);
  let urls;
  let collectionName;
  let hasPart;
  let speakable;

  if (match) {
    const year = Number(match[1]);
    collectionName = `Viikkonumerot ${year}`;
    urls = Array.from(
      { length: weeksInIsoYear(year) },
      (_, index) => canonicalFor(`/viikko-${index + 1}-${year}`),
    );
    // The year page also links out to its 12 month pages (see YearCalendar.jsx's
    // month pill row) — surfaced here as hasPart WebPage stubs alongside the
    // week ItemList, rather than folding them into one mixed ItemList, so the
    // existing week-only mainEntity contract stays unchanged for any consumer.
    hasPart = M_FULL.map((name, index) => ({
      "@type": "WebPage",
      name: `${name} ${year}`,
      url: canonicalFor(`/kuukausi-${index + 1}-${year}`),
    }));
  } else {
    match = pathname.match(/^\/kuukausi-(\d+)-(\d+)$/);
    if (!match) return [];
    const month = Number(match[1]);
    const year = Number(match[2]);
    const seen = new Set();
    urls = [];
    const days = new Date(year, month, 0).getDate();
    for (let day = 1; day <= days; day += 1) {
      const date = new Date(year, month - 1, day);
      const weekYear = isoYear(date);
      const week = isoWeek(date);
      const key = `${weekYear}-${week}`;
      if (
        seen.has(key) ||
        weekYear < PRERENDER_MIN_YEAR ||
        weekYear > PRERENDER_MAX_YEAR
      ) {
        continue;
      }
      seen.add(key);
      urls.push(canonicalFor(`/viikko-${week}-${weekYear}`));
    }
    collectionName = metaFor(pathname).title;
    // Month pages carry a short factual summary sentence (WeeksInEachMonth.jsx's
    // .answer-sentence — "Kesäkuu 2026 sisältää N viikkoa: viikot X-Y.") that
    // year pages don't have an equivalent single crisp sentence for, so this
    // is scoped to just this branch, not both outcomes of the vuosi/kuukausi
    // split above.
    speakable = {
      "@type": "SpeakableSpecification",
      cssSelector: [".answer-sentence"],
    };
  }

  const meta = metaFor(pathname);
  return [pageNode(pathname, "CollectionPage", {
    name: collectionName,
    description: meta.description,
    dateModified: CONTENT_UPDATED,
    author: { "@id": `${SITE_URL}/#organization` },
    ...(hasPart ? { hasPart } : {}),
    ...(speakable ? { speakable } : {}),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: urls.length,
      itemListElement: urls.map((url, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url,
      })),
    },
  })];
}

// WebPage + Event + FAQPage data for each named-holiday landing page. The
// visible content, metadata and schema all use holidayPages.js, so dates and
// answers cannot drift between the three representations.
function namedHolidayNodes(year, slug) {
  const page = holidayPageFor(year, slug);
  if (!page) return [];
  const meta = holidayPageMeta(year, slug);
  const faq = holidayFaqs(page);
  const date = `${page.date.getFullYear()}-${String(page.date.getMonth() + 1).padStart(2, "0")}-${String(page.date.getDate()).padStart(2, "0")}`;
  const url = canonicalFor(page.path);
  // Holiday -> Week/Month structured-data links (bidirectional linking
  // system), built from the exact same helper NamedHoliday.jsx's visible
  // links use, so the schema and the page content can't disagree.
  const links = holidayWeekLinks(page);
  return [
      pageNode(page.path, "WebPage", {
        description: meta.description,
        datePublished: "2026-08-03",
        dateModified: CONTENT_UPDATED,
        author: { "@id": `${SITE_URL}/#organization` },
        mainEntity: { "@id": `${url}#event` },
        mentions: [
          { "@id": `${canonicalFor(links.week.path)}#webpage` },
          { "@id": `${canonicalFor(links.month.path)}#webpage` },
        ],
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: [".answer-sentence"],
        },
      }),
      {
        "@type": "Event",
        "@id": `${url}#event`,
        name: `${page.displayName} ${page.year}`,
        description: meta.description,
        startDate: date,
        endDate: date,
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        location: { "@type": "Country", name: "Suomi" },
        url,
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        inLanguage: "fi-FI",
        datePublished: "2026-08-03",
        dateModified: CONTENT_UPDATED,
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ];
}

function nameDayPageNodes(url) {
  let page;
  let meta;
  let type;
  let match;
  if (url === "/nimipaivat/tanaan") {
    page = todayNameDayPage();
    meta = todayNameDayMeta();
    type = "today";
  } else if ((match = url.match(/^\/nimipaiva\/([a-z0-9-]+)$/))) {
    page = nameDayNamePage(match[1]);
    meta = nameDayNameMeta(match[1]);
    type = "name";
  } else if ((match = url.match(/^\/nimipaivat\/(\d{2}-\d{2})$/))) {
    page = nameDayDatePage(match[1]);
    meta = nameDayDateMeta(match[1]);
    type = "date";
  }
  if (!page || !meta) return [];
  const faq = nameDayFaqs(page, type);
  const canonical = canonicalFor(url);
  return [
      pageNode(url, "WebPage", {
        description: meta.description,
        datePublished: "2026-08-04",
        dateModified: CONTENT_UPDATED,
        author: { "@id": `${SITE_URL}/#organization` },
      }),
      {
        "@type": "FAQPage",
        "@id": `${canonical}#faq`,
        inLanguage: "fi-FI",
        datePublished: "2026-08-04",
        dateModified: CONTENT_UPDATED,
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ];
}

// HowTo + FAQ structured data for the four calculator pages. Each FAQ entry
// mirrors that page's visible <details> list exactly (same convention as
// mikaOnViikkonumeroNodes above and faqNodes for /ukk) — edit the page's
// JSX and this object together.
const CALCULATOR_SCHEMA = {
  "/paivamaara-viikoksi": {
    howToName: "Näin selvität päivämäärän viikkonumeron",
    steps: [
      "Valitse tai kirjoita päivämäärä yläkentässä.",
      "Työkalu näyttää heti viikkonumeron, viikonpäivän ja koko viikon päivämäärät.",
      'Avaa "avaa viikko" -linkki nähdäksesi viikon juhlapäivät, nimipäivät ja muut tiedot.',
    ],
    faq: [
      [
        "Miksi 29.–31. joulukuuta voi kuulua ensi vuoden viikkoon 1?",
        "ISO 8601 -standardin mukaan vuoden ensimmäinen viikko on se, johon vuoden ensimmäinen torstai osuu. Jos esimerkiksi 1. tammikuuta on torstai, myös sitä edeltävä maanantai (29. joulukuuta) kuuluu jo uuden vuoden viikkoon 1.",
      ],
      [
        "Toimiiko laskuri myös menneille päivämäärille?",
        'Kyllä, laskuri laskee viikkonumeron mille tahansa päivämäärälle. "Avaa viikko" -linkki vie tarkempiin tietoihin vuosilta 2020–2035; tätä väliä vanhemmat tai uudemmat päivämäärät saavat silti oikean viikkonumeron, mutta ilman omaa tietosivua.',
      ],
      [
        "Mistä standardista viikkonumero lasketaan?",
        "ISO 8601 -standardista, jota käytetään Suomessa ja koko Euroopassa. Katso tarkempi selitys sivulta Mikä on viikkonumero.",
      ],
    ],
  },
  "/viikko-paivamaaraksi": {
    howToName: "Näin selvität viikon alkamis- ja päättymispäivän",
    steps: [
      "Syötä viikkonumero (1–53).",
      "Syötä vuosi.",
      "Näet heti viikon alkamis- ja päättymispäivän sekä kaikki seitsemän viikonpäivää.",
    ],
    faq: [
      [
        "Miksi viikko 1 voi alkaa jo edellisenä joulukuuna?",
        "Koska vuoden ensimmäinen viikko määräytyy vuoden ensimmäisen torstain mukaan, sen maanantai voi olla vielä edellisen kalenterivuoden puolella. Esimerkiksi viikko 1/2026 alkaa maanantaina 29.12.2025.",
      ],
      [
        "Onko joka vuodessa viikko 53?",
        "Ei. Useimmissa vuosissa on 52 viikkoa; viikko 53 esiintyy vain noin joka viidennessä tai kuudennessa vuodessa. Katso, mitkä vuodet ovat 53 viikon vuosia.",
      ],
      [
        "Mitä tapahtuu, jos syötän viikon, jota kyseisessä vuodessa ei ole?",
        "Laskuri ei näytä tulosta, koska sellaista viikkoa ei ole olemassa kyseiselle vuodelle. Tarkista ensin, onko vuodessa 52 vai 53 viikkoa.",
      ],
    ],
  },
  "/tyopaivalaskuri": {
    howToName: "Näin lasket työpäivät kahden päivämäärän välillä",
    steps: [
      "Valitse alkupäivä.",
      "Valitse loppupäivä.",
      "Näet heti työpäivien, viikonlopun päivien ja arkipyhien määrän sekä päivien kokonaismäärän.",
    ],
    faq: [
      [
        "Lasketaanko jouluaatto ja juhannusaatto työpäiviksi?",
        "Kyllä. Kumpikaan ei ole Suomen lain mukaan virallinen arkipyhä, vaikka suurin osa työpaikoista on kiinni tai lyhentää työaikaa niinä päivinä. Tämä laskuri noudattaa lain mukaista listaa virallisista arkipyhistä.",
      ],
      [
        "Lasketaanko alku- ja loppupäivä mukaan?",
        "Kyllä, molemmat syöttämäsi päivämäärät sisältyvät laskentaan.",
      ],
      [
        "Mistä arkipyhät haetaan?",
        "Suomen 13 virallisesta arkipyhästä, mukaan lukien liikkuvat pyhät kuten pääsiäinen, helatorstai, helluntai ja juhannuspäivä. Koko lista löytyy vuoden pyhäpäivät-sivulta.",
      ],
    ],
  },
  "/paivien-erotus": {
    howToName: "Näin lasket päivien erotuksen kahden päivämäärän välillä",
    steps: [
      "Valitse ensimmäinen päivämäärä.",
      "Valitse toinen päivämäärä.",
      "Näet heti päivien ja viikkojen erotuksen.",
    ],
    faq: [
      [
        "Lasketaanko molemmat päivämäärät mukaan erotukseen?",
        "Erotus on päivämäärien välinen etäisyys, ei niiden välissä olevien kalenteripäivien lukumäärä molemmat reunat mukaan lukien. Esimerkiksi 1.1. ja 2.1. välissä on 1 päivä.",
      ],
      [
        "Mitä eroa tällä ja työpäivälaskurilla on?",
        "Tämä laskuri laskee kaikki päivät, myös viikonloput ja arkipyhät. Jos tarvitset vain arkipäivien määrän, käytä työpäivälaskuria.",
      ],
      [
        "Miksi koko kalenterivuoden erotus on 364 eikä 365 päivää?",
        "Koska erotus lasketaan päivämäärien välisenä etäisyytenä. Esimerkiksi 1.1. ja 31.12. saman vuoden välissä on 364 päivää, vaikka vuodessa on 365 (tai karkausvuonna 366) päivää.",
      ],
    ],
  },
};

function calculatorNodes(url) {
  const entry = CALCULATOR_SCHEMA[url];
  if (!entry) return [];
  return [
      {
        "@type": "HowTo",
        name: entry.howToName,
        dateModified: CONTENT_UPDATED,
        step: entry.steps.map((s, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          text: s,
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${canonicalFor(url)}#faq`,
        inLanguage: "fi-FI",
        dateModified: CONTENT_UPDATED,
        mainEntity: entry.faq.map(([q, a]) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      },
    ];
}

// The <SEO> component renders <title>/<meta> via Helmet, and React emits those
// inline in the SSR output — which would leave a duplicate <title> inside
// <body>. The authoritative tags are written into <head> by applyMeta() above,
// and the client re-hoists them into <head> itself on render, so drop the
// inline copies from the static markup. (Image <link rel="preload"> tags are
// valid in <body> and genuinely help LCP, so they stay.)
function stripInlineMeta(appHtml) {
  return appHtml
    .replace(/<title>[\s\S]*?<\/title>/g, "")
    .replace(/<meta\s+name="(?:description|robots)"[^>]*>/g, "")
    // <SEO> also renders a <link rel="canonical"> via Helmet, which lands
    // inline in the SSR body; the authoritative one is written into <head> by
    // applyMeta(), so drop the body copy to avoid two canonicals per page.
    .replace(/<link\s+rel="canonical"[^>]*>/g, "")
    // Language alternates are injected into <head> for the Finnish and English
    // landing pages below; remove Helmet's SSR body copies.
    .replace(/<link\b[^>]*\brel="alternate"[^>]*>/g, "");
}

// Google's SERP snippet truncates titles around ~60 chars and descriptions
// around ~158 — past these, the visible snippet gets cut mid-word. A
// truncated title is close to as bad as a wrong one (same failure severity as
// a duplicate title below); a truncated description still shows a coherent,
// if shorter, snippet, so that's a warning only.
const MAX_TITLE_LENGTH = 60;
const MAX_DESCRIPTION_LENGTH = 158;

let failures = 0;
const titleSeen = new Map();

for (const url of routes) {
  try {
    // Keep stripInlineMeta: the <SEO>/Helmet component emits <title>/<meta>
    // inline in the SSR output, which would otherwise duplicate the tags
    // applyMeta() writes into <head>.
    const appHtml = stripInlineMeta(render(url));
    // Static pages come from routeMeta; the homepage carries the live current
    // week; week/month/year/print pages are generated — all via metaFor().
    const meta = metaFor(url);
    if (!meta) {
      failures += 1;
      console.error(`no meta for ${url} — skipping`);
      continue;
    }
    const canonical = canonicalFor(url);
    const description = meta.description;

    const dupeOf = titleSeen.get(meta.title);
    if (dupeOf) {
      failures += 1;
      console.error(`duplicate <title> "${meta.title}" on both ${dupeOf} and ${url}`);
    }
    titleSeen.set(meta.title, url);

    if (meta.title.length > MAX_TITLE_LENGTH) {
      failures += 1;
      console.error(
        `<title> too long (${meta.title.length} > ${MAX_TITLE_LENGTH} chars) on ${url}: "${meta.title}"`,
      );
    }
    if (description && description.length > MAX_DESCRIPTION_LENGTH) {
      console.warn(
        `<meta description> long (${description.length} > ${MAX_DESCRIPTION_LENGTH} chars) on ${url}: "${description}"`,
      );
    }

    let html = applyMeta(template, {
      title: meta.title,
      description,
      url: canonical,
    });

    const languageLinks = languageAlternateLinks(url);
    if (languageLinks) {
      html = html.replace("</head>", languageLinks + "</head>");
    }
    const feedLink = jsonFeedAlternateLink(url);
    if (feedLink) {
      html = html.replace("</head>", feedLink + "</head>");
    }
    if (url === "/en") {
      html = html.replace('<html lang="fi">', '<html lang="en">');
    }

    // Prune the index to the high-intent window: out-of-window year pages stay
    // prerendered (navigable) but are noindexed (flip the template's default
    // index,follow) and dropped from the sitemap below.
    if (!isIndexable(url) || meta.robots?.startsWith("noindex")) {
      html = html.replace(
        'content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"',
        'content="noindex, follow"',
      );
    }

    // Per-year OG image for calendar pages (all four variants of a year share
    // its image); every other page keeps the site's default /og.png.
    const calOg = url.match(/^\/(?:tulostettava-)?kalenteri-(\d+)/);
    if (calOg) {
      const og = `${SITE_URL}/og/kalenteri-${calOg[1]}.png`;
      html = html
        .replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${og}$2`)
        .replace(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${og}$2`);
    }

    // Noindexed archive pages keep their crawlable HTML but omit page-level
    // schema, avoiding hundreds of repeated graph payloads that parsers should
    // not index anyway.
    if (isIndexable(url) && !meta.robots?.startsWith("noindex")) {
      const nodes = [];
      const crumb = breadcrumbNode(url);
      if (crumb) nodes.push(crumb);

      if (url === "/ukk") nodes.push(...faqNodes());
      if (url === "/") nodes.push(...homepageFaqNodes(), ...datasetNodes());
      if (url === "/en") nodes.push(...englishPageNodes());

      if (["/mika-kuukausi-nyt", "/mika-vuosi-nyt", "/viikonpaiva"].includes(url)) {
        nodes.push(...currentDateIntentNodes(url));
      }
      if (url === "/mika-on-viikkonumero") {
        nodes.push(...mikaOnViikkonumeroNodes());
      }
      if (url === "/viikko-alkaa-maanantaista") {
        nodes.push(...weekStartsMondayNodes());
      }
      if (url === "/suomi-vs-usa-viikkonumerot") {
        nodes.push(...finlandVsUsaNodes());
      }
      if (/^\/(?:tulosta-|tulostettava-kalenteri-)\d+$/.test(url)) {
        nodes.push(...printIntentNodes(url));
      }

      const schoolHolidayMatch = url.match(/^\/koululomat-(\d+)$/);
      if (schoolHolidayMatch) {
        nodes.push(...schoolHolidayNodes(Number(schoolHolidayMatch[1])));
      }
      if (url === "/kuinka-monta-viikkoa-vuodessa") {
        nodes.push(...weeksInYearNodes());
      }

      const holidaysMatch = url.match(/^\/pyhapaivat-(\d+)$/);
      if (holidaysMatch) nodes.push(...holidaysEventNodes(+holidaysMatch[1]));

      const flagDaysMatch = url.match(/^\/liputuspaivat-(\d+)$/);
      if (flagDaysMatch) nodes.push(...flagDayNodes(+flagDaysMatch[1]));

      const workingDaysMatch = url.match(/^\/tyopaivat-(\d+)$/);
      if (workingDaysMatch) nodes.push(...workingDaysFaqNodes(+workingDaysMatch[1]));

      const monthlyWorkingDaysMatch = url.match(/^\/tyopaivat-([a-z]+)-(\d+)$/);
      if (monthlyWorkingDaysMatch) {
        const mi = M_SLUG.indexOf(monthlyWorkingDaysMatch[1]);
        if (mi !== -1) {
          nodes.push(...monthlyWorkingDaysNodes(mi + 1, +monthlyWorkingDaysMatch[2]));
        }
      }

      const namedHolidayMatch = url.match(/^\/pyhat-(\d+)\/([a-z0-9-]+)$/);
      if (namedHolidayMatch) {
        nodes.push(...namedHolidayNodes(+namedHolidayMatch[1], namedHolidayMatch[2]));
      }
      if (/^\/nimipaiva(?:t)?\//.test(url)) nodes.push(...nameDayPageNodes(url));

      const weekMatch = url.match(/^\/viikko-(\d+)-(\d+)$/);
      if (weekMatch) nodes.push(...weekFaqNodes(+weekMatch[1], +weekMatch[2]));

      const calendarMatch = url.match(/^\/kalenteri-(\d+)$/);
      if (calendarMatch) nodes.push(...calendarPageNodes(+calendarMatch[1]));

      const monthMatch = url.match(/^\/kuukausi-(\d+)-(\d+)$/);
      if (monthMatch) nodes.push(...monthFaqNodes(+monthMatch[1], +monthMatch[2]));

      const quarterMatch = url.match(/^\/q([1-4])-(\d+)$/);
      if (quarterMatch) nodes.push(...quarterNodes(+quarterMatch[1], +quarterMatch[2]));

      const yearMatch = url.match(/^\/vuosi-(\d+)$/);
      if (yearMatch) nodes.push(...yearFaqNodes(+yearMatch[1]));

      if (/^\/(?:vuosi-\d+|kuukausi-\d+-\d+)$/.test(url)) {
        nodes.push(...weekCollectionNodes(url));
      }
      if (CALCULATOR_SCHEMA[url]) nodes.push(...calculatorNodes(url));

      const pageId = `${canonical}#webpage`;
      if (!nodes.some((node) => node["@id"] === pageId)) {
        nodes.unshift(
          pageNode(url, "WebPage", {
            description,
            ...speakableExtra(url),
            ...weekHolidayMentionsExtra(url),
          }),
        );
      }
      html = html.replace(
        "</head>",
        `${jsonLdBlock([...globalJsonLdNodes, ...nodes])}</head>`,
      );
    }

    html = html.replace(
      '<div id="root"></div>',
      `<div id="root">${appHtml}</div>`,
    );

    // Flat files (dist/ukk.html), not dist/ukk/index.html: a real directory
    // on disk invites static hosts to auto-redirect the slash-less URL to a
    // trailing-slash one (a common directory-index convention), which fights
    // the opposite (no-trailing-slash) convention canonicalFor() declares and
    // vercel.json's "trailingSlash": false.
    const outPath =
      url === "/" ? path.join(distDir, "index.html") : path.join(distDir, `${url}.html`);

    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, html);
    console.log(`prerendered ${url} -> ${path.relative(__dirname, outPath)}`);
  } catch (err) {
    failures += 1;
    console.error(`failed to prerender ${url}:`, err);
  }
}

// 404 page: a static dist/404.html so Vercel serves it (with a real 404 status,
// not 200) for any path that doesn't match a prerendered file. Rendered from the
// NotFound route; meta is set manually (metaFor has no 404 entry) and forced to
// noindex since the same page answers many unmatched URLs.
try {
  const nf = stripInlineMeta(render("/404"));
  let html404 = applyMeta(template, {
    title: "Sivua ei löytynyt (404) | Viikko Nro",
    description:
      "Etsimääsi sivua ei löytynyt. Palaa etusivulle ja jatka viikkonumeroiden selaamista.",
    url: `${SITE_URL}/404`,
  });
  // Flip the template's default index,follow to noindex (don't append a second
  // robots meta — the same 404 page answers many unmatched URLs).
  html404 = html404.replace(
    'content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"',
    'content="noindex, follow"',
  );
  html404 = html404.replace(
    '<div id="root"></div>',
    `<div id="root">${nf}</div>`,
  );
  fs.writeFileSync(path.join(distDir, "404.html"), html404);
  console.log("prerendered 404 -> dist/404.html");
} catch (err) {
  console.error("failed to prerender 404.html:", err);
}

// Static machine-readable JSON feeds (STEP 2 of the GEO/AI-consumption data
// layer): one file per week/year/holiday-year, written straight to dist/ so
// Vercel serves them as plain static assets — no API route, no server, no
// auth, fully CDN-cacheable, same publishing mechanism as every prerendered
// HTML page. Every value below is read from a function this file already
// imports for the HTML pages (yearStats, holidaysInYear, the week-page date
// math) — no new day-counting logic, so a feed value and its HTML/schema
// equivalent can never disagree (STEP 6).
// Bumped only on a breaking payload-shape change (a field renamed or
// removed — adding a new field is not breaking and doesn't require a bump).
// Every per-item feed below carries this, so a consumer caching or parsing
// these feeds long-term has a stable way to detect a future breaking change
// without guessing from field presence.
const FEED_SCHEMA_VERSION = "1.0";

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

// Working days in a single ISO week (Mon–Fri minus official holidays) — the
// one genuinely new calculation this feature needs, since nothing before now
// exposed a per-week count as a plain function (WeekDays.jsx computes its own
// copy inline for its Quick Facts block, but that file has JSX prerender.js
// can't import directly — see holidaysInWeekForPrerender() above for the
// same constraint on the holiday list itself).
function weekWorkingDaysCount(monday, officialHolidays) {
  const officialDates = new Set(officialHolidays.map((h) => h.date.toDateString()));
  let count = 0;
  for (let i = 0; i < 7; i += 1) {
    const d = addDays(monday, i);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6 && !officialDates.has(d.toDateString())) count += 1;
  }
  return count;
}

const dataDir = path.join(distDir, "data");
const weekManifest = []; // { year, weekCount, indexUrl }
const yearManifest = []; // { year, url }
const holidaysManifest = []; // { year, url }
const quarterManifest = []; // { year, quarter, url }
const monthlyWorkingDaysManifest = []; // { year, month, url }
const monthManifest = []; // { year, month, url }
let feedFileCount = 0;

for (let y = 2020; y <= currentYear + 9; y += 1) {
  // /data/year/<year>.json — reuses yearStats() (seo.js), the same function
  // powering YearCalendar.jsx's Quick Facts and yearFaqs().
  const yStats = yearStats(y);
  const yearHolidaysOut = holidaysInYear(y).map((h) => ({
    name: h.name,
    date: ymd(h.date),
    official: h.official,
  }));
  writeJson(path.join(dataDir, "year", `${y}.json`), {
    schemaVersion: FEED_SCHEMA_VERSION,
    year: y,
    weekCount: yStats.weekCount,
    workingDays: yStats.working,
    weekendDays: yStats.weekend,
    holidays: yearHolidaysOut,
    firstWeek: { week: yStats.firstWeek, year: yStats.firstWeekYear },
    lastWeek: { week: yStats.lastWeek, year: yStats.lastWeekYear },
    url: canonicalFor(`/vuosi-${y}`),
  });
  yearManifest.push({ year: y, url: `${SITE_URL}/data/year/${y}.json` });
  feedFileCount += 1;

  // /data/holidays/<year>.json — reuses holidaysInYear() (data/holidays.js),
  // the same source PublicHolidays.jsx renders as its data table.
  writeJson(path.join(dataDir, "holidays", `${y}.json`), {
    schemaVersion: FEED_SCHEMA_VERSION,
    year: y,
    holidays: holidaysInYear(y).map((h) => ({
      name: h.name,
      date: ymd(h.date),
      weekday: getWeekdayName(h.date),
      week: isoWeek(h.date),
      official: h.official,
    })),
    url: canonicalFor(`/pyhapaivat-${y}`),
  });
  holidaysManifest.push({ year: y, url: `${SITE_URL}/data/holidays/${y}.json` });
  feedFileCount += 1;

  // /data/week/<year>/<week>.json — reuses holidaysInWeekForPrerender() (this
  // file, already used by weekFaqNodes) and mondayOf/quarterOf/seasonIndexOf.
  const totalWeeks = weeksInIsoYear(y);
  const yearWeekManifest = [];
  for (let w = 1; w <= totalWeeks; w += 1) {
    const monday = mondayOf(w, y);
    const sunday = addDays(monday, 6);
    const thursday = addDays(monday, 3);
    const weekHolidays = holidaysInWeekForPrerender(y, w);
    const officialWeekHolidays = weekHolidays.filter((h) => h.official);
    writeJson(path.join(dataDir, "week", String(y), `${w}.json`), {
      schemaVersion: FEED_SCHEMA_VERSION,
      week: w,
      year: y,
      startDate: ymd(monday),
      endDate: ymd(sunday),
      workingDays: weekWorkingDaysCount(monday, officialWeekHolidays),
      holidays: weekHolidays.map((h) => ({
        name: h.name,
        date: ymd(h.date),
        official: h.official,
      })),
      quarter: quarterOf(monday),
      season: SEASON_KEYS_EN[seasonIndexOf(thursday.getMonth())],
      url: canonicalFor(`/viikko-${w}-${y}`),
    });
    yearWeekManifest.push({ week: w, url: `${SITE_URL}/data/week/${y}/${w}.json` });
    feedFileCount += 1;
  }
  writeJson(path.join(dataDir, "week", String(y), "index.json"), {
    year: y,
    weeks: yearWeekManifest,
  });
  weekManifest.push({
    year: y,
    weekCount: totalWeeks,
    indexUrl: `${SITE_URL}/data/week/${y}/index.json`,
  });
  feedFileCount += 1; // the per-year week index itself

  // /data/quarter/<year>/<quarter>.json — reuses quarterStats() (seo.js,
  // itself built from monthStats()), the same function QuarterPage.jsx and
  // quarterFaqs() use. Added after the fiscal-quarter route family shipped;
  // slots into the same year loop and manifest pattern as week/year/holidays
  // without any URL-architecture change — exactly the extensibility STEP 9
  // of the original data-layer design called for.
  for (let q = 1; q <= 4; q += 1) {
    const qStats = quarterStats(y, q);
    const qHolidaysOut = qStats.holidays.map((h) => ({
      name: h.name,
      date: ymd(h.date),
      official: h.official,
    }));
    writeJson(path.join(dataDir, "quarter", String(y), `${q}.json`), {
      schemaVersion: FEED_SCHEMA_VERSION,
      quarter: q,
      year: y,
      startDate: ymd(qStats.firstDay),
      endDate: ymd(qStats.lastDay),
      months: qStats.months,
      weekRange: {
        firstWeek: qStats.weeks[0].week,
        firstYear: qStats.weeks[0].year,
        lastWeek: qStats.weeks[qStats.weeks.length - 1].week,
        lastYear: qStats.weeks[qStats.weeks.length - 1].year,
      },
      workingDays: qStats.working,
      weekendDays: qStats.weekend,
      totalDays: qStats.totalDays,
      holidays: qHolidaysOut,
      url: canonicalFor(`/q${q}-${y}`),
    });
    quarterManifest.push({
      year: y,
      quarter: q,
      url: `${SITE_URL}/data/quarter/${y}/${q}.json`,
    });
    feedFileCount += 1;
  }

  // /data/monthly-working-days/<year>/<month>.json — reuses monthStats()
  // (seo.js), the same function MonthlyWorkingDays.jsx and
  // monthlyWorkingDayFaqs() use. Feed paths use the plain month number, not
  // the page route's Finnish slug (M_SLUG), matching quarter's convention
  // above (page /q1-<year>, feed /data/quarter/<year>/1.json) — feed URLs
  // stay slug-free throughout /data/.
  for (let mm = 1; mm <= 12; mm += 1) {
    const mStats = monthStats(y, mm);
    const officialHolidays = mStats.holidays.filter((h) => h.official);
    writeJson(path.join(dataDir, "monthly-working-days", String(y), `${mm}.json`), {
      schemaVersion: FEED_SCHEMA_VERSION,
      month: mm,
      year: y,
      startDate: ymd(mStats.firstDay),
      endDate: ymd(mStats.lastDay),
      workingDays: mStats.working,
      weekendDays: mStats.weekend,
      holidays: officialHolidays.map((h) => ({
        name: h.name,
        date: ymd(h.date),
        official: h.official,
      })),
      url: canonicalFor(`/tyopaivat-${M_SLUG[mm - 1]}-${y}`),
    });
    monthlyWorkingDaysManifest.push({
      year: y,
      month: mm,
      url: `${SITE_URL}/data/monthly-working-days/${y}/${mm}.json`,
    });
    feedFileCount += 1;
  }

  // /data/month/<year>/<month>.json — the Month dataset (audit finding: no
  // feed or Dataset schema existed for /kuukausi-<m>-<y> before this pass,
  // unlike every other page type). Distinct from monthly-working-days above:
  // this describes which ISO weeks fall in the month, not its working-day
  // count. Reuses the same monthStats() call already made for the
  // monthly-working-days feed two lines up — no second day-counting pass.
  for (let mm = 1; mm <= 12; mm += 1) {
    const mStats = monthStats(y, mm);
    writeJson(path.join(dataDir, "month", String(y), `${mm}.json`), {
      schemaVersion: FEED_SCHEMA_VERSION,
      month: mm,
      year: y,
      startDate: ymd(mStats.firstDay),
      endDate: ymd(mStats.lastDay),
      weekCount: mStats.weekCount,
      weeks: mStats.weeks,
      workingDays: mStats.working,
      weekendDays: mStats.weekend,
      holidays: mStats.holidays
        .filter((h) => h.official)
        .map((h) => ({ name: h.name, date: ymd(h.date), official: h.official })),
      url: canonicalFor(`/kuukausi-${mm}-${y}`),
    });
    monthManifest.push({
      year: y,
      month: mm,
      url: `${SITE_URL}/data/month/${y}/${mm}.json`,
    });
    feedFileCount += 1;
  }
}

// Per-family manifests — the actual contentUrl each Dataset node's
// distribution points at (STEP 4), and the one URL an agent needs to
// discover every week/year/holiday feed without guessing the pattern.
writeJson(path.join(dataDir, "year", "index.json"), { years: yearManifest });
writeJson(path.join(dataDir, "holidays", "index.json"), { years: holidaysManifest });
writeJson(path.join(dataDir, "week", "index.json"), { years: weekManifest });
writeJson(path.join(dataDir, "quarter", "index.json"), { quarters: quarterManifest });
writeJson(path.join(dataDir, "monthly-working-days", "index.json"), {
  months: monthlyWorkingDaysManifest,
});
writeJson(path.join(dataDir, "month", "index.json"), { months: monthManifest });
feedFileCount += 6;

// Top-level manifest (STEP 9): describes the whole /data/ surface by dataset
// family rather than by URL pattern, so a fifth family (school holidays, name
// days, monthly working days, another country) can be added later as one more
// entry here without changing anything about the URLs already published.
writeJson(path.join(dataDir, "index.json"), {
  name: "Viikko Nro machine-readable data feeds",
  schemaVersion: FEED_SCHEMA_VERSION,
  license: `${SITE_URL}/kayttoehdot`,
  dateModified: CONTENT_UPDATED,
  datasets: [
    {
      name: "week",
      description: "One JSON file per ISO 8601 week.",
      indexUrl: `${SITE_URL}/data/week/index.json`,
      urlPattern: `${SITE_URL}/data/week/{year}/{week}.json`,
    },
    {
      name: "year",
      description: "One JSON file per calendar year.",
      indexUrl: `${SITE_URL}/data/year/index.json`,
      urlPattern: `${SITE_URL}/data/year/{year}.json`,
    },
    {
      name: "holidays",
      description: "One JSON file per calendar year's public holidays.",
      indexUrl: `${SITE_URL}/data/holidays/index.json`,
      urlPattern: `${SITE_URL}/data/holidays/{year}.json`,
    },
    {
      name: "quarter",
      description: "One JSON file per fiscal quarter (Q1-Q4).",
      indexUrl: `${SITE_URL}/data/quarter/index.json`,
      urlPattern: `${SITE_URL}/data/quarter/{year}/{quarter}.json`,
    },
    {
      name: "monthly-working-days",
      description: "One JSON file per calendar month's working-day count.",
      indexUrl: `${SITE_URL}/data/monthly-working-days/index.json`,
      urlPattern: `${SITE_URL}/data/monthly-working-days/{year}/{month}.json`,
    },
    {
      name: "month",
      description: "One JSON file per calendar month's ISO weeks.",
      indexUrl: `${SITE_URL}/data/month/index.json`,
      urlPattern: `${SITE_URL}/data/month/{year}/{month}.json`,
    },
  ],
});
feedFileCount += 1;

// Standalone Dataset JSON-LD (STEP 3/4), fetchable on its own without parsing
// any HTML — the same 4 nodes also embedded in the homepage's <head> above,
// built from the one datasetNodes() function so the two can't drift.
writeJson(path.join(dataDir, "dataset.json"), {
  "@context": "https://schema.org",
  "@graph": datasetNodes(),
});
feedFileCount += 1;

console.log(`generated ${feedFileCount} JSON feed files under dist/data/ (2020-${currentYear + 9})`);

// Generate sitemap.xml with a fresh <lastmod> and current-year page entries.
// (currentYear is defined above, alongside the prerender route list.)
const sitemapDate = todayNameDayPage().date;
const today = `${sitemapDate.getFullYear()}-${String(sitemapDate.getMonth() + 1).padStart(2, "0")}-${String(sitemapDate.getDate()).padStart(2, "0")}`;
// Per-URL <lastmod>: a page describing a finalized past year (its week/date
// content can never change again) is frozen to that year's end — an honest
// "stable, old" signal that keeps crawl budget off the deep archive. The
// homepage, current/future-year pages, and editable static pages use the build
// date. Self-maintaining: the boundary moves automatically as currentYear rolls.
const lastmodFor = (p) => {
  const m = p.match(/-(\d{4})(?:-[12])?(?:\/[a-z0-9-]+)?$/);
  if (m && Number(m[1]) < currentYear) return `${m[1]}-12-31`;
  return today;
};
const urlset = sitemapEntries(currentYear)
  .filter((e) => isIndexable(e.path))
  .map((e) => {
    const loc = e.path === "/" ? `${SITE_URL}/` : `${SITE_URL}${e.path}`;
    return [
      "  <url>",
      `    <loc>${loc}</loc>`,
      `    <lastmod>${lastmodFor(e.path)}</lastmod>`,
      `    <changefreq>${e.changefreq}</changefreq>`,
      `    <priority>${e.priority}</priority>`,
      "  </url>",
    ].join("\n");
  })
  .join("\n");
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlset}\n</urlset>\n`;
fs.writeFileSync(path.join(distDir, "sitemap.xml"), sitemap);
console.log(
  `generated sitemap.xml (${sitemapEntries(currentYear).filter((e) => isIndexable(e.path)).length} indexable urls of ${sitemapEntries(currentYear).length} prerendered, lastmod ${today})`,
);

// Generate llms-full.txt from the FAQ single-source so AI ingestion always
// matches the visible /ukk page and the FAQPage JSON-LD.
const llmsFull =
  "# Viikko Nro – täysi sisältö\n\n" +
  "> Viikko Nro (viikkonro.fi) on ilmainen suomalainen viikkolaskuri. Se näyttää kuluvan viikkonumeron ja laskee minkä tahansa päivän viikon ISO 8601 -standardin mukaan. Alla kaikki usein kysytyt kysymykset vastauksineen.\n\n" +
  "## Tietoa viikkonumeroista\n\n" +
  "Suomessa ja koko Euroopassa viikot numeroidaan ISO 8601 -standardin mukaan. Viikko alkaa aina maanantaista ja päättyy sunnuntaihin. Vuoden ensimmäinen viikko on se, joka sisältää vuoden ensimmäisen torstain (aina 4. tammikuuta). Tavallisessa vuodessa on 52 viikkoa; noin joka viides tai kuudes vuosi on 53 viikon vuosi.\n\n" +
  "## Usein kysytyt kysymykset\n\n" +
  faqCategories
    .map(
      (cat) =>
        `### ${cat.title}\n\n` +
        cat.items.map((it) => `Q: ${it.q}\nA: ${it.a}`).join("\n\n"),
    )
    .join("\n\n") +
  "\n";
fs.writeFileSync(path.join(distDir, "llms-full.txt"), llmsFull);
console.log(`generated llms-full.txt (${faqs.length} Q&A)`);

// public/robots.txt is copied verbatim by Vite and can't read env itself, so
// its Sitemap: line is rewritten here to stay in sync with SITE_URL instead
// of drifting from a hardcoded domain.
const robotsPath = path.join(distDir, "robots.txt");
const robotsTxt = fs.readFileSync(robotsPath, "utf-8");
const patchedRobots = robotsTxt.replace(
  /^Sitemap:.*$/m,
  `Sitemap: ${SITE_URL}/sitemap.xml`,
);
fs.writeFileSync(robotsPath, patchedRobots);
console.log(`patched robots.txt Sitemap: line -> ${SITE_URL}/sitemap.xml`);

// Name-day coverage warning: list calendar dates that still lack licensed data
// (their Nimipäivä row is hidden). Read the JSON directly with fs so this stays
// node-native (no JSON import assertion needed here).
{
  const nd = JSON.parse(
    fs.readFileSync(path.join(__dirname, "src/data/nimipaivat.json"), "utf-8"),
  );
  const ndMeta = JSON.parse(
    fs.readFileSync(path.join(__dirname, "src/data/nimipaivat.meta.json"), "utf-8"),
  );
  const missing = [];
  const s = new Date(2024, 0, 1); // leap year → all 366 dates
  for (let i = 0; i < 366; i++) {
    const d = new Date(s);
    d.setDate(s.getDate() + i);
    const k = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const real = (nd[k] ?? []).filter((n) => n && !/^[A-Z]{2,}-\d/.test(n));
    if (real.length === 0) missing.push(k);
  }
  if (!ndMeta.complete && missing.length) {
    console.warn(
      `name-days: ${missing.length}/366 dates lack licensed data (Nimipäivä row hidden). ` +
        `First missing: ${missing.slice(0, 10).join(", ")}${missing.length > 10 ? " …" : ""}`,
    );
  }
}

// Generate the static Open Graph image (dist/og.png, 1200×630) showing the
// current ISO week. Built on every deploy, so the daily rebuild keeps it
// current. A plain static file — not an edge function — so it can never 404
// and needs no serverless runtime. @vercel/og renders it in Node here.
{
  const now = new Date();
  const d = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7) + 3); // Thursday
  const ogYear = d.getUTCFullYear();
  const firstThu = new Date(Date.UTC(ogYear, 0, 4));
  firstThu.setUTCDate(firstThu.getUTCDate() - ((firstThu.getUTCDay() + 6) % 7) + 3);
  const ogWeek = 1 + Math.round((d - firstThu) / 604800000);

  const h = React.createElement;
  const card = h(
    "div",
    {
      style: {
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "90px 96px",
        background:
          "linear-gradient(135deg, #15211f 0%, #0f2a21 55%, #16130f 100%)",
        color: "#ffffff",
      },
    },
    h(
      "div",
      { style: { display: "flex", fontSize: 34, letterSpacing: 6, color: "#bbf7d0" } },
      "VIIKKONRO.FI",
    ),
    h(
      "div",
      { style: { display: "flex", alignItems: "flex-end", marginTop: 26 } },
      h("span", { style: { fontSize: 156, fontWeight: 800, lineHeight: 1 } }, `Viikko ${ogWeek}`),
      h(
        "span",
        { style: { fontSize: 56, color: "#e0a23b", marginLeft: 28, marginBottom: 22 } },
        `/ ${ogYear}`,
      ),
    ),
    h("div", {
      style: { display: "flex", width: 240, height: 12, marginTop: 36, background: "#8900ff", borderRadius: 8 },
    }),
    h(
      "div",
      { style: { display: "flex", marginTop: 42, fontSize: 54, color: "#e7eceb" } },
      "Mikä viikko nyt on?",
    ),
    h(
      "div",
      { style: { display: "flex", marginTop: 18, fontSize: 30, color: "#8aa39b" } },
      "Ilmainen viikkonumerolaskuri · ISO 8601",
    ),
  );
  const res = new ImageResponse(card, { width: 1200, height: 630 });
  const ogBuf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(path.join(distDir, "og.png"), ogBuf);
  console.log(`generated og.png (Viikko ${ogWeek}/${ogYear}, ${ogBuf.length} bytes)`);
}

// Per-year calendar OG images (dist/og/kalenteri-{y}.png), one per year across
// the same rolling range as the calendar pages; shared by the full/half/print
// variants and referenced by the per-page og:image override in the loop above.
{
  const h = React.createElement;
  fs.mkdirSync(path.join(distDir, "og"), { recursive: true });
  let count = 0;
  for (let cy = 2020; cy <= currentYear + 9; cy++) {
    const card = h(
      "div",
      {
        style: {
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "88px 96px",
          background:
            "linear-gradient(135deg, #15211f 0%, #0f2a21 55%, #16130f 100%)",
          color: "#ffffff",
        },
      },
      h(
        "div",
        { style: { display: "flex", fontSize: 34, letterSpacing: 6, color: "#bbf7d0" } },
        "VIIKKONRO.FI",
      ),
      h(
        "div",
        { style: { display: "flex", fontSize: 112, fontWeight: 800, lineHeight: 1, marginTop: 26 } },
        `Vuoden ${cy}`,
      ),
      h(
        "div",
        { style: { display: "flex", fontSize: 112, fontWeight: 800, lineHeight: 1, color: "#e0a23b", marginTop: 4 } },
        "kalenteri",
      ),
      h(
        "div",
        { style: { display: "flex", marginTop: 40, fontSize: 33, color: "#8aa39b" } },
        "Viikkonumerot · juhlapäivät · ISO 8601",
      ),
    );
    const res = new ImageResponse(card, { width: 1200, height: 630 });
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(path.join(distDir, "og", `kalenteri-${cy}.png`), buf);
    count += 1;
  }
  console.log(`generated ${count} calendar OG images (dist/og/kalenteri-*.png)`);
}

// Remove the temporary SSR bundle so it never ships in the image.
fs.rmSync(serverDir, { recursive: true, force: true });

if (failures > 0) {
  console.error(`\nPrerender finished with ${failures} failure(s).`);
  process.exit(1);
}
console.log(`\nPrerendered ${routes.length} route(s).`);
