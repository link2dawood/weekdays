import {
  isLeapYear,
  weeksInIsoYear,
  WD,
} from "../components/dateUtils.js";

export function yearWeekFact(year) {
  const weeks = weeksInIsoYear(year);
  const startsOn = WD[new Date(year, 0, 1).getDay()];
  return {
    year,
    weeks,
    startsOn,
    leap: isLeapYear(year),
    reason:
      weeks === 53
        ? isLeapYear(year) && startsOn === "Keskiviikko"
          ? "Karkausvuosi alkaa keskiviikkona"
          : "Vuosi alkaa torstaina"
        : "ISO-viikkovuodessa on 52 viikkoa",
  };
}

export function yearWeekRows(startYear, endYear) {
  return Array.from(
    { length: endYear - startYear + 1 },
    (_, index) => yearWeekFact(startYear + index),
  );
}

export function weeksInYearFaqs(currentYear) {
  const currentWeeks = weeksInIsoYear(currentYear);
  return [
    {
      q: "Kuinka monta viikkoa vuodessa on yhdellä lauseella?",
      a: "Vuodessa on ISO 8601 -viikkonumeroinnin mukaan 52 tai 53 viikkoa; useimmissa vuosissa on 52 viikkoa.",
    },
    {
      q: `Kuinka monta viikkoa vuonna ${currentYear} on?`,
      a: `Vuonna ${currentYear} on ${currentWeeks} ISO-viikkoa.`,
    },
    {
      q: "Milloin vuodessa on 53 viikkoa?",
      a: "Vuodessa on 53 ISO-viikkoa, kun vuosi alkaa torstaina tai kun keskiviikkona alkava vuosi on karkausvuosi.",
    },
    {
      q: "Miksi vuodessa ei ole tasan 52 viikkoa?",
      a: "Tavallisessa vuodessa on 365 päivää eli 52 täyttä viikkoa ja yksi päivä. Karkausvuodessa on 366 päivää eli 52 viikkoa ja kaksi päivää.",
    },
    {
      q: "Voiko vuodessa olla 54 viikkoa?",
      a: "Ei. ISO 8601 -järjestelmässä viikkovuodessa on aina joko 52 tai 53 viikkoa.",
    },
    {
      q: "Miksi tammikuun ensimmäiset päivät voivat kuulua edelliseen viikkovuoteen?",
      a: "ISO-viikko kuuluu sille vuodelle, jonka puolella viikon torstai on. Siksi tammikuun alku voi kuulua edellisen vuoden viikkoon 52 tai 53.",
    },
    {
      q: "Miten tarkistan tietyn vuoden viikkojen määrän?",
      a: "Avaa kyseisen vuoden viikkonumerosivu. Sivulla näkyvät kaikki vuoden ISO-viikot päivämäärineen sekä tieto siitä, onko viimeinen viikko 52 vai 53.",
    },
  ];
}
