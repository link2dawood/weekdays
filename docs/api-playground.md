# API Playground — Design Spec

An interactive page for testing the site's 4 live `/api/` endpoints
(week/month/year/holiday) directly in the browser, with matching
curl/JS/PHP/Python examples. No backend risk to design around — every
endpoint is a static-file redirect (`docs/api.md`), so "live testing" is
just a `fetch()` from the browser to a public, CORS-open static file;
there's no server, no rate limit, nothing that can be broken by traffic.

## One deliberate exception to flag up front

**This page should be English, with an English URL slug** — a real
departure from `SEO_CONSTITUTION.md` invariant #1 (Finnish-only URL
slugs), which I'm making deliberately rather than by accident, for the
same reason `docs/api.md` and `llms-api.txt` already are English despite
the rest of the site being Finnish-first: API documentation and
developer tooling are near-universally English by convention, even on
non-English company sites, and the stated target ("developers searching
for week APIs") is an English-query audience. This mirrors the site's
existing single deliberate exception (`/en`) rather than introducing an
unprincipled second one — it's the same "developer/international content
gets English" boundary already drawn, just applied to a new page instead
of extended to Finnish content.

**Proposed URL**: `/api-playground` (not `/api-testaa` or similar — an
English audience searching "week number API playground" should see a
matching URL, and this isn't competing with any Finnish-slug page for the
same query).

---

## UI

Single page, four sections:

1. **Endpoint selector** — tabs: Week / Month / Year / Holiday.
2. **Parameter inputs** — change per tab:
   - Week: `week` (1–53), `year` (2020–2035)
   - Month: `month` (1–12), `year`
   - Year: `year`
   - Holiday: `slug` (dropdown of the 15 real holiday slugs), `year`
3. **Try it** button — fires a real `fetch()` to the actual
   `/api/{...}.json` URL built from the current inputs, displays:
   - The resolved request URL (so the user sees the 301 target, not just
     a black box)
   - Response status, response headers (`Content-Type`,
     `Cache-Control` — real ones, not simulated)
   - Pretty-printed JSON response body
   - **Deliberately also demonstrates the real error case**: if inputs
     are out of range, show the actual 404 HTML response (truncated),
     not a fabricated error message — this is the single most-likely-to-
     surprise behavior documented in `docs/api.md` (no JSON error
     envelope), so the playground should teach it, not paper over it.
4. **Code examples** — 4 tabs (curl / JavaScript / PHP / Python),
   regenerated live as the parameter inputs change, each with a
   copy-to-clipboard button.

### Code example templates (per endpoint, parameterized)

**curl**
```bash
curl -L https://viikkonro.fi/api/week/{week}/{year}.json
```

**JavaScript**
```js
const res = await fetch("https://viikkonro.fi/api/week/{week}/{year}.json");
const week = await res.json();
console.log(week);
```

**PHP**
```php
<?php
$json = file_get_contents("https://viikkonro.fi/api/week/{week}/{year}.json");
$week = json_decode($json, true);
print_r($week);
```

**Python**
```python
import requests
week = requests.get("https://viikkonro.fi/api/week/{week}/{year}.json").json()
print(week)
```

Same 4-language template repeats for month/year/holiday, substituting the
real endpoint path from `docs/api.md`. All 4 examples must be generated
from **one shared template per language** (parameterized by endpoint),
not 16 independent hand-written snippets — same single-source-of-truth
discipline as everything else in this codebase; a hand-maintained 4×4
grid of code strings is exactly how one of them quietly goes stale.

---

## SEO

- **Title**: "API Playground — Test the Free ISO Week Number API | Viikko Nro"
- **Meta description**: targets the stated real search intent directly
  — "Test Viikko Nro's free ISO 8601 week number API live in your
  browser. No auth, no rate limit. cURL, JavaScript, PHP and Python
  examples for week, month, year and Finnish holiday endpoints."
- **`routeMeta` entry**, `sitemapEntries()` inclusion — same mechanism
  as every other page, no special-casing needed despite the language
  exception.
- Content should state the real facts already established in
  `docs/api.md` (no auth, no rate limit, 301→200, no JSON error
  envelope) as visible page text, not just in schema — an English-
  searching developer reading the page should get the same accurate
  picture an AI system parsing its schema would.

## Schema

`WebAPI` (schema.org's actual type for describing an API — not used
anywhere else on the site) — one node per endpoint, plus the page's own
`WebPage`/`TechArticle` node with `mainEntity` pointing at all four:

```json
{
  "@type": "WebAPI",
  "@id": "https://viikkonro.fi/api-playground#api-week",
  "name": "Viikko Nro Week API",
  "description": "Free ISO 8601 week-number data for any week/year, 2020-2035. No auth, no rate limit.",
  "documentation": "https://viikkonro.fi/avoin-data",
  "termsOfService": "https://viikkonro.fi/kayttoehdot",
  "endpointUrl": "https://viikkonro.fi/api/week/{week}/{year}.json"
}
```
Repeated for month/year/holiday (4 `WebAPI` nodes total). Page-level:
```json
{
  "@type": "TechArticle",
  "@id": "https://viikkonro.fi/api-playground#webpage",
  "mainEntity": [
    { "@id": "...#api-week" }, { "@id": "...#api-month" },
    { "@id": "...#api-year" }, { "@id": "...#api-holiday" }
  ]
}
```
Plus `FAQPage` (real questions: "Is there a rate limit?", "Do I need an
API key?", "What happens if I request an invalid week?" — answered
straight from `docs/api.md`, not invented) and `HowTo` (matching the
existing `CALCULATOR_SCHEMA` convention: numbered steps for "select an
endpoint → set parameters → click Try it → copy the code example").

## Internal linking

**From**:
- `/avoin-data` — add a prominent "Try it live" link near the top,
  pointing here (currently that page only shows static examples).
- `llms-api.txt` — add a line pointing developers/AI systems at the
  interactive version.
- Site footer — a `/api-playground` link makes sense in a "Developers"
  or "API" footer group if one gets added; not forcing it into the
  existing Service/Company columns if it doesn't fit either.

**To** (from the playground page, out to the rest of the site):
- `/avoin-data` — full field-by-field documentation (the playground
  demonstrates; that page explains).
- The real HTML page matching whatever example is currently selected
  (e.g. testing week 32/2026 → link to `/viikko-32-2026`) — ties the
  machine-readable demo back to the human-readable page for the same
  data, so neither side of the site is a dead end from the other.
- `/kayttoehdot` (terms, referenced by `termsOfService` in the schema
  above — should be a real visible link too, not just a schema pointer).

---

## Implementation notes

- Pure client-side React component — no SSR concern beyond the usual
  prerendered shell (the interactive "Try it" functionality only runs
  after hydration, same as every other calculator on the site).
- Reuse the exact 4 endpoint patterns from `docs/api.md` — don't
  re-derive them; that file is the single source of truth for what the
  API actually does.
- The out-of-range/error demonstration (UI point 3) should use a real
  invalid request (e.g. week 60), not a mocked error response — the
  whole point is showing the actual, sometimes-surprising behavior.
