import React from "react";
import { Link } from "react-router-dom";

const TermsAndConditions = () => {
  return (
    <section className="app">
      <div className="breadcrumb">
        <Link to="/">Etusivu</Link> / Käyttöehdot
      </div>
      <h1>Käyttöehdot</h1>
      <p>Päivitetty viimeksi: 23. kesäkuuta 2026</p>
      <div className="prose">
        <p>
          Tervetuloa palveluun <strong>Viikko Nro</strong>. Nämä käyttöehdot
          määrittelevät verkkosivustomme ja palveluidemme käyttöä koskevat
          säännöt ja määräykset.
        </p>
      </div>
      <h2>1. Ehtojen hyväksyminen</h2>
      <div className="prose">
        <p>
          Käyttämällä tätä verkkosivustoa oletamme, että hyväksyt nämä
          käyttöehdot kokonaisuudessaan. Älä jatka palvelun{" "}
          <strong>Viikko Nro</strong> käyttöä, jos et hyväksy kaikkia tällä
          sivulla mainittuja käyttöehtoja.
        </p>
      </div>
      <h2>2. Immateriaalioikeudet</h2>
      <div className="prose">
        <p>
          Ellei toisin mainita, <strong>Viikko Nro</strong> omistaa
          immateriaalioikeudet kaikkeen tämän verkkosivuston materiaaliin ja
          koodiin. Kaikki immateriaalioikeudet pidätetään. Voit tarkastella ja
          tulostaa sivuja omaan henkilökohtaiseen käyttöösi näissä ehdoissa
          asetettujen rajoitusten mukaisesti.
        </p>
      </div>
      <p>Et saa:</p>
      <ul>
        <li>
          Julkaista uudelleen tämän verkkosivuston materiaalia tai
          lähdekoodia ilman nimenomaista lähdemainintaa.
        </li>
        <li>Myydä, vuokrata tai alilisensoida alustan materiaalia.</li>
        <li>Jäljentää, monistaa tai kopioida materiaalia kaupallisiin kopioihin.</li>
      </ul>

      <h2>3. Vastuuvapauslauseke</h2>
      <div className="prose">
        <p>
          Tämän verkkosivuston työkalut ja laskurit tarjotaan sellaisenaan
          ("as-is"). Vaikka pyrimme ehdottomaan tekniseen ja matemaattiseen
          tarkkuuteen, emme takaa, että kalenteritiedot tai kaavat ovat täysin
          vapaita erikoistapausten virheistä. <strong>Viikko Nro</strong> ei ole
          vastuussa aikatauluhäiriöistä, tietojen epäjohdonmukaisuuksista tai
          vahingoista, jotka aiheutuvat verkkolaskureidemme käytöstä.
        </p>
      </div>
    </section>
  );
};

export default TermsAndConditions;
