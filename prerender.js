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
} from "./src/data/seo.js";
import { faqs, faqCategories } from "./src/data/faqs.js";
import { fmtShortFi } from "./src/components/dateUtils.js";
import { holidaysInYear } from "./src/data/holidays.js";
import {
  holidayFaqs,
  holidayPageFor,
  holidayPageMeta,
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
import {
  swedishHomeFaqs,
  swedishWeekFaqs,
  swedishYearFaqs,
} from "./src/data/swedishContent.js";

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

// BreadcrumbList structured data mirroring the visible "Etusivu / …" trail.
// Skipped for the homepage (a breadcrumb to itself adds nothing).
function breadcrumbScript(url) {
  const trail = breadcrumbTrail(url);
  if (!trail || trail.length < 2) return "";
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: canonicalFor(t.path),
    })),
  };
  return `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n    </script>\n  `;
}

// FAQPage structured data generated from src/data/faqs.js. Injected only on
// /ukk, whose visible list matches it exactly (Google requires the two agree).
function faqScript() {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE_URL}/ukk#faq`,
    inLanguage: "fi-FI",
    dateModified: CONTENT_UPDATED,
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n    </script>\n  `;
}

function englishPageScript() {
  const url = canonicalFor("/en");
  const meta = metaFor("/en");
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": url + "#page",
        url,
        name: "What is the current week number?",
        description: meta.description,
        inLanguage: "en",
        datePublished: "2026-08-04",
        dateModified: CONTENT_UPDATED,
      },
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
    ],
  };
  return '<script type="application/ld+json">\n' + JSON.stringify(data, null, 2) + "\n    </script>\n  ";
}

function swedishPageScript(url) {
  let headline = "Vilken vecka är det nu?";
  let faqsForPage = swedishHomeFaqs;
  let match = url.match(/^\/sv\/veckor-(\d+)$/);
  if (match) {
    headline = "Veckonummer " + match[1];
    faqsForPage = swedishYearFaqs(Number(match[1]));
  }
  match = url.match(/^\/sv\/vecka-(\d+)-(\d+)$/);
  if (match) {
    headline = "Vecka " + match[1] + " år " + match[2];
    faqsForPage = swedishWeekFaqs(Number(match[1]), Number(match[2]));
  }
  const canonical = canonicalFor(url);
  const meta = metaFor(url);
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": canonical + "#page",
        url: canonical,
        name: headline,
        description: meta.description,
        inLanguage: "sv-FI",
        datePublished: "2026-08-04",
        dateModified: CONTENT_UPDATED,
      },
      {
        "@type": "FAQPage",
        "@id": canonical + "#faq",
        inLanguage: "sv-FI",
        dateModified: CONTENT_UPDATED,
        mainEntity: faqsForPage.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
  };
  return '<script type="application/ld+json">\n' + JSON.stringify(data, null, 2) + "\n    </script>\n  ";
}

function languageAlternateLinks(url) {
  let fi;
  let sv;
  if (["/", "/en", "/sv"].includes(url)) {
    fi = "/";
    sv = "/sv";
    return (
      '<link rel="alternate" hreflang="fi" href="' + canonicalFor(fi) + '" />' +
      '<link rel="alternate" hreflang="sv-FI" href="' + canonicalFor(sv) + '" />' +
      '<link rel="alternate" hreflang="en" href="' + canonicalFor("/en") + '" />' +
      '<link rel="alternate" hreflang="x-default" href="' + canonicalFor(fi) + '" />'
    );
  }
  let match = url.match(/^\/(?:vuosi-|sv\/veckor-)(\d+)$/);
  if (match) {
    fi = "/vuosi-" + match[1];
    sv = "/sv/veckor-" + match[1];
  }
  match = url.match(/^\/(?:viikko-|sv\/vecka-)(\d+)-(\d+)$/);
  if (match) {
    fi = "/viikko-" + match[1] + "-" + match[2];
    sv = "/sv/vecka-" + match[1] + "-" + match[2];
  }
  if (!fi) return "";
  return (
    '<link rel="alternate" hreflang="fi" href="' + canonicalFor(fi) + '" />' +
    '<link rel="alternate" hreflang="sv-FI" href="' + canonicalFor(sv) + '" />' +
    '<link rel="alternate" hreflang="x-default" href="' + canonicalFor(fi) + '" />'
  );
}

function currentDateIntentScript(url) {
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
  if (!config) return "";
  const canonical = canonicalFor(url);
  const graph = [
    {
      "@type": "WebPage",
      "@id": canonical + "#page",
      url: canonical,
      name: config.headline,
      description: config.meta.description,
      inLanguage: "fi-FI",
      datePublished: "2026-08-04",
      dateModified: CONTENT_UPDATED,
    },
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
      mainEntityOfPage: { "@id": canonical + "#page" },
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
  const data = { "@context": "https://schema.org", "@graph": graph };
  return '<script type="application/ld+json">\n' + JSON.stringify(data, null, 2) + "\n    </script>\n  ";
}

// Article + FAQPage structured data for the /mika-on-viikkonumero explainer.
// BreadcrumbList is added separately (breadcrumbScript), so it is not repeated
// here. The FAQ entries mirror the page's visible <details> list exactly.
function mikaOnViikkonumeroScript() {
  const faq = whatWeekFaqs;
  const url = canonicalFor("/mika-on-viikkonumero");
  const meta = metaFor("/mika-on-viikkonumero");
  const data = {
    "@context": "https://schema.org",
    "@graph": [
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
        mainEntityOfPage: { "@id": `${url}#page` },
        about: [
          { "@type": "Thing", name: "ISO 8601" },
          { "@type": "Thing", name: "Viikkonumero" },
          { "@type": "Thing", name: "Kalenteri" },
        ],
      },
      {
        "@type": "WebPage",
        "@id": `${url}#page`,
        url,
        name: meta.title,
        description: meta.description,
        inLanguage: "fi-FI",
        datePublished: "2026-01-01",
        dateModified: CONTENT_UPDATED,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntity: { "@id": `${url}#article` },
      },
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
    ],
  };
  return `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n    </script>\n  `;
}

