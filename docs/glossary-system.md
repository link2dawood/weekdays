# Glossary System — Design Spec

**33 definitions, not 100.** I counted honestly rather than pad to the
requested number. Real, distinct, week-number-related Finnish terms this
site could authoritatively define: 33. Getting to 100 would mean one of:
- A separate page per weekday name (Maanantai, Tiistai, ...) or month name
  — real words, but not "week-number" concepts, and thin (one sentence
  each).
- A separate glossary page per named holiday — but those already have a
  dedicated page each (`/pyhat-{year}/{slug}`, 15 of them). A second,
  year-less "glossary" page defining the same holiday would compete with
  the site's own existing page for the same query, not extend coverage.
- Synonym-splitting (e.g. separate entries for "viikkonumero" and
  "kalenteriviikko," which mean the same thing) — duplicate content with
  a different headword.

None of that "owns" more of the topic — it just multiplies near-identical
pages, the exact pattern already flagged twice this session. 33 real terms
with genuine, non-overlapping definitions is what "own every
week-number-related definition" actually means.

## Architecture

Mirrors a pattern already live on this site — the holiday hub/individual
split (`/pyhapaivat-{year}` + `/pyhat-{year}/{slug}`) — rather than
inventing a new shape:

- **`/sanasto`** (hub, evergreen, not year-scoped since these are
  definitions, not per-year data): lists all 33 terms grouped by category,
  each linking to its own page. Schema: `CollectionPage` + `DefinedTermSet`
  (the schema.org type for "this page is the authoritative list of these
  terms" — not used anywhere on the site yet).
- **`/sanasto/{slug}`** (33 individual pages): one term each.

### Schema model (shared by all 33 pages)

```json
{
  "@type": "DefinedTerm",
  "@id": "https://viikkonro.fi/sanasto/viikkonumero#term",
  "name": "Viikkonumero",
  "description": "...",
  "inDefinedTermSet": { "@id": "https://viikkonro.fi/sanasto#termset" }
}
```
Plus, per page: `WebPage` (via the site's existing `pageNode()`, `about` →
the `DefinedTerm`) and `FAQPage` (2-3 Q&A, same `*Faqs()` →
visible-`<details>`-plus-schema-node pattern as every other page).
`inDefinedTermSet` is what makes this a genuine *system*, not 33 isolated
pages — it's the schema.org signal that ties every term back to one
authoritative set.

---

## The 33 terms

### A. ISO 8601 & week fundamentals

| Slug | Term | One-line definition | Related pages |
|---|---|---|---|
| `viikkonumero` | Viikkonumero | ISO 8601 -standardin mukainen viikon järjestysnumero (1-52/53) | `/mika-on-viikkonumero`, `/vuosi-{year}` |
| `iso-8601` | ISO 8601 | Kansainvälinen päivämäärä- ja viikkostandardi | `/mika-on-viikkonumero`, `/suomi-vs-usa-viikkonumerot` |
| `viikko` | Viikko | Maanantaista sunnuntaihin kestävä 7 päivän jakso | `/viikko-{week}-{year}` |
| `viikko-1` | Viikko 1 | Vuoden ensimmäinen ISO-viikko (sisältää 4. tammikuuta) | `/mika-on-viikko-1` (proposed, see `citation-pages.md`) |
| `viikko-53` | Viikko 53 | 53. ISO-viikko, esiintyy vain "pitkinä" vuosina | `/mika-on-viikko-53` (proposed) |
| `iso-viikkovuosi` | ISO-viikkovuosi | Viikon oma vuosi, voi erota kalenterivuodesta vuodenvaihteessa | `/viikko-1-{year}`, `llms-glossary.txt` |
| `karkausvuosi` | Karkausvuosi | 366-päiväinen vuosi; vaikuttaa 53-viikkoisten vuosien laskentaan | `/kuinka-monta-viikkoa-vuodessa` |
| `vuosineljannes` | Vuosineljännes | Yksi vuoden neljästä kolmen kuukauden jaksosta | `/q{1-4}-{year}` |
| `kalenterivuosi` | Kalenterivuosi | 1. tammikuuta - 31. joulukuuta, eri asia kuin ISO-viikkovuosi | `/vuosi-{year}` |
| `alkuvuosi-loppuvuosi` | Alkuvuosi / loppuvuosi | Vuoden ensimmäinen tai jälkimmäinen puolisko | `/kalenteri-{year}-alkuvuosi`, `-loppuvuosi` |

### B. Työpäivät ja työaika

| Slug | Term | One-line definition | Related pages |
|---|---|---|---|
| `tyopaiva` | Työpäivä | Arkipäivä, joka ei ole virallinen pyhäpäivä | `/tyopaivat-{year}` |
| `arkipaiva` | Arkipäivä | Maanantaista perjantaihin, riippumatta pyhäpäivistä | `/tyopaivat-{year}` |
| `viikonloppu` | Viikonloppu | Lauantai ja sunnuntai | `/viikko-{week}-{year}` |
| `vapaapaiva` | Vapaapäivä | Yleisnimitys päivälle, jolloin ei työskennellä | `/pyhapaivat-{year}` |
| `tyoaikalain-viikkoraja` | Työaikalain viikkoraja | Työaikalain mukainen enimmäisviikkotyöaika | `/tyopaivalaskuri` |
| `jaksotyoaika` | Jaksotyöaika | Työaikalain mukainen useamman viikon tasoittumisjärjestelmä (mm. terveydenhuolto) | `/tyopaivat-{year}`, `long-tail-pages.md` §7 |
| `ylityo` | Ylityö | Sovitun viikkotyöajan ylittävä työ | `/tyopaivalaskuri` |

### C. Pyhäpäivät ja muut merkkipäivät

| Slug | Term | One-line definition | Related pages |
|---|---|---|---|
| `pyhapaiva` | Pyhäpäivä | Yleisnimitys viralliselle tai vietetylle vapaapäivälle | `/pyhapaivat-{year}` |
| `arkipyha` | Arkipyhä | Virallinen, laissa säädetty pyhäpäivä (13/15) | `/pyhapaivat-{year}` |
| `aattopaiva` | Aattopäivä | Ei-virallinen mutta laajasti vietetty vapaapäivä (Jouluaatto, Juhannusaatto) | `/pyhat-{year}/jouluaatto` |
| `liputuspaiva` | Liputuspäivä | Suomen lipun virallinen tai vakiintunut liputuspäivä | `/liputuspaivat-{year}` |
| `nimipaiva` | Nimipäivä | Suomalaisen almanakan mukainen nimipäivä | `/nimipaivat/tanaan` |
| `koululoma` | Koululoma | Suomalaisten koulujen lomajakso | `/koululomat-{year}` |
| `hiihtoloma` | Hiihtoloma | Helmi-maaliskuun koululoma, viikko vaihtelee alueittain | `/koululomat-{year}` |
| `syysloma` | Syysloma | Lokakuun koululoma | `/koululomat-{year}` |

### D. Liiketoiminta ja raportointi

| Slug | Term | One-line definition | Related pages |
|---|---|---|---|
| `tilikausi` | Tilikausi | Yrityksen kirjanpidollinen vuosi, ei aina sama kuin kalenterivuosi | `/q{1-4}-{year}`, `long-tail-pages.md` §6 |
| `palkkakausi` | Palkkakausi | Palkanmaksujakso (esim. kahden viikon jakso) | `long-tail-pages.md` §2 |
| `maksukausi` | Maksukausi | Kelan 4 viikon etuusmaksujakso | `long-tail-pages.md` §8 |
| `raportointijakso` | Raportointijakso | Yleisnimitys määräajoin toistuvalle raportointivälille | `/avoin-data` |
| `vuosikello` | Vuosikello | Julkishallinnossa yleinen vuosisuunnittelun työkalu | `long-tail-pages.md` §8 |

### E. Ajan jäsentäminen

| Slug | Term | One-line definition | Related pages |
|---|---|---|---|
| `vuodenaika` | Vuodenaika | Talvi, kevät, kesä tai syksy — sidottu viikon torstaihin tällä sivustolla | `/viikko-{week}-{year}` |
| `viikkoaikataulu` | Viikkoaikataulu | Suomen rakennusalan viikkotason aikataulutuskäytäntö | `long-tail-pages.md` §5 |
| `sprintti` | Sprintti | Ketterän projektinhallinnan 1-4 viikon työjakso | `long-tail-pages.md` §4 |

---

## Two fully worked examples

The rest follow this exact template — I'm not writing all 33 out in full
(that's the build step, not the spec), but here's the pattern unambiguous
enough to replicate.

### `/sanasto/viikko-1`

**Definition**: Viikko 1 on ISO 8601 -standardin mukaisen vuoden
ensimmäinen viikko — se maanantaista sunnuntaihin kestävä viikko, joka
sisältää 4. tammikuuta (vastaavasti: vuoden ensimmäisen torstain).

**Examples**: Vuonna 2026 viikko 1 alkaa maanantaina 29. joulukuuta 2025
ja päättyy sunnuntaina 4. tammikuuta 2026 — kolme sen päivistä kuuluu
vielä kalenterivuoteen 2025, mutta viikko itse on ISO-viikkovuoden 2026
viikko 1.

**Related pages**: `/viikko-1-{year}`, `/vuosi-{year}`,
`/mika-on-viikkonumero`, `/sanasto/iso-viikkovuosi`

**FAQ**:
- K: Miksi joulukuun lopun päivät voivat kuulua ensi vuoden viikkoon 1? —
  V: Koska viikko 1 määräytyy sen mukaan, minä viikolla vuoden ensimmäinen
  torstai on — ei sen mukaan, milloin 1. tammikuuta on.
- K: Sisältääkö viikko 1 aina 1. tammikuuta? — V: Ei aina — vain jos 1.
  tammikuuta on maanantai, tiistai, keskiviikko tai torstai.

**Schema**:
```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "DefinedTerm",
      "@id": "https://viikkonro.fi/sanasto/viikko-1#term",
      "name": "Viikko 1",
      "description": "ISO 8601 -standardin mukaisen vuoden ensimmäinen viikko, joka sisältää 4. tammikuuta.",
      "inDefinedTermSet": { "@id": "https://viikkonro.fi/sanasto#termset" }
    },
    {
      "@type": "WebPage",
      "@id": "https://viikkonro.fi/sanasto/viikko-1#webpage",
      "about": { "@id": "https://viikkonro.fi/sanasto/viikko-1#term" },
      "isPartOf": { "@id": "https://viikkonro.fi/#website" }
    },
    {
      "@type": "FAQPage",
      "@id": "https://viikkonro.fi/sanasto/viikko-1#faq",
      "mainEntity": [
        { "@type": "Question", "name": "Miksi joulukuun lopun päivät voivat kuulua ensi vuoden viikkoon 1?", "acceptedAnswer": { "@type": "Answer", "text": "Koska viikko 1 määräytyy sen mukaan, minä viikolla vuoden ensimmäinen torstai on." } }
      ]
    }
  ]
}
```

### `/sanasto/jaksotyoaika`

**Definition**: Jaksotyöaika on työaikalain mukainen työaikamalli, jossa
työtunteja tasoitetaan usean viikon (yleisesti 2-6 viikon) jakson
yli yhden kalenteriviikon sijaan — yleinen erityisesti
terveydenhuollon vuorotyössä.

**Examples**: Jos jakso on 3 viikkoa, työntekijän tunnit voivat vaihdella
viikoittain, kunhan koko 3 viikon jakson yhteenlaskettu tuntimäärä pysyy
rajoissa — ei jokaisen yksittäisen ISO-viikon.

**Related pages**: `/tyopaivat-{year}`, `/sanasto/tyoaikalain-viikkoraja`,
`long-tail-pages.md` (Healthcare section)

**FAQ**:
- K: Miten jaksotyöaika eroaa tavallisesta viikkotyöajasta? — V:
  Tavallisessa mallissa tuntiraja koskee jokaista viikkoa erikseen;
  jaksotyössä raja koskee koko usean viikon jakson keskiarvoa.

**Schema**: sama rakenne kuin yllä, `@id`-arvot vaihdettuna
`jaksotyoaika`-poluksi.

---

## Implementation checklist

- [ ] New `DefinedTermSet` node for `/sanasto`, one `DefinedTerm` per
      term, both in `prerender.js`.
- [ ] New route (`/sanasto/:slug`) in `AppRoutes.jsx` + a `glossaryTerms`
      data module (single source of truth — mirrors `HOLIDAY_DEFINITIONS`)
      feeding the hub page, individual pages, and schema alike.
- [ ] `routeMeta` + `sitemapEntries()` entries for all 34 URLs
      (1 hub + 33 terms).
- [ ] Cross-link every term to the real pages in its "Related pages"
      column above — this is what makes 33 pages a system instead of 33
      islands.
- [ ] Register `/sanasto` in `llms-glossary.txt` (the file already exists
      for exactly this kind of content — cross-reference rather than
      duplicate the definitions inside it).
