import React from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import { routeMeta } from "../data/seo";
const AboutUs = () => {
  const meta = routeMeta["/about-us"];
  return (
    <>
      <section className="app">
        <SEO title={meta.title} description={meta.description} />
        <div className="breadcrumb">
          <Link to="/">Etusivu</Link> / Tietoa meistä
        </div>
        <h1>Tietoa meistä</h1>
        <div className="prose">
          <p>
            Tervetuloa palveluun <strong>Viikko Nro</strong> – digitaalinen
            työkalusi ajan seurantaan, kalenterijärjestelmiin ja vuoden
            suunnitteluun tarkasti.
          </p>
        </div>
        <h2>Keitä me olemme?</h2>
        <div className="prose">
          <p>
            Olemme joukko intohimoisia kehittäjiä ja tuottavuuden ystäviä, jotka
            ovat omistautuneet yksinkertaistamaan sitä, miten ihmiset käyttävät
            kalentereita. Uskomme, ettei ajan seurannan tulisi olla
            monimutkaista, sekavaa tai vanhentuneiden alueellisten
            kalenterisääntöjen kuormittamaa. Siksi rakensimme selkeän ja erittäin
            tarkan, maailmanlaajuisiin standardeihin perustuvan alustan, joka
            antaa sinulle välittömän selkeyden aikatauluusi.
          </p>
        </div>
        <h2>Tehtävämme</h2>
        <div className="prose">
          <p>
            Tehtävämme on yksinkertainen: tarjota selkeitä, salamannopeita ja
            helppokäyttöisiä verkkotyökaluja, jotka auttavat yksityishenkilöitä,
            projektipäälliköitä ja yrityksiä pysymään ajan tasalla. Käyttämällä
            yleismaailmallisia standardeja kuten ISO 8601 -kalenterijärjestelmää
            poistamme arvailun aikatauluttamisesta, päivämäärälaskennasta ja
            kuluneen ajan seurannasta.
          </p>
        </div>
        <h2>Miksi valita meidät?</h2>
        <ul>
          <li>
            <strong>Yksinkertaisuus edellä:</strong> Ei sekavuutta eikä
            monimutkaisia asetuksia – vain ne täsmälliset päivämäärä- ja
            aikatiedot, joita tarvitset silloin kun tarvitset.
          </li>
          <li>
            <strong>Tekninen tarkkuus:</strong> Rakennettu vankalla logiikalla
            varmistaen, että tietosi ovat täydellisesti synkronoituja
            maailmanlaajuisten standardien kanssa.
          </li>
          <li>
            <strong>Käytettävissä kaikkialla:</strong> Täysin optimoitu mobiili-,
            työpöytä- ja tablettiselaimille, joten voit tarkistaa aikataulusi
            missä tahansa.
          </li>
        </ul>
        <p>
          Kiitos, että olemme osa päivittäistä tuottavuusrutiiniasi!
        </p>
      </section>
    </>
  );
};

export default AboutUs;
