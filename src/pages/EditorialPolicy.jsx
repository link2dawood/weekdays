import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import { canonicalFor, CONTENT_UPDATED_FI, FEED_SCHEMA_VERSION, routeMeta } from "../data/seo";
import { editorialPolicyFaqs } from "../data/trustPages";

const PATH = "/toimitusperiaatteet";

// Describes the process as it actually is — deterministic computation plus
// a stated, honest citation policy (HOLIDAY_LEGAL_BASIS's own discipline:
// cite only what's independently confirmed) — not a fictional editorial
// board this site doesn't have.
const EditorialPolicy = () => {
  const meta = routeMeta[PATH];
  const faqs = editorialPolicyFaqs();

  return (
    <section className="app">
      <SEO {...meta} canonical={canonicalFor(PATH)} />
      <div className="breadcrumb">
        <Link to="/">Etusivu</Link> / Toimitusperiaatteet
      </div>
      <h1>Toimitusperiaatteet</h1>

      <div className="prose">
        <p className="lead">
          <span className="answer-sentence">
            Viikko Nron viikkonumerot, kuukaudet ja vuodet{" "}
            <strong>lasketaan koodilla</strong>, ei syötetä käsin sivu
            kerrallaan — tämä on tälle sivustolle sopivin tapa varmistaa
            oikeellisuus, ei perinteinen toimituksellinen lukukierros.
          </span>
        </p>
        <p className="note-soft">Sisältö päivitetty {CONTENT_UPDATED_FI}.</p>

        <h2>Miten oikeellisuus varmistetaan</h2>
        <p>
          Jokainen viikkonumero, kuukausi ja vuosi lasketaan samalla
          deterministisellä ISO 8601 -logiikalla riippumatta siitä, mikä
          sivu sitä näyttää — katso tarkka laskentatapa sivulta{" "}
          <Link to="/menetelma">Menetelmä</Link>. Koska luvut lasketaan,
          ei kirjoiteta käsin joka sivulle erikseen, yksittäisen sivun
          transkriptiovirhe ei ole mahdollinen samalla tavalla kuin käsin
          ylläpidetyssä sisällössä.
        </p>

        <h2>Tietojen vahvistaminen</h2>
        <p>
          Pyhäpäivien lakiviittaukset ilmoitetaan sivustolla vain silloin,
          kun ne on erikseen vahvistettu Finlexistä. Emme väitä
          vahvistaneemme jokaisen pyhäpäivän taustalla olevaa lakipykälää
          — kerromme suoraan, minkä kahden pyhäpäivän kohdalla vahvistus
          on tehty, ja että loput perustuvat vakiintuneeseen
          kalenterikäytäntöön. Tarkempi erittely:{" "}
          <Link to="/tietolahteet">Tietolähteet</Link>.
        </p>

        <h2>Päivityskäytäntö</h2>
        <p>
          Koneluettavat <code>/data/</code>-tiedostot päivittyvät
          jokaisen julkaisun yhteydessä sekä kerran vuorokaudessa
          automaattisen yöllisen julkaisun kautta — niiden{" "}
          <code>dateModified</code>-kenttä kertoo aina todellisen
          koontipäivän, ei kiinteää päivämäärää. Toimituksellinen
          sisältö (kuten tämän sivun teksti) päivittyy, kun sitä
          muokataan; sivun oma "Sisältö päivitetty" -rivi kertoo
          silloin todellisen muokkauspäivän. Jokainen datatiedosto
          sisältää lisäksi <code>schemaVersion</code>-kentän (nyt{" "}
          <code>"{FEED_SCHEMA_VERSION}"</code>), joka nousee vain, jos
          jokin kenttä poistetaan tai nimetään uudelleen.
        </p>

        <h2>Virheiden korjaaminen</h2>
        <p>
          Jos löydät virheen, ota yhteyttä{" "}
          <Link to="/ota-yhteytta">yhteydenottolomakkeella</Link> ja
          kerro mahdollisimman tarkka sivu. Koska arvot lasketaan
          lähdekoodista, korjaus tehdään laskentalogiikkaan — se
          korjaa automaattisesti kaikki samaa laskentaa käyttävät sivut
          kerralla, ei vain yhtä.
        </p>

        <h2>Riippumattomuus</h2>
        <p>
          Palvelu on käyttäjälle ilmainen. Mahdollinen mainonta ei vaikuta
          laskentatuloksiin, lähdevalintoihin tai toimitukselliseen sisältöön,
          emmekä julkaise maksettuja sijoitteluja toimituksellisena aineistona.
          Mainosevästeistä ja suostumuksesta kerrotaan{" "}
          <Link to="/tietosuoja">tietosuojaselosteessa</Link>.
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
          <Link className="ql" to="/tietolahteet">
            <b>Tietolähteet</b>
            <span>Mihin viikko- ja pyhäpäivätieto perustuu</span>
          </Link>
          <Link className="ql" to="/menetelma">
            <b>Menetelmä</b>
            <span>Miten viikkonumerot ja pyhäpäivät lasketaan</span>
          </Link>
          <Link className="ql" to="/ota-yhteytta">
            <b>Ota yhteyttä</b>
            <span>Ilmoita virheestä tai anna palautetta</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default EditorialPolicy;
