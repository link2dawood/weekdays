// Single source of truth for all FAQ content (Finnish).
//
// GEO NOTE: The FAQPage JSON-LD block in /index.html mirrors these questions
// and answers for generative engines / AI crawlers that do not run JavaScript.
// If you edit a question or answer here, update the matching entry in
// index.html as well so the structured data stays consistent with the page.

export const faqCategories = [
  {
    title: "Kuluva viikko",
    items: [
      {
        featured: true,
        q: "Mikä viikko nyt on?",
        a: "Kuluva viikkonumero näkyy heti etusivun yläreunassa. Se lasketaan automaattisesti laitteesi päivämäärän perusteella ISO 8601 -standardin mukaan, joten näet aina oikean ja ajantasaisen viikon.",
      },
      {
        q: "Monesko viikko menee juuri nyt?",
        a: "Näet kuluvan viikon numeron etusivun laskurista. Suomessa viikot numeroidaan ISO 8601 -standardilla, ja vuoteen mahtuu 52 tai 53 viikkoa.",
      },
      {
        featured: true,
        q: "Miten tarkistan minkä tahansa päivän viikkonumeron?",
        a: "Valitse päivämäärä etusivun päivämäärähausta, niin näet kyseisen päivän viikkonumeron, vuoden ja viikon ajanjakson. Voit tarkistaa minkä tahansa menneen tai tulevan päivän viikon.",
      },
    ],
  },
  {
    title: "Viikon alkaminen ja ISO 8601",
    items: [
      {
        featured: true,
        q: "Alkaako viikko maanantaista vai sunnuntaista?",
        a: "Suomessa ja koko Euroopassa viikko alkaa maanantaista ja päättyy sunnuntaihin ISO 8601 -standardin mukaisesti. Esimerkiksi Yhdysvalloissa viikko alkaa usein sunnuntaista.",
      },
      {
        q: "Mikä on ISO 8601 -standardi?",
        a: "ISO 8601 on kansainvälinen standardi päivämäärien ja viikkojen esittämiseen. Sen mukaan viikko alkaa maanantaista, ja vuoden ensimmäinen viikko on se, johon osuu vuoden ensimmäinen torstai.",
      },
      {
        q: "Milloin viikko alkaa ja päättyy?",
        a: "Viikko alkaa maanantaina kello 00.00 ja päättyy sunnuntaina keskiyöllä. Jokainen viikko kestää tasan seitsemän vuorokautta.",
      },
    ],
  },
  {
    title: "Viikkonumeron laskenta",
    items: [
      {
        featured: true,
        q: "Miten viikkonumero lasketaan?",
        a: "Vuoden ensimmäinen viikko on se, joka sisältää vuoden ensimmäisen torstain (eli aina 4. tammikuuta). Tästä eteenpäin jokainen maanantaista alkava jakso kasvattaa viikkonumeroa yhdellä.",
      },
      {
        q: "Mikä on vuoden ensimmäinen viikko?",
        a: "Viikko 1 on se viikko, johon osuu vuoden ensimmäinen torstai. Käytännössä se on aina viikko, joka sisältää 4. tammikuuta.",
      },
      {
        q: "Mihin viikkoon 1. tammikuuta kuuluu?",
        a: "Se riippuu viikonpäivästä. Jos 1. tammikuuta on maanantain ja torstain välillä, se kuuluu uuden vuoden viikkoon 1. Jos se on perjantain ja sunnuntain välillä, se kuuluu edellisen vuoden viimeiseen viikkoon (52 tai 53).",
      },
    ],
  },
  {
    title: "Viikkojen määrä vuodessa",
    items: [
      {
        featured: true,
        q: "Kuinka monta viikkoa vuodessa on?",
        a: "Useimmissa vuosissa on 52 viikkoa. Noin joka viides tai kuudes vuosi on 53 viikon vuosi.",
      },
      {
        featured: true,
        q: "Milloin vuodessa on 53 viikkoa?",
        a: "Vuodessa on 53 viikkoa, kun vuosi alkaa torstaista tai kun karkausvuosi alkaa keskiviikosta. Esimerkiksi vuosissa 2020 ja 2026 on 53 viikkoa, ja seuraava tällainen vuosi on 2032.",
      },
      {
        q: "Voiko vuodessa olla 54 viikkoa?",
        a: "Ei. ISO 8601 -viikkonumerointi tuottaa aina joko 52 tai 53 viikkoa vuodessa, ei koskaan enempää eikä vähempää.",
      },
    ],
  },
  {
    title: "Erikoistapaukset",
    items: [
      {
        q: "Miksi tammikuun alkupäivät voivat kuulua edellisen vuoden viikkoon?",
        a: "Koska viikko lasketaan kokonaisena maanantaista sunnuntaihin, vuoden ensimmäiset päivät voivat kuulua edellisen vuoden viikkoon 52 tai 53, jos kyseisen viikon torstai osuu vielä vanhalle vuodelle.",
      },
      {
        q: "Mihin viikkoon joulukuun loppupäivät kuuluvat?",
        a: "Joulukuun viimeiset päivät voivat kuulua jo seuraavan vuoden viikkoon 1, jos kyseisen viikon torstai osuu tammikuulle. Esimerkiksi 29. joulukuuta 2025 kuuluu jo vuoden 2026 viikkoon 1.",
      },
      {
        q: "Mikä on viikko 53?",
        a: "Viikko 53 on ylimääräinen viikko, joka esiintyy vain 53 viikon vuosina. Se on tällaisen vuoden viimeinen viikko ennen seuraavan vuoden viikkoa 1.",
      },
    ],
  },
  {
    title: "Palvelun käyttö",
    items: [
      {
        featured: true,
        q: "Onko viikkolaskuri ilmainen?",
        a: "Kyllä. Viikko Nro on täysin ilmainen eikä sisällä mainoksia. Voit tarkistaa viikkonumerot ilman rekisteröitymistä.",
      },
      {
        q: "Toimiiko palvelu mobiililla?",
        a: "Kyllä. Sivusto on optimoitu mobiili-, tabletti- ja työpöytäselaimille, joten voit tarkistaa viikkonumeron millä tahansa laitteella.",
      },
      {
        q: "Mihin viikkonumeroita käytetään?",
        a: "Viikkonumeroita käytetään laajasti työelämässä, kouluissa, projektien aikataulutuksessa ja logistiikassa esimerkiksi toimitusten ja tapaamisten ajoittamiseen.",
      },
    ],
  },
];

// Flat list of every question/answer.
export const faqs = faqCategories.flatMap((category) => category.items);

// Curated subset highlighted on the home page.
export const featuredFaqs = faqs.filter((item) => item.featured);
