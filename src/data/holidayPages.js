import {
  fmtFullFi,
  fmtShortFi,
  isoWeek,
  isoYear,
  WD,
  WD_ESSIVE,
} from "../components/dateUtils.js";
import { holidaysInYear } from "./holidays.js";

// One editorial record per holiday. Dates and official status always come
// from holidays.js; this registry only supplies stable URLs and explanatory
// copy for the programmatic landing pages.
export const HOLIDAY_DEFINITIONS = [
  {
    slug: "uudenvuodenpaiva",
    sourceName: "Uudenvuodenpäivä",
    displayName: "Uudenvuodenpäivä",
    seoName: "Uudenvuodenpäivä",
    rule: "Uudenvuodenpäivää vietetään aina 1. tammikuuta.",
    kind: "kiinteä pyhäpäivä",
  },
  {
    slug: "loppiainen",
    sourceName: "Loppiainen",
    displayName: "Loppiainen",
    seoName: "Loppiainen",
    rule: "Loppiaista vietetään aina 6. tammikuuta.",
    kind: "kiinteä pyhäpäivä",
  },
  {
    slug: "pitkaperjantai",
    sourceName: "Pitkäperjantai",
    displayName: "Pitkäperjantai",
    seoName: "Pitkäperjantai",
    rule: "Pitkäperjantai on kaksi päivää ennen pääsiäissunnuntaita.",
    kind: "liikkuva pyhäpäivä",
  },
  {
    slug: "paasiaispaiva",
    sourceName: "1. pääsiäispäivä",
    displayName: "Pääsiäispäivä",
    seoName: "Pääsiäinen",
    rule: "Pääsiäispäivä on kevätpäiväntasausta seuraavan täydenkuun jälkeinen sunnuntai kirkollisen laskennan mukaan.",
    kind: "liikkuva pyhäpäivä",
  },
  {
    slug: "toinen-paasiaispaiva",
    sourceName: "2. pääsiäispäivä",
    displayName: "Toinen pääsiäispäivä",
    seoName: "2. pääsiäispäivä",
    rule: "Toinen pääsiäispäivä on pääsiäissunnuntaita seuraava maanantai.",
    kind: "liikkuva pyhäpäivä",
  },
  {
    slug: "vappu",
    sourceName: "Vappu",
    displayName: "Vappu",
    seoName: "Vappu",
    rule: "Vappua vietetään aina 1. toukokuuta.",
    kind: "kiinteä pyhäpäivä",
  },
  {
    slug: "helatorstai",
    sourceName: "Helatorstai",
    displayName: "Helatorstai",
    seoName: "Helatorstai",
    rule: "Helatorstai on 39 päivää pääsiäissunnuntain jälkeen ja osuu aina torstaille.",
    kind: "liikkuva pyhäpäivä",
  },
  {
    slug: "helluntaipaiva",
    sourceName: "Helluntai",
    displayName: "Helluntaipäivä",
    seoName: "Helluntai",
    rule: "Helluntaipäivä on 49 päivää pääsiäissunnuntain jälkeen ja osuu aina sunnuntaille.",
    kind: "liikkuva pyhäpäivä",
  },
  {
    slug: "juhannusaatto",
    sourceName: "Juhannusaatto",
    displayName: "Juhannusaatto",
    seoName: "Juhannusaatto",
    rule: "Juhannusaatto on juhannuspäivää edeltävä perjantai, joten se osuu 19.–25. kesäkuuta.",
    kind: "liikkuva juhlapäivä",
  },
  {
    slug: "juhannuspaiva",
    sourceName: "Juhannuspäivä",
    displayName: "Juhannuspäivä",
    seoName: "Juhannus",
    rule: "Juhannuspäivä on 20.–26. kesäkuuta väliin osuva lauantai.",
    kind: "liikkuva pyhäpäivä",
  },
  {
    slug: "pyhainpaiva",
    sourceName: "Pyhäinpäivä",
    displayName: "Pyhäinpäivä",
    seoName: "Pyhäinpäivä",
    rule: "Pyhäinpäivä on 31. lokakuuta ja 6. marraskuuta välille osuva lauantai.",
    kind: "liikkuva pyhäpäivä",
  },
  {
    slug: "itsenaisyyspaiva",
    sourceName: "Itsenäisyyspäivä",
    displayName: "Itsenäisyyspäivä",
    seoName: "Itsenäisyyspäivä",
    rule: "Suomen itsenäisyyspäivää vietetään aina 6. joulukuuta.",
    kind: "kiinteä pyhäpäivä",
  },
  {
    slug: "jouluaatto",
    sourceName: "Jouluaatto",
    displayName: "Jouluaatto",
    seoName: "Jouluaatto",
    rule: "Jouluaattoa vietetään aina 24. joulukuuta.",
    kind: "kiinteä juhlapäivä",
  },
  {
    slug: "joulupaiva",
    sourceName: "Joulupäivä",
    displayName: "Joulupäivä",
    seoName: "Joulupäivä",
    rule: "Joulupäivää vietetään aina 25. joulukuuta.",
    kind: "kiinteä pyhäpäivä",
  },
  {
    slug: "tapaninpaiva",
    sourceName: "Tapaninpäivä",
    displayName: "Tapaninpäivä",
    seoName: "Tapaninpäivä",
    rule: "Tapaninpäivää vietetään aina 26. joulukuuta.",
    kind: "kiinteä pyhäpäivä",
  },
];

