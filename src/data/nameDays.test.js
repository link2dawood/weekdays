import { describe, it, expect } from "vitest";
import {
  NAME_DAYS_FI,
  NAME_DAYS_SV,
  CALENDAR_META,
  CALENDAR_META_SV,
  nameDaysForDate,
  nameDaysForWeek,
} from "./nameDays";

// These tests verify the ENGINE (lookup mechanism, week iteration, leap-year
// handling) works correctly — not the DATA, which is intentionally
// placeholder until the Almanac Office licensing question is resolved (see
// the file header). Once real data lands, these should still pass
// unchanged; only CALENDAR_META's isPlaceholder-related assertions below
// will need updating.

describe("placeholder calendar shape", () => {
  it("has exactly 366 entries (all calendar dates incl. 29 Feb)", () => {
    expect(Object.keys(NAME_DAYS_FI).length).toBe(366);
    expect(Object.keys(NAME_DAYS_SV).length).toBe(366);
  });
  it("includes 29 February", () => {
    expect(NAME_DAYS_FI["02-29"]).toBeDefined();
  });
  it("every day has at least one name", () => {
    for (const names of Object.values(NAME_DAYS_FI)) {
      expect(names.length).toBeGreaterThan(0);
    }
  });
  it("is explicitly flagged as placeholder, not real data", () => {
    expect(CALENDAR_META.isPlaceholder).toBe(true);
    expect(CALENDAR_META.source).toBeNull();
    expect(CALENDAR_META_SV.isPlaceholder).toBe(true);
  });
});

describe("nameDaysForDate", () => {
  it("looks up by calendar date regardless of year", () => {
    expect(nameDaysForDate(new Date(2026, 0, 15))).toEqual(["PLACEHOLDER-01-15"]);
    expect(nameDaysForDate(new Date(1999, 0, 15))).toEqual(["PLACEHOLDER-01-15"]);
  });
  it("resolves 29 February in a leap year", () => {
    expect(nameDaysForDate(new Date(2024, 1, 29))).toEqual(["PLACEHOLDER-02-29"]);
  });
});

describe("nameDaysForWeek", () => {
  it("returns 7 consecutive days, Monday through Sunday", () => {
    const days = nameDaysForWeek(2026, 30);
    expect(days.length).toBe(7);
    expect(days[0].date.getDay()).toBe(1); // Monday
    expect(days[6].date.getDay()).toBe(0); // Sunday
    for (let i = 1; i < 7; i++) {
      expect(days[i].date - days[i - 1].date).toBe(24 * 60 * 60 * 1000);
    }
  });
  it("each day carries a names array matching nameDaysForDate", () => {
    const days = nameDaysForWeek(2026, 30);
    for (const { date, names } of days) {
      expect(names).toEqual(nameDaysForDate(date));
    }
  });
  it("correctly includes 29 February for a week that contains it in a leap year (2024, week 9)", () => {
    const days = nameDaysForWeek(2024, 9);
    const feb29 = days.find((d) => d.date.getMonth() === 1 && d.date.getDate() === 29);
    expect(feb29).toBeDefined();
    expect(feb29.names).toEqual(["PLACEHOLDER-02-29"]);
  });
  it("a non-leap-year week never produces a 29 February date", () => {
    // 2026 week 9 covers the same time of year; 2026 is not a leap year.
    const days = nameDaysForWeek(2026, 9);
    const feb29 = days.find((d) => d.date.getMonth() === 1 && d.date.getDate() === 29);
    expect(feb29).toBeUndefined();
  });
});
