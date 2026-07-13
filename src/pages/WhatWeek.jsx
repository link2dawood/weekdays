import React from "react";
import { Link } from "react-router-dom";
import { isoWeek, isoYear } from "../components/dateUtils";
const WhatWeek = () => {
  const NOW = new Date();
  const W_NOW = isoWeek(NOW);
  const Y_NOW = isoYear(NOW);
  return (
    <section className="app">
      <div className="breadcrumb">
        <Link to="/">Etusivu</Link> / Mikä on viikkonumero
      </div>
      <h1>Mikä on viikkonumero?</h1>
      <div className="prose">
        <p>
          Viikkonumero kertoo, mikä vuoden viikko on parhaillaan menossa. Viikot
          numeroidaan <strong>ISO 8601 -standardin</strong> mukaan, jota
          käytetään laajasti kaikkialla Euroopassa ja liike-elämässä ympäri
          maailmaa.
        </p>

        <p>Säännöt ovat yksinkertaiset:</p>

        <ul>
          <li>
            Viikko alkaa aina <strong>maanantaista</strong> ja päättyy
            sunnuntaihin.
          </li>

          <li>
            Vuoden ensimmäinen viikko on se, joka sisältää vuoden ensimmäisen{" "}
            <strong>torstain</strong>. Käytännössä tämä on aina se viikko, johon
            osuu <strong>4. tammikuuta</strong>.
          </li>

          <li>
            Tämän vuoksi vuoden viimeinen viikko voi sisältää tammikuun
            alkupäiviä, ja ensimmäinen viikko voi sisältää joulukuun loppupäiviä.
          </li>
        </ul>

        <p>
          Esimerkiksi 29. joulukuuta 2025 kuuluu jo vuoden 2026 viikkoon 1,
          koska kyseisen viikon torstai osuu tammikuulle.
        </p>
      </div>
      <p>
        <Link className="btn" to={`/year/${Y_NOW}`}>
          Katso vuoden {Y_NOW} viikot
        </Link>
      </p>
    </section>
  );
};

export default WhatWeek;
