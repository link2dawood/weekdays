# Research Center — Design Spec

**20 reports, and this time the honest count actually reaches 20** — worth
flagging since the last several requests this session got cut hard (100
pages → 8, 100 definitions → 33, 50 calculators → 17). A "report" is a
different content shape: it's a genuine data-analysis cut of the site's
existing 16-year (2020–2035) dataset, and there turn out to be 20 real,
distinct, chart-worthy cuts of that same underlying data without
repeating an angle or inventing numbers the site doesn't have. Checked
`schoolHolidayPages.js` before including the regional report (#5) — it
does carry real per-city data with a confirmed/estimated confidence
label already, so that report can honestly show which regions are
verified vs. estimated rather than presenting all of it as equally solid.

Every report below computes from data the site already has (`holidaysInYear`,
`flagDaysInYear`, `weeksInIsoYear`, the Easter algorithm, school-holiday
municipal data) across the real 2020–2035 horizon — nothing requires new
data collection, and nothing extrapolates past what's actually computed
elsewhere in this codebase.

## Architecture

- **`/tutkimuskeskus`** (hub): lists all 20 reports, grouped by theme,
  each with a one-line finding as a teaser (not just a title — a
  journalist scanning the hub should see the actual hook).
- **`/tutkimuskeskus/{slug}`** (20 individual reports): each a genuine
  data-journalism piece — a lead finding, 1–3 charts, a methodology note
  (what data, what date range, computed how), and a table of the
  underlying numbers for anyone who wants to verify or re-derive.

### Schema (shared pattern)

`Report` (schema.org's actual type for this — a subtype of `Article`,
not used anywhere else on the site) + `Dataset` (linking to the real
`/data/` feed(s) the report is computed from — reuses `datasetNodes()`,
doesn't invent a new one) + `ImageObject` per chart (the site already has
this exact pattern from OG/Discover images) + `BreadcrumbList`.

```json
{
  "@type": "Report",
  "@id": "https://viikkonro.fi/tutkimuskeskus/{slug}#report",
  "headline": "...",
  "about": { "@id": "https://viikkonro.fi/#organization" },
  "isBasedOn": { "@id": "https://viikkonro.fi/#dataset-{family}" },
  "datePublished": "...",
  "dateModified": "FEED_BUILD_DATE — same distinction fixed earlier this session, not the hand-bumped editorial constant, since these recompute from live data every build"
}
```

---

## The 20 reports

| # | Title | URL slug | Data source | Chart(s) |
|---|---|---|---|---|
| 1 | Kuinka usein Suomessa on 53 viikon vuosi? | `53-viikon-vuodet` | `/data/year/{year}.json` (2020-2035) | Timeline: 52- vs 53-week years |
| 2 | Työpäivien määrä vuosittain 2020–2035 | `tyopaivat-vuosittain` | `/data/year/*.json` | Line chart: working days/year |
| 3 | Mitkä vuodet vievät eniten pyhäpäiviä viikonloppuun? | `pyhapaivat-viikonlopussa` | `/data/holidays/*.json` | Bar chart: holidays-on-weekend count/year |
| 4 | Siltapäivien kalenteri 2020–2035 | `siltapaivat` | `/data/holidays/*.json` + weekday | Calendar heatmap: bridge-day opportunities |
| 5 | Hiihtoloman viikko vaihtelee alueittain | `hiihtoloma-alueittain` | `schoolHolidayPages.js` (confirmed + estimated, labeled separately) | Map/table: ski-holiday week by city |
| 6 | Mikä vuosineljännes sisältää eniten työpäiviä? | `tyopaivat-vuosineljanneksittain` | `/data/quarter/*.json` | Grouped bar: working days by Q1–Q4 |
| 7 | Pääsiäisen vaihtelu ja sen vaikutus kevään pyhiin | `paasiaisen-vaihtelu` | Easter algorithm (`juhlapaivat.js`) | Range chart: Easter date span 2020-2035 |
| 8 | ISO-viikko vs. USA:n viikko: eroavatko ne yhä enemmän? | `iso-vs-usa-viikot` | Computed (dateUtils.js logic) | Line chart: divergence days/year |
| 9 | Itsenäisyyspäivän viikonpäivä 2020–2035 | `itsenaisyyspaiva-viikonpaivat` | `/data/holidays/*.json` | Histogram: weekday distribution |
| 10 | Vapun ja Helatorstain väli — kuinka paljon se vaihtelee? | `vappu-helatorstai-vali` | Computed from holiday dates | Line chart: week-gap by year |
| 11 | Keskimääräiset työpäivät kuukausittain | `tyopaivat-kuukausittain-keskiarvo` | `/data/monthly-working-days/*.json` (aggregated) | Bar chart: avg. working days per calendar month |
| 12 | Joulun ja uudenvuoden vapaajakson pituus vuosittain | `joulun-vapaajakso` | `/data/holidays/*.json` + weekday | Bar chart: consecutive days off by year |
| 13 | Kuinka usein liputuspäivä osuu pyhäpäivän kanssa samalle päivälle? | `liputus-ja-pyhapaiva-paallekkaisyys` | `/data/flag-days/*.json` | Bar chart: overlap count/year |
| 14 | Yksinäiset pyhäpäivät vs. viikonloppuun rajautuvat | `yksinaiset-pyhapaivat` | `/data/holidays/*.json` + weekday | Stacked bar: isolated vs. adjacent-to-weekend, by year |
| 15 | Työpäivät kuukausittain 2020–2035 (koko aikasarja) | `tyopaivat-kuukausittain-aikasarja` | `/data/monthly-working-days/*.json` | Heatmap: month × year grid |
| 16 | Mihin kuukausiin Suomen pyhäpäivät kasautuvat? | `pyhapaivat-kuukausittain` | `/data/holidays/*.json` | Bar chart: holiday count by month |
| 17 | Kolme 53 viikon vuotta rinnakkain: 2020, 2026, 2032 | `53-viikon-vuodet-vertailu` | `/data/year/2020,2026,2032.json` | Side-by-side calendar comparison |
| 18 | Liikkuvien pyhien päivämäärähaarukka | `liikkuvat-pyhat-haarukka` | Easter algorithm, all movable feasts | Range chart per movable holiday |
| 19 | Minä viikonpäivänä Suomen pyhäpäivät useimmiten osuvat? | `pyhapaivien-viikonpaivajakauma` | `/data/holidays/*.json`, all 15 × 16 years | Histogram: weekday distribution, all holidays combined |
| 20 | Osuuko koululoma aina pyhäpäivän kanssa samalle viikolle? | `koululoma-ja-pyhapaiva` | School holiday data + `/data/holidays/*.json` | Bar chart: overlap frequency by year |

---

## Two fully worked examples

### #1 — "Kuinka usein Suomessa on 53 viikon vuosi?"

- **Title**: Kuinka usein Suomessa on 53 viikon vuosi?
- **URL**: `/tutkimuskeskus/53-viikon-vuodet`
- **Data source**: `/data/year/{year}.json` for `{year}` in 2020–2035
  (`weekCount` field) — real, already-computed, no new data needed.
- **Charts**: (1) a 16-year timeline strip, one cell per year, colored
  by 52 vs. 53; (2) a callout stat: "3 of 16 years (18.75%) in this
  range have 53 weeks."
- **Schema**: `Report` + `Dataset` (`isBasedOn` →
  `#dataset-year`) + `ImageObject` (the timeline chart) + `FAQPage`
  (e.g. "Milloin seuraava 53 viikon vuosi on?" → 2032).
- **Internal links**: `/kuinka-monta-viikkoa-vuodessa` (the existing
  explainer this report extends into a data story), `/vuosi-2026`,
  `/vuosi-2032`, `/sanasto/viikko-53` (from `glossary-system.md`).

### #9 — "Itsenäisyyspäivän viikonpäivä 2020–2035"

- **Title**: Itsenäisyyspäivän viikonpäivä 2020–2035
- **URL**: `/tutkimuskeskus/itsenaisyyspaiva-viikonpaivat`
- **Data source**: `/data/holidays/{year}.json`, filtered to
  Itsenäisyyspäivä, all 16 years — `weekday` field already present in
  that feed.
- **Charts**: histogram — 16 data points across 7 weekday buckets (a
  fixed 6 December date cycles through weekdays roughly evenly over 16
  years, but not exactly — the real distribution is the finding).
- **Schema**: `Report` + `Dataset` (`isBasedOn` →
  `#dataset-holidays`) + `ImageObject` + `FAQPage` ("Onko
  itsenäisyyspäivä 2026 arkena vai viikonloppuna?" → answer computed
  from real 2026 data).
- **Internal links**: `/pyhat-{year}/itsenaisyyspaiva` for each of the
  16 years (a genuinely rich internal-linking opportunity — 16 real
  target pages, not a generic "see also"), `/pyhapaivat-2026`.

---

## Implementation notes

- Every report's chart data comes from the **existing** `/data/` JSON
  feeds — no new computation logic, just aggregation across years that
  the per-year feeds already expose individually. A report's build step
  is "fetch/read N years of an existing feed and reduce," not new
  business logic.
- `dateModified` on every report should be `FEED_BUILD_DATE` (the
  build-freshness fix from earlier this session), not the hand-bumped
  `CONTENT_UPDATED` — these regenerate their numbers from live data on
  every build, same category as the `/data/` feeds, not hand-edited prose.
- Chart rendering: reuse `@vercel/og`'s `ImageResponse` (already the
  site's chart/graphic-rendering mechanism, via the Discover-image
  system) rather than adding a new charting library — a bar/line/heatmap
  in flexbox-div rectangles is exactly what `discoverMonthGrid()` already
  does for calendar grids.
- Register all 20 in `sitemapEntries()`, `llms-data.txt` (a "Reports"
  pointer section), and `/avoin-data`.
- Target audience (journalists/schools/researchers) means each report's
  methodology note matters as much as the chart — state the exact date
  range, the exact source feed, and the exact computation, since this
  audience is the one most likely to ask "how was this calculated" and
  most valuable to have citing this site accurately if they trust the
  answer.
