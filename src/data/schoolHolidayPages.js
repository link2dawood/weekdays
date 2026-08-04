import { mondayOf } from "../components/dateUtils.js";

export const SCHOOL_HOLIDAY_SOURCES = {
  oph2025: {
    label: "Opetushallitus: lukuvuosi 2025–2026",
    url: "https://www.oph.fi/fi/uutiset/2025/koulujen-tyo-ja-loma-ajat-lukuvuonna-2025-2026",
  },
  oph2026: {
    label: "Opetushallitus: lukuvuosi 2026–2027",
    url: "https://www.oph.fi/fi/uutiset/2026/koulujen-tyo-ja-loma-ajat-lukuvuonna-2026-2027",
  },
  helsinki: {
    label: "Helsingin kaupunki: koulujen työ- ja loma-ajat",
    url: "https://www.hel.fi/fi/kasvatus-ja-koulutus/koulujen-ja-oppilaitosten-tyo-ja-loma-ajat",
  },
  oulu: {
    label: "Oulun kaupunki: koulujen työ- ja loma-ajat",
    url: "https://www.ouka.fi/opiskelu-perusopetuksessa/koulujen-tyo-ja-loma-ajat",
  },
};

const WINTER_CITIES = {
  8: ["Helsinki", "Espoo", "Vantaa", "Pori", "Turku"],
  9: [
    "Hämeenlinna",
    "Jyväskylä",
    "Kokkola",
    "Kotka",
    "Kouvola",
    "Lahti",
    "Lappeenranta",
    "Mikkeli",
    "Seinäjoki",
    "Tampere",
    "Vaasa",
  ],
  10: ["Joensuu", "Kajaani", "Kuopio", "Oulu", "Rovaniemi"],
};

function weekGroup(year, week, cities, sourceKey, endOnSunday = false) {
  const startDate = mondayOf(week, year);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + (endOnSunday ? 6 : 4));
  return { week, startDate, endDate, cities, sourceKey, coverage: "city-comparison" };
}

const PAGES = {
  2026: {
    year: 2026,
    winter: [
      weekGroup(2026, 8, WINTER_CITIES[8], "oph2025"),
      weekGroup(2026, 9, WINTER_CITIES[9], "oph2025"),
      weekGroup(2026, 10, WINTER_CITIES[10], "oph2025"),
    ],
    autumn: [
      weekGroup(
        2026,
        42,
        [
          "Helsinki",
          "Espoo",
          "Vantaa",
          "Hämeenlinna",
          "Joensuu",
          "Jyväskylä",
          "Kajaani",
          "Kokkola",
          "Kuopio",
          "Rovaniemi",
          "Seinäjoki",
          "Tampere",
          "Turku",
          "Vaasa",
        ],
        "oph2026",
      ),
      weekGroup(
        2026,
        43,
        ["Kotka", "Kouvola", "Lahti", "Lappeenranta", "Mikkeli", "Oulu", "Pori"],
        "oph2026",
        true,
      ),
    ],
    otherPeriods: [
      "Lukuvuosi 2025–2026 päättyi peruskouluissa lauantaina 30.5.2026.",
      "Lukuvuosi 2026–2027 alkoi useimmissa kunnissa 12.–13.8.2026.",
      "Joululoma 2026 alkoi kunnasta riippuen yleensä 20.–23.12. ja päättyi useimmiten 6.1.2027.",
    ],
    coverageNote:
      "Taulukko vertaa Manner-Suomen maakuntien pääkaupunkien perusopetusta. Oman koulun päivät voivat poiketa kunnan yleisistä päivistä.",
    sourceKeys: ["oph2025", "oph2026"],
  },
  2027: {
    year: 2027,
    winter: [
      weekGroup(2027, 8, WINTER_CITIES[8], "oph2026"),
      weekGroup(2027, 9, WINTER_CITIES[9], "oph2026"),
      weekGroup(2027, 10, WINTER_CITIES[10], "oph2026"),
    ],
    autumn: [
      {
        ...weekGroup(2027, 42, ["Helsinki"], "helsinki"),
        coverage: "confirmed-city",
      },
    ],
    otherPeriods: [
      "Lukuvuosi 2026–2027 päättyy peruskouluissa lauantaina 5.6.2027.",
      "Helsingin lukuvuosi 2027–2028 alkaa 11.8.2027; muiden kuntien aloituspäivät tarkistetaan niiden omista päätöksistä.",
      "Helsingin joululoma on 23.12.2027–7.1.2028. Tätä ajankohtaa ei pidä yleistää kaikkiin kuntiin.",
    ],
    coverageNote:
      "Talvilomavertailu kattaa Manner-Suomen maakuntien pääkaupunkeja. Syksyn 2027 taulukossa näytetään vain erikseen vahvistettu Helsinki; tarkista muut kunnat niiden omilta sivuilta.",
    sourceKeys: ["oph2026", "helsinki", "oulu"],
  },
};

