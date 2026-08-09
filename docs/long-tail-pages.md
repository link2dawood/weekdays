# Long-Tail Pages by Professional Category — Viikkonro.fi

Scoped down from a requested 100 pages across 8 categories to **8 pages,
one per category**. The cut criterion was simple: does this category have
a *real, specific, Finnish* practice where week numbers work differently
enough to justify a standalone page, or would it just be the ISO 8601
explainer wearing an industry label? Twelve of these per category would
mean re-explaining "week starts Monday, week 1 contains 4 January" over
and over with a different H1 — exactly the doorway-page pattern that gets
sites algorithmically demoted, and the opposite of what
`docs/SEO_CONSTITUTION.md` commits this site to.

Every page below is anchored to a real, named Finnish practice, law, or
institution — not a generic "week numbers are useful for X" angle. Where
a legal citation needs a specific statute/section number before
publishing, that's flagged explicitly rather than asserted (same
discipline as `HOLIDAY_LEGAL_BASIS` in `src/data/holidays.js`: state what's
confirmed, don't guess the rest).

All 8 are evergreen explainer pages (same family as
`/mika-on-viikkonumero`, `/viikko-alkaa-maanantaista`) — not per-year
dynamic pages — since the content is "how this profession uses week
numbers," which doesn't change year to year.

---

## 1. HR — shift/work-roster scheduling

**Real anchor**: Finnish workplaces — especially retail, logistics, and
healthcare — routinely publish shift rosters ("työvuorolista") by ISO week
number ("viikon 32 työvuorolista"), because Finland already runs on ISO
8601 nationally. This is a direct, non-generic extension of the site's own
core competency.

- **URL**: `/viikkonumerot-tyovuorolistoissa`
- **Title**: "Viikkonumerot työvuorolistoissa — näin työvuorot merkitään viikoittain"
- **Search intent**: HR/scheduling staff who need to structure or read a roster organized by week number rather than calendar date; "mikä viikko" lookups tied to a specific roster period.
- **Internal links**: `/mika-on-viikkonumero`, `/viikko-alkaa-maanantaista`, current-year `/vuosi-{year}`, current-week `/viikko-{week}-{year}`, `/tyopaivat-{year}`
- **Schema type**: `Article` + `FAQPage`

## 2. Payroll — weekly working-hour limits (Työaikalaki)

