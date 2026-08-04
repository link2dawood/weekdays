import { describe, expect, it } from "vitest";
import {
  HOLIDAY_DEFINITIONS,
  holidayFaqs,
  holidayPageFor,
  holidayPageMeta,
} from "./holidayPages.js";

describe("named holiday pages", () => {
  it("defines 15 unique canonical holiday slugs", () => {
    expect(HOLIDAY_DEFINITIONS).toHaveLength(15);
    expect(new Set(HOLIDAY_DEFINITIONS.map((item) => item.slug)).size).toBe(15);
    for (const item of HOLIDAY_DEFINITIONS) {
      expect(item.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("resolves all 240 holiday and year combinations", () => {
    for (let year = 2020; year <= 2035; year += 1) {
      for (const item of HOLIDAY_DEFINITIONS) {
        expect(holidayPageFor(year, item.slug)).not.toBeNull();
      }
    }
  });

  it.each([
    [2027, "juhannuspaiva", "2027-06-26", 25, "Lauantai"],
    [2030, "paasiaispaiva", "2030-04-21", 16, "Sunnuntai"],
    [2024, "loppiainen", "2024-01-06", 1, "Lauantai"],
    [2026, "paasiaispaiva", "2026-04-05", 14, "Sunnuntai"],
    [2026, "itsenaisyyspaiva", "2026-12-06", 49, "Sunnuntai"],
  ])("answers known search intent for %i/%s", (year, slug, date, week, weekday) => {
    const page = holidayPageFor(year, slug);
    const localDate = `${page.date.getFullYear()}-${String(page.date.getMonth() + 1).padStart(2, "0")}-${String(page.date.getDate()).padStart(2, "0")}`;
    expect(localDate).toBe(date);
    expect(page.week).toBe(week);
    expect(page.weekday).toBe(weekday);
  });

  it("keeps every title and description within snippet budgets", () => {
    for (let year = 2020; year <= 2035; year += 1) {
      for (const item of HOLIDAY_DEFINITIONS) {
        const meta = holidayPageMeta(year, item.slug);
        expect(meta.title.length).toBeLessThanOrEqual(60);
        expect(meta.description.length).toBeGreaterThanOrEqual(140);
        expect(meta.description.length).toBeLessThanOrEqual(158);
      }
    }
  });

  it("provides five visible-schema FAQ entries per page", () => {
    const page = holidayPageFor(2026, "juhannuspaiva");
    expect(holidayFaqs(page)).toHaveLength(5);
  });

  it("rejects unknown holiday slugs", () => {
    expect(holidayPageFor(2026, "tuntematon")).toBeNull();
    expect(holidayPageMeta(2026, "tuntematon")).toBeNull();
  });
});
