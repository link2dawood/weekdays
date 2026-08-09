# Expansion Plan: Prerendering Horizon to 2100

Estimates for expanding week/month/year/holiday page generation from the
current horizon (2020–2035, 16 years) out to 2100. Numbers below are
computed directly from the site's real ISO-week logic (`weeksInIsoYear`),
not rounded guesses — full methodology at the bottom.

**Headline finding**: this isn't a 4-item change (week/month/year/holiday
pages) — every system built this session multiplies with it (PDFs, OG
images, Discover images, JSON data feeds, sitemap), because they're all
generated per-year in the same loop. The real ask is closer to "make the
whole site 5x bigger," not "add some pages."

## URL count

| Page type | Current (2020–2035, 16 yrs) | To 2100 (2020–2100, 81 yrs) | Multiplier |
|---|---|---|---|
| Week pages | 835 | 4,227 | 5.06x |
| Month pages | 192 | 972 | 5.06x |
| Year pages | 16 | 81 | 5.06x |
| Individual holiday pages | 240 | 1,215 | 5.06x |
| Holiday hub pages | 16 | 81 | 5.06x |
| Calendar variants (4/yr) | 64 | 324 | 5.06x |
| Flag-day hub pages | 16 | 81 | 5.06x |
| Working-day pages (yearly+monthly) | 208 | 1,053 | 5.06x |
| **Total HTML pages** | **1,587** | **8,034** | **5.06x** |

Every category scales by the same 5.06x factor — mechanically expected,
since it's the same "loop over every year" driving all of them.

## Build impact

Full-system file count (HTML + every per-year asset this session added:
JSON feeds, PDFs, OG images, Discover images):

| Asset type | Current | To 2100 | Multiplier |
|---|---|---|---|
| HTML pages | 1,587 | 8,034 | 5.06x |
| JSON data feed files | ~1,619 | ~8,196 | 5.06x |
| PDF files (calendar+week+month) | ~1,043 | ~5,280 | 5.06x |
| OG images | ~1,283 | ~6,495 | 5.06x |
| Discover images | ~1,283 | ~6,495 | 5.06x |
| **Grand total files generated** | **~6,815** | **~34,500** | **5.06x** |

I can't measure this sandbox's actual current build duration (Node
18.19.1 here can't run the real Vite/Vercel build — a pre-existing
limitation from earlier this session), so I can't give you an absolute
"build currently takes X minutes → would take Y." What I can say with
confidence: PDF generation (pdfkit) and image generation (`@vercel/og`'s
`ImageResponse`, which renders via a headless-browser-equivalent layout
engine) are the two most CPU-intensive steps per item already — those
~11,775 PDF+image files (current: ~3,609) are where build time will
concentrate, not the plain-JSON or HTML templating steps. If your current
build is already multiple minutes (plausible, given ~6,815 generated
files today), 5x the highest-cost asset types puts a from-scratch build
at real risk of hitting CI/platform time limits, not just "takes longer
to wait for."

## Storage impact

Rough per-file-type sizes (typical for this stack, not measured in this
sandbox):

| Asset type | Est. size each | Current total | To 2100 total |
|---|---|---|---|
| HTML page | ~15–25 KB | ~30 MB | ~150 MB |
| JSON feed file | ~1–3 KB | ~3 MB | ~15 MB |
| PDF (pdfkit, Helvetica, no images) | ~15–30 KB | ~23 MB | ~118 MB |
| OG image (PNG, 1200×630) | ~30–60 KB | ~58 MB | ~293 MB |
| Discover image (PNG, 1200×675) | ~20–45 KB | ~42 MB | ~211 MB |
| **Approx. total `dist/` size** | | **~155 MB** | **~785 MB** |

Directionally reliable (image + PDF counts dominate, and those unit sizes
are realistic for this content), but treat the total as order-of-
magnitude, not a guarantee — I'd want an actual `du -sh dist/` from a real
build to replace this estimate before treating it as a hard number.
~800MB isn't disqualifying for most static hosts, but it's a real jump
from "fits comfortably" to "check your plan's limits."

## SEO impact — the part that actually matters here

This is where the plan should probably stop, not scale.

**The indexable window doesn't change, so this isn't "5x more pages
competing in search."** `isIndexable()` already caps what's actually
indexed to `currentYear-2` .. `currentYear+4` (a ~7-year window) — that
logic is unrelated to the *prerender* horizon and wouldn't need to change.
So the realistic outcome of expanding to 2100 is: **~6,447 new pages that
are prerendered, real, reachable by URL — and marked `noindex` the moment
they're built**, per the exact mechanism `CLAUDE.md` and
`SEO_CONSTITUTION.md` already document existing specifically "to avoid a
long tail of near-duplicate future-year pages diluting search ranking."

That's not a hypothetical risk for this expansion — it's the literal
stated reason that logic exists. Building 6,447 more of the pages it's
designed to exclude doesn't dilute rankings (they're excluded), but it
does:

1. **Waste crawl budget.** `noindex` pages still get requested — a
   crawler has to fetch a page to see the `noindex` tag. 6,447 new
   fetches for content nobody searches for competes with crawl budget
   for pages that matter.
2. **Have ~zero real search demand.** Nobody is searching "viikko 14
   vuonna 2073." A live calculator (`/paivamaara-viikoksi`,
   `/viikko-paivamaaraksi`) already answers any date, past or future,
   without a prerendered page — that's the entire reason those
   calculator pages exist. A static page for year 2073 adds no
   capability a visitor doesn't already have.
3. **Cost real, measurable build/storage resources** (above) **for pages
   that are `noindex` from the moment they're built** — the worst
   combination: real cost, no SEO return.

**If there's a genuine reason to extend the horizon** (a specific,
real use case — e.g. long-range corporate/government planning tools
citing this site, or a partner integration needing far-future week
numbers), the right move is a **smaller, deliberate extension** of
`PRERENDER_MAX_YEAR` (currently `currentYear + 9`), not a jump to a fixed
year 75 years out. Even doubling to `currentYear + 20` is a ~1.5x
expansion, not 5x, and keeps the horizon rolling (always "current + N")
rather than fixed (drifting further from "current" every year until
someone remembers to bump it again).

## Recommendation

Don't build this as specified. If there's a real, named use case driving
the "until 2100" request, tell me what it is and I'll size an expansion
that actually serves it — the calculator pages already give unlimited
date coverage for anyone who just wants a number, so the prerendered-page
horizon should track genuine long-range lookup demand, not round to a
century mark.

---

## Methodology

- Week counts computed with the site's actual `isoWeek()`/
  `weeksInIsoYear()` logic (verified match against `src/components/
  dateUtils.js`), summed year-by-year across both ranges — not a flat
  "52 weeks/year" assumption (2020–2100 contains ~15 years with 53).
- HTML/data-feed/PDF/image counts derived from the exact generation loops
  in `prerender.js` (one calendar PDF + N week PDFs + 12 month PDFs per
  year; one OG and one Discover image per week/month/year/holiday page;
  8 JSON feed families per year, one of which — holiday detail — is
  itself ×15 per year).
- Storage figures are typical-size estimates for this stack (pdfkit
  Helvetica-only PDFs, `@vercel/og` PNGs), not measured — flagged as such
  above, not presented as verified.