function weekStartsMondayScript() {
  const path = "/viikko-alkaa-maanantaista";
  const url = canonicalFor(path);
  const meta = metaFor(path);
  const data = {
    "@context": "https://schema.org",
    "@graph": [
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
        mainEntityOfPage: { "@id": `${url}#page` },
        about: [
          { "@type": "Thing", name: "ISO 8601" },
          { "@type": "Thing", name: "Viikon ensimmäinen päivä" },
          { "@type": "Thing", name: "ISO-viikkovuosi" },
        ],
      },
      {
        "@type": "WebPage",
        "@id": `${url}#page`,
        url,
        name: meta.title,
        description: meta.description,
        inLanguage: "fi-FI",
        datePublished: "2026-08-04",
        dateModified: CONTENT_UPDATED,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntity: { "@id": `${url}#article` },
      },
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
    ],
  };
  return `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n    </script>\n  `;
}

function printIntentScript(pathname) {
  const listMatch = pathname.match(/^\/tulosta-(\d+)$/);
  const calendarMatch = pathname.match(/^\/tulostettava-kalenteri-(\d+)$/);
  if (!listMatch && !calendarMatch) return "";

  const year = Number((listMatch || calendarMatch)[1]);
  const faqsForPage = listMatch
    ? printListFaqs(year)
    : printableCalendarFaqs(year);
  const url = canonicalFor(pathname);
  const meta = metaFor(pathname);
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#page`,
        url,
        name: meta.title,
        description: meta.description,
        inLanguage: "fi-FI",
        datePublished: "2026-08-04",
        dateModified: CONTENT_UPDATED,
        author: { "@id": `${SITE_URL}/#organization` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntity: { "@id": `${url}#faq` },
      },
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
    ],
  };
  return `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n    </script>\n  `;
}

function schoolHolidayScript(year) {
  const pathname = `/koululomat-${year}`;
  const url = canonicalFor(pathname);
  const meta = metaFor(pathname);
  const page = schoolHolidayPage(year);
  if (!meta || !page) return "";
  const faq = schoolHolidayFaqs(year);
  const citations = page.sourceKeys.map(
    (key) => SCHOOL_HOLIDAY_SOURCES[key].url,
  );
  const data = {
    "@context": "https://schema.org",
    "@graph": [
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
        mainEntityOfPage: { "@id": `${url}#page` },
        citation: citations,
        about: [
          { "@type": "Thing", name: `Koululomat ${year}` },
          { "@type": "Thing", name: "Hiihtoloma" },
          { "@type": "Thing", name: "Syysloma" },
        ],
      },
      {
        "@type": "WebPage",
        "@id": `${url}#page`,
        url,
        name: meta.title,
        description: meta.description,
        inLanguage: "fi-FI",
        datePublished: "2026-08-04",
        dateModified: CONTENT_UPDATED,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntity: { "@id": `${url}#article` },
      },
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
    ],
  };
  return `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n    </script>\n  `;
}

