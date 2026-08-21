import React from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import { CONTENT_UPDATED_FI, routeMeta } from "../data/seo";

const PrivacyPolicy = () => {
  const meta = routeMeta["/tietosuoja"];
  return (
    <>
      <section className="app">
        <SEO title={meta.title} description={meta.description} />
        <div className="breadcrumb">
          <Link to="/">Etusivu</Link> / Tietosuojaseloste
        </div>
        <h1>Tietosuojaseloste</h1>
        <div className="prose">
          <p>Päivitetty viimeksi: {CONTENT_UPDATED_FI}</p>
        </div>
        <h2>1. Rekisterinpitäjä ja yhteydenotto</h2>
        <div className="prose">
          <p>
            Rekisterinpitäjä on Viikko Nro. Tietosuojaa koskevissa kysymyksissä
            voit ottaa yhteyttä sivun{" "}
            <Link to="/ota-yhteytta">yhteydenottolomakkeella</Link>.
          </p>
        </div>

        <h2>2. Keräämämme tiedot</h2>
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
            <strong>Paikallinen tallennus:</strong> Yhteydenottolomakkeen
            väärinkäytön estävä lähetysrajoitus tallentaa selaimen{" "}
            <code>localStorage</code>-muistiin vain lähetysaikoja. Laskureiden
            käyttämiseen ei tarvita mainos- tai analytiikkaevästeitä.
          </p>
          <p>
            <strong>Käyttöanalytiikka:</strong> Microsoft Clarity voi käsitellä
            sivulatauksiin, laitteeseen, selaimeen sekä sivulla tehtyihin
            napsautuksiin, vierityksiin ja hiiren liikkeisiin liittyviä tietoja
            lämpökarttojen, käyttötietojen ja istuntotallenteiden tuottamiseksi.
            Lomakekenttien sisältö peitetään Clarity-tallenteissa.
          </p>
          <p>
            <strong>Yhteydenottolomake:</strong> Jos lähetät viestin, nimi,
            sähköpostiosoite ja viestin sisältö välitetään Web3Forms-palvelulle
            viestin toimittamista varten.
          </p>
        </div>

        <h2>3. Miten käytämme tietojasi</h2>
        <div className="prose">
          <p>Käytämme keräämiämme tietoja seuraaviin tarkoituksiin:</p>
          <ul>
            <li>Verkkosivustomme tarjoaminen, ylläpito ja huolto.</li>
            <li>Alustamme työkalujen parantaminen, mukauttaminen ja laajentaminen.</li>
            <li>Sen ymmärtäminen ja analysointi, miten käytät verkkosivustoamme.</li>
            <li>Teknisten vikojen ja petollisen toiminnan seuranta ja estäminen.</li>
          </ul>
        </div>

        <h2>4. Google AdSense, mainosevästeet ja DART</h2>
        <div className="prose">
          <p>
            Sivustolla voidaan näyttää Google AdSense -mainoksia. Google on
            kolmannen osapuolen mainostoimittaja, joka voi käyttäjän valinnan
            mukaisesti käyttää evästeitä tai muuta paikallista tallennusta
            mainosten näyttämiseen, rajoittamiseen, mittaamiseen ja
            personointiin. Google käytti mainosevästeestään aiemmin nimeä
            <strong> DART-eväste</strong>; mainosevästeiden avulla mainoksia
            voidaan näyttää tällä ja muilla verkkosivustoilla tehtyjen
            vierailujen perusteella.
          </p>
          <p>
            EU:ssa, ETA-alueella, Isossa-Britanniassa ja Sveitsissä
            valinnaiset mainosevästeet ja personoitu mainonta pidetään pois
            käytöstä, kunnes kävijä tekee valinnan Google-sertifioidussa
            suostumuksenhallintapalvelussa (CMP). Valinnan hylkääminen ei estä
            kalenterien tai laskureiden käyttöä. Kun mainospalvelut ovat
            käytössä, suostumuksen voi myöhemmin perua tai muuttaa bannerin
            evästeasetuksista.
          </p>
          <p>
            Lisätietoja:{" "}
            <a href="https://policies.google.com/technologies/ads" rel="external noopener">
              Googlen mainosevästeet
            </a>
            ,{" "}
            <a href="https://policies.google.com/technologies/partner-sites" rel="external noopener">
              miten Google käyttää kumppanisivustoilta saatuja tietoja
            </a>{" "}
            ja{" "}
            <a href="https://myadcenter.google.com/" rel="external noopener">
              Googlen mainosasetukset
            </a>.
          </p>
        </div>

        <h2>5. Microsoft Clarity -käyttöanalytiikka</h2>
        <div className="prose">
          <p>
            Käytämme Microsoft Clarity -palvelua sivuston käytettävyyden,
            teknisten ongelmien ja käyttäjien vuorovaikutuksen ymmärtämiseen.
            Clarity tuottaa muun muassa koottuja käyttömittareita,
            lämpökarttoja ja istuntotallenteita. Tietoja ei käytetä
            laskureiden tulosten muuttamiseen eikä Clarity estä sivuston
            toimintoja.
          </p>
          <p>
            Claritylle välitetään ennen käyttäjän valintaa Consent API V2
            -signaalit <code>analytics_Storage: denied</code> ja{" "}
            <code>ad_Storage: denied</code>. Tällöin Clarity ei aseta
            analytiikka- tai mainosevästeitä ja toimii rajoitetussa
            evästeettömässä tilassa, jossa yksittäisiä sivulatauksia ja
            perusvuorovaikutuksia voidaan käsitellä ilman sivujen välille
            jatkuvaa evästeistuntoa. Jos käyttäjä antaa suostumuksen
            analytiikkaan tai mainontaan, CMP välittää valinnan Claritylle.
            Suostumuksen voi myöhemmin perua CMP:n evästeasetuksista.
          </p>
          <p>
            Lisätietoja siitä, miten Microsoft käsittelee ja suojaa tietoja, on{" "}
            <a
              href="https://privacy.microsoft.com/privacystatement"
              rel="external noopener"
            >
              Microsoftin tietosuojaselosteessa
            </a>
            .
          </p>
        </div>

        <h2>6. Tietojen vastaanottajat ja säilytys</h2>
        <div className="prose">
          <p>
            Palvelun tekniseen toimittamiseen osallistuvat Vercel ja Cloudflare.
            Yhteydenottoviestit käsittelee Web3Forms ja käyttöanalytiikkaa
            Microsoft Clarity. Jos AdSense-mainonta on käytössä ja siihen on
            annettu tarvittava suostumus, Google ja CMP:ssä luetellut
            mainosteknologian tarjoajat voivat käsitellä tietoja omien
            tietosuojakäytäntöjensä mukaisesti. Emme myy henkilötietoja.
          </p>
          <p>
            Palvelinlokeja säilytetään palveluntarjoajien omien
            säilytysaikojen mukaisesti. Yhteydenottoviestejä säilytetään vain
            niin kauan kuin asian käsittely sitä edellyttää. Paikallisia
            lähetysaikoja käytetään vain tunnin mittaisen lähetysrajan
            laskentaan; sitä vanhemmat merkinnät poistetaan seuraavan
            lomakekäytön yhteydessä. Tiedot voi poistaa myös tyhjentämällä
            selaimen sivustotiedot. Microsoftin ilmoituksen mukaan Clarityn
            istuntotallenteita säilytetään tavallisesti 30 päivää. Koottuja
            napsautus- ja lämpökarttatietoja sekä merkittyjä tai otantaan
            valittuja tallenteita voidaan säilyttää enintään yhdeksän kuukautta.
          </p>
        </div>

        <h2>7. Oikeutesi ja suostumuksen peruuttaminen</h2>
        <div className="prose">
          <p>
            Sinulla on soveltuvan tietosuojalainsäädännön mukaisesti oikeus
            pyytää pääsyä henkilötietoihisi, niiden oikaisua tai poistamista,
            käsittelyn rajoittamista sekä vastustaa käsittelyä. Suostumukseen
            perustuvan käsittelyn voi perua milloin tahansa vaikuttamatta ennen
            peruuttamista tehdyn käsittelyn lainmukaisuuteen. Pyynnön voi tehdä{" "}
            <Link to="/ota-yhteytta">yhteydenottolomakkeella</Link>.
          </p>
        </div>
      </section>
    </>
  );
};

export default PrivacyPolicy;