export const schoolHolidayYears = Object.keys(PAGES).map(Number);

export function schoolHolidayPage(year) {
  return PAGES[Number(year)] || null;
}

export function schoolHolidayMeta(year) {
  const page = schoolHolidayPage(year);
  if (!page) return null;
  return {
    title: `Koululomat ${year} – hiihto- ja syysloma | Viikko Nro`,
    description: `Koululomat ${year} alueittain: hiihtoloma viikoilla 8–10 sekä syys-, joulu- ja kesälomien ajankohdat. Vertaa Helsinkiä, Tamperetta, Oulua ja muita kaupunkeja.`,
  };
}

export function schoolHolidayFaqs(year) {
  const page = schoolHolidayPage(year);
  if (!page) return [];
  const winter = page.winter
    .map((group) => `viikko ${group.week}: ${group.cities.join(", ")}`)
    .join("; ");
  return [
    {
      q: `Milloin hiihtoloma ${year} on?`,
      a: `Hiihtoloma ${year} pidetään alueittain viikoilla 8–10. Kaupunkivertailu: ${winter}.`,
    },
    {
      q: `Milloin syysloma ${year} on?`,
      a:
        year === 2026
          ? "Syysloma 2026 osuu vertailukaupungeissa viikolle 42 tai 43. Tarkka päivämäärä riippuu kunnasta ja koulusta."
          : "Helsingin vahvistettu syysloma 2027 on viikolla 42 eli 18.–22.10. Muiden kuntien päivät on tarkistettava kunnan omalta sivulta.",
    },
    {
      q: "Onko hiihtoloma samaan aikaan koko Suomessa?",
      a: "Ei. Talvi- eli hiihtoloma porrastetaan tavallisesti viikoille 8, 9 ja 10, ja opetuksen järjestäjä päättää tarkat loma-ajat.",
    },
    {
      q: "Ovatko taulukon koululomat voimassa kaikissa kouluissa?",
      a: "Eivät välttämättä. Vertailu koskee pääasiassa kaupunkien perusopetusta. Esiopetuksen, lukioiden, ammatillisten oppilaitosten ja yksittäisten koulujen ajat voivat poiketa.",
    },
    {
      q: "Mistä koululomien päivämäärät on tarkistettu?",
      a: "Päivämäärät perustuvat Opetushallituksen kuntavertailuihin sekä Helsingin ja Oulun kaupunkien virallisiin työ- ja loma-aikoihin.",
    },
    {
      q: "Mistä löydän oman kouluni varmasti ajantasaiset loma-ajat?",
      a: "Tarkista oman kunnan tai koulun verkkosivu ja Wilma. Kunnan yleiseen kalenteriin voi tulla koulu- tai oppilaitoskohtaisia poikkeuksia.",
    },
  ];
}

export function schoolHolidayPeriodsInWeek(year, week) {
  const page = schoolHolidayPage(year);
  if (!page) return [];
  return [
    ...page.winter.map((group) => ({ ...group, type: "hiihtoloma" })),
    ...page.autumn.map((group) => ({ ...group, type: "syysloma" })),
  ]
    .filter((group) => group.week === Number(week))
    .map((group) => ({
      ...group,
      schoolYear: String(year),
      regionName: group.cities.join(", "),
      sourceUrl: SCHOOL_HOLIDAY_SOURCES[group.sourceKey].url,
    }));
}