const BY_SLUG = new Map(HOLIDAY_DEFINITIONS.map((item) => [item.slug, item]));
const BY_SOURCE_NAME = new Map(
  HOLIDAY_DEFINITIONS.map((item) => [item.sourceName, item]),
);

export function holidaySlugForName(name) {
  return BY_SOURCE_NAME.get(name)?.slug ?? null;
}

export function holidayPageFor(year, slug) {
  const y = Number(year);
  const definition = BY_SLUG.get(slug);
  if (!definition || !Number.isInteger(y)) return null;
  const holiday = holidaysInYear(y).find(
    (item) => item.name === definition.sourceName,
  );
  if (!holiday) return null;
  return {
    ...definition,
    year: y,
    date: holiday.date,
    official: holiday.official,
    week: isoWeek(holiday.date),
    weekYear: isoYear(holiday.date),
    weekday: WD[holiday.date.getDay()],
    weekdayEssive: WD_ESSIVE[holiday.date.getDay()],
    path: `/pyhat-${y}/${slug}`,
  };
}

export function holidayPageMeta(year, slug) {
  const page = holidayPageFor(year, slug);
  if (!page) return null;
  let description = `${page.displayName} vuonna ${page.year} on ${page.weekdayEssive} ${fmtFullFi(page.date)} ja kuuluu viikkoon ${page.week}. Katso päivämäärä, viikonpäivä, viikkonumero, asema ja määräytymissääntö.`;
  if (description.length > 158) {
    description = description.replace(", asema ja", " ja");
  }
  return {
    title: `${page.seoName} ${page.year} – ${fmtShortFi(page.date)}, viikko ${page.week} | Viikko Nro`,
    description,
  };
}

export function holidayFaqs(page) {
  const status = page.official
    ? `${page.displayName} on Suomessa virallinen pyhäpäivä.`
    : `${page.displayName} ei ole Suomessa virallinen pyhäpäivä, vaikka sitä vietetään laajasti vapaapäivänä.`;
  return [
    {
      q: `Milloin ${page.displayName.toLowerCase()} on vuonna ${page.year}?`,
      a: `${page.displayName} on ${page.weekdayEssive} ${fmtFullFi(page.date)}.`,
    },
    {
      q: `Mille viikolle ${page.displayName.toLowerCase()} ${page.year} osuu?`,
      a: `${page.displayName} kuuluu viikkoon ${page.week} vuonna ${page.weekYear}.`,
    },
    {
      q: `Mikä viikonpäivä ${page.displayName.toLowerCase()} ${page.year} on?`,
      a: `${fmtFullFi(page.date)} on ${page.weekdayEssive}.`,
    },
    {
      q: `Onko ${page.displayName.toLowerCase()} virallinen pyhäpäivä?`,
      a: status,
    },
    {
      q: `Miten ${page.displayName.toLowerCase()} päivämäärä määräytyy?`,
      a: page.rule,
    },
  ];
}
