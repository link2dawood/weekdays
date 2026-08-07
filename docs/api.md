# Viikko Nro — API Documentation

Reference for the four `/api/` endpoints on `https://viikkonro.fi`. Written
for both developers integrating the API and AI agents calling it directly.

## Architecture, up front

**There is no application server behind `/api/`.** Every endpoint is a
permanent HTTP redirect (301) to a static, prerendered JSON file under
`/data/`. There is no request-time computation, no database, no custom
error handling beyond what static file hosting gives you for free. This is
a deliberate simplicity trade-off — it means:

- **No auth, no API key, no rate limit** — it's a static file, served from
  the CDN like an image would be.
- **No partial/filtered/query-param responses** — each file is a complete,
  fixed payload for one week/month/year/holiday. There is no `?fields=` or
  `?limit=`; none are read.
- **No custom JSON error envelope** — see [Error handling](#error-handling-shared-across-all-endpoints) below. This is the one
  behavior most likely to surprise an integrator, so read it before wiring
  up retry/error logic.

For the full field-by-field schema of the underlying data (`/data/week/`,
`/data/month/`, `/data/year/`, `/data/holidays/`), see
[`docs/datasets.md`](./datasets.md). This document covers the `/api/`
*endpoints* — request/response contract, errors, caching, versioning — not
every field in exhaustive detail.

---

## Endpoint 1 — `/api/week/{week}/{year}`

### Request

```
GET /api/week/{week}/{year}.json
```

| Parameter | Type | Range | Required |
|---|---|---|---|
| `week` | integer | `1`–`52` or `1`–`53` (depends on year; see [`weeksInIsoYear`](../src/components/dateUtils.js)) | Yes |
| `year` | integer | `2020`–`2035` (ISO week-year) | Yes |

- Method: `GET` only.
- No headers required. No query parameters are read.
- `year` is the **ISO week-year**, not necessarily the calendar year of
  every day in that week (a week spanning New Year's can belong to a
  different ISO year than 1 January itself — see
  [`docs/datasets.md`](./datasets.md#1-week-dataset)).

### Response

`301 Moved Permanently` → `Location: /data/week/{year}/{week}.json`, which
resolves to `200 OK`, `Content-Type: application/json; charset=utf-8`.

### Example JSON

`GET /api/week/32/2026.json` → (after redirect) →

```json
{
  "schemaVersion": "1.0",
  "week": 32,
  "year": 2026,
  "startDate": "2026-08-03",
  "endDate": "2026-08-09",
  "workingDays": 5,
  "holidays": [],
  "flagDays": [],
  "quarter": 3,
  "season": "summer",
  "url": "https://viikkonro.fi/viikko-32-2026"
}
```

### Usage

```bash
curl -L https://viikkonro.fi/api/week/32/2026.json
```

```js
// fetch() follows redirects by default — no special handling needed.
const week = await (await fetch("https://viikkonro.fi/api/week/32/2026.json")).json();
```

`curl` requires `-L` to follow the redirect; without it you'll get the 301
response body (empty) instead of the JSON.

---

## Endpoint 2 — `/api/month/{month}/{year}`

### Request

```
GET /api/month/{month}/{year}.json
```

| Parameter | Type | Range | Required |
|---|---|---|---|
| `month` | integer | `1`–`12` | Yes |
| `year` | integer | `2020`–`2035` | Yes |

### Response

`301 Moved Permanently` → `Location: /data/month/{year}/{month}.json` →
`200 OK`, `application/json; charset=utf-8`.

### Example JSON

`GET /api/month/8/2026.json` →

```json
{
  "schemaVersion": "1.0",
  "month": 8,
  "year": 2026,
  "startDate": "2026-08-01",
  "endDate": "2026-08-31",
  "weekCount": 6,
  "weeks": [
    { "week": 31, "year": 2026 },
    { "week": 32, "year": 2026 },
    { "week": 33, "year": 2026 },
    { "week": 34, "year": 2026 },
    { "week": 35, "year": 2026 },
    { "week": 36, "year": 2026 }
  ],
  "workingDays": 21,
  "weekendDays": 10,
  "holidays": [],
  "flagDays": [],
  "quarter": 3,
  "url": "https://viikkonro.fi/kuukausi-8-2026"
}
```

### Usage

```bash
curl -L https://viikkonro.fi/api/month/8/2026.json
```

---

## Endpoint 3 — `/api/year/{year}`

### Request

```
GET /api/year/{year}.json
```

| Parameter | Type | Range | Required |
|---|---|---|---|
| `year` | integer | `2020`–`2035` | Yes |

### Response

`301 Moved Permanently` → `Location: /data/year/{year}.json` → `200 OK`,
`application/json; charset=utf-8`.

### Example JSON

`GET /api/year/2026.json` (holiday/flag-day arrays truncated — 15 and 14
items respectively; see full example in
[`docs/datasets.md`](./datasets.md#3-year-dataset)) →

```json
{
  "schemaVersion": "1.0",
  "year": 2026,
  "weekCount": 53,
  "workingDays": 254,
  "weekendDays": 104,
  "holidays": [
    { "name": "Uudenvuodenpäivä", "date": "2026-01-01", "official": true }
  ],
  "flagDays": [
    { "name": "J. L. Runebergin päivä", "date": "2026-02-05" }
  ],
  "firstWeek": { "week": 1, "year": 2026 },
  "lastWeek": { "week": 53, "year": 2026 },
  "url": "https://viikkonro.fi/vuosi-2026"
}
```

### Usage

```bash
curl -L https://viikkonro.fi/api/year/2026.json
```

---

## Endpoint 4 — `/api/holiday/{slug}/{year}`

### Request

```
GET /api/holiday/{slug}/{year}.json
```

| Parameter | Type | Range | Required |
|---|---|---|---|
| `slug` | string | One of 15 fixed slugs (below) | Yes |
| `year` | integer | `2020`–`2035` | Yes |

Valid `slug` values (one file per holiday per year — this is a *per-holiday
detail* endpoint, distinct from the full-year list at
`/data/holidays/{year}.json`):

```
uudenvuodenpaiva, loppiainen, pitkaperjantai, paasiaispaiva,
toinen-paasiaispaiva, vappu, helatorstai, helluntaipaiva, juhannusaatto,
juhannuspaiva, pyhainpaiva, itsenaisyyspaiva, jouluaatto, joulupaiva,
tapaninpaiva
```

### Response

`301 Moved Permanently` → `Location: /data/holiday/{year}/{slug}.json` →
`200 OK`, `application/json; charset=utf-8`.

### Example JSON

`GET /api/holiday/itsenaisyyspaiva/2026.json` →

```json
{
  "schemaVersion": "1.0",
  "slug": "itsenaisyyspaiva",
  "name": "Itsenäisyyspäivä",
  "year": 2026,
  "date": "2026-12-06",
  "weekday": "Sunnuntai",
  "week": 49,
  "weekYear": 2026,
  "month": 12,
  "quarter": 4,
  "official": true,
  "kind": "kiinteä pyhäpäivä",
  "rule": "Suomen itsenäisyyspäivää vietetään aina 6. joulukuuta.",
  "legalBasis": {
    "act": "388/1937",
    "actName": "Laki itsenäisyyspäivän viettämisestä yleisenä juhla- ja vapaapäivänä",
    "url": "https://www.finlex.fi/en/legislation/1937/388"
  },
  "url": "https://viikkonro.fi/pyhat-2026/itsenaisyyspaiva"
}
```

`legalBasis` is `null` for the 13 of 15 holidays without an independently
confirmed, holiday-specific Finlex citation (most fall under the Church
Act or a different instrument not individually re-verified) — it is never
guessed. `official` is `false` only for the two unofficial eve days
(`juhannusaatto`, `jouluaatto`); all others are `true`.

### Usage

```bash
curl -L https://viikkonro.fi/api/holiday/vappu/2026.json
```

To resolve the slug for a holiday you only know by name, see the full list
in [`docs/datasets.md`](./datasets.md#4-holiday-dataset) or fetch
`/data/holidays/{year}.json`, whose entries share the same `name` values.

---

## Error handling (shared across all endpoints)

**There is no JSON error body.** These endpoints are static-file redirects
with no server-side validation layer, so an invalid request does not
return `{"error": "..."}` — it returns the site's generic HTML 404 page.
Concretely:

| Situation | What happens |
|---|---|
| Valid parameters | `301` → `200` JSON, as documented above |
| `year` outside `2020`–`2035` | `301` redirect still fires (the redirect rule doesn't validate), then the target `/data/...json` file doesn't exist → `404`, `Content-Type: text/html`, body is the site's generic "Sivua ei löytynyt" page |
| `week` outside the valid range for that year (e.g. `53` in a 52-week year) | Same as above: `301` then `404` HTML |
| `slug` not one of the 15 valid values | Same: `301` then `404` HTML |
| Non-numeric `year`/`week`/`month` (e.g. `/api/week/abc/2026.json`) | Same: the redirect pattern matches any non-slash characters, so it still 301s, then 404s |
| Any HTTP method other than `GET` | Not a documented/supported use case for a static asset; do not rely on specific behavior |

**Practical implication**: validate `year`/`week`/`month`/`slug` against
the documented ranges *before* calling the API, rather than relying on the
response to tell you the request was invalid. Don't parse the 404 response
body as JSON — check the HTTP status code first. A `200` response is
always well-formed JSON matching the shapes above; anything else is not.

---

## Rate limits

**None.** No API key, no per-IP throttling, no quota. These are static
files served from Vercel's CDN — the practical ceiling is CDN bandwidth,
not an application-level limit. There is no benefit to artificially
throttling your own requests, though caching responses client-side (see
below) avoids redundant fetches of data that rarely changes.

## Caching

- **The `/api/...` redirect itself**: `301 Moved Permanently` is
  cacheable by HTTP clients and browsers per standard HTTP semantics —
  most well-behaved clients will remember the redirect target and skip the
  extra hop on repeat requests. If your HTTP client caches redirects
  aggressively and the target ever needs to change, expect that to lag.
- **The final `/data/...json` response**:
  `Cache-Control: public, max-age=3600` (clients may cache 1 hour) and
  `CDN-Cache-Control: public, s-maxage=86400, stale-while-revalidate=604800`
  (the CDN edge treats it fresh for 24 hours, then serves stale while
  revalidating for up to 7 days).
- **CORS**: the final `/data/...json` response carries
  `Access-Control-Allow-Origin: *`, so browser-based cross-origin `fetch()`
  works. The `/api/...` redirect hop itself does not carry a CORS header
  (only the site-wide security headers do); if you hit CORS issues calling
  `/api/` directly from a browser, call the equivalent `/data/...json` URL
  instead — server-side, CLI, and most AI-agent HTTP clients aren't subject
  to CORS at all, so this only matters for browser JavaScript.
- Recommendation: cache responses client-side for at least an hour, longer
  for past (non-current) weeks/months/years, which never change once
  published.

## Versioning

- **No URL versioning** — there is no `/v1/` or `/v2/` prefix, and none is
  planned; see the field-addition policy below for why.
- Every response body carries a `schemaVersion` field (currently `"1.0"`).
  It increments **only** when an existing field is removed or renamed.
  Adding a new field to a response is explicitly *not* a breaking change
  and does not bump the version — write your parsing code to ignore
  unknown fields.
- The four `/api/` URL *patterns* themselves (`/api/week/...`,
  `/api/month/...`, `/api/year/...`, `/api/holiday/...`) are permanent
  redirects to permanent `/data/` URLs; neither is expected to change
  shape once published for a given period.

## See also

- [`docs/datasets.md`](./datasets.md) — full field-by-field schema,
  purpose, update frequency and temporal coverage for every dataset,
  including the two not aliased under `/api/` (Quarter, Flag-day) and the
  ones that are (Week, Month, Year, Holiday).
- `/avoin-data` — the human-readable version of this reference, rendered
  on the live site.
- `/data/knowledge-graph.json` — how these entities relate to every other
  page and resource on the site.
- `/ai.txt`, `/llms.txt`, `/ai-manifest.txt` — machine-readable discovery
  files an AI agent should fetch before this document, for site-wide
  context.
