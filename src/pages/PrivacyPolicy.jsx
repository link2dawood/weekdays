import React from "react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <>
      <section className="app">
        <div className="breadcrumb">
          <Link to="/">Etusivu</Link> / Tietosuojaseloste
        </div>
        <h1>Tietosuojaseloste</h1>
        <div className="prose">
          <p>Päivitetty viimeksi: 23. kesäkuuta 2026</p>
        </div>
        <h2>1. Keräämämme tiedot</h2>
        <div className="prose">
          <p>
            <strong>Lokitiedostot:</strong> Kuten useimmat tavanomaiset
            verkkopalvelimet, noudatamme vakiokäytäntöä lokitiedostojen
            käytössä. Nämä tiedostot kirjaavat kävijät heidän vieraillessaan
            verkkosivustoilla. Kerätyt tiedot sisältävät IP-osoitteet,
            selaintyypin, internetpalveluntarjoajan (ISP), päivämäärä- ja
            aikaleiman sekä viittaavat/poistumissivut.
          </p>
          <p>
            <strong>Evästeet ja verkkojäljitteet:</strong> Käytämme
            perusevästeitä käyttäjän asetusten (kuten valitseman teeman tai
            tumman tilan) tallentamiseen ja käyttökokemuksesi optimoimiseen.
          </p>
        </div>

        <h2>2. Miten käytämme tietojasi</h2>
        <div className="prose">
          <p>Käytämme keräämiämme tietoja seuraaviin tarkoituksiin:</p>
          <ul>
            <li>Verkkosivustomme tarjoaminen, ylläpito ja huolto.</li>
            <li>Alustamme työkalujen parantaminen, mukauttaminen ja laajentaminen.</li>
            <li>Sen ymmärtäminen ja analysointi, miten käytät verkkosivustoamme.</li>
            <li>Teknisten vikojen ja petollisen toiminnan seuranta ja estäminen.</li>
          </ul>
        </div>

        <h2>3. Tietosuoja (GDPR & CCPA)</h2>
        <div className="prose">
          <p>
            Emme myy, vuokraa tai jaa henkilötietojasi kolmansille osapuolille.
            Selaimesi tiedot pysyvät laitteellasi paikallisina aina kun se on
            mahdollista. Sinulla on oikeus pyytää pääsyä IP-osoitteeseesi
            liittyviin vähäisiin lokitietoihin, niiden korjaamista tai
            poistamista.
          </p>
        </div>

        <h2>4. Suostumus</h2>
        <div className="prose">
          <p>
            Käyttämällä verkkosivustoamme annat suostumuksesi
            tietosuojaselosteellemme ja hyväksyt sen ehdot.
          </p>
        </div>
      </section>
    </>
  );
};

export default PrivacyPolicy;
