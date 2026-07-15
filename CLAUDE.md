# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"Viikko Nro" (viikkonro.fi) — a Finnish-language ISO 8601 week-number calculator built as a React SPA (Vite + React Router). All UI copy is in Finnish. There is no backend; the contact form posts directly to Web3Forms from the client.

## Commands

- `npm run dev` — start Vite dev server
- `npm run build` — full production build: client build → SSR build (`entry-server.jsx`) → `node prerender.js`. This is what CI/Docker runs; use it to verify prerendering/SEO output, not just the app.
- `npm run build:spa` — client-only build, skips SSR/prerendering (fast path if you only need to check the SPA bundles)
- `npm run preview` — serve the built `dist/` locally
- `npm run lint` — ESLint (flat config, `eslint.config.js`)
- No test suite exists in this repo.

Docker: `docker compose up --build` builds and serves the site at `http://localhost:3005` (same nginx-based image CI/CD produces). `VITE_WEB3FORMS_ACCESS_KEY` can be set via a local `.env` file for the contact form to work.

## Architecture

**Hybrid SPA + prerendering (no SSR server at runtime).** There are two separate render entry points that both mount the same router-agnostic `AppRoutes`:
- `src/main.jsx` → `App.jsx` (wraps `AppRoutes` in `BrowserRouter`) — normal client hydration.
- `src/entry-server.jsx` — wraps `AppRoutes` in `StaticRouter`, used only at build time.

`prerender.js` runs after both builds finish: it imports the SSR bundle, calls `render(url)` for every route listed in `src/data/seo.js`'s `routeMeta`, injects the resulting HTML into `dist/<route>/index.html` along with per-route `<title>`, meta description, canonical URL, Open Graph/Twitter tags, and a BreadcrumbList JSON-LD script. It then generates `dist/sitemap.xml` from `sitemapEntries()` and deletes the temporary `dist-server/` SSR bundle so it never ships. This makes static pages (FAQ, about, legal, etc.) fully crawlable without JS, while the client still hydrates into a normal SPA.

**Dynamic routes are intentionally NOT prerendered**: `/year/:year`, `/week/:week/:year`, `/month/:month/:year`, `/print/:year`. These are served by nginx's SPA fallback (`try_files ... /index.html`) and rendered client-side only. Only routes with an entry in `routeMeta` (`src/data/seo.js`) get a static HTML file — adding a new static page means adding it there (and to `sitemapEntries()` if it should appear in the sitemap).

**SEO/GEO metadata is centralized in `src/data/seo.js`**: `routeMeta` (per-route title/description/breadcrumb), `canonicalFor()`, and `sitemapEntries()`. `index.html` additionally carries global JSON-LD (`WebSite`/`Organization`/`WebApplication`/`FAQPage` schema.org graph) that should stay in sync with `src/data/faqs.js`.

**Date/week logic lives in `src/components/dateUtils.jsx`** — ISO week/year calculations (`isoWeek`, `isoYear`, `weeksInIsoYear`, `mondayOf`), plus Finnish date/weekday formatters (`dShort`, `dWritten`, `dFull`, `formatShort`, `formatLong`, `WD`/`WEEKDAYS`, `M_FULL`, `M_SHORT`). All week-number pages and components should use these rather than reimplementing ISO week math.

**Pages vs. components**: `src/pages/*` are route-level screens (one per `AppRoutes.jsx` route); `src/components/*` are shared building blocks (`Navbar`, `Footer`, `Weekcounter`, `WeeklySearch`, `WeeksOfMonth`, `YearsWeek`, `QuickLinks`, `FAQ`, `WeekCard`, `Information`) composed into `Home.jsx` and other pages.

**Build chunking** (`vite.config.js`): manual chunks split `react`/`react-dom`/`scheduler` into a `react` chunk, `react-router*` into a `router` chunk, and everything else from `node_modules` into `vendor`, for long-term browser caching. This only applies to the client build — the SSR build uses default (single-bundle) output.

## Deployment

CI (`.github/workflows/deploy.yml`) builds the Docker image on GitHub Actions and pushes to GHCR on every push to `main`; the deploy job then SSHes into the server to `docker pull` + restart the container — the server never builds anything itself. The `VITE_WEB3FORMS_ACCESS_KEY` build arg is injected from a GitHub secret at build time (Vite bakes `VITE_*` vars into the bundle, so it cannot be supplied at container runtime).

`Dockerfile` is a two-stage build: stage 1 (`node:22-alpine`) runs `npm run build`; stage 2 copies only `dist/` into `nginxinc/nginx-unprivileged:1.27-alpine`, serving on port 3005 (rootless, hence >1024). `nginx.conf` sets SPA fallback, immutable caching for fingerprinted `/assets/`, and no-cache for `index.html`/`robots.txt`/`sitemap.xml` so redeploys and SEO updates take effect immediately.

## Contact form

`src/pages/ContactUs.jsx` posts directly to the Web3Forms API with no backend. It implements its own client-side anti-spam: a honeypot field, a minimum-fill-time trap (3s), and a `localStorage`-based rate limiter (cooldown + rolling-window cap). The Web3Forms access key is safe to expose client-side (it can only deliver mail to the pre-verified address).
