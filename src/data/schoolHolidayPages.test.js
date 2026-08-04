import { describe, expect, it } from "vitest";
import {
  schoolHolidayFaqs,
  schoolHolidayMeta,
  schoolHolidayPage,
  schoolHolidayPeriodsInWeek,
  schoolHolidayYears,
} from "./schoolHolidayPages.js";

describe("school holiday landing-page data", () => {
  it("publishes only years backed by official data", () => {
    expect(schoolHolidayYears).toEqual([2026, 2027]);
    expect(schoolHolidayPage(2028)).toBeNull();
  });

  it("groups winter holidays into weeks 8, 9 and 10", () => {
    for (const year of schoolHolidayYears) {
      expect(schoolHolidayPage(year).winter.map((group) => group.week)).toEqual([8, 9, 10]);
    }
    expect(schoolHolidayPeriodsInWeek(2027, 8)[0].cities).toContain("Helsinki");
    expect(schoolHolidayPeriodsInWeek(2027, 9)[0].cities).toContain("Tampere");
    expect(schoolHolidayPeriodsInWeek(2027, 10)[0].cities).toContain("Oulu");
  });

  it("does not generalize Helsinki's autumn 2027 dates nationwide", () => {
    const autumn = schoolHolidayPage(2027).autumn;
    expect(autumn).toHaveLength(1);
    expect(autumn[0]).toMatchObject({
      week: 42,
      cities: ["Helsinki"],
      coverage: "confirmed-city",
    });
  });

  it("provides six FAQs and snippet-length metadata", () => {
    expect(schoolHolidayFaqs(2027)).toHaveLength(6);
    for (const year of schoolHolidayYears) {
      const meta = schoolHolidayMeta(year);
      expect(meta.title.length).toBeLessThanOrEqual(60);
      expect(meta.description.length).toBeGreaterThanOrEqual(140);
      expect(meta.description.length).toBeLessThanOrEqual(160);
    }
  });
});
