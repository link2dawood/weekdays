import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import { canonicalFor, CONTENT_UPDATED_FI, FEED_SCHEMA_VERSION, routeMeta } from "../data/seo";
import { DATA_FEED_FAMILIES, openDataFaqs } from "../data/openDataContent";

const PATH = "/avoin-data";

// Human-readable documentation for the /data/* JSON feeds prerender.js
// generates (machine-readable equivalents already exist at /data/index.json
// and /data/dataset.json — this page is the page a person, not a script,
// lands on). Every fact here (family list, field names, schemaVersion) is
// read from the same DATA_FEED_FAMILIES/FEED_SCHEMA_VERSION prerender.js
// itself uses to build the feeds and their Dataset schema, so this page and
// the feeds it describes can't drift apart.
//
// Layout note: tables and code blocks are deliberately siblings of (not
// nested inside) the .prose wrapper, same as WorkingDays.jsx — .prose caps
// at 680px for readable paragraphs, but a 4-column table or a JSON example
// needs the full .app container width (1000px) to avoid unnecessary
// horizontal scrolling on desktop. Only narrative text/lists/FAQ go inside
// .prose; wide elements sit directly under <section className="app">.
const OpenData = () => {
  const meta = routeMeta[PATH];

  const faqs = openDataFaqs();

  return (
    <section className="app">
      <SEO {...meta} canonical={canonicalFor(PATH)} />

      <div className="breadcrumb">
        <Link to="/">Etusivu</Link> / Avoin data
      </div>

      <h1>Avoin data ja JSON-rajapinta</h1>

      <p>
        <Link className="btn" to="/api-playground">
          Kokeile API:a selaimessa →
        </Link>
      </p>

      <div className="prose">
        <p className="lead">
          <span className="answer-sentence">
            Viikko Nro julkaisee kaiken viikko-, kuukausi-, vuosi-, vuosineljännes-,
            pyhäpäivä- ja liputuspäivädatansa <strong>ilmaisina, staattisina
            JSON-tiedostoina</strong> ilman kirjautumista tai pyyntörajoja.
          </span>{" "}
          Data kattaa vuodet 2020–2035 ja päivittyy automaattisesti kerran
          vuorokaudessa.
        </p>

        <p className="note-soft">Sisältö päivitetty {CONTENT_UPDATED_FI}.</p>

        <h2>Datasetit</h2>
        <p>
          Jokaisesta joukosta on yksi tiedosto per vuosi (tai per vuosi ja
          viikko/kuukausi/neljännes), sekä hakemistotiedosto (<code>index.json</code>)
          joka listaa kaikki kyseisen joukon tiedostot.
        </p>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Dataset</th>
              <th>Kuvaus</th>
              <th>URL-kaava</th>
              <th>Esimerkki</th>
            </tr>
          </thead>
          <tbody>
            {DATA_FEED_FAMILIES.map((family) => (
              <tr key={family.id}>
                <td>{family.name}</td>
                <td>{family.description}</td>
                <td><code>{family.urlPattern}</code></td>
                <td>
                  <a href={family.example}>{family.example}</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="prose">
        <h2>CSV ja XML</h2>
        <p>
          Viikko-, kuukausi-, vuosi-, pyhäpäivä- ja työpäivädata on
          saatavilla myös CSV- ja XML-muodossa, koko vuoden kerralla yhdessä
          tiedostossa (ei per tietue kuten JSON). Jokaisella datasetilla on
          oma sivunsa, jolla on lataus vuosittain sekä kenttäselitykset:
        </p>
        <ul>
          <li><Link to="/data/week">Viikkodata (CSV/XML)</Link></li>
          <li><Link to="/data/month">Kuukausidata (CSV/XML)</Link></li>
          <li><Link to="/data/year">Vuosidata (CSV/XML, kaikki vuodet yhdessä tiedostossa)</Link></li>
          <li><Link to="/data/holiday">Pyhäpäivädata (CSV/XML)</Link></li>
          <li><Link to="/data/working-days">Työpäivädata (CSV/XML)</Link></li>
        </ul>
      </div>

      <div className="prose">
        <h2>Esimerkki: /data/week/2026/32.json</h2>
      </div>
      <pre className="code-block">
{`{
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
}`}
      </pre>

      <div className="prose">
        <h2>Esimerkki: /data/year/2026.json</h2>
      </div>
      <pre className="code-block">
{`{
  "schemaVersion": "1.0",
  "year": 2026,
  "weekCount": 53,
  "workingDays": 254,
  "weekendDays": 104,
  "holidays": [
    { "name": "Uudenvuodenpäivä", "date": "2026-01-01", "official": true },
    { "name": "Loppiainen", "date": "2026-01-06", "official": true }
    // ... loput vuoden 2026 pyhäpäivät
  ],
  "flagDays": [
    { "name": "J. L. Runebergin päivä", "date": "2026-02-05" },
    { "name": "Kalevalan päivä", "date": "2026-02-28" }
    // ... loput vuoden 2026 liputuspäivät
  ],
  "firstWeek": { "week": 1, "year": 2026 },
  "lastWeek": { "week": 53, "year": 2026 },
  "url": "https://viikkonro.fi/vuosi-2026"
}`}
      </pre>

      <div className="prose">
        <h2>Kehittäjäystävällinen /api/-alias</h2>
        <p>
          Samat viikko-, kuukausi-, vuosi- ja pyhäpäivätiedostot ovat
          saatavilla myös osoitteista{" "}
          <code>/api/week/&#123;viikko&#125;/&#123;vuosi&#125;.json</code>,{" "}
          <code>/api/month/&#123;kuukausi&#125;/&#123;vuosi&#125;.json</code>,{" "}
          <code>/api/year/&#123;vuosi&#125;.json</code> ja{" "}
          <code>/api/holiday/&#123;tunniste&#125;/&#123;vuosi&#125;.json</code> —
          tutumpi polkumuoto kehittäjille, jotka odottavat REST-tyylistä{" "}
          <code>/api/</code>-etuliitettä. Nämä ovat pysyviä
          301-uudelleenohjauksia yllä olevaan <code>/data/</code>-osoitteeseen,
          eivät erillinen, itsenäisesti ylläpidetty kopio — sisältö on aina
          täsmälleen sama, eikä samasta datasta synny kahta kilpailevaa
          kanonista osoitetta.
        </p>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>/api/-osoite</th>
              <th>Ohjautuu osoitteeseen</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>/api/week/32/2026.json</code></td>
              <td><a href="/data/week/2026/32.json">/data/week/2026/32.json</a></td>
            </tr>
            <tr>
              <td><code>/api/month/8/2026.json</code></td>
              <td><a href="/data/month/2026/8.json">/data/month/2026/8.json</a></td>
            </tr>
            <tr>
              <td><code>/api/year/2026.json</code></td>
              <td><a href="/data/year/2026.json">/data/year/2026.json</a></td>
            </tr>
            <tr>
              <td><code>/api/holiday/itsenaisyyspaiva/2026.json</code></td>
              <td><a href="/data/holiday/2026/itsenaisyyspaiva.json">/data/holiday/2026/itsenaisyyspaiva.json</a></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="prose">
        <h2>Versiointi</h2>
        <p>
          Jokaisessa tiedostossa on <code>schemaVersion</code>-kenttä (nyt{" "}
          <code>"{FEED_SCHEMA_VERSION}"</code>). Numero nousee vain silloin,
          kun jokin kenttä poistetaan tai nimetään uudelleen — uuden kentän
          lisääminen olemassa olevaan tiedostoon ei ole rikkova muutos eikä
          nosta versiota. Sama numero näkyy myös schema.org/Dataset-merkinnän{" "}
          <code>version</code>-kentässä (ks. alla).
        </p>

        <h2>schema.org/Dataset-merkintä</h2>
        <p>
          Jokainen dataset on kuvattu myös koneluettavana{" "}
          <a href="https://schema.org/Dataset" target="_blank" rel="noopener noreferrer">
            schema.org/Dataset
          </a>{" "}
          -merkintänä JSON-LD-muodossa, kokonaisuudessaan osoitteessa{" "}
          <a href="/data/dataset.json">/data/dataset.json</a>. Merkintä sisältää
          nimen, kuvauksen, kielen (<code>fi-FI</code>), kattavuuden vuosina,
          lisenssin ja <code>DataDownload</code>-viittauksen jokaisen datasetin
          hakemistotiedostoon.
        </p>

        <h2>Käyttöoikeudet ja viittaaminen</h2>
        <p>
          Data on vapaasti käytettävissä{" "}
          <Link to="/kayttoehdot">käyttöehtojen</Link> mukaisesti. Kun
          siteeraat tai näytät dataa, mainitse lähteeksi "Viikko Nro" ja linkitä{" "}
          <a href="https://viikkonro.fi/">viikkonro.fi</a>.
        </p>

        <h2>Kaikki datasetit yhdellä kertaa</h2>
        <ul>
          <li>
            <a href="/data/index.json">/data/index.json</a> — kaikki datasetit
            ja niiden URL-kaavat.
          </li>
          <li>
            <a href="/data/dataset.json">/data/dataset.json</a> — sama tieto
            schema.org/Dataset-muodossa.
          </li>
          <li>
            <a href="/llms.txt">/llms.txt</a> ja{" "}
            <a href="/ai.txt">/ai.txt</a> — koneluettava sivustokuvaus
            tekoälyjärjestelmille.
          </li>
        </ul>

        <h2>Usein kysytyt kysymykset</h2>
        <div className="faq-list">
          {faqs.map((item, index) => (
            <details key={item.q} open={index === 0}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>

        <h2>Aiheeseen liittyviä sivuja</h2>
        <div className="quicklinks">
          <Link className="ql" to="/mika-on-viikkonumero">
            <b>Mikä on viikkonumero?</b>
            <span>ISO 8601 -viikkolaskenta kokonaisuudessaan</span>
          </Link>
          <Link className="ql" to="/vuosi-2026">
            <b>Vuoden 2026 viikot</b>
            <span>Kaikki viikkonumerot päivämäärineen</span>
          </Link>
          <Link className="ql" to="/pyhapaivat-2026">
            <b>Pyhäpäivät 2026</b>
            <span>Suomen viralliset pyhäpäivät</span>
          </Link>
          <Link className="ql" to="/tietoa-meista">
            <b>Tietoa meistä</b>
            <span>Kuka Viikko Nron tekee ja miksi</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default OpenData;
