// D-06 crawl-reachability check: BFS from "/" using the app's real SSR
// render (dist-server/entry-server.js) to extract the actual client-side
// link graph — this is what a JS-executing crawler (Googlebot) or a real
// browser sees, and is exactly the same React render output the client
// hydrates into (React is isomorphic: SSR and client render the identical
// component tree/links for a given URL).
//
// Not a live-browser crawl — no Puppeteer/Playwright involved. Deliberately
// so: react-dom/server's render() IS the real component tree for a route,
// so re-deriving the same links via an actual headless browser would only
// add a heavy new dependency without finding anything this doesn't.
//
// Requires a built dist/ + dist-server/ (run `npm run build`, then rebuild
// dist-server since prerender.js deletes it: `npx vite build --ssr
// src/entry-server.jsx --outDir dist-server`) before running this.
//
// Checks (per the handoff's D-06):
//   - every sitemap URL reachable from "/" within 3 clicks
//   - zero internal links to a redirect-only page or the 404 page

import { pathToFileURL } from "node:url";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const { render } = await import(
  pathToFileURL(path.join(root, "dist-server/entry-server.js")).href
);

// Asset hints (<link rel="preload" href="...svg">, favicons, etc.) also use
// href= but aren't page links — exclude by extension so they don't pollute
// the crawl or the redirect-only heuristic below.
const ASSET_EXT = /\.(svg|png|jpg|jpeg|ico|xml|txt|css|js)$/i;

function extractLinks(html) {
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  return [
    ...new Set(
      hrefs.filter(
        (h) => h.startsWith("/") && !h.startsWith("//") && !ASSET_EXT.test(h),
      ),
    ),
  ];
}

// Detects the <Navigate> short-circuit case (e.g. an invalid week 53
// redirecting): those routes render almost nothing besides Navbar/Footer,
// distinctly shorter than a real page.
function looksLikeRedirectOnly(html) {
  return html.length < 3500;
}

const MAX_DEPTH = 3;
const visited = new Map(); // url -> depth
const queue = [["/", 0]];
visited.set("/", 0);

const errors = [];
const redirects = [];
const notFounds = [];

while (queue.length) {
  const [url, depth] = queue.shift();

  let html;
  try {
    html = render(url);
  } catch (e) {
    errors.push({ url, error: e.message });
    continue;
  }

  if (url !== "/" && looksLikeRedirectOnly(html)) redirects.push(url);
  if (html.includes("Sivua ei löytynyt")) notFounds.push(url);

  if (depth >= MAX_DEPTH) continue;

  for (const link of extractLinks(html)) {
    if (!visited.has(link)) {
      visited.set(link, depth + 1);
      queue.push([link, depth + 1]);
    }
  }
}

const sitemap = fs.readFileSync(path.join(root, "dist/sitemap.xml"), "utf-8");
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => {
  const u = new URL(m[1]);
  return u.pathname === "/" ? "/" : u.pathname;
});

const unreachable = sitemapUrls.filter((u) => !visited.has(u));
const tooDeep = sitemapUrls.filter((u) => visited.has(u) && visited.get(u) > MAX_DEPTH);

console.log(`Crawled ${visited.size} distinct internal URLs from "/".`);
console.log(`Sitemap has ${sitemapUrls.length} URLs.`);
console.log(`Unreachable: ${unreachable.length}, beyond ${MAX_DEPTH} clicks: ${tooDeep.length}`);
console.log(`Redirect-only pages linked internally: ${redirects.length}`);
console.log(`Internal links to the 404 page: ${notFounds.length}`);
console.log(`Render errors: ${errors.length}`);

for (const u of unreachable) console.log(`  UNREACHABLE: ${u}`);
for (const u of tooDeep) console.log(`  TOO DEEP (${visited.get(u)}): ${u}`);
for (const u of redirects) console.log(`  REDIRECT-ONLY: ${u}`);
for (const u of notFounds) console.log(`  404: ${u}`);
for (const e of errors) console.log(`  ERROR: ${e.url}: ${e.error}`);

const failed =
  unreachable.length > 0 ||
  tooDeep.length > 0 ||
  redirects.length > 0 ||
  notFounds.length > 0 ||
  errors.length > 0;

if (failed) {
  console.error("\nFAIL");
  process.exit(1);
}
console.log("\nOK");
