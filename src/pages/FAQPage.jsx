import React from "react";
import { Link } from "react-router-dom";

const FAQPage = () => {
  return (
    <>
      <section className="app">
        <div className="breadcrumb">
          <Link to="/">Etusivu</Link> / UKK
        </div>
        <h1>Usein kysytyt kysymykset</h1>
        <details open>
          <summary>Mikä viikko nyt on?</summary>
          <p>
            Kuluva viikkonumero näkyy tämän sivun yläreunassa heti kun avaat
            sen. Viikko lasketaan laitteesi päivämäärän perusteella, joten se on
            aina ajan tasalla.
          </p>
        </details>
        <details>
          <summary>Alkaako viikko maanantaista vai sunnuntaista?</summary>
          <p>
            Suomessa viikko alkaa maanantaista ja päättyy sunnuntaihin ISO 8601
            -standardin mukaisesti.
          </p>
        </details>
        <details>
          <summary>Miten viikkonumero lasketaan?</summary>
          <p>
            Vuoden ensimmäinen viikko on se, joka sisältää vuoden ensimmäisen
            torstain, 4. tammikuuta. Siitä eteenpäin jokainen maanantaista
            alkava jakso kasvattaa viikkonumeroa yhdellä.
          </p>
        </details>
        <details>
          <summary>Kuinka monta viikkoa vuodessa on?</summary>
          <p>
            Useimmissa vuosissa on 52 viikkoa. Joissakin vuosissa on 53 viikkoa,
            kun vuosi alkaa torstaista tai karkausvuosi alkaa keskiviikosta.
          </p>
        </details>
      </section>
    </>
  );
};

export default FAQPage;
