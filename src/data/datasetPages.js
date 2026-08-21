// Content config for the 5 dataset landing pages (/data/week, /data/month,
// /data/year, /data/holiday, /data/working-days) — plain .js, same reason
// as trustPages.js/openDataContent.js: prerender.js needs the FAQ arrays
// directly. One config object per family drives a single shared page
// component (DatasetPage.jsx) rather than 5 near-duplicate files — see
// docs/downloadable-datasets.md for the full design (bulk-per-year CSV/
// XML, the /data/working-days public-name decision, the /data/holiday
// per-year-list bulk shape).
export const DATASET_PAGES = {
  week: {
    slug: "week",
    title: "Viikkodata",
    intro:
      "ISO 8601 -viikkodata jokaiselle viikolle 2020–2035: alkamis- ja päättymispäivä, työpäivien määrä, juhla- ja liputuspäivät, vuosineljännes ja vuodenaika.",
    formats: [
      { format: "JSON", pattern: "/data/week/{vuosi}/{viikko}.json", example: "/data/week/2026/32.json", shape: "Yksi tietue (nykyinen)" },
      { format: "CSV", pattern: "/data/week/{vuosi}.csv", example: "/data/week/2026.csv", shape: "52/53 riviä, yksi per viikko" },
      { format: "XML", pattern: "/data/week/{vuosi}.xml", example: "/data/week/2026.xml", shape: "52/53 <week>-elementtiä" },
    ],
    fields: [
      ["week", "Viikkonumero (1–53)"],
      ["year", "ISO-viikkovuosi"],
      ["startDate", "Maanantai (viikon alku)"],
      ["endDate", "Sunnuntai (viikon loppu)"],
      ["workingDays", "Työpäivien määrä"],
      ["holidays", "Viikolle osuvat pyhäpäivät"],
      ["flagDays", "Viikolle osuvat liputuspäivät"],
      ["quarter", "Vuosineljännes (1–4)"],
      ["season", "Vuodenaika"],
    ],
    csvColumns: "week,startDate,endDate,workingDays,quarter,season,holidays,flagDays",
  },
  month: {
    slug: "month",
    title: "Kuukausidata",
    description:
      "Kuukausidata vuosille 2020–2035: ISO-viikot, työ- ja viikonloppupäivät, arkipyhät, liputuspäivät ja vuosineljännes. JSON-, CSV- ja XML-lataukset.",
    intro:
      "Kalenterikuukausidata jokaiselle kuukaudelle 2020–2035: kuukauden sisältämät ISO-viikot, työpäivien ja viikonloppupäivien määrä, arkipyhät, liputuspäivät ja vuosineljännes.",
    formats: [
      { format: "JSON", pattern: "/data/month/{vuosi}/{kuukausi}.json", example: "/data/month/2026/8.json", shape: "Yksi tietue (nykyinen)" },
      { format: "CSV", pattern: "/data/month/{vuosi}.csv", example: "/data/month/2026.csv", shape: "12 riviä" },
      { format: "XML", pattern: "/data/month/{vuosi}.xml", example: "/data/month/2026.xml", shape: "12 <month>-elementtiä" },
    ],
    fields: [
      ["month", "Kuukausi (1–12)"],
      ["year", "Kalenterivuosi"],
      ["startDate", "Kuukauden ensimmäinen päivä"],
      ["endDate", "Kuukauden viimeinen päivä"],
      ["weekCount", "Kuukauteen osuvien ISO-viikkojen määrä"],
      ["workingDays", "Työpäivien määrä"],
      ["weekendDays", "Viikonloppupäivien määrä"],
      ["quarter", "Vuosineljännes (1–4)"],
      ["holidays", "Kuukaudelle osuvat viralliset pyhäpäivät"],
      ["flagDays", "Kuukaudelle osuvat liputuspäivät"],
    ],
    csvColumns: "month,monthName,startDate,endDate,weekCount,workingDays,weekendDays,quarter,holidays,flagDays",
  },
  year: {
    slug: "year",
    title: "Vuosidata",
    description:
      "Vuositason data vuosille 2020–2035: ISO-viikkojen määrä sekä työ- ja viikonloppupäivät. Lataa tiedot JSON-, CSV- tai XML-muodossa.",
    intro:
      "Vuositason data jokaiselle vuodelle 2020–2035: ISO-viikkojen määrä (52 tai 53), työpäivien ja viikonloppupäivien määrä, vuoden ensimmäinen ja viimeinen ISO-viikko.",
    formats: [
      { format: "JSON", pattern: "/data/year/{vuosi}.json", example: "/data/year/2026.json", shape: "Yksi tietue (nykyinen)" },
      { format: "CSV", pattern: "/data/year.csv", example: "/data/year.csv", shape: "Kaikki 16 vuotta yhdessä tiedostossa" },
      { format: "XML", pattern: "/data/year.xml", example: "/data/year.xml", shape: "Kaikki 16 vuotta, yksi <year>-elementti/vuosi" },
    ],
    fields: [
      ["year", "Kalenterivuosi"],
      ["weekCount", "ISO-viikkojen määrä (52 tai 53)"],
      ["workingDays", "Työpäivien määrä koko vuodelle"],
      ["weekendDays", "Viikonloppupäivien määrä"],
      ["firstWeek / firstWeekYear", "Vuoden ensimmäinen ISO-viikko"],
      ["lastWeek / lastWeekYear", "Vuoden viimeinen ISO-viikko"],
    ],
    csvColumns: "year,weekCount,workingDays,weekendDays,firstWeek,firstWeekYear,lastWeek,lastWeekYear",
    bulkIsAllYears: true,
  },
  holiday: {
    slug: "holiday",
    title: "Pyhäpäivädata",
    description:
      "Suomen 15 nimetyn pyhäpäivän data vuosille 2020–2035: päivämäärä, viikonpäivä, ISO-viikko ja virallinen asema. JSON-, CSV- ja XML-lataukset.",
    intro:
      "Suomen 15 nimetyn pyhäpäivän data jokaiselle vuodelle 2020–2035: päivämäärä, viikonpäivä, ISO-viikko ja virallinen asema. Katso myös pyhäpäiväkohtainen JSON-data (yksi tiedosto per pyhäpäivä), joka sisältää myös lainsäädäntöperusteen ja määräytymissäännön.",
    formats: [
      { format: "JSON (vuosilista)", pattern: "/data/holidays/{vuosi}.json", example: "/data/holidays/2026.json", shape: "Yksi tietue, 15 pyhäpäivää" },
      { format: "JSON (yksittäinen)", pattern: "/data/holiday/{vuosi}/{tunniste}.json", example: "/data/holiday/2026/vappu.json", shape: "Yksi tietue per pyhäpäivä" },
      { format: "CSV", pattern: "/data/holiday/{vuosi}.csv", example: "/data/holiday/2026.csv", shape: "15 riviä" },
      { format: "XML", pattern: "/data/holiday/{vuosi}.xml", example: "/data/holiday/2026.xml", shape: "15 <holiday>-elementtiä" },
    ],
    fields: [
      ["name", "Pyhäpäivän nimi"],
      ["date", "Päivämäärä kyseisenä vuonna"],
      ["weekday", "Viikonpäivä"],
      ["week", "ISO-viikko, jolle päivä osuu"],
      ["official", "Virallinen (13/15) vai ei-virallinen aattopäivä (2/15)"],
    ],
    csvColumns: "name,date,weekday,week,official",
  },
  "working-days": {
    slug: "working-days",
    title: "Työpäivädata",
    description:
      "Kuukausittaiset työ- ja viikonloppupäivien määrät vuosille 2020–2035 sekä vuosikohtaiset yhteissummat. Saatavilla JSON-, CSV- ja XML-muodossa.",
    intro:
      "Kuukausikohtainen työpäivädata jokaiselle vuodelle 2020–2035: työpäivien ja viikonloppupäivien määrä kuukausittain, sekä koko vuoden yhteissumma. Julkinen nimi tälle sivulle — taustalla oleva JSON-data on osoitteessa /data/monthly-working-days/, joka pysyy muuttumattomana.",
    formats: [
      { format: "JSON", pattern: "/data/monthly-working-days/{vuosi}/{kuukausi}.json", example: "/data/monthly-working-days/2026/8.json", shape: "Yksi tietue per kuukausi" },
      { format: "CSV", pattern: "/data/working-days/{vuosi}.csv", example: "/data/working-days/2026.csv", shape: "12 kuukausiriviä + 1 TOTAL-rivi" },
      { format: "XML", pattern: "/data/working-days/{vuosi}.xml", example: "/data/working-days/2026.xml", shape: "12 <month>-elementtiä + <total>" },
    ],
    fields: [
      ["month", "Kuukausi (1–12)"],
      ["monthName", "Kuukauden nimi"],
      ["workingDays", "Työpäivien määrä"],
      ["weekendDays", "Viikonloppupäivien määrä"],
      ["officialHolidaysInMonth", "Kuukaudelle osuvien virallisten pyhäpäivien määrä"],
    ],
    csvColumns: "month,monthName,workingDays,weekendDays,officialHolidaysInMonth (+ TOTAL-rivi)",
  },
};

