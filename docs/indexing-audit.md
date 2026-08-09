# Indexing Strategy Audit — Viikkonro.fi

Read-only audit, no code changed. Every finding below cites an exact
file and line number, and every count is either computed from the real
logic (isolated Node harness reusing the actual `isIndexable()`/
`sitemapEntries()` functions, methodology at the bottom) or explicitly
marked as not independently verified in this pass, with the reason.

---

## 1. Every noindexed URL is intentionally outside `isIndexable()`

**Verified: yes, by construction, for every route currently in the
system.**

The single gate is `isIndexable()`, `prerender.js:142-151`:

```js
const isIndexable = (p) => {
  if (/^\/pyhat-\d{4}\/[a-z0-9-]+$/.test(p)) return true;   // line 146
  const m = p.match(/-(\d{4})(?:-(?:alkuvuosi|loppuvuosi))?$/);
  if (!m) return true;                                       // line 148
  const y = Number(m[1]);
  return y >= INDEX_MIN_YEAR && y <= INDEX_MAX_YEAR;         // line 150
};
```
`INDEX_MIN_YEAR`/`INDEX_MAX_YEAR` (`prerender.js:140-141`) =
`currentYear-2`..`currentYear+4` = **2024–2030** as of this audit
(`currentYear = 2026`).

It's applied at the actual noindex-flip site, `prerender.js:2395`:
```js
if (!isIndexable(url) || meta.robots?.startsWith("noindex")) {
```
This OR has two branches. I checked whether the second branch
(`meta.robots`) ever fires independently of the first:

- `src/data/seo.js`: only **one** route in the entire meta system sets
  `robots` explicitly — `calendarMeta()`, `src/data/seo.js:604`,
  value `"index, follow"` (not noindex).
- `metaFor()` (`src/data/seo.js:959-990`) returns one of ~20 possible
  meta shapes; none of the others include a `robots` field at all, so
  `meta.robots` is `undefined` for every other route and
  `undefined?.startsWith(...)` is always `false`.

**Finding**: today, `meta.robots?.startsWith("noindex")` is dead code —
no route sets it. Every currently-noindexed URL is noindexed *solely*
because `isIndexable()` returned `false`. This is a correct, intentional
mechanism, not an accident — confirmed by the comment directly above it
(`prerender.js:2392-2394`, "Prune the index to the high-intent window").

