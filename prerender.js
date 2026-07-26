// Post-build prerendering: renders each static route to real HTML and writes it
// into dist/<route>/index.html. This makes full page text (headings, FAQ,
// article copy) crawlable by search + AI/generative engines even when they
// don't run JavaScript — while the client still hydrates into the normal SPA.
//
// No headless browser is used, so the CI/Docker build stays fast and small.
//
// Dynamic routes (/year/:year, /week/..., /month/..., /print/:year) are NOT
// prerendered — nginx's SPA fallback serves index.html and React Router renders
// them on the client.

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
  hreflangAlternates,
} from "./src/data/seo.js";
import { faqs, faqCategories } from "./src/data/faqs.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "dist");
const serverDir = path.resolve(__dirname, "dist-server");

// Prerender EVERY URL in the sitemap, not just the static pages. The
// week/month/year pages are content-rich (holidays, name days, sun times,
// per-day details) — they just weren't prerendered, so crawlers saw the SPA
// home shell and treated ~200 URLs as duplicates of the homepage. Rendering
// them gives each unique, indexable HTML that matches its sitemap entry.
const currentYear = new Date().getFullYear();
const routes = sitemapEntries(currentYear).map((e) => e.path);

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
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
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
    .replace(/<link\s+rel="canonical"[^>]*>/g, "");
}

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

    let html = applyMeta(template, {
      title: meta.title,
      description,
      url: canonical,
    });

    const crumb = breadcrumbScript(url);
    if (crumb) html = html.replace("</head>", `${crumb}</head>`);

    if (url === "/ukk") {
      html = html.replace("</head>", `${faqScript()}</head>`);
    }

    // hreflang alternates (fi <-> sv) for pages that have a translated twin.
    const alts = hreflangAlternates(url);
    if (alts) {
      const fiPath = alts.find((a) => a.lang === "fi").path;
      const tags =
        alts
          .map(
            (a) =>
              `<link rel="alternate" hreflang="${a.lang}" href="${canonicalFor(a.path)}" />`,
          )
          .join("\n    ") +
        `\n    <link rel="alternate" hreflang="x-default" href="${canonicalFor(fiPath)}" />`;
      html = html.replace("</head>", `${tags}\n  </head>`);
    }
    // Swedish pages declare lang="sv".
    if (url === "/sv" || url.startsWith("/sv/")) {
      html = html.replace('<html lang="fi"', '<html lang="sv"');
    }

    html = html.replace(
      '<div id="root"></div>',
      `<div id="root">${appHtml}</div>`,
    );

    // Flat files (dist/ukk.html), not dist/ukk/index.html: a real directory
    // on disk makes nginx auto-redirect the slash-less URL to a trailing-
    // slash one (its own directory-index convention), which fights the
    // opposite (no-trailing-slash) convention canonicalFor() declares and
    // causes a redirect loop against nginx.conf's trailing-slash rule.
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

// Generate sitemap.xml with a fresh <lastmod> and current-year page entries.
// (currentYear is defined above, alongside the prerender route list.)
const today = new Date().toISOString().slice(0, 10);
const urlset = sitemapEntries(currentYear)
  .map((e) => {
    const loc = e.path === "/" ? `${SITE_URL}/` : `${SITE_URL}${e.path}`;
    return [
      "  <url>",
      `    <loc>${loc}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      `    <changefreq>${e.changefreq}</changefreq>`,
      `    <priority>${e.priority}</priority>`,
      "  </url>",
    ].join("\n");
  })
  .join("\n");
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlset}\n</urlset>\n`;
fs.writeFileSync(path.join(distDir, "sitemap.xml"), sitemap);
console.log(
  `generated sitemap.xml (${sitemapEntries(currentYear).length} urls, lastmod ${today})`,
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

// Remove the temporary SSR bundle so it never ships in the image.
fs.rmSync(serverDir, { recursive: true, force: true });

if (failures > 0) {
  console.error(`\nPrerender finished with ${failures} failure(s).`);
  process.exit(1);
}
console.log(`\nPrerendered ${routes.length} route(s).`);
