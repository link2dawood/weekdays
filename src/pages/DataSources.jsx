import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import { canonicalFor, CONTENT_UPDATED_FI, routeMeta } from "../data/seo";
import { dataSourcesFaqs } from "../data/trustPages";

const PATH = "/tietolahteet";

// Every claim here traces to something independently verifiable elsewhere
// in this codebase (HOLIDAY_LEGAL_BASIS in src/data/holidays.js for the 2
// confirmed statute citations, CLAUDE.md for the school-holiday municipal
// sourcing) — nothing here asserts a source this site doesn't actually use.
const DataSources = () => {
  const meta = routeMeta[PATH];
  const faqs = dataSourcesFaqs();

  return (
    <section className="app">
      <SEO {...meta} canonical={canonicalFor(PATH)} />
      <div className="breadcrumb">
        <Link to="/">Etusivu</Link> / Tietolähteet
      </div>
      <h1>Tietolähteet</h1>

      <div className="prose">
        <p className="lead">
          <span className="answer-sentence">
            Viikko Nron viikkonumerot ja kalenteridata <strong>lasketaan
            paikallisesti ISO 8601 -standardin mukaisilla säännöillä</strong> —
            niitä ei haeta ulkopuolisesta kalenteri-API:sta.
          </span>{" "}
          Tällä sivulla on koottuna, mihin jokainen tietotyyppi todella
          perustuu.
        </p>
        <p className="note-soft">Sisältö päivitetty {CONTENT_UPDATED_FI}.</p>

        <h2>ISO 8601 -viikkostandardi</h2>
        <p>
          Kaikki viikkonumerot lasketaan{" "}
          <a
            href="https://www.iso.org/iso-8601-date-and-time-format.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            ISO 8601
          </a>{" "}
          -standardin mukaan: viikko alkaa maanantaista, ja vuoden viikko 1
          on se viikko, joka sisältää vuoden ensimmäisen torstain. Tarkka
          laskentatapa on kuvattu sivulla{" "}
          <Link to="/menetelma">Menetelmä</Link>.
        </p>

        <h2>Suomen pyhäpäivien lähteet</h2>
        <p>
          Kahden pyhäpäivän virallinen asema on vahvistettu suoraan{" "}
          <a href="https://www.finlex.fi/" target="_blank" rel="noopener noreferrer">
            Finlexistä
          </a>
          , Suomen virallisesta säädöstietopankista:
        </p>
        <ul>
          <li>
            Vappu — Laki vapunpäivän järjestämisestä työntekijäin
            vapaapäiväksi (272/1944)
          </li>
          <li>
            Itsenäisyyspäivä — Laki itsenäisyyspäivän viettämisestä
            yleisenä juhla- ja vapaapäivänä (388/1937)
          </li>
        </ul>
        <p>
          Muiden 13 pyhäpäivän kohdalla noudatamme pitkäaikaista,
          vakiintunutta kalenterikäytäntöä. Emme väitä yksilöllisesti
          vahvistaneemme jokaisen niistä lakipykälää erikseen — kerromme
          tämän suoraan sen sijaan, että arvaisimme lakiviittauksen.
        </p>

        <h2>Koululomien lähteet</h2>
        <p>
          Koululomien alue- ja kaupunkikohtaiset ajankohdat (esim.
          hiihtoloma) perustuvat kuntien ja kaupunkien virallisiin
          tiedotteisiin. Osa tulevien lukuvuosien tiedoista on merkitty
          arvioiksi, jos virallista vahvistusta ei vielä ole julkaistu —
          tämä näkyy erikseen{" "}
          <Link to="/koululomat-2026">koululomasivuilla</Link>.
        </p>

        <h2>Suomalainen ja kansainvälinen konteksti</h2>
        <p>
          Viikko Nro ei hae dataa Tilastokeskukselta, mutta Tilastokeskus
          on esimerkki suomalaisesta viranomaisesta, joka niin ikään
          käyttää ISO 8601 -viikkonumerointia omassa raportoinnissaan —
          sama käytäntö, eri lähde. Vastaavasti ISO 8601 ei ole EU:n oma
          erillinen standardi, mutta EU:n hallinnolliset ja tilastolliset
          järjestelmät nojaavat laajasti samaan kansainväliseen
          standardiin.
        </p>

        <h2>Usein kysyttyä</h2>
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
          <Link className="ql" to="/menetelma">
            <b>Menetelmä</b>
            <span>Miten viikkonumerot ja pyhäpäivät lasketaan</span>
          </Link>
          <Link className="ql" to="/toimitusperiaatteet">
            <b>Toimitusperiaatteet</b>
            <span>Miten sisällön oikeellisuus varmistetaan</span>
          </Link>
          <Link className="ql" to="/avoin-data">
            <b>Avoin data</b>
            <span>Koneluettavien /data/-tiedostojen dokumentaatio</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default DataSources;