// Article + FAQPage data for the expanded weeks-per-year explainer. FAQs are
// shared with the visible page so schema and rendered answers stay identical.
function weeksInYearScript() {
  const url = canonicalFor("/kuinka-monta-viikkoa-vuodessa");
  const meta = metaFor("/kuinka-monta-viikkoa-vuodessa");
  const faq = weeksInYearFaqs(currentYear);
  const data = {
    "@context": "https://schema.org",
    "@graph": [
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
        mainEntityOfPage: { "@id": `${url}#page` },
        about: [
          { "@type": "Thing", name: "ISO 8601" },
          { "@type": "Thing", name: "Viikkovuosi" },
          { "@type": "Thing", name: "Viikko 53" },
        ],
      },
      {
        "@type": "WebPage",
        "@id": `${url}#page`,
        url,
        name: meta.title,
        description: meta.description,
        inLanguage: "fi-FI",
        datePublished: "2026-01-01",
        dateModified: CONTENT_UPDATED,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntity: { "@id": `${url}#article` },
      },
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
    ],
  };
  return `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n    </script>\n  `;
}

function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

// Event structured data for a year's public holidays, injected only on
// /pyhapaivat-<year>, whose visible table lists these same holidays with the
// same dates. "Country" is a valid schema.org Place subtype, so a national
// holiday can carry a real (if coarse) location without inventing a venue.
function holidaysEventScript(year) {
  const ymd = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const data = {
    "@context": "https://schema.org",
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
  };
  return `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n    </script>\n  `;
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
function weekFaqScript(w, y) {
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

  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${canonicalFor(`/viikko-${w}-${y}`)}#faq`,
    inLanguage: "fi-FI",
    dateModified: CONTENT_UPDATED,
    mainEntity: faq.map(([q, a]) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
  return `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n    </script>\n  `;
}

// CollectionPage + FAQPage data for the full /kalenteri-<year> landing pages.
// The FAQ entries come from the same source as the visible <details> list.
function calendarPageScript(year) {
  const url = canonicalFor(`/kalenteri-${year}`);
  const meta = calendarMeta(year, null, false);
  const faq = calendarFaqs(year);
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#page`,
        url,
        name: meta.title,
        description: meta.description,
        inLanguage: "fi-FI",
        datePublished: "2026-08-03",
        dateModified: CONTENT_UPDATED,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        author: { "@id": `${SITE_URL}/#organization` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: 12,
          itemListElement: Array.from({ length: 12 }, (_, index) => ({
            "@type": "ListItem",
            position: index + 1,
            url: canonicalFor(`/kuukausi-${index + 1}-${year}`),
          })),
        },
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
    ],
  };
  return `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n    </script>\n  `;
}

// WebPage + Event + FAQPage data for each named-holiday landing page. The
// visible content, metadata and schema all use holidayPages.js, so dates and
// answers cannot drift between the three representations.
function namedHolidayScript(year, slug) {
  const page = holidayPageFor(year, slug);
  if (!page) return "";
  const meta = holidayPageMeta(year, slug);
  const faq = holidayFaqs(page);
  const date = `${page.date.getFullYear()}-${String(page.date.getMonth() + 1).padStart(2, "0")}-${String(page.date.getDate()).padStart(2, "0")}`;
  const url = canonicalFor(page.path);
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#page`,
        url,
        name: meta.title,
        description: meta.description,
        inLanguage: "fi-FI",
        datePublished: "2026-08-03",
        dateModified: CONTENT_UPDATED,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        author: { "@id": `${SITE_URL}/#organization` },
        publisher: { "@id": `${SITE_URL}/#organization` },
        mainEntity: { "@id": `${url}#event` },
      },
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
    ],
  };
  return `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n    </script>\n  `;
}

function nameDayPageScript(url) {
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
  if (!page || !meta) return "";
  const faq = nameDayFaqs(page, type);
  const canonical = canonicalFor(url);
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${canonical}#page`,
        url: canonical,
        name: meta.title,
        description: meta.description,
        inLanguage: "fi-FI",
        datePublished: "2026-08-04",
        dateModified: CONTENT_UPDATED,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        author: { "@id": `${SITE_URL}/#organization` },
        publisher: { "@id": `${SITE_URL}/#organization` },
      },
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
    ],
  };
  return `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n    </script>\n  `;
}