**Real anchor**: Finland's Working Hours Act (työaikalaki) sets a
statutory weekly hour limit (standard 40h/week, with averaging periods for
flexible arrangements) — payroll teams need to reconcile actual worked
hours against week boundaries, not pay-period boundaries, when checking
overtime thresholds. *(General practice is well-established; the exact
current statute/section reference should be verified before publishing —
same bar as the site's existing `HOLIDAY_LEGAL_BASIS` citations.)*

- **URL**: `/viikkonumerot-palkanlaskennassa`
- **Title**: "Viikkonumerot palkanlaskennassa — työaikalain viikkorajat ja ylityö"
- **Search intent**: payroll/accounting staff checking which ISO week a pay period's hours fall into, for overtime calculation under Finnish working-hours law.
- **Internal links**: `/tyopaivalaskuri`, `/mika-on-viikkonumero`, `/tyopaivat-{year}`, `/kuinka-monta-viikkoa-vuodessa`
- **Schema type**: `Article` + `FAQPage`

## 3. Education — university teaching-week numbering

**Real anchor**: Finnish universities commonly number teaching weeks
directly in course schedules (e.g. a course syllabus stating "viikko
36–42"), distinct from `/koululomat-{year}` (which covers school
*vacation* weeks, not teaching-week numbering) — genuinely different
content, not a duplicate of an existing page.

- **URL**: `/opetusviikot-ja-viikkonumerot`
- **Title**: "Opetusviikot ja viikkonumerot — miten yliopistot merkitsevät lukujärjestyksen"
- **Search intent**: students/staff decoding a course schedule that references ISO week numbers instead of dates ("mikä päivä on viikko 38").
- **Internal links**: `/koululomat-{year}`, `/mika-on-viikkonumero`, `/kuukausi-{month}-{year}`, `/vuosi-{year}`
- **Schema type**: `Article` + `FAQPage`

## 4. Project Management — sprint planning by ISO week

**Real anchor**: Scrum/Agile sprints are widely aligned to ISO week
numbers (a 2-week sprint = "weeks 31–32") — a globally real, well-
documented practice, not Finland-specific, and distinct enough from the
consumer-facing week/month pages to earn its own page.

- **URL**: `/viikkonumerot-projektinhallinnassa`
- **Title**: "Viikkonumerot projektinhallinnassa — sprintit ja aikataulutus viikkojen mukaan"
- **Search intent**: project managers/Scrum practitioners planning sprint boundaries or reporting cycles against ISO week numbers.
- **Internal links**: `/mika-on-viikkonumero`, `/vuosi-{year}`, `/q{quarter}-{year}`, `/kuinka-monta-viikkoa-vuodessa`
- **Schema type**: `Article` + `HowTo` + `FAQPage`

## 5. Construction — viikkoaikataulu (weekly schedule) planning

**Real anchor**: Finnish construction project management runs on
"viikkoaikataulu" (weekly schedule), a named, standard practice (related
to Last Planner System methodology used on Finnish sites) — schedules and
progress tracking are organized by ISO week, not by date ranges.

- **URL**: `/viikkonumerot-rakennusalalla`
- **Title**: "Viikkonumerot rakennusalalla — viikkoaikataulu selitettynä"
- **Search intent**: site managers/foremen reading or building a "viikkoaikataulu," needing to map week numbers to actual calendar dates.
- **Internal links**: `/mika-on-viikkonumero`, `/tyopaivat-{year}`, `/vuosi-{year}`, `/tulosta-{year}` (printable week list)
- **Schema type**: `Article` + `FAQPage`

## 6. Accounting — non-calendar fiscal years and weekly reporting

**Real anchor**: Finnish companies can set a "tilikausi" (fiscal year)
that doesn't start 1 January — this page is deliberately *not* a
duplicate of the existing `/q{1-4}-{year}` pages (which assume calendar-
year quarters); it addresses how ISO week numbers behave when your
fiscal year is offset, which those pages don't cover.

- **URL**: `/viikkonumerot-kirjanpidossa`
- **Title**: "Viikkonumerot kirjanpidossa — viikot ja poikkeava tilikausi"
- **Search intent**: accountants/controllers at companies with a non-calendar fiscal year, reconciling ISO week numbers (always calendar-year-based) against their own fiscal calendar.
- **Internal links**: `/q{quarter}-{year}`, `/vuosi-{year}`, `/mika-on-viikkonumero`, `/avoin-data` (for the quarter data feed)
- **Schema type**: `Article` + `FAQPage`

## 7. Healthcare — jaksotyöaika (periodic working time) shift design

**Real anchor**: Finnish healthcare shift work commonly falls under
"jaksotyöaika" (periodic working time) in the Working Hours Act — hour
limits are averaged over a defined multi-week period (commonly cited as
2, 3, or 6 weeks), not a single calendar week, which is a materially
different calculation from the general HR/payroll pages above. *(Exact
current period lengths and statute section should be verified before
publishing.)*

- **URL**: `/viikkonumerot-terveydenhuollossa`
- **Title**: "Viikkonumerot terveydenhuollon työvuorosuunnittelussa (jaksotyö)"
- **Search intent**: healthcare shift planners calculating jaksotyöaika averaging periods, needing to identify which ISO weeks fall inside a given period.
- **Internal links**: `/mika-on-viikkonumero`, `/tyopaivat-{year}`, `/vuosi-{year}`, `/viikko-{week}-{year}`
- **Schema type**: `Article` + `FAQPage`

## 8. Government — Kela's 4-week benefit payment periods

**Real anchor**: Kela (Finland's Social Insurance Institution) pays
several benefits — including basic unemployment allowance — on a 4-week
cycle ("maksukausi"), not a calendar month, which routinely confuses
recipients trying to match a payment period to specific dates. *(A
well-known practice; the exact current benefit list/period length should
be confirmed against kela.fi before publishing specific claims.)*

- **URL**: `/viikkonumerot-julkishallinnossa`
- **Title**: "Viikkonumerot julkishallinnossa — Kelan 4 viikon maksukaudet"
- **Search intent**: benefit recipients or public-sector staff trying to map a Kela 4-week payment period to calendar dates/ISO weeks.
- **Internal links**: `/mika-on-viikkonumero`, `/pyhapaivat-{year}`, `/vuosi-{year}`, `/viikko-{week}-{year}`
- **Schema type**: `Article` + `FAQPage`

---

## What didn't make the cut, and why

Every category has more angles than one page can hold, but the second
angle in each case was either (a) too close to an angle already covered
above, or (b) not actually distinct from the generic ISO 8601 explainer.
Examples: a second HR page on "PTO accrual by week" would substantially
overlap with the payroll page's hour-limit content; a second Healthcare
page on gestational "raskausviikko" tracking uses a completely different
meaning of "week" (pregnancy week, not ISO calendar week) and would
confuse rather than serve this site's actual subject. If real user demand
shows up for a specific second angle, add it then — don't pre-build it on
spec.

## Before publishing any of these

1. Verify the flagged legal specifics (Työaikalaki averaging periods,
   Kela's current payment-period length) against a primary source, the
   same bar `HOLIDAY_LEGAL_BASIS` already holds this site to.
2. Write real, substantive content per page — this document is the
   spec (URL/title/intent/links/schema), not the copy itself.
3. Follow the existing evergreen-page pattern end to end: `routeMeta`
   entry in `seo.js`, a `*Faqs()` function feeding both the visible
   `<details>` list and a matching `FAQPage` node in `prerender.js`,
   addition to `sitemapEntries()` — see the implementation checklist at
   the bottom of `docs/citation-pages.md`, which applies identically here.
