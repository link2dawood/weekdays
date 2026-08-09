# Entity SEO Plan — Viikkonro.fi

Design spec for establishing Viikko Nro as a clear, trustworthy entity to
search engines and AI systems — Organization schema, page-level trust
signals, and a citation strategy. Nothing here is built yet (design spec
first, per your call). Scoped to **5 pages, not 6** — see the decision
below.

## Decision: no Author/Person page

The original brief asked for an Author page with Person schema. Checked
the codebase for a real named individual to attach it to: none exists —
`AboutUs.jsx` currently says generic "we are a team of developers," no
legal entity name, no Y-tunnus, no public individual anywhere. Inventing
one would be exactly the fake-credential padding Google's E-E-A-T
guidance exists to catch, and publishing a real person's identity isn't
mine to decide unilaterally. Per your call: **Organization-only** — trust
is established through process and sourcing transparency (Editorial
Policy, Methodology, Data Sources below), not a personal bio. If a real
named person ever wants to be publicly credited, add the Author page then
— the other 5 pages don't depend on it.

---

## 1. Organization schema (site-wide, extend — don't replace)

`index.html` already has a real `Organization` node
(`https://viikkonro.fi/#organization`) with name, alternateName, url,
description, logo, and `sameAs` (4 social profiles) — this is a solid
foundation, not a rebuild. Extend it with:

```json
{
  "@type": "Organization",
  "@id": "https://viikkonro.fi/#organization",
  "areaServed": { "@type": "Country", "name": "Suomi" },
  "knowsAbout": ["ISO 8601", "Viikkonumerot", "Suomen pyhäpäivät", "Suomen liputuspäivät"],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "url": "https://viikkonro.fi/ota-yhteytta"
  }
}
```

No `founder`/`employee` fields — that would need the same real-person
input the Author page decision just deferred. `knowsAbout` and
`areaServed` are additive, low-risk trust signals that don't require
inventing anything.

---

## 2. About page (`/tietoa-meista` — exists, needs rework)

**Current state**: generic "we are passionate developers" marketing
copy — zero concrete, verifiable facts. This is the weakest page on the
site from a trust-signal standpoint precisely because it makes claims
("team of developers," "passionate about productivity") that aren't
falsifiable or specific, which is the opposite of what an About page
should do for E-E-A-T.

**Rework direction**: replace vague claims with concrete, checkable ones
already true elsewhere on this site — what the tool actually does (ISO
8601 week-number calculation, Finnish holidays/flag-days/working-days,
2020–2035 coverage), how it's built (computed from deterministic rules,
not a third-party API — see Methodology), what's free and license terms.
Drop unverifiable "we are a team of..." language entirely rather than
leave it standing next to newly-accurate content elsewhere on the site.

**Schema**: `AboutPage` (new — nothing on the site uses this type today):
```json
{
  "@type": "AboutPage",
  "@id": "https://viikkonro.fi/tietoa-meista#webpage",
  "about": { "@id": "https://viikkonro.fi/#organization" },
  "mainEntity": { "@id": "https://viikkonro.fi/#organization" }
}
```
(Replaces the generic `WebPage` type `pageNode()` currently assigns via
the fallback — same `@id`, different `@type`, same single-node discipline
the rest of the schema graph already follows.)

---

## 3. Editorial Policy (new — propose `/toimituksellinen-periaate`)

**Purpose**: state, plainly, what standards the site's content holds
itself to — the trust-building counterpart to not having a named author.

**Real, groundable content** (not invented):
- All week/date/holiday facts are **computed**, not manually entered —
  same deterministic ISO 8601 logic (`dateUtils.js`) and Gregorian Easter
  algorithm (`juhlapaivat.js`) for every date on the site, so there's no
  per-page human transcription error to correct.
- Legal citations (holiday statutory basis) are only stated where
  independently verified against Finlex — see `HOLIDAY_LEGAL_BASIS`'s own
  documented policy of citing exactly 2 of 15 holidays with a confirmed
  citation and stating the rest generically rather than guessing.
- No advertising, no sponsored content, no paid placement anywhere on the
  site (verified: no ad code in the codebase).
- Correction process: how an error would get fixed (a real, concrete
  channel — the existing contact form) and reflected (dateModified update
  policy — see Methodology).

