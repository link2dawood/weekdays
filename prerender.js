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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, "dist");
const serverDir = path.resolve(__dirname, "dist-server");

// Static, content-rich routes worth prerendering for SEO/GEO.
const routes = [
  "/",
  "/what-is-a-week-number",
  "/weeks-in-a-year",
  "/faq",
  "/about-us",
  "/contact-us",
  "/privacy-policy",
  "/terms-and-conditions",
];

const template = fs.readFileSync(path.join(distDir, "index.html"), "utf-8");
const { render } = await import(path.join(serverDir, "entry-server.js"));

let failures = 0;

for (const url of routes) {
  try {
    const appHtml = render(url);
    const html = template.replace(
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

// Remove the temporary SSR bundle so it never ships in the image.
fs.rmSync(serverDir, { recursive: true, force: true });

if (failures > 0) {
  console.error(`\nPrerender finished with ${failures} failure(s).`);
  process.exit(1);
}
console.log(`\nPrerendered ${routes.length} route(s).`);
