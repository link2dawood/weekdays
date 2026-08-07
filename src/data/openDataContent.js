// Content for /avoin-data — the human-readable documentation page for the
// /data/* JSON feeds. Plain .js (not .jsx), same reason dateUtils.js/seo.js
// are: prerender.js (a plain-Node script) needs openDataFaqs() directly for
// this page's FAQPage JSON-LD, and it can't import a .jsx file.
import { FEED_SCHEMA_VERSION } from "./seo.js";

// One row per family actually written under /data/ by prerender.js (see its
// per-year feed-writing loop and datasetNodes()) — kept here as a single,
// hand-maintained description shared by OpenData.jsx's table and (indirectly,
// by staying in sync with it) llms.txt's own listing. Order matches
// datasetNodes()'s return array.
export const DATA_FEED_FAMILIES = [
  {
    id: "week",
    name: "Viikko",
    description: "Yksi tiedosto jokaiselle ISO 8601 -viikolle: alkamis- ja päättymispäivä, työpäivien määrä, juhla- ja liputuspäivät, vuosineljännes ja vuodenaika.",
    indexUrl: "/data/week/index.json",
    urlPattern: "/data/week/{vuosi}/{viikko}.json",
    example: "/data/week/2026/32.json",
  },
  {
    id: "month",
    name: "Kuukausi",
    description: "Yksi tiedosto jokaiselle kalenterikuukaudelle: kuukauden sisältämät ISO-viikot, työpäivien ja viikonloppupäivien määrä, arkipyhät, liputuspäivät sekä vuosineljännes.",
    indexUrl: "/data/month/index.json",
    urlPattern: "/data/month/{vuosi}/{kuukausi}.json",
    example: "/data/month/2026/8.json",
  },
  {
    id: "year",
    name: "Vuosi",
    description: "Yksi tiedosto jokaiselle vuodelle: viikkojen määrä (52 tai 53), työpäivien ja viikonloppupäivien määrä, arkipyhät, liputuspäivät sekä vuoden ensimmäinen ja viimeinen ISO-viikko.",
    indexUrl: "/data/year/index.json",
    urlPattern: "/data/year/{vuosi}.json",
    example: "/data/year/2026.json",
  },
  {
    id: "quarter",
    name: "Vuosineljännes",
    description: "Yksi tiedosto jokaiselle vuosineljännekselle (Q1–Q4): alkamis- ja päättymispäivä, kuukaudet, viikkoväli, työpäivien ja viikonloppupäivien määrä sekä arkipyhät.",
    indexUrl: "/data/quarter/index.json",
    urlPattern: "/data/quarter/{vuosi}/{neljännes}.json",
    example: "/data/quarter/2026/3.json",
  },
  {
    id: "holidays",
    name: "Pyhäpäivät",
    description: "Yksi tiedosto jokaisen vuoden virallisista pyhäpäivistä ja laajasti vietetyistä vapaapäivistä: nimi, päivämäärä, viikonpäivä, ISO-viikko ja virallinen asema.",
    indexUrl: "/data/holidays/index.json",
    urlPattern: "/data/holidays/{vuosi}.json",
    example: "/data/holidays/2026.json",
  },
  {
    id: "holiday",
    name: "Pyhäpäivä (yksittäinen)",
    description: "Yksi tiedosto jokaista nimettyä pyhäpäivää kohti per vuosi: päivämäärä, viikonpäivä, ISO-viikko, vuosineljännes, virallinen asema, määräytymissääntö ja lainsäädäntöperuste (kun se on vahvistettu).",
    indexUrl: "/data/holiday/index.json",
    urlPattern: "/data/holiday/{vuosi}/{tunniste}.json",
    example: "/data/holiday/2026/itsenaisyyspaiva.json",
  },
  {
    id: "flag-days",
    name: "Liputuspäivät",
    description: "Yksi tiedosto jokaisen vuoden liputuspäivistä: nimi, päivämäärä, viikonpäivä, ISO-viikko, tyyppi ja mahdollinen päällekkäisyys pyhäpäivän kanssa.",
    indexUrl: "/data/flag-days/index.json",
    urlPattern: "/data/flag-days/{vuosi}.json",
    example: "/data/flag-days/2026.json",
  },
  {
    id: "monthly-working-days",
    name: "Kuukausittainen työpäivädata",
    description: "Yksi tiedosto jokaiselle kuukaudelle: työpäivien ja viikonloppupäivien määrä sekä sen kuukauden arkipyhät.",
    indexUrl: "/data/monthly-working-days/index.json",
    urlPattern: "/data/monthly-working-days/{vuosi}/{kuukausi}.json",
    example: "/data/monthly-working-days/2026/8.json",
  },
];

// Shared with prerender.js's FAQPage JSON-LD so the visible FAQ and the
// schema can't drift — same discipline as every other FAQ set in this
// codebase.
export function openDataFaqs() {
  return [
    {
      q: "Onko Viikko Nron dataa saa käyttää ilmaiseksi?",
      a: "Kyllä. Kaikki /data/-tiedostot ovat julkisesti saatavilla ilman kirjautumista, API-avainta tai pyyntörajoja. Käyttö edellyttää vain maininnan lähteestä (Viikko Nro, viikkonro.fi) — tarkat ehdot löytyvät käyttöehdoista.",
    },
    {
      q: "Miten datan versiointi toimii?",
      a: `Jokaisessa tiedostossa on schemaVersion-kenttä (nyt "${FEED_SCHEMA_VERSION}"). Numero nousee vain silloin, kun jokin kenttä poistetaan tai nimetään uudelleen — uuden kentän lisääminen ei ole rikkova muutos eikä nosta versiota.`,
    },
    {
      q: "Kuinka usein data päivittyy?",
      a: "Kaikki tiedostot generoidaan uudelleen jokaisessa julkaisussa ja lisäksi kerran vuorokaudessa automaattisen yöllisen julkaisun yhteydessä, joten data pysyy ajan tasalla ilman erillistä toimenpidettä.",
    },
    {
      q: "Kuinka pitkälle tulevaisuuteen ja historiaan dataa on saatavilla?",
      a: "Jokaiselle joukolle on tiedosto vuosilta 2020–2035 (kuluva vuosi + yhdeksän seuraavaa vuotta, sekä kaksi edeltävää). Vanhentuneet vuodet säilyvät tiedostoina, eivätkä ne katoa ajan myötä.",
    },
    {
      q: "Mistä löydän kaikki datasetit yhdellä kertaa?",
      a: "Osoitteesta /data/index.json löytyvät kaikki datasetit ja niiden URL-kaavat. Osoitteesta /data/dataset.json löytyy sama tieto schema.org/Dataset-muodossa.",
    },
    {
      q: "Voiko dataa hakea selaimen JavaScriptillä toiselta sivustolta?",
      a: "Kyllä. /data/-tiedostot lähetetään Access-Control-Allow-Origin: * -otsikolla, joten selaimen fetch()-kutsu toimii mistä tahansa alkuperästä ilman CORS-virhettä.",
    },
  ];
}
