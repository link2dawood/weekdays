import React from "react";
import { Link } from "react-router-dom";
import {
  isoYear,
  weeksInIsoYear,
  PRERENDER_MIN_YEAR as YEAR_MIN,
  PRERENDER_MAX_YEAR as YEAR_MAX,
} from "../components/dateUtils";
import SEO from "../components/SEO";
import { routeMeta } from "../data/seo";

const WeeksInYear = () => {
  const meta = routeMeta["/kuinka-monta-viikkoa-vuodessa"];

  const years = [];
  for (let y = YEAR_MIN; y <= YEAR_MAX; y++) {
    years.push(y);
  }

  // 53-week years, computed for accuracy (extractable facts for search/AI).
  const longYears = [];
  for (let y = 2020; y <= 2040; y++) {
    if (weeksInIsoYear(y) === 53) longYears.push(y);
  }

  const Y_NOW = isoYear(new Date());

  return (
    <>
      <section className="app">
        <SEO title={meta.title} description={meta.description} />
        <div className="breadcrumb">
          <Link to="/">Etusivu</Link> / Viikkoja vuodessa
        </div>
        <h1>Kuinka monta viikkoa vuodessa on?</h1>
        <div className="prose">
          <p>
            Useimmissa vuosissa on <strong>52 viikkoa</strong>. Suunnilleen
            joka viides tai kuudes vuosi on kuitenkin sellainen, jossa on{" "}
            <strong>53 viikkoa</strong>.
          </p>
          <p>
            Vuodessa on 53 viikkoa, kun se alkaa <strong>torstaista</strong>,
            tai kun <strong>karkausvuosi</strong> alkaa keskiviikosta.
            Esimerkiksi vuosissa 2020 ja 2026 on molemmissa 53 viikkoa.
          </p>
          <p>
            Tämä työkalu käsittelee eron automaattisesti, joten näkemäsi
            viikkonumero on aina oikein.
          </p>
          <p>
            Viikkojen laskenta perustuu{" "}
            <a
              href="https://fi.wikipedia.org/wiki/ISO_8601"
              target="_blank"
              rel="noopener noreferrer"
            >
              ISO 8601 -standardiin
            </a>
            , jossa vuoden ensimmäinen viikko sisältää vuoden ensimmäisen
            torstain. Lue tarkemmin:{" "}
            <Link to="/mika-on-viikkonumero">mikä on viikkonumero</Link>.
          </p>
        </div>

        <h2 className="mh">Mitä 53. viikko tarkoittaa käytännössä?</h2>
        <div className="prose">
          <p>
            <strong>Palkanlaskenta:</strong> Monet palkka- ja
            työaikajärjestelmät on rakennettu olettaen 52 viikkoa vuodessa.
            53. viikko tarkoittaa yhtä ylimääräistä palkanmaksu- tai
            raportointijaksoa niille, joiden palkka lasketaan viikoittain –
            tämä kannattaa tarkistaa palkkajärjestelmästä etukäteen, jotta
            vuosikohtaiset summat ja jaksotukset täsmäävät.
          </p>
          <p>
            <strong>Vähittäiskauppa ja raportointi:</strong> Monet yritykset
            käyttävät sisäisessä raportoinnissaan viikkopohjaista
            tilikautta (esim. ns. 4-4-5-kalenteria), jossa vuosi jaetaan
            tasaisiin viikkojaksoihin. 53. viikko rikkoo tämän jaon
            säännöllisesti, joten vuositason vertailut (esim. edellisvuoteen)
            vaativat oikaisua sellaisina vuosina.
          </p>
        </div>

        <h2 className="mh">Miksi eri kalenterit näyttävät eri viikkonumeron?</h2>
        <div className="prose">
          <p>
            Kalenteriohjelmat ja -sovellukset eivät aina noudata ISO
            8601 -standardia. Osa ohjelmistoista (esimerkiksi
            oletusasetuksin Yhdysvaltain alueasetuksilla) numeroi viikot
            niin, että viikko alkaa sunnuntaista ja viikko 1 on aina se,
            johon 1. tammikuuta osuu – ei se, johon vuoden ensimmäinen
            torstai osuu. Tämä ero näkyy erityisesti vuodenvaihteessa: sama
            päivä voi olla ISO-standardin mukaan edellisen tai seuraavan
            vuoden viikossa, kun taas amerikkalaistyyppinen laskenta antaa
            eri numeron. Tarkista aina, noudattaako käyttämäsi
            kalenteriohjelma ISO 8601 -standardia, jos viikkonumero
            vaikuttaa väärältä.
          </p>
        </div>

        <h2 className="mh">53 viikon vuodet</h2>
        <p className="lead">
          Seuraavissa vuosissa on poikkeuksellinen viikko 53. Kaikissa muissa
          vuosissa on 52 viikkoa.
        </p>
        <div className="pills">
          {longYears.map((y) => (
            <Link
              key={y}
              to={`/vuosi-${y}`}
              className={`pill ${y === Y_NOW ? "active" : ""}`}
              onClick={() => window.scrollTo(0, 0)}
            >
              {y}
            </Link>
          ))}
        </div>

        <h2 className="mh">Selaa vuoden viikkoja</h2>
        <div className="pills">
          {years.map((y) => (
            <Link
              key={y}
              to={`/vuosi-${y}`}
              className={`pill ${y === Y_NOW ? "active" : ""}`}
            >
              {y}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
};

export default WeeksInYear;
