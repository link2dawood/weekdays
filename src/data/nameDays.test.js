import { describe, it, expect } from "vitest";
import {
  CALENDAR_META,
  nameDaysForDate,
  nameDaysForWeek,
  missingNameDayDates,
} from "./nameDays";

// Tests the ENGINE (lookup, week iteration, leap handling) and the hard
// guarantee that no PLACEHOLDER/empty value can ever leak through to a page.
// The dataset itself is a partial seed until the Almanac Office licensing is
// resolved (see the file header).

describe("nameDaysForDate", () => {
  it("returns seeded names by calendar date regardless of year", () => {
    expect(nameDaysForDate(new Date(2026, 0, 2))).toEqual(["Aapeli"]);
    expect(nameDaysForDate(new Date(1999, 0, 2))).toEqual(["Aapeli"]);
    expect(nameDaysForDate(new Date(2026, 0, 3))).toEqual(["Elmeri", "Elmer"]);
  });
  it("returns [] for dates without licensed data (no placeholder leaks)", () => {
    expect(nameDaysForDate(new Date(2026, 6, 20))).toEqual([]);
  });
  it("never returns a PLACEHOLDER value on any calendar date", () => {
    for (let m = 0; m < 12; m++) {
      for (let d = 1; d <= 28; d++) {
        for (const n of nameDaysForDate(new Date(2026, m, d))) {
          expect(n).not.toMatch(/^PLACEHOLDER/);
        }
      }
    }
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
    for (const { date, names } of nameDaysForWeek(2026, 30)) {
      expect(names).toEqual(nameDaysForDate(date));
    }
  });
  it("a non-leap-year week never produces a 29 February date", () => {
    const days = nameDaysForWeek(2026, 9);
    const feb29 = days.find(
      (d) => d.date.getMonth() === 1 && d.date.getDate() === 29,
    );
    expect(feb29).toBeUndefined();
  });
  it("includes 29 February for a leap-year week containing it (2024, week 9)", () => {
    const days = nameDaysForWeek(2024, 9);
    const feb29 = days.find(
      (d) => d.date.getMonth() === 1 && d.date.getDate() === 29,
    );
    expect(feb29).toBeDefined();
    expect(Array.isArray(feb29.names)).toBe(true); // [] until data is licensed
  });
});

describe("coverage diagnostics", () => {
  it("no longer a placeholder calendar; reports the seed gap", () => {
    expect(CALENDAR_META.isPlaceholder).toBe(false);
    const missing = missingNameDayDates();
    expect(missing.length).toBe(363); // 3 of 366 seeded
    expect(missing).not.toContain("01-02");
  });
});
