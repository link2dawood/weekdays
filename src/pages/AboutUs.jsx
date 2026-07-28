import React from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import SocialLinks from "../components/SocialLinks";
import { routeMeta } from "../data/seo";
const AboutUs = () => {
  const meta = routeMeta["/tietoa-meista"];
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
        <h2>Tietolähteet ja standardit</h2>
        <div className="prose">
          <p>
            Viikkonumerot lasketaan{" "}
            <a
              href="https://fi.wikipedia.org/wiki/ISO_8601"
              target="_blank"
              rel="noopener noreferrer"
            >
              ISO 8601 -standardin
            </a>{" "}
            mukaan: viikko alkaa maanantaista, ja vuoden ensimmäinen viikko on
            se, johon vuoden ensimmäinen torstai osuu. Lue lisää:{" "}
            <Link to="/mika-on-viikkonumero">mikä on viikkonumero</Link>.
          </p>
          <ul>
            <li>
              <strong>Pyhäpäivät:</strong> lasketaan Suomen lainsäädännön
              (laki 272/1944 ja laki 388/1937) mukaisista arkipyhistä.
            </li>
            <li>
              <strong>Auringonnousu ja -lasku:</strong> lasketaan{" "}
              <a
                href="https://github.com/mourner/suncalc"
                target="_blank"
                rel="noopener noreferrer"
              >
                suncalc
              </a>
              -kirjastolla, oletussijaintina Helsinki.
            </li>
            <li>
              <strong>Koulujen loma-ajat:</strong> perustuvat kuntien ja
              opetushallinnon julkaisemiin lukuvuositietoihin.
            </li>
            <li>
              <strong>Nimipäivät:</strong> täysi kalenteri odottaa
              lisenssivahvistusta Helsingin yliopiston almanakkatoimistolta;
              näytämme toistaiseksi vain vahvistetut nimet.
            </li>
          </ul>
        </div>

        <h2>Seuraa meitä</h2>
        <div className="prose">
          <p>Löydät Viikko Nron myös sosiaalisessa mediassa:</p>
        </div>
        <SocialLinks />
      </section>
    </>
  );
};

export default AboutUs;
