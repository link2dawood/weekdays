# Dataset Format Extension — Design Spec

Extends `docs/downloadable-datasets.md` (JSON/CSV/XML) with the 4
requested formats. Two corrections to the premise before the design,
then the spec itself.

## Corrections to "Current: JSON, CSV, XML"

**CSV and XML aren't built yet.** Checked `prerender.js` for any
CSV/XML-writing code: none exists. `docs/downloadable-datasets.md` is a
design spec from two requests ago (you chose "design spec first" then)
— it was never implemented. Only **JSON is real and live**. This spec
extends the *full plan* (JSON + designed-CSV/XML + the 4 new formats),
but building it means building CSV/XML for the first time too, not just
adding 4 formats on top of a working 3-format system.

**One of the 4 requested formats is likely redundant, and I'd cut it.**
Markdown and TXT would contain the same content for this data shape (a
week/month/year/holiday record) — Markdown *is* readable plain text, just
with light structure (`#`, `-`, bold). Shipping both means two file
extensions with near-identical bytes, the same file-proliferation pattern
already cut twice this session (100 pages → 8, 100 definitions → 33).
Recommendation below: build Markdown, skip a separate `.txt`.

**One of the other three (XML) is a weak fit for the stated goal.**
"Easiest for AI systems" and XML sit in tension — XML is the most
verbose, most token-expensive format of the seven under discussion, and
isn't what LLM/RAG pipelines preferentially parse (that's JSON, JSON-LD,
and increasingly Markdown). It's already scoped in
`downloadable-datasets.md` for spreadsheet/legacy-system consumers, which
is a real audience — just not the AI-citation audience this request is
optimizing for. Keeping it for that other audience is fine; it shouldn't
be justified by *this* goal.

## Recommended final format set (7 → 6)

| Format | Status | Granularity | Serves |
|---|---|---|---|
| JSON | **live** | per-record | Programmatic lookup (existing `/api/` aliases) |
| JSON-LD | **new, recommended** | per-record | Semantic/schema-graph consumption — the closest fit for "AI systems" specifically |
| NDJSON | **new, recommended** | bulk-per-year | Streaming/bulk ingestion into RAG pipelines |
| Markdown | **new, recommended** | per-record | Citation-friendly prose — an AI quoting a fact wants this, not raw JSON |
| CSV | designed, not built | bulk-per-year | Spreadsheet/analyst tools |
| XML | designed, not built | bulk-per-year | Legacy/enterprise systems — not the AI-citation audience |
| TXT | **not recommended** | — | Redundant with Markdown for this content shape |

---

## File naming

Extends the existing `*PdfPath()`-style single-source-of-truth pattern in
`seo.js` — one path-builder function per format per family, every
consumer (page link, schema, sitemap) reads it, never a hand-built string.

| Format | Pattern | Example |
|---|---|---|
| JSON (existing) | `/data/{family}/{year}/{n}.json` | `/data/week/2026/32.json` |
| JSON-LD | `/data/{family}/{year}/{n}.jsonld` | `/data/week/2026/32.jsonld` |
| Markdown | `/data/{family}/{year}/{n}.md` | `/data/week/2026/32.md` |
| NDJSON | `/data/{family}/{year}.ndjson` | `/data/week/2026.ndjson` |
| CSV (designed) | `/data/{family}/{year}.csv` | `/data/week/2026.csv` |
| XML (designed) | `/data/{family}/{year}.xml` | `/data/week/2026.xml` |

JSON-LD and Markdown mirror JSON's per-record granularity (same `{n}` —
week/month number, or slug for holidays); NDJSON mirrors CSV/XML's
bulk-per-year granularity, for the same reason CSV/XML are bulk (see
`downloadable-datasets.md`'s reasoning — one record's worth of NDJSON
would just be one line, pointless).

`year` dataset is the one exception throughout (already true for
CSV/XML): one record *per year* already, so its bulk files are
`/data/year.ndjson` etc. (all years, no `{year}` in the path), not
per-year.

---

## Schema

### JSON-LD — reuse, don't reinvent

Every page already embeds a real JSON-LD graph in its `<head>`
(`pageNode()`, `FAQPage`, etc. — the whole schema system built earlier
this session). The per-record `.jsonld` file is **that same graph,
extracted as a standalone fetchable document** — not a new schema design.
`/data/week/2026/32.jsonld` is the exact `@graph` array currently only
reachable by fetching `/viikko-32-2026` and parsing its `<script
type="application/ld+json">` — now fetchable directly, for a consumer
that wants schema without an HTML parse. This also means no new
schema.org type-fitting risk (recall the site already removed `Event`
schema from holidays/flag-days earlier this session because it didn't
fit — reusing the existing, already-correct nodes avoids repeating that
mistake for a new format).

### NDJSON — same shape, no wrapping array

