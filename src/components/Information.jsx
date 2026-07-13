import React from "react";

const Information = () => {
  return (
    <>
      <section>
        <h2>Viikkonumerot Suomessa</h2>
        <div className="prose">
          <p>
            Suomessa viikot numeroidaan
            <strong> ISO 8601 -standardin</strong> mukaan. Viikko alkaa aina
            <strong> maanantaista</strong> ja päättyy sunnuntaihin, toisin kuin
            joissakin maissa kuten Yhdysvalloissa, joissa viikko alkaa usein
            sunnuntaista.
          </p>

          <p>
            Vuoden ensimmäinen viikko on se, joka sisältää vuoden ensimmäisen
            torstain. Käytännössä viikko 1 on aina se viikko, johon osuu
            <strong> 4. tammikuuta</strong>. Tämän vuoksi vuoden ensimmäinen
            viikko voi sisältää joulukuun viimeiset päivät, tai tammikuun
            ensimmäiset päivät voivat kuulua edellisen vuoden viimeiseen
            viikkoon.
          </p>

          <p>
            Tavallisessa vuodessa on <strong>52 viikkoa</strong>. Noin viiden
            tai kuuden vuoden välein on vuosi, jossa on 53 viikkoa. Tämä
            laskuri käsittelee nämä erot automaattisesti, joten näkemäsi
            viikkonumero on aina oikein.
          </p>
        </div>
      </section>
    </>
  );
};

export default Information;