// Single source of truth for these 5 pages' <title>/<meta description> —
// used by both the visible <SEO> component (DatasetPage.jsx) and
// metaFor()'s regex dispatch (seo.js), so the two can't drift, same
// discipline as every other page-type meta function in seo.js.
export function datasetPageMeta(family) {
  const p = DATASET_PAGES[family];
  if (!p) return null;
  return {
    title: `${p.title} — avoin data | Viikko Nro`,
    description: p.description ?? p.intro,
  };
}

export function datasetPageFaqs(family) {
  const p = DATASET_PAGES[family];
  return [
    {
      q: `Onko ${p.title.toLowerCase()} ilmaista käyttää?`,
      a: "Kyllä. Kaikki tiedostot ovat julkisesti saatavilla ilman kirjautumista, API-avainta tai pyyntörajoja. Käyttö edellyttää vain maininnan lähteestä (Viikko Nro, viikkonro.fi).",
    },
    {
      q: "Missä muodoissa data on saatavilla?",
      a: "JSON, CSV ja XML. JSON on saatavilla yhtenä tietueena kerrallaan; CSV ja XML sisältävät koko vuoden datan yhdessä tiedostossa.",
    },
    {
      q: "Kuinka usein data päivittyy?",
      a: "Kaikki tiedostot generoidaan uudelleen jokaisessa julkaisussa ja lisäksi kerran vuorokaudessa automaattisen yöllisen julkaisun yhteydessä.",
    },
  ];
}
