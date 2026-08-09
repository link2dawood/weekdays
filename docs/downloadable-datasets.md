# Downloadable Dataset Pages — Design Spec

Design for 5 new HTML landing pages (`/data/week`, `/data/month`,
`/data/year`, `/data/holiday`, `/data/working-days`), each documenting one
dataset family with `Dataset` + `DataDownload` schema, an API endpoint,
and three download formats (JSON, CSV, XML). This is the spec — nothing
here has been built yet (per your call to design first).

## Two decisions this spec is built around

**1. Bulk-per-year, not per-record.** JSON stays exactly as it is today
(one file per week/month/etc. — that granularity is right for
programmatic single-record lookups and isn't changing). CSV and XML are
new, and are bulk exports: one file per year containing every record in
it, matching how the site's existing CSV feature already works
(`downloadCalendarCsv(year)` — all 52/53 weeks in one file, not one file
per week). Building CSV/XML at per-record granularity would mean ~1,700
tiny one-row files each — not how anyone actually consumes a CSV/XML
export, and not what "downloadable dataset" conventionally means.

**2. `/data/working-days` reconciles a real naming gap, non-breaking.**
No existing family is called `working-days` — the closest is
`monthly-working-days` (per-month breakdown) plus working-day totals
already inside `/data/year/{year}.json`. Rather than rename the existing
family (a breaking URL change `SEO_CONSTITUTION.md` explicitly forbids
without a 301), `/data/working-days` becomes a new page + new bulk
CSV/XML export that presents `monthly-working-days` under a clearer public
name — exactly the same pattern already used for `/api/holiday/` aliasing
`/data/holiday/`. The underlying JSON family keeps its existing name and
URLs untouched.

**3. `/data/holiday` bulk export uses the per-year-list shape.** Two JSON
families already touch "holiday": `holidays` (plural — all 15 holidays for
a year, one file) and `holiday` (singular — one file per named holiday per
year, added for the `/api/holiday/{slug}/{year}` alias). A "download all
holidays" bulk CSV/XML naturally means the per-year list (15 rows), so
that's what `/data/holiday/{year}.csv|.xml` contains — the page documents
both JSON families, but the bulk export matches `holidays`, not `holiday`.

---

## Shared page template (all 5 pages)

Evergreen static pages (flat prerendered files, same convention as
`/avoin-data` — `dist/data/week.html`, not `dist/data/week/index.html`,
so they don't collide with the real `dist/data/week/` directory of JSON
files sitting right next to them).

1. **H1 + direct-answer sentence**: what this dataset is, one sentence.
2. **Quick facts**: record count/year, temporal coverage (2020–2035),
   formats available, license, update frequency — same `QuickFacts`
   component pattern used elsewhere on the site.
3. **Formats table**: JSON endpoint pattern + example, CSV endpoint
   pattern + example, XML endpoint pattern + example — see per-dataset
   sections below.
4. **Field reference**: summary table inline; links to `docs/datasets.md`
   for the exhaustive version rather than duplicating it in full.
5. **Download table**: year-by-year CSV/XML links, 2020–2035.
6. **FAQ** (`FAQPage` schema, same `*Faqs()` → visible `<details>` +
   schema-node pattern as every other page).
7. **Schema**: `Dataset` + 3×`DataDownload` + `FAQPage` + `BreadcrumbList`.

---

## 1. `/data/week`

**Dataset schema** (extends the existing `datasetNodes()` week entry —
same `@id`, richer `distribution`):
```json
{
  "@type": "Dataset",
  "@id": "https://viikkonro.fi/#dataset-week",
  "name": "Suomen ISO 8601 -viikkonumerodata",
  "temporalCoverage": "2020-01-01/2035-12-31",
  "distribution": [
    { "@type": "DataDownload", "encodingFormat": "application/json", "contentUrl": "https://viikkonro.fi/data/week/index.json" },
    { "@type": "DataDownload", "encodingFormat": "text/csv", "contentUrl": "https://viikkonro.fi/data/week/2026.csv" },
    { "@type": "DataDownload", "encodingFormat": "application/xml", "contentUrl": "https://viikkonro.fi/data/week/2026.xml" }
  ]
}
```
(`contentUrl` for CSV/XML points at the current year as the canonical
example; the page's download table links all 16.)

**API endpoint**: `GET /api/week/{week}/{year}.json` (existing, 301 →
`/data/week/{year}/{week}.json`)

**Formats**:
| Format | URL pattern | Example | Shape |
|---|---|---|---|
| JSON | `/data/week/{year}/{week}.json` | `/data/week/2026/32.json` | One record (existing) |
| CSV | `/data/week/{year}.csv` | `/data/week/2026.csv` | 52/53 rows, one per week |
| XML | `/data/week/{year}.xml` | `/data/week/2026.xml` | 52/53 `<week>` elements |

**CSV columns**: `week,startDate,endDate,workingDays,quarter,season,holidays,flagDays`
(`holidays`/`flagDays` are semicolon-joined names, empty string if none.)

**XML shape**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<weeks year="2026" schemaVersion="1.0">
  <week number="32">
    <startDate>2026-08-03</startDate>
    <endDate>2026-08-09</endDate>
    <workingDays>5</workingDays>
    <quarter>3</quarter>
    <season>summer</season>
    <holidays/>
    <flagDays/>
  </week>
  <!-- ... -->
</weeks>
```

---

## 2. `/data/month`

**Dataset schema**: extends the existing `#dataset-month` node the same way as above.

**API endpoint**: `GET /api/month/{month}/{year}.json` (existing)

**Formats**:
| Format | URL pattern | Example | Shape |
|---|---|---|---|
| JSON | `/data/month/{year}/{month}.json` | `/data/month/2026/8.json` | One record (existing) |
| CSV | `/data/month/{year}.csv` | `/data/month/2026.csv` | 12 rows |
| XML | `/data/month/{year}.xml` | `/data/month/2026.xml` | 12 `<month>` elements |

**CSV columns**: `month,monthName,startDate,endDate,weekCount,workingDays,weekendDays,quarter,holidays,flagDays`

**XML shape**: `<months year="2026"><month number="8"><name>Elokuu</name>...</month></months>`

---

## 3. `/data/year`

Different shape from the other four: the JSON family is already one
record *per* year, so "bulk" here means **all years in one file**, not
one file per year (a per-year CSV would be a pointless single data row).

**Dataset schema**: extends `#dataset-year`.

**API endpoint**: `GET /api/year/{year}.json` (existing)

**Formats**:
| Format | URL pattern | Example | Shape |
|---|---|---|---|
| JSON | `/data/year/{year}.json` | `/data/year/2026.json` | One record (existing) |
| CSV | `/data/year.csv` | — | **All 16 years**, one row each |
| XML | `/data/year.xml` | — | **All 16 years**, one `<year>` element each |

**CSV columns**: `year,weekCount,workingDays,weekendDays,firstWeek,firstWeekYear,lastWeek,lastWeekYear`

**XML shape**: `<years schemaVersion="1.0"><year number="2026">...</year>...</years>`

---

## 4. `/data/holiday`

Documents both existing JSON families (`holidays` — per-year list, and
`holiday` — per-slug detail backing `/api/holiday/`); the bulk CSV/XML
matches the per-year-list shape.

**Dataset schema**: extends `#dataset-holidays` (bulk distribution) — the
page should also link to `#dataset-holiday` (the per-slug family) as a
related dataset, via `Dataset.isBasedOn` or a plain related-links section,
so the two aren't presented as the same thing.

**API endpoints**: `GET /api/holiday/{slug}/{year}.json` (existing,
per-slug) — there's no per-year-list `/api/` alias today; if one's wanted,
it'd be `GET /api/holidays/{year}.json` (plural, new — not scoped here,
flagging as a natural follow-up, not building it silently).

**Formats**:
| Format | URL pattern | Example | Shape |
|---|---|---|---|
| JSON (per-year list) | `/data/holidays/{year}.json` | `/data/holidays/2026.json` | One record, 15 holidays inline (existing) |
| JSON (per-slug detail) | `/data/holiday/{year}/{slug}.json` | `/data/holiday/2026/vappu.json` | One record per holiday (existing) |
| CSV | `/data/holiday/{year}.csv` | `/data/holiday/2026.csv` | 15 rows |
| XML | `/data/holiday/{year}.xml` | `/data/holiday/2026.xml` | 15 `<holiday>` elements |

**CSV columns**: `name,date,weekday,week,official`

**XML shape**: `<holidays year="2026"><holiday official="true"><name>Vappu</name>...</holiday>...</holidays>`

---

## 5. `/data/working-days`

New public name for the existing `monthly-working-days` family (see
decision #2 above) — JSON URLs are unchanged; this page and its CSV/XML
are additive.

**Dataset schema**: extends `#dataset-monthly-workingdays`, described on
this page under the clearer `/data/working-days` name.

**API endpoint**: none exists today (`/api/month/` returns the *week*
composition of a month, not its working-day count) — if wanted, a new
`GET /api/working-days/{month}/{year}.json` alias would 301 to
`/data/monthly-working-days/{year}/{month}.json`. Flagged, not assumed.

**Formats**:
| Format | URL pattern | Example | Shape |
|---|---|---|---|
| JSON | `/data/monthly-working-days/{year}/{month}.json` | `/data/monthly-working-days/2026/8.json` | One record (existing) |
| CSV | `/data/working-days/{year}.csv` | `/data/working-days/2026.csv` | 12 rows (+ a synthesized `TOTAL` row using the year feed's own totals, so the whole-year figure and the monthly breakdown can't disagree) |
| XML | `/data/working-days/{year}.xml` | `/data/working-days/2026.xml` | 12 `<month>` elements + one `<total>` |

**CSV columns**: `month,monthName,workingDays,weekendDays,officialHolidaysInMonth`

---

## Implementation notes (for whenever this gets built)

- New path-builder functions in `seo.js`, matching the existing
  `*PdfPath()` single-source-of-truth pattern: `weekCsvPath(year)`,
  `weekXmlPath(year)`, `monthCsvPath(year)`, `monthXmlPath(year)`,
  `yearCsvPath()`, `yearXmlPath()` (no year param), `holidayCsvPath(year)`,
  `holidayXmlPath(year)`, `workingDaysCsvPath(year)`,
  `workingDaysXmlPath(year)`. Every consumer (page link, `DataDownload`
  schema, sitemap) reads these — never a hand-built path string.
- CSV/XML generation reuses the *same* already-computed per-record data
  (`holidaysInYear()`, `flagDaysInYear()`, `monthStats()`, etc.) the JSON
  writers already call — building the bulk row set by mapping over the
  same source, not a second independent computation that could drift.
- File count: 5 datasets × 16 years × 2 formats = 160 new files (not the
  ~3,400 a per-record approach would produce), plus the year dataset's 2
  singleton files (`year.csv`, `year.xml`) instead of 32.
- Register each new format in `datasetNodes()`'s `distribution` array,
  `/data/index.json`'s per-family entries, `DATA_FEED_FAMILIES` in
  `openDataContent.js`, and `/avoin-data` — the same four-place
  registration this session's `SEO_CONSTITUTION.md` (invariant #8) already
  requires for any new dataset surface.
- `vercel.json`'s `/data/(.*)` header block sets
  `Content-Type: application/json` unconditionally — it needs a
  `.csv`/`.xml`-specific header rule (`text/csv; charset=utf-8`,
  `application/xml; charset=utf-8`) added alongside it, or CSV/XML
  responses will be mislabeled as JSON.