**Not a current bug, but a latent one** (feeds into finding #2 below):
the code was clearly written to support a *second*, independent
noindex reason — if that ever gets used (someone adds `robots:
"noindex, follow"` to a specific route's meta for a reason unrelated to
the year window), it will correctly noindex that page's `<meta>` tag,
but will **not** be excluded from the sitemap (see #2). The mechanism
exists but isn't dual-purpose everywhere it's checked.

### Named-holiday exception (by design, verified correct)

`prerender.js:146` makes all `/pyhat-{year}/{slug}` pages indexable
regardless of year — the whole 2020–2035 span, not just 2024–2030. This
is intentional (comment at `prerender.js:143-145`: "the deliberately
expanded content cluster"), not a bug, and it's the reason indexable
totals below include 240 individual holiday pages spanning 16 years
while every sibling category (week/month/year/etc.) only contributes its
7-year window's worth.

---

## 2. No noindexed page should appear in `sitemap.xml`

**Verified: true today, but by coincidence, not by construction. This
is the audit's one real finding.**

The sitemap's filter, `prerender.js:3248`:
```js
const indexableEntries = sitemapEntries(currentYear).filter((e) => isIndexable(e.path));
```
This checks **only** `isIndexable(e.path)`. It does **not** also check
`meta.robots?.startsWith("noindex")` — unlike the actual per-page
noindex-flip condition at `prerender.js:2395`, which checks both.

Because (per finding #1) no route currently sets `meta.robots` to
noindex, `isIndexable()` alone happens to produce the same result as the
full two-branch condition — **today**. But the two checks are not the
same code, and nothing keeps them in sync structurally. If a future
change adds a per-route `robots: "noindex, ..."` override for a reason
other than the year window (the mechanism already exists and is already
checked at the per-page level, so it reads as supported), that page
would:
- Correctly get `<meta name="robots" content="noindex, follow">` in its
  own HTML (via `prerender.js:2395-2399`), **and**
- **Still be listed in `sitemap.xml`**, because line 3248 never
  re-checks `meta.robots`.

**Recommendation** (not applied — audit only): line 3248's filter should
check the same condition line 2395 does:
```js
.filter((e) => isIndexable(e.path) && !metaFor(e.path)?.robots?.startsWith("noindex"))
```

---

## 3. Every noindexed page still has a self-referencing canonical

**Verified: true, by construction, for every route.**

`prerender.js:2336`: `const canonical = canonicalFor(url);` — computed
unconditionally, once per route, from that route's own `url`.

`prerender.js:2358-2362`:
```js
let html = applyMeta(template, {
  title: meta.title,
  description,
  url: canonical,
});
```
`applyMeta()` (`prerender.js:194-228`) writes
`<link rel="canonical" href="${u}">` (line 205-207) unconditionally.

This entire sequence runs **before** the noindex-flip check at line
2395. The noindex flip only ever touches the `<meta name="robots">`
string (lines 2396-2399) — nothing in that block or after it re-touches
or removes the canonical tag. There is no code path where a page's
canonical points anywhere other than its own `canonicalFor(url)`, and no
code path where indexability status affects whether the canonical tag is
written. Spot-checked the literal strings both operations match against
real `index.html` content (`index.html:12` for canonical,
`index.html:37-40` for robots) — both regexes match the real markup
exactly, so neither replace silently no-ops.

---

## 4. Legacy route family audit

All 5 requested families, `vercel.json:8-12`:

| Source | Destination | Status | Verified match (path-to-regexp) |
|---|---|---|---|
| `/week/:week/:year` | `/viikko-:week-:year` | 301 | ✅ `/week/32/2026` → captures `week=32, year=2026` |
| `/month/:month/:year` | `/kuukausi-:month-:year` | 301 | ✅ `/month/8/2026` → `month=8, year=2026` |
| `/year/:year` | `/vuosi-:year` | 301 | ✅ `/year/2026` → `year=2026` |
| `/print/:year` | `/tulosta-:year` | 301 | ✅ `/print/2026` → `year=2026` |
| `/pdfs/:file` | `/pdf/:file` | 301 | ✅ `/pdfs/kalenteri-2026.pdf` → `file=kalenteri-2026.pdf` |

All 5 tested directly against the real `path-to-regexp` (the library
Vercel's redirect matching uses), not assumed.

**Do they accidentally return 200?** No, on two independent layers:
1. `vercel.json` has no `rewrites`/SPA-fallback configured (documented
   in `CLAUDE.md`) — a path with no matching redirect and no matching
   prerendered file is a genuine 404, not a client-rendered guess.
2. Even hypothetically without the redirect: `AppRoutes.jsx` has no
   `path="/week/..."` etc. route (confirmed via grep, zero matches), and
   the catch-all `DynamicSlug` (`AppRoutes.jsx:56` route
   `path="/:slug"`) only ever matches a **single** path segment — a
   3-segment path like `/week/32/2026` can't match a `/:slug` route in
   React Router at all, so even a client-side navigation would fall
   through to `NotFound` (`AppRoutes.jsx`, `path="*"`), never a 200.
3. Checked for a shadowing static file/directory (`public/pdfs/` or
   similar) that could pre-empt the redirect at the filesystem layer:
   none exists.

**Canonicalize?** Not applicable in the risky sense — since these paths
never render page content (301 before any HTML is served), there's no
canonical tag to check on them. The redirect target itself
(`/viikko-32-2026` etc.) carries its own correct self-referencing
canonical per finding #3.

**One resilience note, not a bug**: if any of these 5 redirect lines
were ever accidentally deleted, the fallback isn't a duplicate-content
200 — it degrades safely to a 404 (per point 1 above). Low blast radius
either way.

---

## 5. Report

### Total indexed / noindexed URLs

Computed precisely for the dominant year-scoped categories (week, month,
year, quarter, holiday hub, individual holidays, flag-day hub,
working-days yearly+monthly, print, calendar × 4 variants) — these are
the categories `isIndexable()`'s year-window logic actually governs, and
where the volume is. Methodology: reused the real `isIndexable()` logic
verbatim and replicated `sitemapEntries()`'s year-generation loop
(`src/data/seo.js:867-951`) in an isolated Node harness against the real
`weeksInIsoYear()`/`HOLIDAY_DEFINITIONS`.

| | Count |
|---|---|
| Total year-scoped URLs generated (2020–2035) | **1,667** |
| — Indexable (in sitemap) | **864** |
| — Noindexed (excluded from sitemap, still prerendered) | **803** |
| PDF sitemap entries (subset of indexable: calendar+week+month) | **456** |
| **Total `<url>` entries in `sitemap.xml`** (HTML + PDF, this scope) | **1,320** |

Breakdown of the 803 noindexed, by family (all outside 2024–2030):

| Family | Noindexed count |
|---|---|
| `/viikko-{w}-{y}` | 470 |
| `/tyopaivat-{month}-{y}` | 108 |
| `/kuukausi-{m}-{y}` | 108 |
| `/q{1-4}-{y}` | 36 |
| `/vuosi-{y}` | 9 |
| `/pyhapaivat-{y}` | 9 |
| `/liputuspaivat-{y}` | 9 |
| `/tyopaivat-{y}` | 9 |
| `/tulosta-{y}` | 9 |
| `/kalenteri-{y}` | 9 |
| `/kalenteri-{y}-alkuvuosi` + `-loppuvuosi` | 18 |
| `/tulostettava-kalenteri-{y}` | 9 |

Note: `/pyhat-{year}/{slug}` (individual holidays) contributes **0** to
the noindexed count — all 240 (15 holidays × 16 years) are indexable per
the deliberate exception at `prerender.js:146`.

**Not recomputed in this pass** (Node-version sandbox limitation — this
codebase's `nameDays.js` uses a JSON import assertion this sandbox's
Node 18.19.1 can't parse, and that module is in the dependency chain for
name-day/school-holiday route generation): static pages (~20, all
indexable per `prerender.js:148`), `/nimipaiva/{name}` and
`/nimipaivat/{date}` (all indexable — no year suffix, so
`isIndexable()` returns `true` unconditionally for these), and
`/koululomat-{year}` (year-scoped, and additionally gated by
`pageConfidenceTier()` per `src/data/seo.js:838-839` — only `CONFIRMED`-
tier years reach the sitemap at all, a stricter filter than the year
window alone). These are a small fraction of total URL count relative to
the ~1,667 above and don't change the audit's structural findings; exact
counts require a real build (`npm run build`, then reading the actual
generated `sitemap.xml`/console output) rather than this sandbox.

### URLs leaking into sitemap

**Zero, currently** — see finding #2. The structural risk (sitemap
filter not checking `meta.robots`) exists but has nothing exploiting it
today.

### Legacy URLs requiring redirects

**Zero requiring new redirects** — all 5 requested families already
redirect correctly (`vercel.json:8-12`), verified against the real
matching library. No gap found.

### Crawl budget opportunities

1. **The 803 noindexed-but-still-crawlable pages are a real, ongoing
   crawl-budget cost.** `noindex, follow` (not `noindex, nofollow`)
   means crawlers still fetch these pages to discover the noindex tag,
   and still follow their outbound links. This is the correct choice
   for link-equity flow (a 2019 far-future week page still links to its
   own month/year/quarter, keeping that graph connected) but it is not
   free — every one of those 803 URLs is a real HTTP request a crawler
   spends budget on for a page that will never rank. This is an
   intentional, already-understood tradeoff (per the `CLAUDE.md`
   rationale), not a new finding, but worth stating as the concrete cost
   side of that tradeoff.
2. **Close finding #2's gap** (add the `meta.robots` check to the
   sitemap filter) before it's ever needed — cheap now, silently wrong
   later if a per-route noindex override gets added for any reason
   other than the year window.
3. **The PDF sitemap (456 entries) scales 1:1 with the HTML sitemap.**
   Every week/month/calendar page's PDF gets its own `<url>` entry.
   Worth confirming (separately from this audit, which didn't check
   PDF-specific crawl value) that Search Console actually indexes and
   surfaces these PDFs in results — if not, that's 456 sitemap entries
   spending budget for zero indexing return, the same category of cost
   as point 1 but for a resource type Google indexes less aggressively
   than HTML by default.
4. **`INDEX_MIN_YEAR`/`INDEX_MAX_YEAR`'s 7-year window is already the
   lever that exists for tuning this tradeoff** (`prerender.js:140-141`)
   — if crawl-budget pressure is a real, measured problem (e.g. via
   Search Console's crawl-stats report, not assumed), narrowing the
   window (e.g. `currentYear-1`..`currentYear+2`) is a one-line change
   with a precise, computable effect on both numbers in this report —
   no architecture change needed.

---

## Methodology

- `isIndexable()` and the `sitemapEntries()` year-generation loop were
  extracted verbatim (not reimplemented from memory) into an isolated
  Node harness importing the real `weeksInIsoYear()`
  (`src/components/dateUtils.js`) and `HOLIDAY_DEFINITIONS`
  (`src/data/holidayPages.js`) — the same verification pattern used
  throughout this session for anything requiring computed output.
- The 5 legacy redirects were tested against the actual `path-to-regexp`
  library (installed standalone, not assumed to behave a certain way),
  matching the verification standard already applied to this site's
  `/api/` aliases earlier this session.
- Every code citation above was re-read directly from the current file
  state immediately before writing this report, not recalled from
  earlier context.
