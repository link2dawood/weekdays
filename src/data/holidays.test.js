import { describe, it, expect } from "vitest";
import {
  easterSunday,
  juhannuspaiva,
  juhannusaatto,
  pyhainpaiva,
  holidaysInYear,
  holidaysInWeek,
} from "./holidays";

// Independently verified against https://en.wikipedia.org/wiki/List_of_dates_for_Easter
// and cross-checked with a second source — not derived from this file's own
// algorithm. Covers 11 consecutive years plus 2032, including two leap
// years (2024, 2032) and 2026 (the year this was built in).
const KNOWN_EASTER_SUNDAYS = {
  2016: [2, 27], // March 27 (month is 0-indexed)
  2017: [3, 16],
  2018: [3, 1],
  2019: [3, 21],
  2020: [3, 12],
  2021: [3, 4],
  2022: [3, 17],
  2023: [3, 9],
  2024: [2, 31], // leap year
  2025: [3, 20],
  2026: [3, 5],
  2032: [2, 28], // leap year
};

describe("easterSunday", () => {
  for (const [year, [month, day]] of Object.entries(KNOWN_EASTER_SUNDAYS)) {
    it(`matches the known date for ${year}`, () => {
      const d = easterSunday(Number(year));
      expect([d.getMonth(), d.getDate()]).toEqual([month, day]);
    });
  }
});

describe("Easter-derived holidays (2026: Easter = 5 April)", () => {
  const byName = Object.fromEntries(
    holidaysInYear(2026).map((h) => [h.name, h.date]),
  );

  it("pitkäperjantai is 2 days before Easter", () => {
    expect(byName["Pitkäperjantai"].toDateString()).toBe(
      new Date(2026, 3, 3).toDateString(),
    );
  });
  it("2. pääsiäispäivä is 1 day after Easter", () => {
    expect(byName["2. pääsiäispäivä"].toDateString()).toBe(
      new Date(2026, 3, 6).toDateString(),
    );
  });
  it("helatorstai is 39 days after Easter", () => {
    expect(byName["Helatorstai"].toDateString()).toBe(
      new Date(2026, 4, 14).toDateString(),
    );
  });
  it("helluntai is 49 days after Easter", () => {
    expect(byName["Helluntai"].toDateString()).toBe(
      new Date(2026, 4, 24).toDateString(),
    );
  });
});

describe("fixed-date holidays", () => {
  const h = Object.fromEntries(holidaysInYear(2027).map((x) => [x.name, x.date]));
  it.each([
    ["Uudenvuodenpäivä", 0, 1],
    ["Loppiainen", 0, 6],
    ["Vappu", 4, 1],
    ["Itsenäisyyspäivä", 11, 6],
    ["Jouluaatto", 11, 24],
    ["Joulupäivä", 11, 25],
    ["Tapaninpäivä", 11, 26],
  ])("%s falls on the fixed date every year", (name, month, day) => {
    expect(h[name].toDateString()).toBe(new Date(2027, month, day).toDateString());
  });
});

describe("floating Saturday-anchored holidays", () => {
  // Verified against independent sources (checked 2026-07-23): Juhannuspäivä
  // 2026 = Saturday 20 June, Pyhäinpäivä 2026 = Saturday 31 October — both
  // the earliest possible Saturday in their legal windows that year.
  it("juhannuspäivä 2026 matches the sourced date", () => {
    expect(juhannuspaiva(2026).toDateString()).toBe(
      new Date(2026, 5, 20).toDateString(),
    );
  });
  it("pyhäinpäivä 2026 matches the sourced date", () => {
    expect(pyhainpaiva(2026).toDateString()).toBe(
      new Date(2026, 9, 31).toDateString(),
    );
  });

  // Algorithmic invariants, checked across many years rather than one fixed
  // fixture: always a Saturday, always inside the legally defined window.
  for (let year = 2016; year <= 2035; year++) {
    it(`juhannuspäivä ${year} is the Saturday in [June 20, June 26]`, () => {
      const d = juhannuspaiva(year);
      expect(d.getDay()).toBe(6);
      expect(d.getMonth()).toBe(5);
      expect(d.getDate()).toBeGreaterThanOrEqual(20);
      expect(d.getDate()).toBeLessThanOrEqual(26);
    });
    it(`juhannusaatto ${year} is the day before juhannuspäivä`, () => {
      const eve = juhannusaatto(year);
      const day = juhannuspaiva(year);
      expect(eve.getDay()).toBe(5); // Friday
      expect(day - eve).toBe(24 * 60 * 60 * 1000);
    });
    it(`pyhäinpäivä ${year} is the Saturday in [Oct 31, Nov 6]`, () => {
      const d = pyhainpaiva(year);
      expect(d.getDay()).toBe(6);
      const windowStart = new Date(year, 9, 31);
      const windowEnd = new Date(year, 10, 6);
      expect(d >= windowStart && d <= windowEnd).toBe(true);
    });
  }
});

describe("official vs. observed-but-working (arkipyhä distinction)", () => {
  const h = Object.fromEntries(holidaysInYear(2026).map((x) => [x.name, x.official]));

  it("jouluaatto is NOT an official arkipyhä", () => {
    expect(h["Jouluaatto"]).toBe(false);
  });
  it("juhannusaatto is NOT an official arkipyhä", () => {
    expect(h["Juhannusaatto"]).toBe(false);
  });
  it("all other holidays ARE official", () => {
    const nonOfficial = new Set(["Jouluaatto", "Juhannusaatto"]);
    for (const [name, official] of Object.entries(h)) {
      if (nonOfficial.has(name)) continue;
      expect(official, `${name} should be official`).toBe(true);
    }
  });
  it("exactly 13 official statutory holidays per year", () => {
    expect(holidaysInYear(2026).filter((x) => x.official).length).toBe(13);
  });
});

describe("holidaysInWeek", () => {
  it("finds New Year's Day in week 1 of 2026 (week starts Mon 29 Dec 2025)", () => {
    const names = holidaysInWeek(2026, 1).map((h) => h.name);
    expect(names).toContain("Uudenvuodenpäivä");
  });
  it("does NOT put Loppiainen (6 Jan) in week 1 of 2026", () => {
    const names = holidaysInWeek(2026, 1).map((h) => h.name);
    expect(names).not.toContain("Loppiainen");
  });
  it("finds Loppiainen in week 2 of 2026", () => {
    const names = holidaysInWeek(2026, 2).map((h) => h.name);
    expect(names).toContain("Loppiainen");
  });
  it("finds both Joulupäivä and Tapaninpäivä in the same week (2026 week 52)", () => {
    const names = holidaysInWeek(2026, 52).map((h) => h.name);
    expect(names).toContain("Joulupäivä");
    expect(names).toContain("Tapaninpäivä");
  });
  it("returns nothing for a holiday-free week", () => {
    // Week 30 of 2026 (late July) has no Finnish public holiday.
    expect(holidaysInWeek(2026, 30)).toEqual([]);
  });
});
