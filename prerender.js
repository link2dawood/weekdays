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
import { fileURLToPath } from "node:url";
import {
  routeMeta,
  canonicalFor,
  SITE_URL,
  sitemapEntries,
  homeDescription,
} from "./src/data/seo.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "dist");
const serverDir = path.resolve(__dirname, "dist-server");

// Static, content-rich routes worth prerendering for SEO/GEO.
const routes = Object.keys(routeMeta);

const template = fs.readFileSync(path.join(distDir, "index.html"), "utf-8");
const { render } = await import(path.join(serverDir, "entry-server.js"));

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
function breadcrumbScript(url, meta, canonical) {
  if (url === "/" || !meta.breadcrumb) return "";
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Etusivu",
        item: canonicalFor("/"),
      },
      { "@type": "ListItem", position: 2, name: meta.breadcrumb, item: canonical },
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
    .replace(/<meta\s+name="(?:description|robots)"[^>]*>/g, "");
}

let failures = 0;

for (const url of routes) {
  try {
    const appHtml = stripInlineMeta(render(url));
    const meta = routeMeta[url];
    const canonical = canonicalFor(url);
    // The home page advertises the current week number + its Monday.
    const description = url === "/" ? homeDescription() : meta.description;

    let html = applyMeta(template, {
      title: meta.title,
      description,
      url: canonical,
    });

    const crumb = breadcrumbScript(url, meta, canonical);
    if (crumb) html = html.replace("</head>", `${crumb}</head>`);

    html = html.replace(
      '<div id="root"></div>',
      `<div id="root">${appHtml}</div>`,
    );

    const outPath =
      url === "/"
        ? path.join(distDir, "index.html")
        : path.join(distDir, url, "index.html");

    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, html);
    console.log(`prerendered ${url} -> ${path.relative(__dirname, outPath)}`);
  } catch (err) {
    failures += 1;
    console.error(`failed to prerender ${url}:`, err);
  }
}

// Generate sitemap.xml with a fresh <lastmod> and current-year page entries.
const today = new Date().toISOString().slice(0, 10);
const currentYear = new Date().getFullYear();
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

// Remove the temporary SSR bundle so it never ships in the image.
fs.rmSync(serverDir, { recursive: true, force: true });

if (failures > 0) {
  console.error(`\nPrerender finished with ${failures} failure(s).`);
  process.exit(1);
}
console.log(`\nPrerendered ${routes.length} route(s).`);
