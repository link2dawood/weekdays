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
import {
  routeMeta,
  canonicalFor,
  SITE_URL,
  sitemapEntries,
  homeMeta,
} from "./src/data/seo.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "dist");
const serverDir = path.resolve(__dirname, "dist-server");

// Static, content-rich routes worth prerendering for SEO/GEO.
const routes = Object.keys(routeMeta);

const template = fs.readFileSync(path.join(distDir, "index.html"), "utf-8");
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

let failures = 0;
const titleSeen = new Map();

for (const url of routes) {
  try {
    const appHtml = render(url);
    // Home carries the real current week/date range in its title+description
    // (F-04), computed fresh at build time rather than the static copy used
    // for breadcrumb/canonical purposes.
    const meta = url === "/" ? { ...routeMeta[url], ...homeMeta(new Date()) } : routeMeta[url];
    const canonical = canonicalFor(url);

    const dupeOf = titleSeen.get(meta.title);
    if (dupeOf) {
      failures += 1;
      console.error(`duplicate <title> "${meta.title}" on both ${dupeOf} and ${url}`);
    }
    titleSeen.set(meta.title, url);

    let html = applyMeta(template, {
      title: meta.title,
      description: meta.description,
      url: canonical,
    });

    const crumb = breadcrumbScript(url, meta, canonical);
    if (crumb) html = html.replace("</head>", `${crumb}</head>`);

    html = html.replace(
      '<div id="root"></div>',
      `<div id="root">${appHtml}</div>`,
    );

    // Flat files (dist/faq.html), not dist/faq/index.html: a real directory
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

// Remove the temporary SSR bundle so it never ships in the image.
fs.rmSync(serverDir, { recursive: true, force: true });

if (failures > 0) {
  console.error(`\nPrerender finished with ${failures} failure(s).`);
  process.exit(1);
}
console.log(`\nPrerendered ${routes.length} route(s).`);
