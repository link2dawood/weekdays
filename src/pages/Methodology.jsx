import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import { canonicalFor, CONTENT_UPDATED_FI, routeMeta } from "../data/seo";
import { methodologyFaqs } from "../data/trustPages";

const PATH = "/menetelma";

// Every rule stated here is the same one the site's own code computes
// with (dateUtils.js's isoWeek()/isoYear(), juhlapaivat.js's Anonymous
// Gauss Easter algorithm) — this page explains the code, it doesn't
// restate a different, hand-written version of the rules.
const Methodology = () => {
  const meta = routeMeta[PATH];
  const faqs = methodologyFaqs();

  return (
    <section className="app">
      <SEO {...meta} canonical={canonicalFor(PATH)} />
      <div className="breadcrumb">
        <Link to="/">Etusivu</Link> / Menetelmä
      </div>
      <h1>Menetelmä</h1>

      <div className="prose">
        <p className="lead">
          <span className="answer-sentence">
            Viikko Nro laskee jokaisen viikkonumeron, kuukauden ja vuoden
            <strong> ISO 8601 -standardin tarkoilla, deterministisillä
            säännöillä</strong> — ei arvioimalla eikä käsin ylläpidetystä
            taulukosta.
          </span>{" "}
          Tällä sivulla on koko laskentatapa, mukaan lukien
          reunatapaukset.
        </p>
        <p className="note-soft">Sisältö päivitetty {CONTENT_UPDATED_FI}.</p>

        <h2>Perussääntö</h2>
        <p>
          ISO 8601 -viikko alkaa maanantaista ja päättyy sunnuntaihin.
          Vuoden viikko 1 on se viikko, joka sisältää vuoden ensimmäisen
          torstain — tämä vastaa aina viikkoa, joka sisältää 4.
          tammikuuta. Katso myös{" "}
          <Link to="/mika-on-viikkonumero">Mikä on viikkonumero</Link>.
        </p>

        <h2>Reunatapaus: vuodenvaihde</h2>
        <p>
          Koska viikko 1 määräytyy vuoden ensimmäisen torstain, ei 1.
          tammikuuta, mukaan, joulukuun viimeiset päivät voivat kuulua
          seuraavan vuoden viikkoon 1, ja tammikuun ensimmäiset päivät
          voivat kuulua edellisen vuoden viimeiseen viikkoon. Esimerkiksi
          vuoden 2026 viikko 1 alkaa maanantaina 29. joulukuuta 2025.
        </p>

        <h2>Karkausvuodet ja viikko 53</h2>
        <p>
          Tavallisessa vuodessa on 52 viikkoa. 53 viikkoa on silloin, kun
          1. tammikuuta on torstai, tai karkausvuonna kun 1. tammikuuta on
          keskiviikko. Vuodet 2020, 2026 ja 2032 ovat 53 viikon vuosia.
          Katso myös{" "}
          <Link to="/kuinka-monta-viikkoa-vuodessa">
            Kuinka monta viikkoa vuodessa on
          </Link>
          .
        </p>

        <h2>Liikkuvat pyhäpäivät</h2>
        <p>
          Pääsiäisen päivämäärä lasketaan Gaussin pääsiäisalgoritmilla —
          samalla deterministisellä kaavalla joka vuosi. Pitkäperjantai,
          helatorstai ja helluntai lasketaan pääsiäisestä kiinteinä
          päivämäärävälein (pääsiäisestä −2, +39 ja +49 päivää).
          Juhannus ja pyhäinpäivä määräytyvät lauantaista tietyn
          päivämäärävälin sisällä — eivät kiinteästä päivämäärästä.
        </p>

        <h2>Työpäivien laskukaava</h2>
        <p>
          Työpäivien määrä = kalenteripäivät − lauantait ja sunnuntait −
          viralliset (13 laissa säädettyä) pyhäpäivää. Aattopäivät
          (juhannusaatto, jouluaatto) ja liputuspäivät eivät vähennä
          työpäivien määrää.
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
          <Link className="ql" to="/mika-on-viikkonumero">
            <b>Mikä on viikkonumero?</b>
            <span>ISO 8601 -viikkolaskenta selkokielellä</span>
          </Link>
          <Link className="ql" to="/vuosi-2026">
            <b>Vuoden 2026 viikot</b>
            <span>53 viikon vuosi käytännössä</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Methodology;