// HowTo + FAQ structured data for the four calculator pages. Each FAQ entry
// mirrors that page's visible <details> list exactly (same convention as
// mikaOnViikkonumeroScript above and faqScript for /ukk) — edit the page's
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

function calculatorScript(url) {
  const entry = CALCULATOR_SCHEMA[url];
  if (!entry) return "";
  const data = {
    "@context": "https://schema.org",
    "@graph": [
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
    ],
  };
  return `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n    </script>\n  `;
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
    if (url === "/en" || url.startsWith("/sv")) {
      html = html.replace(
        '<html lang="fi">',
        url === "/en" ? '<html lang="en">' : '<html lang="sv">',
      );
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

    const crumb = breadcrumbScript(url);
    if (crumb) html = html.replace("</head>", `${crumb}</head>`);

    if (url === "/ukk") {
      html = html.replace("</head>", `${faqScript()}</head>`);
    }

    if (url === "/en") {
      html = html.replace("</head>", englishPageScript() + "</head>");
    }

    if (url === "/sv" || /^\/sv\/(?:vecka|veckor)-/.test(url)) {
      html = html.replace("</head>", swedishPageScript(url) + "</head>");
    }

    if (["/mika-kuukausi-nyt", "/mika-vuosi-nyt", "/viikonpaiva"].includes(url)) {
      html = html.replace("</head>", currentDateIntentScript(url) + "</head>");
    }

    if (url === "/mika-on-viikkonumero") {
      html = html.replace("</head>", `${mikaOnViikkonumeroScript()}</head>`);
    }

    if (url === "/viikko-alkaa-maanantaista") {
      html = html.replace("</head>", `${weekStartsMondayScript()}</head>`);
    }

    if (/^\/(?:tulosta-|tulostettava-kalenteri-)\d+$/.test(url)) {
      html = html.replace("</head>", `${printIntentScript(url)}</head>`);
    }

    const schoolHolidayMatch = url.match(/^\/koululomat-(\d+)$/);
    if (schoolHolidayMatch) {
      html = html.replace(
        "</head>",
        `${schoolHolidayScript(Number(schoolHolidayMatch[1]))}</head>`,
      );
    }

    if (url === "/kuinka-monta-viikkoa-vuodessa") {
      html = html.replace("</head>", `${weeksInYearScript()}</head>`);
    }

    const holidaysMatch = url.match(/^\/pyhapaivat-(\d+)$/);
    if (holidaysMatch) {
      html = html.replace("</head>", `${holidaysEventScript(+holidaysMatch[1])}</head>`);
    }

    const namedHolidayMatch = url.match(/^\/pyhat-(\d+)\/([a-z0-9-]+)$/);
    if (namedHolidayMatch) {
      html = html.replace(
        "</head>",
        `${namedHolidayScript(+namedHolidayMatch[1], namedHolidayMatch[2])}</head>`,
      );
    }

    if (/^\/nimipaiva(?:t)?\//.test(url)) {
      html = html.replace("</head>", `${nameDayPageScript(url)}</head>`);
    }

    const weekMatch = url.match(/^\/viikko-(\d+)-(\d+)$/);
    if (weekMatch) {
      html = html.replace(
        "</head>",
        `${weekFaqScript(+weekMatch[1], +weekMatch[2])}</head>`,
      );
    }

    const calendarMatch = url.match(/^\/kalenteri-(\d+)$/);
    if (calendarMatch) {
      html = html.replace(
        "</head>",
        `${calendarPageScript(+calendarMatch[1])}</head>`,
      );
    }

    if (CALCULATOR_SCHEMA[url]) {
      html = html.replace("</head>", `${calculatorScript(url)}</head>`);
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
  const missing = [];
  const s = new Date(2024, 0, 1); // leap year → all 366 dates
  for (let i = 0; i < 366; i++) {
    const d = new Date(s);
    d.setDate(s.getDate() + i);
    const k = `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const real = (nd[k] ?? []).filter((n) => n && !/^[A-Z]{2,}-\d/.test(n));
    if (real.length === 0) missing.push(k);
  }
  if (missing.length) {
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
