# Citation-Optimized Page Templates — Viikkonro.fi

Design reference for pages structured to be quoted, summarized, or linked
by AI answer engines (ChatGPT, Claude, Gemini, Perplexity) when they answer
questions about ISO week numbers, Finnish holidays, and working days. This
is a **content/structure design document, not implementation** — no routes,
components, or schema were added or changed to produce it. Where a page
already exists, this documents what to add or tighten; where one doesn't,
it specifies exactly what to build.

## Status of the 7 requested topics

| # | Topic | Status | URL |
|---|---|---|---|
| 1 | What week is today in Finland? | **Exists** | `/` (homepage) |
| 2 | ISO week number explained | **Exists** | `/mika-on-viikkonumero` |
| 3 | Week 1 explained | **Missing** | proposed: `/mika-on-viikko-1` |
| 4 | Week 53 explained | **Missing** | proposed: `/mika-on-viikko-53` |
| 5 | Finnish public holidays | **Exists (per year only)** | `/pyhapaivat-{year}` |
| 6 | Working days in Finland | **Exists (per year only)** | `/tyopaivat-{year}` |
| 7 | Calendar year pages | **Exists** | `/vuosi-{year}` |

Items 5 and 6 raise the same question the codebase has already answered
once: `/liputuspaivat` (no year) deliberately redirects to the current
year rather than becoming a second, year-less content type — see the
comment on that route in `src/AppRoutes.jsx`. This document does **not**
propose breaking that precedent. Instead, sections 5 and 6 below describe
how the *current year's* hub page (which is what a visitor or AI crawler
actually lands on) can better answer the general, year-agnostic version of
the question ("What are Finland's public holidays?") without inventing a
duplicate page.

---

## Shared template anatomy

Every page below follows the same skeleton, matching conventions already
in this codebase rather than inventing new ones:

1. **H1** — states the entity plainly (not a marketing headline).
2. **Direct-answer sentence** — one self-contained sentence, in the same
   `.answer-sentence`-class paragraph pattern already used on
   `WeekDays.jsx`/`WorkingDays.jsx`, which SSR's Speakable schema targets.
   This is the single sentence most likely to be lifted verbatim into an AI
   answer — it must be correct and complete without any surrounding
   context.
3. **Definition** — 1-2 sentences, dictionary-style, no fluff.
4. **Structured facts** — a `QuickFacts`-style block (the component already
   used on `WeekDays.jsx`, `WorkingDays.jsx`, etc.) — short label/value
   pairs, not prose. This is the part most cheaply parsed by an LLM without
   reading the whole page.
5. **Worked example(s)** — real, computed dates/numbers, never placeholder
   values (matching this codebase's standing rule against fabricated data).
6. **Explanation** — the "why," 2-4 short paragraphs.
7. **FAQ** — 3-6 Q&A pairs phrased as real queries, feeding a `FAQPage`
   JSON-LD node (same `faqNodes()`-family pattern already used throughout
   `prerender.js`).
8. **Related pages** — internal links to the specific week/month/year
   instance the reader most likely wants next (e.g. from "Week 1
   explained" to `/viikko-1-{currentYear}`), following the `isPartOf`/
   `mentions` edges already established in `/data/knowledge-graph.json`.

**Schema.org markup, every page**: `WebPage` (via the site's existing
`pageNode()`), `BreadcrumbList`, `FAQPage`, and `Speakable` scoped to the
direct-answer sentence — the same three-JSON-LD-node combination already
shipped on `/viikko-{week}-{year}` and `/tyopaivat-{year}`. Add
`DefinedTerm` for the four purely-definitional pages (2, 3, 4, and the
"ISO 8601 week" concept generally) — not currently used anywhere on the
site, and the one new schema type this document proposes.

**Why this shape helps citation specifically**: AI answer engines favor
content that is (a) extractable without JavaScript — already guaranteed
here by prerendering, (b) self-contained per-sentence rather than
requiring the whole page for context, (c) explicit about numbers and dates
rather than vague, and (d) structured as Q&A, which maps directly onto how
a user's question was phrased. Every element above serves one of those
four properties; nothing here is generic keyword-stuffing advice.

---

## 1. What week is today in Finland? (exists — `/`)

### Current state
The homepage already leads with a computed direct-answer sentence
(`Weekcounter.jsx`, driven by `homeMeta()` in `seo.js`) and a date-to-week
lookup tool.

### What to add for citation-optimization
- **FAQ section** — the homepage currently has no `FAQPage` schema of its
  own beyond the sitewide graph nodes (`homepageFaqNodes()` exists in
  `prerender.js` but check it covers today-specific phrasing). Add 4-5
  entries phrased exactly as users ask assistants:
  - "What week is it today in Finland?"
  - "What is this week's ISO week number?"
  - "When does the current week end?"
  - "Is this a 52- or 53-week year?"
- **Structured facts block**, above the fold: `{week, weekYear, startDate,
  endDate, quarter, weekCount (52/53)}` — currently expressed only as
  prose in the lead sentence; a table version is more directly extractable.

### Direct-answer sentence (template)
> "Today is in week {week} of {year} (ISO 8601), which runs from {Monday
> date} to {Sunday date}."

### Example (real, computed)
> "Today is in week 32 of 2026 (ISO 8601), which runs from Monday, 3
> August 2026 to Sunday, 9 August 2026."

### FAQ (proposed)
- Q: What week is it today in Finland? — A: [current week, restated]
- Q: Does Finland use the same week numbers as the rest of Europe? — A:
  Yes — Finland follows ISO 8601, the same standard used across the EU.
- Q: What day does the week start in Finland? — A: Monday, per ISO 8601
  (unlike the US convention, where the week starts Sunday).

---

## 2. ISO week number explained (exists — `/mika-on-viikkonumero`)

### Current state
Already an `Article` + `FAQPage` + `HowTo` page (see
`mikaOnViikkonumeroNodes()` in `prerender.js`).

### What to add
- **`DefinedTerm` schema** for "ISO 8601 week number" itself — currently
  the page explains the concept in prose/FAQ but doesn't mark it up as a
  formal definition, which is the schema type most directly useful to an
  answer engine looking for "define X."
- **A compact rule-list** (structured facts, not just prose) stating the
  three defining rules in one glanceable block:
  1. Week starts Monday, ends Sunday.
  2. Week 1 is the week containing the year's first Thursday (= the week
     containing 4 January).
  3. A year has 52 or 53 weeks.

