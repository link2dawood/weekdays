# Educational Articles — Design Spec

**24 articles, not 50.** Same discipline as every "generate N" request
this session. "Educational article for students and teachers" is a
genuinely different content shape from the tool/reference pages already
spec'd — pedagogical framing, history, and classroom use, not quick
lookup — so I re-researched from scratch rather than reuse the glossary
or citation-pages counts. 24 is the honest number of topics that are (a)
real, (b) distinct from each other and from existing pages, and (c)
actually about this site's subject (the ISO calendar and Finnish
holidays), not generic "how to manage your time" content — the same
scope discipline I just pushed back on for `/ajanhallinta`, applied here
too, since "students and teachers" is broad enough to invite the same
kind of drift.

One genuinely new capability this research surfaced: `src/data/sunTimes.js`
already computes real sunrise/sunset (via `suncalc`) including
polar-day/polar-night handling for northern Finland — nothing in this
session's prior docs has used it. It grounds two real articles below
(#4, #4b) that nothing else in the site's content currently covers.

## Categories (24 total)

### A. Calendar math & science (6)
1. Karkausvuoden matematiikka (the math of leap years, and why it
   affects which years get a 53rd week)
2. Miten pääsiäisen päivämäärä lasketaan (the Anonymous Gauss algorithm,
   already implemented in `juhlapaivat.js` — this article explains the
   code the site already runs)
3. Vuodenaikojen tähtitieteellinen perusta (equinoxes/solstices — the
   real basis for the site's own `vuodenaika` field)
4. Auringonnousu ja -lasku viikon aikana (a week's sunrise/sunset change,
   using real `sunTimes.js` data — genuinely new ground)
4b. Miksi aurinko ei laske Lapissa kesällä? (polar day/night, using the
   same module's `polarDay`/`polarNight` handling)
5. Työpäivien laskeminen matematiikan tehtävänä (working-day counting as
   a countable-set math exercise, tied to `/tyopaivalaskuri`)

### B. Calendar history & etymology (5)
6. Gregoriaanisen kalenterin historia (why ISO 8601 needed a common
   standard in the first place)
7. Viikonpäivien nimien alkuperä (Nordic/Roman-god etymology of Finnish
   weekday names)
8. Kuukausien nimien alkuperä (Latin-root month-name etymology)
9. ISO 8601 -standardin synty ja historia
10. Nimipäiväkalenterin historia Suomessa

### C. Finnish holiday history, deep dives (5)
Distinct from the existing `/pyhat-{year}/{slug}` pages, which are
fact-sheets (date, week, official status) — these are the *history*
behind the 5 holidays with genuinely rich, real backstories, not all 15
(most of the rest are "day honoring person X," too thin for a full
article each).
11. Juhannuksen esikristilliset juuret
12. Vapun historia: työväenliikkeestä kevätjuhlaksi
13. Itsenäisyyspäivän historia
14. Joulun perinteiden historia Suomessa
15. Pääsiäisen kristillinen ja kansanperinteinen tausta

### D. For teachers: pedagogy & classroom resources (5)
16. Miten opettaa lapsille kalenterin lukemista
17. ISO-viikkomatikkaa alakouluun: harjoituksia
18. ISO-viikkomatikkaa yläkouluun ja lukioon: harjoituksia
19. Miten selittää ISO 8601 -standardi oppilaille
20. Suomen koulujen lukuvuoden rakenne opettajille

### E. Comparative / applied (3)
21. Suomen ja USA:n viikkojärjestelmien vertailu opetuskäyttöön
    (pedagogical companion to the existing `/suomi-vs-usa-viikkonumerot`)
22. Liputuspäivien historia ja merkitys kouluille
23. Koululomien alueellinen vaihtelu: opetusmateriaali (teacher-facing
    companion to `long-tail-pages.md`'s regional hiihtoloma report)

## Shared template (per article)

- **URL**: `/oppimateriaali/{slug}` (proposed hub: `/oppimateriaali`)
- **Outline**: intro hook → core explanation → worked example (real
  computed dates, not placeholders) → "try it yourself" link to the
  relevant live tool/page → summary
- **FAQ**: 3-5 Q&A, real questions a student/teacher would ask, feeding
  `FAQPage` (same `*Faqs()`-source discipline as every other page)
- **Schema**: `LearningResource` (schema.org's actual type for
  educational content — not used anywhere else on the site; has
  `educationalLevel`/`learningResourceType` properties worth setting) +
  `Article` + `FAQPage`
- **Internal links**: at minimum, the live page/tool the article's math
  or facts come from (e.g. #2 → `/mika-on-viikkonumero` +
  `/pyhat-{year}/paasiaispaiva`; #17/#18 → `/tyopaivalaskuri`)

## Two fully worked examples

### #2 — "Miten pääsiäisen päivämäärä lasketaan"
- **URL**: `/oppimateriaali/paasiaisen-laskeminen`
- **Outline**: Why Easter moves (lunar calendar tie-in) → the Anonymous
  Gauss algorithm, explained step by step → worked example for 2026 →
  link to see the real result live
- **FAQ**: "Miksi pääsiäinen ei ole aina samana päivänä?", "Kuka keksi
  pääsiäisen laskentatavan?", "Milloin pääsiäinen on aikaisimmillaan/
  myöhäisimmillään?"
- **Schema**: `LearningResource` (`educationalLevel`: "yläkoulu, lukio",
  `learningResourceType`: "selittävä artikkeli") + `Article` + `FAQPage`
- **Internal links**: `/pyhat-{year}/paasiaispaiva`,
  `/pyhat-{year}/pitkaperjantai`, `/mika-on-viikkonumero`

### #4b — "Miksi aurinko ei laske Lapissa kesällä?"
- **URL**: `/oppimateriaali/keskiyon-aurinko`
- **Outline**: polar day/night explained → how `sunTimes.js` detects it
  (no sunrise/sunset crossing that day) → a real week's worth of
  Helsinki-vs-Lapland sunrise/sunset comparison → link to whichever live
  page ends up surfacing this data
- **FAQ**: "Milloin keskiyön aurinko alkaa ja loppuu?", "Näkyykö
  ilmiö koko Suomessa?"
- **Schema**: `LearningResource` (`educationalLevel`: "alakoulu,
  yläkoulu") + `Article` + `FAQPage`
- **Internal links**: whatever page first surfaces `sunTimesForWeek()`
  output live (none currently does — this article and that feature
  would need to ship together, not the article alone)

## What I didn't include, and why

- **A history article per remaining named holiday** (the other 10 of
  15) — most have a one-sentence origin ("decreed in year X to honor
  person Y"), not enough distinct material for a full article each
  without padding.
- **General "time management for students" content** — exactly the
  scope creep I flagged for `/ajanhallinta`; "how to manage your
  homework schedule" isn't this site's subject even under an
  educational framing.
- **A generic "history of calendars worldwide" survey** (Islamic,
  Hebrew, Chinese calendars) — real and educational, but a genuine
  departure from ISO 8601/Finnish-calendar territory into general
  comparative-religion content this site has no established authority
  in.

## Implementation notes

- `#4`/`#4b` are the only two articles requiring genuinely new
  computation on the page (weekly sunrise/sunset table) — everything
  else assembles from data/logic that already exists elsewhere in the
  codebase (Easter algorithm, holiday dates, school-holiday data).
  Sequence those two after confirming `sunTimesForWeek()`'s output
  actually gets surfaced somewhere live, not just in tests.
- Register in `sitemapEntries()`, cross-link from `/mika-on-viikkonumero`
  and the relevant holiday pages, and add an "Oppimateriaali" pointer
  section to `llms-glossary.txt` (definitions) or a new mention in
  `llms-full.txt`'s page-type catalog.
