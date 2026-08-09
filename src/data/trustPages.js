// Content for the three "authority" pages (/tietolahteet, /menetelma,
// /toimitusperiaatteet) — plain .js (not .jsx), same reason dateUtils.js/
// seo.js/openDataContent.js are: prerender.js (a plain-Node script) needs
// these FAQ arrays directly for FAQPage JSON-LD, and it can't import a
// .jsx file. Every fact in every array below is either independently
// verified elsewhere in this codebase (HOLIDAY_LEGAL_BASIS, the Anonymous
// Gauss algorithm, CONTENT_UPDATED/FEED_BUILD_DATE) or stated generically
// where it isn't — nothing here asserts a source this site doesn't
// actually use.
import { FEED_SCHEMA_VERSION } from "./seo.js";

export function dataSourcesFaqs() {
  return [
    {
      q: "Mistä Viikko Nron viikkonumerot ja päivämäärät tulevat?",
      a: "Kaikki viikkonumerot, kuukausi- ja vuositiedot lasketaan paikallisesti ISO 8601 -standardin mukaisilla, deterministisillä säännöillä — niitä ei haeta ulkopuolisesta kalenteri-API:sta. Katso tarkka laskentatapa sivulta Menetelmä.",
    },
    {
      q: "Mihin Suomen pyhäpäivien virallinen asema perustuu?",
      a: "Kahden pyhäpäivän (Vappu ja itsenäisyyspäivä) virallinen asema on vahvistettu suoraan Finlexistä, Suomen virallisesta säädöstietopankista, tarkalla lakiviittauksella. Muiden 13 pyhäpäivän kohdalla noudatamme pitkäaikaista, vakiintunutta kalenterikäytäntöä emmekä väitä yksilöllisesti vahvistaneemme jokaista lakipykälää erikseen.",
    },
    {
      q: "Mistä koululomien (esim. hiihtoloman) viikot tulevat?",
      a: "Koululomien alue- ja kaupunkikohtaiset ajankohdat perustuvat kuntien ja kaupunkien virallisiin tiedotteisiin. Osa tiedoista on merkitty arvioiksi, jos virallista vahvistusta ei vielä ole julkaistu — tämä näkyy koululomasivuilla erikseen.",
    },
    {
      q: "Käyttääkö Viikko Nro Tilastokeskuksen dataa?",
      a: "Ei suoraan — Viikko Nron viikko- ja kalenteridata ei ole peräisin Tilastokeskukselta. Tilastokeskus mainitaan tällä sivulla kontekstina: se on esimerkki suomalaisesta viranomaisesta, joka niin ikään käyttää ISO 8601 -viikkonumerointia omassa raportoinnissaan.",
    },
    {
      q: "Onko ISO 8601 EU:n oma standardi?",
      a: "Ei — ISO 8601 on kansainvälinen (ISO:n) standardi, ei EU:n erillinen standardi. EU:n omat hallinnolliset ja tilastojärjestelmät kuitenkin nojaavat laajasti samaan ISO 8601 -standardiin, joten käytäntö on sama.",
    },
  ];
}

export function methodologyFaqs() {
  return [
    {
      q: "Miten viikkonumero lasketaan?",
      a: "ISO 8601 -standardin mukaan viikko alkaa maanantaista ja päättyy sunnuntaihin. Vuoden viikko 1 on se viikko, joka sisältää vuoden ensimmäisen torstain — tämä vastaa aina viikkoa, joka sisältää 4. tammikuuta.",
    },
    {
      q: "Miksi joulukuun viimeiset päivät voivat kuulua ensi vuoden viikkoon 1?",
      a: "Koska viikko 1 määräytyy vuoden ensimmäisen torstain, ei 1. tammikuuta, mukaan. Jos esimerkiksi 1. tammikuuta on torstai, jo sitä edeltävä maanantai (28.–31. joulukuuta väliltä) kuuluu uuden vuoden viikkoon 1.",
    },
    {
      q: "Milloin vuodessa on 53 viikkoa 52:n sijaan?",
      a: "Silloin kun 1. tammikuuta on torstai, tai karkausvuonna kun 1. tammikuuta on keskiviikko. Esimerkiksi vuodet 2020, 2026 ja 2032 ovat 53 viikon vuosia.",
    },
    {
      q: "Miten liikkuvien pyhäpäivien (esim. pääsiäisen) päivämäärä lasketaan?",
      a: "Pääsiäisen ja siitä riippuvien pyhien (pitkäperjantai, helatorstai, helluntai) päivämäärät lasketaan Gaussin pääsiäisalgoritmilla — samalla deterministisellä kaavalla joka vuosi, ei käsin ylläpidetystä listasta.",
    },
    {
      q: "Miten työpäivien määrä lasketaan?",
      a: "Työpäivien määrä = kalenteripäivät miinus lauantait ja sunnuntait miinus viralliset (13 laissa säädettyä) pyhäpäivää. Aattopäivät ja liputuspäivät eivät vähennä työpäivien määrää.",
    },
  ];
}

export function editorialPolicyFaqs() {
  return [
    {
      q: "Miten Viikko Nro varmistaa tietojen oikeellisuuden?",
      a: "Viikkonumerot, kuukaudet ja vuodet lasketaan koodilla, ei syötetä käsin sivu kerrallaan — tämä poistaa suurimman osan inhimillisistä transkriptiovirheistä. Pyhäpäivien lakiviittaukset ilmoitetaan vain silloin, kun ne on erikseen vahvistettu Finlexistä.",
    },
    {
      q: "Kuinka usein sisältö päivittyy?",
      a: `Koneluettavat /data/-tiedostot päivittyvät jokaisen julkaisun yhteydessä ja lisäksi kerran vuorokaudessa automaattisen yöllisen julkaisun kautta — niiden "dateModified"-kenttä kertoo aina todellisen koontipäivän. Toimituksellinen sisältö (esim. tämän sivun teksti) päivittyy, kun sitä muokataan; muutospäivä näkyy sivulla erikseen.`,
    },
    {
      q: "Mitä teen, jos löydän virheen?",
      a: "Ota yhteyttä yhteydenottolomakkeella. Kerro mahdollisimman tarkka sivu ja mikä tieto vaikuttaa virheelliseltä — korjaamme lasketut arvot lähdekoodista, jolloin korjaus koskee automaattisesti kaikkia samaa laskentaa käyttäviä sivuja.",
    },
    {
      q: "Onko sivustolla mainoksia tai maksettua sisältöä?",
      a: "Ei. Palvelu on ilmainen eikä sisällä mainoksia tai maksettuja sijoitteluja.",
    },
    {
      q: `Mitä "schemaVersion ${FEED_SCHEMA_VERSION}" tarkoittaa datatiedostoissa?`,
      a: `Se on koneluettavien tiedostojen versionumero. Se nousee vain, jos jokin kenttä poistetaan tai nimetään uudelleen — uuden kentän lisääminen ei nosta versiota. Tarkemmin: sivulla Avoin data.`,
    },
  ];
}