### Direct-answer sentence
> "An ISO 8601 week number identifies one of the 52 or 53 seven-day weeks
> in a year, starting Monday and ending Sunday, where week 1 is the week
> containing the year's first Thursday."

### Definition (DefinedTerm candidate)
> **ISO week number**: the sequential number (1-52 or 1-53) assigned to a
> Monday-to-Sunday week under the ISO 8601 international date standard,
> counted so that week 1 always contains 4 January.

---

## 3. Week 1 explained (missing — propose `/mika-on-viikko-1`)

### Why this needs its own page
"Week 1" is disproportionately confusing because it's the one week whose
membership isn't obvious from the calendar: late-December dates can
belong to *next* year's week 1, and some of week 1's days can fall in the
*previous* calendar year. This exact confusion is a common AI-assistant
query ("why is Dec 30 in week 1?") that no current page directly answers
— `/viikko-alkaa-maanantaista` covers the Thursday rule in passing but
isn't structured as a standalone, citable answer to "what is week 1."

### Direct-answer sentence
> "Week 1 of an ISO year is the week that contains that year's first
> Thursday, which is always the same as the week containing 4 January —
> so week 1 can start as early as 29 December of the previous year."

### Definition
> **Week 1**: under ISO 8601, the first numbered week of a year, defined
> as the Monday-to-Sunday week containing 4 January (equivalently, the
> week containing the year's first Thursday) — not necessarily the week
> containing 1 January.

### Structured facts (template — fill with current/next year at build time)
| Fact | Value |
|---|---|
| Week 1 of {year} starts | {Monday date, computed} |
| Week 1 of {year} ends | {Sunday date, computed} |
| Contains 1 January {year}? | {yes/no, computed} |
| Days from the previous calendar year in this week | {count, computed} |

### Worked example (real, computed for 2026)
> Week 1 of 2026 runs from Monday, 29 December 2025 to Sunday, 4 January
> 2026 — three of its seven days (29-31 December) fall in the *2025*
> calendar year, but the week itself belongs to ISO week-year 2026,
> because it contains 4 January 2026 and the year's first Thursday
> (1 January 2026).

### FAQ (proposed)
- Q: Why is 30 December sometimes in week 1 of next year? — A: [Thursday
  rule, restated with the specific year's dates]
- Q: Does week 1 always contain 1 January? — A: No — only when 1 January
  falls on Monday, Tuesday, Wednesday, or Thursday. If 1 January falls on
  Friday, Saturday, or Sunday, it belongs to the *previous* year's last
  week instead, and week 1 starts the following Monday.
- Q: How is week 1 different from "the first week of January"? — A: They
  can differ — see the worked example above.

### Related pages
`/viikko-1-{currentYear}` (this year's actual week 1 page), `/mika-on-viikkonumero`, `/viikko-alkaa-maanantaista`.

---

## 4. Week 53 explained (missing — propose `/mika-on-viikko-53`)

### Why this needs its own page
Distinct from `/kuinka-monta-viikkoa-vuodessa` (which explains the general
52-vs-53 phenomenon): this page answers the sharper, more citable
question "is *this* year a 53-week year, and what is week 53 exactly,"
which is how people actually phrase it to an assistant.

### Direct-answer sentence
> "Week 53 exists only in 'long' ISO years — years where 1 January falls
> on a Thursday, or, in a leap year, on a Wednesday — and covers the last
> days of December."

### Definition
> **Week 53**: the 53rd and final ISO week of a "long year," occurring in
> roughly 1 out of every 5-6 years, following the same start-Monday /
> contains-4-January-equivalent rule as every other week.

### Structured facts
| Fact | Value (2020-2035 data horizon) |
|---|---|
| 53-week years | 2020, 2026, 2032 |
| Frequency | ~28% of years in this range (3 of 11 elapsed + upcoming) |
| Rule | 1 January falls on Thursday, OR (leap year AND 1 January falls on Wednesday) |

*(Verified computationally against the site's own `isoWeek`/`weeksInIsoYear`
logic for this document — 2020: leap year, 1 Jan = Wednesday; 2026: 1 Jan
= Thursday; 2032: leap year, 1 Jan = Thursday.)*

### Worked example (real, computed for 2026)
> 2026 is a 53-week year. Week 53 of 2026 runs from Monday, 28 December
> 2026 to Sunday, 3 January 2027 — meaning 1-3 January 2027 belong to ISO
> week 53 of *2026*, not week 1 of 2027.

### FAQ (proposed)
- Q: Does every year have 53 weeks? — A: No — most years have 52; roughly
  once every 5-6 years a year has 53 instead.
- Q: Is 2026 a 53-week year? — A: Yes.
- Q: What happens to the "missing" days in a 52-week year? — A: Nothing
  is missing — a 52-week year is exactly 364 days across 52 weeks, plus
  the 1 (or 2, in a leap year) extra day(s) get absorbed into the
  adjacent year's week 1 or the year's own final week, per the same
  first-Thursday rule.

### Related pages
`/viikko-53-2026`, `/kuinka-monta-viikkoa-vuodessa`, `/mika-on-viikko-1`
(the two "boundary week" pages should cross-link each other).

---

## 5. Finnish public holidays (exists per-year — `/pyhapaivat-{year}`)

### The year-agnostic question
An AI assistant asked "What are Finland's public holidays?" wants the
*list of 15 names* and the *general rules* (which are official vs.
informal, roughly when in the year they fall), not necessarily this
year's exact dates. The current hub page is correct but framed entirely
around one specific year.

### What to add (to the existing per-year hub, not a new page)
- **A year-agnostic structured-facts block above the per-year table**:
  the 15 holiday names, each tagged `official`/`unofficial`, without
  dates — genuinely answers the general-knowledge version of the question
  and is stable across every year's rendering of this page.
- **A `DefinedTerm`-style one-line answer** ahead of the per-year list:

> "Finland observes 13 official public holidays (arkipyhät) and 2 widely
> observed but unofficial 'eve days' (Juhannusaatto, Jouluaatto) — 15
> named days in total, most fixed to a specific date and a few tied to
> Easter or a specific weekday."

### Structured facts (year-agnostic)
| Holiday | Official? | Timing |
|---|---|---|
| Uudenvuodenpäivä | Yes | Fixed — 1 January |
| Loppiainen | Yes | Fixed — 6 January |
| Pitkäperjantai | Yes | Movable — 2 days before Easter Sunday |
| Pääsiäispäivä | Yes | Movable — Easter Sunday |
| 2. pääsiäispäivä | Yes | Movable — day after Easter |
| Vappu | Yes | Fixed — 1 May |
| Helatorstai | Yes | Movable — 39 days after Easter |
| Helluntai | Yes | Movable — 49 days after Easter |
| Juhannusaatto | No | Movable — Friday before Midsummer |
| Juhannuspäivä | Yes | Movable — Saturday, 20-26 June |
| Pyhäinpäivä | Yes | Movable — Saturday, 31 Oct-6 Nov |
| Itsenäisyyspäivä | Yes | Fixed — 6 December |
| Jouluaatto | No | Fixed — 24 December |
| Joulupäivä | Yes | Fixed — 25 December |
| Tapaninpäivä | Yes | Fixed — 26 December |

(This table is the year-agnostic content; the existing per-year table
below it keeps the exact computed dates — the two are complementary, not
duplicative.)

### FAQ (add to existing page)
- Q: How many public holidays does Finland have? — A: 15 named days: 13
  official (arkipyhät) and 2 unofficial eve days.
- Q: Are Christmas Eve and Midsummer Eve official holidays in Finland? —
  A: No — Jouluaatto and Juhannusaatto are widely observed but not
  legally official; most workplaces still close.
- Q: Which Finnish holidays move every year? — A: Six are tied to Easter
  or a specific weekday: Pitkäperjantai, Pääsiäispäivä, 2. pääsiäispäivä,
  Helatorstai, Helluntai, Juhannus(aatto/päivä), and Pyhäinpäivä.

---

## 6. Working days in Finland (exists per-year — `/tyopaivat-{year}`)

### The year-agnostic question
Same pattern as section 5: the general question is "how are working days
calculated in Finland," not a specific year's count.

### What to add (to the existing per-year hub)
- **A rule statement**, above the per-year figures:

> "A working day in Finland is any Monday-Friday that isn't one of the
> 13 official public holidays. Weekends and the 2 unofficial eve days
> don't count as holidays for this purpose, but Saturdays/Sundays are
> excluded as non-working days regardless."

- **A formula, stated explicitly** (structured, not just implied by a
  number): `working days = calendar days − weekends − official holidays`.

### Structured facts (year-agnostic)
| Fact | Rule |
|---|---|
| Working week | Monday-Friday |
| Reduces working-day count | Only the 13 official holidays |
| Does NOT reduce working-day count | Weekends, Juhannusaatto, Jouluaatto, all flag days |
| Typical working days per year | ~251-255, depending on how many official holidays fall on weekdays that year |

### FAQ (add to existing page)
- Q: Do Finnish flag days reduce the working-day count? — A: No — flag
  days (liputuspäivät) are separate from public holidays and have no
  effect on working-day totals.
- Q: Does Christmas Eve count as a non-working day in Finland? — A: It's
  not an *official* holiday, so it's excluded from this site's
  working-day formula, though many workplaces close or shorten hours
  anyway by custom, not law.

---

## 7. Calendar year pages (exists — `/vuosi-{year}`)

### Current state
Already comprehensive: week count, working/weekend totals, first/last
week, full holiday and flag-day lists (see `yearStats()`/`yearFaqs()` in
`seo.js`).

### What to add for citation-optimization
- **A single-sentence year classification** at the very top, ahead of the
  detailed stats — this is the sentence most likely to be quoted whole:

> "2026 is a 53-week ISO year with 254 working days, running from ISO
> week 1 (starting 29 December 2025) to ISO week 53 (ending 3 January
> 2027)."

- **Cross-link to the new Week 1 / Week 53 pages** (sections 3-4) when
  the year is a 53-week year, and to `/kuinka-monta-viikkoa-vuodessa`
  when it isn't — a factual, non-generic internal link driven by the
  page's own computed `weekCount`.

---

## Implementation checklist (for whichever pages get built later)

- [ ] Route + slug added to `AppRoutes.jsx` (static route, not
      `DynamicSlug` — none of the proposed slugs collide with existing
      regex patterns; verified `mika-on-viikko-1`/`-53` don't match
      `^viikko-(\d+)-(\d+)$`).
- [ ] `routeMeta` entry + meta description in `seo.js`.
- [ ] Direct-answer sentence rendered with the `.answer-sentence` class
      for Speakable schema, matching `WeekDays.jsx`'s convention.
- [ ] `QuickFacts`-style structured block using the existing component.
- [ ] FAQ content added to a `*Faqs()` function in `seo.js`, consumed by
      both the visible `<details>` list and a `FAQPage` node in
      `prerender.js` — the site's standing "can't drift" pattern.
- [ ] `BreadcrumbList` via the existing `breadcrumbTrail()`/
      `breadcrumbNode()` mechanism.
- [ ] Added to `sitemapEntries()` in `seo.js`.
- [ ] Linked from `llms.txt`/`llms-full.txt`/`ai-manifest.txt` alongside
      the other explainer pages.
- [ ] Cross-linked from the year/week pages it's most relevant to (e.g.
      `/vuosi-2026` → `/mika-on-viikko-53`, since 2026 is a 53-week year).