One JSON object per line, byte-identical field shape to the existing
per-record JSON, just concatenated with `\n` instead of nested in an
array:
```
{"schemaVersion":"1.0","week":1,"year":2026,"startDate":"2025-12-29",...}
{"schemaVersion":"1.0","week":2,"year":2026,"startDate":"2026-01-05",...}
```

### Markdown — citation-friendly fact sheet

```markdown
# Viikko 32, 2026

- **Alkaa:** maanantai 3.8.2026
- **Päättyy:** sunnuntai 9.8.2026
- **Työpäiviä:** 5
- **Vuosineljännes:** Q3
- **Vuodenaika:** kesä
- **Juhlapäivät:** –
- **Liputuspäivät:** –

Lähde: [viikkonro.fi/viikko-32-2026](https://viikkonro.fi/viikko-32-2026)
```
Deliberately mirrors the QuickFacts block already visible on the live
page — same facts, same order, so nothing here can disagree with what a
person sees.

---

## API endpoints

Extends the existing `/api/` alias pattern (redirect, not a duplicate —
same discipline as the existing week/month/year/holiday aliases):

```
GET /api/week/{week}/{year}.jsonld  -> /data/week/{year}/{week}.jsonld
GET /api/week/{week}/{year}.md      -> /data/week/{year}/{week}.md
GET /api/week/{year}.ndjson         -> /data/week/{year}.ndjson
```
(and equivalently for month/year/holiday — note the NDJSON alias drops
the per-record `{week}`/`{month}`/`{slug}` segment, since it's a bulk
endpoint, same shape difference as the file-naming table above.)

Same behavior as the existing aliases: 301, no auth, no rate limit, no
JSON error envelope on invalid params (still 404s with the site's HTML
error page — that's a `vercel.json` redirect-rule characteristic, not
format-specific, so it applies identically to every new extension).

---

## Cache strategy

Same `Cache-Control`/`CDN-Cache-Control` values as the existing `/data/`
header block (`public, max-age=3600` / `s-maxage=86400,
stale-while-revalidate=604800`) — no reason for a new format to have a
different freshness policy than the JSON it's a re-serialization of; they
regenerate together, in the same build.

What **does** need to change: `vercel.json`'s `/data/(.*)` header
currently force-sets `Content-Type: application/json` for everything
under `/data/` (the same gap already flagged in
`downloadable-datasets.md` for CSV/XML) — extending to 3 more formats
means 3 more `Content-Type` overrides, not a blanket rule:

| Extension | Content-Type |
|---|---|
| `.jsonld` | `application/ld+json; charset=utf-8` |
| `.ndjson` | `application/x-ndjson; charset=utf-8` |
| `.md` | `text/markdown; charset=utf-8` |

---

## Real scale, if built for all current dataset families

Computed the same way as the earlier 2100-horizon estimate — real
numbers, not a guess. For the 4 per-record-shaped families (week, month,
year, holiday) across the current 2020–2035 horizon:

| Format | New files |
|---|---|
| JSON-LD (per-record) | ~1,283 |
| Markdown (per-record) | ~1,283 |
| NDJSON (bulk-per-year, 4 families × 16 years) | ~64 |
| **Total new files** | **~2,630** |

On top of the ~160 CSV/XML files `downloadable-datasets.md` already
scoped (still unbuilt), this roughly **doubles** the current `/data/`
file count again. Not a reason to not build it — unlike the 2100-horizon
expansion, these are all within the already-indexed, already-relevant
date range, serving a real audience (AI ingestion) rather than
speculative far-future years — but worth seeing the real number rather
than treating "add 4 formats" as small.

## Recommendation

Build JSON-LD, NDJSON, and Markdown — each serves a genuinely different
AI/RAG consumption pattern and directly advances the stated goal. Build
CSV and XML too, since they were already scoped and CSV has real
non-AI demand (spreadsheets). Skip a separate TXT format — Markdown
already covers that need. That's 6 formats total, not 7, and gets you
closer to "easiest dataset for AI systems" than 7 would, since a
redundant format is one more thing an AI system has to figure out is
the same as another one, not additional coverage.

## Implementation checklist

- [ ] `seo.js`: `weekJsonLdPath`, `weekMdPath`, `weekNdjsonPath` (+
      month/year/holiday equivalents) — single-source path builders.
- [ ] `prerender.js`: JSON-LD writer reuses the exact graph already built
      for the HTML page (extract, don't reconstruct); Markdown writer
      reuses the same QuickFacts values already rendered visibly; NDJSON
      writer maps over the same per-record data the JSON writer already
      produces.
- [ ] `vercel.json`: 3 new `/api/` alias redirects per family, 3 new
      Content-Type rules (table above) alongside the existing CSV/XML
      ones once those are built.
- [ ] Register in all the places `SEO_CONSTITUTION.md` invariant #8
      already requires for any dataset change: `datasetNodes()`
      `distribution` array, `/data/index.json`, `DATA_FEED_FAMILIES`,
      `/avoin-data`.
- [ ] `llms-data.txt` (built two requests ago): add a "Formats" note per
      family so this doesn't become the next stale-content gap.
