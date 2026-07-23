import { describe, it, expect } from "vitest";
import {
  SCHOOL_HOLIDAYS,
  HIIHTOLOMA_REGIONS,
  schoolHolidaysInWeek,
} from "./schoolHolidays";

describe("HIIHTOLOMA_REGIONS", () => {
  it("has exactly the three staggered regions", () => {
    expect(Object.keys(HIIHTOLOMA_REGIONS).sort()).toEqual(
      ["etelaSuomi", "itaPohjoisSuomi", "valiSuomi"].sort(),
    );
  });
  it("every region has a display name and example cities", () => {
    for (const region of Object.values(HIIHTOLOMA_REGIONS)) {
      expect(region.name).toBeTruthy();
      expect(region.exampleCities.length).toBeGreaterThan(0);
    }
  });
});

describe("schoolHolidaysInWeek — 2026-2027", () => {
  it("finds syysloma in week 42 of 2026", () => {
    const results = schoolHolidaysInWeek(2026, 42);
    expect(results.some((r) => r.type === "syysloma")).toBe(true);
  });

  it("finds joululoma across the year boundary (week 52/2026 and week 1/2027)", () => {
    const w52 = schoolHolidaysInWeek(2026, 52);
    const w1 = schoolHolidaysInWeek(2027, 1);
    expect(w52.some((r) => r.type === "joululoma")).toBe(true);
    expect(w1.some((r) => r.type === "joululoma")).toBe(true);
  });

  it("assigns each hiihtoloma region to its own distinct week (8, 9, 10 of 2027)", () => {
    const week8 = schoolHolidaysInWeek(2027, 8);
    const week9 = schoolHolidaysInWeek(2027, 9);
    const week10 = schoolHolidaysInWeek(2027, 10);

    expect(week8.find((r) => r.type === "hiihtoloma")?.region).toBe("etelaSuomi");
    expect(week9.find((r) => r.type === "hiihtoloma")?.region).toBe("valiSuomi");
    expect(week10.find((r) => r.type === "hiihtoloma")?.region).toBe("itaPohjoisSuomi");
  });

  it("does not put any other region's hiihtoloma in etelaSuomi's week", () => {
    const week8 = schoolHolidaysInWeek(2027, 8);
    const hiihtolomaEntries = week8.filter((r) => r.type === "hiihtoloma");
    expect(hiihtolomaEntries.length).toBe(1);
    expect(hiihtolomaEntries[0].region).toBe("etelaSuomi");
  });

  it("finds kesäloma in deep summer between the two known school years", () => {
    const results = schoolHolidaysInWeek(2027, 28); // mid-July 2027
    expect(results.some((r) => r.type === "kesaloma")).toBe(true);
  });

  it("finds nothing during an ordinary mid-semester week", () => {
    const results = schoolHolidaysInWeek(2026, 45); // mid-November, no known break
    expect(results).toEqual([]);
  });
});

describe("schoolHolidaysInWeek — 2027-2028", () => {
  it("finds syysloma in week 42 of 2027", () => {
    const results = schoolHolidaysInWeek(2027, 42);
    expect(results.some((r) => r.type === "syysloma")).toBe(true);
  });

  it("assigns hiihtoloma regions to weeks 8/9/10 of 2028", () => {
    expect(
      schoolHolidaysInWeek(2028, 8).find((r) => r.type === "hiihtoloma")?.region,
    ).toBe("etelaSuomi");
    expect(
      schoolHolidaysInWeek(2028, 9).find((r) => r.type === "hiihtoloma")?.region,
    ).toBe("valiSuomi");
    expect(
      schoolHolidaysInWeek(2028, 10).find((r) => r.type === "hiihtoloma")?.region,
    ).toBe("itaPohjoisSuomi");
  });

  it("finds kesäloma even with no known following school year (estimated)", () => {
    // Well after the 2027-2028 school year ends, with no 2028-2029 data yet
    // — falls within the estimated (not confirmed) summer-break bound.
    const results = schoolHolidaysInWeek(2028, 30); // late July 2028
    const kesaloma = results.find((r) => r.type === "kesaloma");
    expect(kesaloma).toBeDefined();
    expect(kesaloma.estimated).toBe(true);
  });
});

describe("degrades cleanly when data for a year is absent", () => {
  it("returns [] for a school year well before the covered range", () => {
    expect(schoolHolidaysInWeek(2015, 42)).toEqual([]);
  });
  it("returns [] for a school year well after the covered range", () => {
    // Far enough past 2027-2028 that even the open-ended kesäloma shouldn't
    // reasonably be considered to still apply — this is deep into a school
    // year we have no data for at all (autumn 2029).
    expect(schoolHolidaysInWeek(2029, 45)).toEqual([]);
  });
  it("does not throw for any of these — it's plain data, not an error path", () => {
    expect(() => schoolHolidaysInWeek(1990, 1)).not.toThrow();
    expect(() => schoolHolidaysInWeek(2050, 1)).not.toThrow();
  });
});

describe("SCHOOL_HOLIDAYS shape", () => {
  it("covers exactly the current and next school year", () => {
    expect(Object.keys(SCHOOL_HOLIDAYS).sort()).toEqual(
      ["2026-2027", "2027-2028"].sort(),
    );
  });
  it("kesäloma bridges 2026-2027's end to 2027-2028's start with no gap", () => {
    const kesaloma = SCHOOL_HOLIDAYS["2026-2027"].kesaloma;
    const nextStart = SCHOOL_HOLIDAYS["2027-2028"].schoolYearStart;
    const dayAfterKesaloma = new Date(kesaloma.endDate);
    dayAfterKesaloma.setDate(dayAfterKesaloma.getDate() + 1);
    expect(dayAfterKesaloma.toDateString()).toBe(nextStart.toDateString());
  });
  it("2027-2028's kesäloma is an estimate, not confirmed (no known next school year yet)", () => {
    expect(SCHOOL_HOLIDAYS["2027-2028"].kesaloma.estimated).toBe(true);
    expect(SCHOOL_HOLIDAYS["2027-2028"].kesaloma.endDate).not.toBeNull();
  });
  it("2026-2027's kesäloma is confirmed, not an estimate", () => {
    expect(SCHOOL_HOLIDAYS["2026-2027"].kesaloma.estimated).toBe(false);
  });
});