**Schema**: `WebPage` (no dedicated schema.org type for "editorial
policy" exists) + link `Organization` via `about`.

---

## 4. Methodology (new — propose `/menetelma`)

**Purpose**: explain *how* every number on the site is produced — this is
the page that actually earns AI-citation trust, since it lets a crawler
or answer engine verify the site isn't guessing.

**Real, groundable content**:
- ISO 8601 week calculation: Monday-start, week-1-contains-4-January rule
  (same explanation already on `/mika-on-viikkonumero`, cited not
  duplicated).
- Holiday dates: fixed dates stated directly; movable feasts (Easter-
  relative, Midsummer, All Saints') computed via the Anonymous Gauss
  Easter algorithm in `juhlapaivat.js` — name the algorithm, don't just
  assert "we calculate it."
- Working-day counts: calendar days minus weekends minus *official*
  holidays only (the exact formula already in `llms-glossary.txt`'s
  semantic-relationships section — reuse the same wording, don't let two
  pages state the formula differently).
- Data refresh: every build + nightly cron (real, already documented in
  `CLAUDE.md`) — and per bug-report fix earlier this session, `/data/`
  feed `dateModified` now reflects actual build date, not a stale
  editorial constant — this page is the natural place to state that
  distinction explicitly for a technical reader.

**Schema**: `WebPage`, `about` → Organization; consider `HowTo` only if
the content is genuinely step-by-step (the ISO week rule arguably is —
same pattern already used on `/mika-on-viikkonumero`'s `HowTo` node).

---

## 5. Data Sources (new — propose `/tietolahteet`)

**Purpose**: one consolidated list of every external source the site's
facts ultimately trace back to — currently scattered across code comments
(`HOLIDAY_LEGAL_BASIS`, CLAUDE.md's school-holiday sourcing note) with no
public-facing page collecting them.

**Real, groundable content**:
| Fact category | Source |
|---|---|
| ISO week numbering | ISO 8601 international standard |
| Holiday legal status (2 of 15, confirmed) | Finlex (Finland's official statute database) — cite the exact acts already in `HOLIDAY_LEGAL_BASIS` (272/1944 for Vappu, 388/1937 for Itsenäisyyspäivä) |
| Other 13 holidays | Long-standing calendar convention; not individually re-verified against a specific act — state this honestly, same as the code comment does, rather than implying uniform legal sourcing |
| School holiday weeks | Official municipal/regional announcements (per `CLAUDE.md`) |
| Date/week computation | Self-computed (this codebase), not a third-party calendar API |

**Schema**: `WebPage` + `Dataset`-adjacent — link out to
`/data/knowledge-graph.json` and `/avoin-data` as the machine-readable
counterparts of this same information, rather than restating field-level
detail already documented there.

---

## 6. Contact page (`/ota-yhteytta` — exists, needs schema only)

**Current state**: real, working contact form (Web3Forms, with a
honeypot + rate limiter — already legitimate, no content rework needed).

**Add**: `ContactPage` schema (unused type today):
```json
{
  "@type": "ContactPage",
  "@id": "https://viikkonro.fi/ota-yhteytta#webpage",
  "about": { "@id": "https://viikkonro.fi/#organization" },
  "mainEntity": { "@id": "https://viikkonro.fi/#organization" }
}
```

---

## Citation strategy

How the site asks to be cited, consolidated (currently split across
`ai.txt`'s `Attribution:`/`Preferred-Citation:` lines and each page's own
`Article`/`FAQPage` nodes — this section ties them together rather than
introducing a new mechanism):

1. **Preferred attribution string**: "Viikko Nro" (already the value of
   `Attribution:`/`Preferred-Citation:` in `ai.txt` — keep exactly this
   string everywhere so it's unambiguous to match).
2. **Preferred citation URL**: the specific page a fact came from (e.g.
   cite `/pyhat-2026/vappu` for a Vappu-date claim, not just the
   homepage) — every page already has a canonical URL; this is a policy
   statement (state it explicitly on the new Editorial Policy page) more
   than a code change.
3. **Machine-readable reinforcement**: `Organization`'s `@id` is the
   anchor every page's `publisher` already points at — an AI system that
   resolves that `@id` once gets the same entity facts (name, logo,
   sameAs, now `areaServed`/`knowsAbout`) regardless of which page it
   started from. This is the actual mechanism citation strategy relies
   on; the About/Editorial/Methodology/Data-Sources pages are what make
   that entity worth citing, not a separate technical layer.
4. **Dated claims**: any page stating "as of `{date}`" should use the
   page's own real `dateModified` (`CONTENT_UPDATED` for edited content,
   `FEED_BUILD_DATE` for machine feeds — the exact distinction fixed
   earlier this session) so a citation can be time-stamped accurately.

## Implementation checklist

- [ ] Extend `Organization` node in `index.html` (additive fields only).
- [ ] Rewrite `AboutUs.jsx` content; add `AboutPage` schema in
      `prerender.js`.
- [ ] New route + page + `routeMeta` entry: Editorial Policy.
- [ ] New route + page + `routeMeta` entry: Methodology.
- [ ] New route + page + `routeMeta` entry: Data Sources.
- [ ] Add `ContactPage` schema to the existing `/ota-yhteytta` dispatch.
- [ ] Add all 3 new pages to `sitemapEntries()`.
- [ ] Cross-link all 5 pages to each other and to `/avoin-data` — an
      entity-trust cluster should be internally well-linked, not 5
      isolated pages.
- [ ] Reference the 3 new pages from `llms-full.txt`'s page-type catalog
      once built, same registration discipline as every other addition
      this session.
