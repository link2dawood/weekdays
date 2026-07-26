// Single source of truth for all FAQ content (Finnish).
//
// This drives THREE outputs, all generated from this one file so they never
// drift: the visible /ukk page (FAQPage.jsx) + home featured block (FAQ.jsx),
// the FAQPage JSON-LD injected into /ukk by prerender.js, and the generated
// dist/llms-full.txt. Edit here only.

export const faqCategories = [
  {
    title: "Kuluva viikko",
    items: [
      {
        featured: true,
        q: "Mikä viikko nyt on?",
        a: "Kuluva viikkonumero näkyy heti etusivun yläreunassa. Se lasketaan automaattisesti laitteesi päivämäärästä ISO 8601 -standardin mukaan, joten näet aina oikean ja ajantasaisen viikon.",
      },
      {
        q: "Monesko viikko nyt menee?",
        a: "Sama kuin kuluva viikkonumero – katso se etusivun laskurista. Suomessa viikot numeroidaan ISO 8601 -standardilla, ja vuoteen mahtuu 52 tai 53 viikkoa.",
      },
      {
        q: "Mikä viikko on tänään?",
        a: "Tämän päivän viikkonumero näkyy etusivulla. Viikko vaihtuu aina maanantaina, joten numero päivittyy automaattisesti viikon alussa.",
      },
      {
        q: "Millä viikolla ollaan nyt?",
        a: "Nykyinen viikko näkyy etusivun laskurissa. Viikko alkaa maanantaista ja päättyy sunnuntaihin ISO 8601 -standardin mukaan.",
      },
      {
        q: "Mikä on tämän viikon numero ja päivämäärät?",
        a: "Etusivu näyttää kuluvan viikon numeron sekä sen alkamis- (maanantai) ja päättymispäivän (sunnuntai).",
      },
    ],
  },
  {
    title: "Tietyn päivän viikko",
    items: [
      {
        featured: true,
        q: "Miten selvitän tietyn päivän viikkonumeron?",
        a: "Valitse päivämäärä etusivun päivämäärähausta, niin näet kyseisen päivän viikkonumeron, vuoden ja viikon ajanjakson – minkä tahansa menneen tai tulevan päivän osalta.",
      },
      {
        q: "Millä viikolla jokin päivämäärä on?",
        a: "Syötä päivämäärä etusivun hakuun; palvelu kertoo sen viikkonumeron ISO 8601 -standardin mukaan.",
      },
      {
        q: "Mikä viikko on ensi maanantaina?",
        a: "Näet tulevan viikon etusivun laskurista tai avaamalla suoraan seuraavan viikon sivun. Uusi viikko alkaa aina maanantaista.",
      },
      {
        q: "Voiko sama päivä kuulua kahteen eri viikkoon?",
        a: "Ei. Jokainen päivä kuuluu täsmälleen yhteen ISO-viikkoon, joka kestää maanantaista sunnuntaihin.",
      },
    ],
  },
  {
    title: "Viikon alkaminen ja ISO 8601",
    items: [
      {
        featured: true,
        q: "Alkaako viikko maanantaista vai sunnuntaista?",
        a: "Suomessa ja koko Euroopassa viikko alkaa maanantaista ja päättyy sunnuntaihin ISO 8601 -standardin mukaan. Esimerkiksi Yhdysvalloissa viikko alkaa usein sunnuntaista.",
      },
      {
        q: "Mikä on viikon ensimmäinen päivä Suomessa?",
        a: "Maanantai. ISO 8601 -standardin mukaan viikko alkaa aina maanantaista.",
      },
      {
        q: "Milloin viikko vaihtuu?",
        a: "Viikko vaihtuu sunnuntain ja maanantain välisenä yönä kello 00.00. Jokainen viikko kestää tasan seitsemän vuorokautta.",
      },
      {
        q: "Mikä on ISO 8601 -standardi?",
        a: "Kansainvälinen standardi päivämäärien ja viikkojen esittämiseen: viikko alkaa maanantaista, ja vuoden ensimmäinen viikko sisältää vuoden ensimmäisen torstain.",
      },
      {
        q: "Käyttävätkö kaikki maat samaa viikkonumerointia?",
        a: "Eivät. Eurooppa käyttää ISO 8601:tä, kun taas esimerkiksi Yhdysvalloissa viikko alkaa sunnuntaista ja viikko 1 määritellään eri tavalla.",
      },
    ],
  },
  {
    title: "Viikkonumeron laskenta",
    items: [
      {
        featured: true,
        q: "Miten viikkonumero lasketaan?",
        a: "Vuoden ensimmäinen viikko on se, joka sisältää vuoden ensimmäisen torstain (aina 4. tammikuuta). Siitä eteenpäin jokainen maanantaista alkava jakso kasvattaa viikkonumeroa yhdellä.",
      },
      {
        q: "Mikä on vuoden ensimmäinen viikko?",
        a: "Viikko 1 on se viikko, johon osuu vuoden ensimmäinen torstai – käytännössä aina viikko, joka sisältää 4. tammikuuta.",
      },
      {
        q: "Mihin viikkoon 1. tammikuuta kuuluu?",
        a: "Se riippuu viikonpäivästä: jos 1. tammikuuta on maanantain ja torstain välillä, se kuuluu viikkoon 1; jos perjantain ja sunnuntain välillä, se kuuluu edellisen vuoden viimeiseen viikkoon (52 tai 53).",
      },
      {
        q: "Mihin viikkoon uudenvuodenpäivä kuuluu?",
        a: "Sama kuin 1. tammikuuta: joko uuden vuoden viikkoon 1 tai edellisen vuoden viikkoon 52/53, viikonpäivästä riippuen.",
      },
      {
        q: "Miksi tammikuun alkupäivät voivat olla viikkoa 52 tai 53?",
        a: "Koska viikko lasketaan kokonaisena maanantaista sunnuntaihin, vuoden ensimmäiset päivät voivat kuulua edellisen vuoden viimeiseen viikkoon, jos kyseisen viikon torstai osuu vielä vanhalle vuodelle.",
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
        a: "Vuodessa on 53 viikkoa, kun se alkaa torstaista, tai kun karkausvuosi alkaa keskiviikosta.",
      },
      {
        q: "Mitkä vuodet ovat 53 viikon vuosia?",
        a: "Esimerkiksi 2020, 2026, 2032, 2037 ja 2043. Muina vuosina on 52 viikkoa.",
      },
      {
        q: "Kuinka monta viikkoa vuonna 2026 on?",
        a: "Vuonna 2026 on 53 viikkoa, koska vuosi alkaa torstaista.",
      },
      {
        q: "Kuinka monta viikkoa vuonna 2025 on?",
        a: "Vuonna 2025 on 52 viikkoa.",
      },
      {
        q: "Kuinka monta viikkoa vuonna 2024 on?",
        a: "Vuonna 2024 on 52 viikkoa.",
      },
      {
        q: "Kuinka monta viikkoa vuonna 2027 on?",
        a: "Vuonna 2027 on 52 viikkoa.",
      },
      {
        q: "Voiko vuodessa olla 54 viikkoa?",
        a: "Ei. ISO 8601 -viikkonumerointi tuottaa aina joko 52 tai 53 viikkoa vuodessa, ei koskaan enempää.",
      },
      {
        q: "Onko tänä vuonna 52 vai 53 viikkoa?",
        a: "Katso tarkka viikkomäärä kuluvan vuoden sivulta – se laskee viikot automaattisesti oikein.",
      },
    ],
  },
  {
    title: "Erikoistapaukset",
    items: [
      {
        q: "Mikä on viikko 53?",
        a: "Viikko 53 on ylimääräinen viikko, joka esiintyy vain 53 viikon vuosina. Se on vuoden viimeinen viikko ennen seuraavan vuoden viikkoa 1.",
      },
      {
        q: "Mihin viikkoon joulu kuuluu?",
        a: "Joulun (24.–26.12.) viikkonumero vaihtelee vuosittain. Tarkista tarkka viikko päivämäärähausta tai kyseisen vuoden sivulta.",
      },
      {
        q: "Mihin viikkoon juhannus osuu?",
        a: "Juhannus vietetään kesäkuun 20.–26. päivän viikonloppuna, ja se osuu useimmiten viikolle 25. Tarkista tarkka viikko päivämäärähausta.",
      },
      {
        q: "Mihin viikkoon vappu kuuluu?",
        a: "Vapun (1.5.) viikkonumero vaihtelee vuosittain. Voit tarkistaa sen etusivun päivämäärähausta.",
      },
    ],
  },
  {
    title: "Viikkonumerot laitteissa ja ohjelmissa",
    items: [
      {
        q: "Miten näen viikkonumeron iPhonessa?",
        a: "iPhonen oma kalenteri ei näytä viikkonumeroita oletuksena, joten helpoin tapa on tarkistaa viikko täältä.",
      },
      {
        q: "Miten näen viikkonumerot Androidissa?",
        a: "Osa Android-kalentereista näyttää viikkonumerot asetuksista; muuten voit tarkistaa kuluvan viikon täältä.",
      },
      {
        q: "Miten saan viikkonumerot näkyviin Outlookissa?",
        a: "Outlookin kalenteriasetuksista voi kytkeä viikkonumerot näkyviin kalenterinäkymässä.",
      },
      {
        q: "Miten näen viikkonumerot Google-kalenterissa?",
        a: "Google-kalenterin asetuksissa on erillinen valinta viikkonumeroiden näyttämiseen.",
      },
      {
        q: "Miten lasken viikkonumeron Excelissä?",
        a: "Käytä kaavaa =ISOVIIKKONRO(päivämäärä) (englanniksi ISOWEEKNUM), joka noudattaa ISO 8601 -standardia.",
      },
      {
        q: "Voinko tulostaa koko vuoden viikkokalenterin?",
        a: "Kyllä. Tulostettava viikkokalenteri listaa kaikki vuoden viikot päivämäärineen yhdellä sivulla.",
      },
    ],
  },
  {
    title: "Nimipäivät, arkipyhät ja lomat",
    items: [
      {
        q: "Mitkä ovat tämän viikon nimipäivät?",
        a: "Jokaisen viikon sivulla näkyvät kaikkien seitsemän päivän nimipäivät.",
      },
      {
        q: "Onko tällä viikolla arkipyhiä?",
        a: "Viikon oma sivu kertoo, osuuko viikolle virallisia arkipyhiä tai muita merkkipäiviä.",
      },
      {
        q: "Mihin viikkoon hiihtoloma osuu?",
        a: "Hiihtoloma vaihtelee alueittain, yleensä viikoille 8–10. Viikon sivu näyttää alueesi koululoman.",
      },
      {
        q: "Mihin viikkoon syysloma osuu?",
        a: "Syysloma on useimmiten viikolla 42. Tarkka ajankohta näkyy kyseisen viikon sivulla.",
      },
      {
        q: "Milloin aurinko nousee ja laskee tällä viikolla?",
        a: "Jokaisen viikon sivulla näkyvät auringonnousu- ja laskuajat sekä valoisan ajan pituus (Helsinki).",
      },
    ],
  },
  {
    title: "Viikkonumeroiden käyttö",
    items: [
      {
        q: "Mihin viikkonumeroita käytetään?",
        a: "Viikkonumeroita käytetään laajasti työelämässä, kouluissa, projektien aikataulutuksessa ja logistiikassa esimerkiksi toimitusten ja tapaamisten ajoittamiseen.",
      },
      {
        q: "Miksi työpaikoilla käytetään viikkonumeroita?",
        a: "Ne ovat lyhyt ja yksiselitteinen tapa viitata ajanjaksoon ilman tarkkoja päivämääriä – esimerkiksi ”hoidetaan viikolla 34”.",
      },
      {
        q: "Käytetäänkö kouluissa viikkonumeroita?",
        a: "Kyllä. Lukujärjestykset, jaksot ja lomat ilmoitetaan usein viikkonumeroina.",
      },
    ],
  },
  {
    title: "Palvelu",
    items: [
      {
        featured: true,
        q: "Onko Viikko Nro ilmainen?",
        a: "Kyllä. Viikko Nro on täysin ilmainen ja mainokseton, eikä käyttö vaadi rekisteröitymistä.",
      },
      {
        q: "Toimiiko palvelu mobiililla?",
        a: "Kyllä. Sivusto on optimoitu mobiili-, tabletti- ja työpöytäselaimille.",
      },
      {
        q: "Tarvitseeko palveluun kirjautua?",
        a: "Ei. Kaikki toiminnot ovat käytettävissä ilman tiliä tai kirjautumista.",
      },
      {
        q: "Onko saatavilla erillistä sovellusta?",
        a: "Palvelu toimii suoraan selaimessa millä tahansa laitteella, joten erillistä sovellusta ei tarvita.",
      },
    ],
  },
];

// Flat list of every question/answer.
export const faqs = faqCategories.flatMap((category) => category.items);

// Curated subset highlighted on the home page.
export const featuredFaqs = faqs.filter((item) => item.featured);
