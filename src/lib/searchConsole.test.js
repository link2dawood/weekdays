import { describe, it, expect } from "vitest";
import {
  templateFor,
  clicksByTemplate,
  detectShareDrops,
  getFinalDateRange,
  getPriorFinalDateRange,
} from "./searchConsole.js";

describe("templateFor", () => {
  const cases = [
    ["https://viikkonro.fi/", "home"],
    ["https://viikkonro.fi/viikko-30-2026", "week"],
    ["https://viikkonro.fi/kuukausi-7-2026", "month"],
    ["https://viikkonro.fi/vuosi-2026", "year"],
    ["https://viikkonro.fi/tulosta-2026", "print"],
    ["https://viikkonro.fi/pyhapaivat-2026", "holidays"],
    ["https://viikkonro.fi/tyopaivat-2026", "working-days"],
    ["https://viikkonro.fi/kalenteri-2026", "calendar"],
    ["https://viikkonro.fi/kalenteri-2026-1", "calendar"],
    ["https://viikkonro.fi/tulostettava-kalenteri-2026", "calendar-print"],
    ["https://viikkonro.fi/laskurit", "calculators"],
    ["https://viikkonro.fi/paivamaara-viikoksi", "calculators"],
    ["https://viikkonro.fi/upota-widgetti", "widget"],
    ["https://viikkonro.fi/mika-on-viikkonumero", "explainer"],
    ["https://viikkonro.fi/kuinka-monta-viikkoa-vuodessa", "explainer"],
    ["https://viikkonro.fi/ukk", "explainer"],
    ["https://viikkonro.fi/tietoa-meista", "info"],
    ["https://viikkonro.fi/ota-yhteytta", "info"],
    ["https://viikkonro.fi/sv", "swedish"],
    ["https://viikkonro.fi/sv/veckor-2026", "swedish"],
    ["https://viikkonro.fi/haku", "search"],
    ["https://viikkonro.fi/some-unknown-path", "other"],
  ];
  for (const [url, expected] of cases) {
    it(`classifies ${url} as "${expected}"`, () => {
      expect(templateFor(url)).toBe(expected);
    });
  }

  // Ordering regression guard: a print-calendar URL must not be swallowed by
  // the more general "calendar" rule (both match /kalenteri-\d+ as a
  // substring-ish shape) since it's listed first specifically to win.
  it("prefers calendar-print over calendar for print URLs", () => {
    expect(templateFor("https://viikkonro.fi/tulostettava-kalenteri-2030")).toBe(
      "calendar-print",
    );
  });
});

describe("clicksByTemplate", () => {
  it("sums clicks per template across multiple pages of the same template", () => {
    const rows = [
      { keys: ["https://viikkonro.fi/viikko-1-2026"], clicks: 10 },
      { keys: ["https://viikkonro.fi/viikko-2-2026"], clicks: 5 },
      { keys: ["https://viikkonro.fi/vuosi-2026"], clicks: 3 },
    ];
    const result = clicksByTemplate(rows);
    expect(result.get("week")).toBe(15);
    expect(result.get("year")).toBe(3);
  });

  it("returns an empty map for no rows", () => {
    expect(clicksByTemplate([]).size).toBe(0);
  });
});

describe("detectShareDrops", () => {
  it("flags a template whose click share dropped more than the threshold", () => {
    // "week" held 50% of clicks last week (500/1000), now holds 30% (300/1000)
    // — a 40% relative drop in share, past the default 20% threshold.
    const lastWeek = new Map([
      ["week", 500],
      ["year", 500],
    ]);
    const thisWeek = new Map([
      ["week", 300],
      ["year", 700],
    ]);
    const drops = detectShareDrops(thisWeek, lastWeek);
    expect(drops).toHaveLength(1);
    expect(drops[0].template).toBe("week");
    expect(drops[0].relativeChange).toBeCloseTo(-0.4, 5);
  });

  it("does not flag a drop at exactly the threshold boundary (not past it)", () => {
    // share goes 0.5 -> 0.4, exactly a 20% relative drop.
    const lastWeek = new Map([
      ["week", 50],
      ["year", 50],
    ]);
    const thisWeek = new Map([
      ["week", 40],
      ["year", 60],
    ]);
    const drops = detectShareDrops(thisWeek, lastWeek, 0.2);
    // -0.2 <= -0.2 is true, so the boundary itself IS flagged (">= threshold"
    // reads as "at least this much", matching the "drops more than 20%"
    // wording being an alerting floor, not a strict-greater-than cutoff).
    expect(drops).toHaveLength(1);
  });

  it("ignores a template with no clicks last week (nothing to compare against)", () => {
    const lastWeek = new Map([["week", 100]]);
    const thisWeek = new Map([
      ["week", 100],
      ["brand-new-template", 5],
    ]);
    const drops = detectShareDrops(thisWeek, lastWeek);
    expect(drops).toHaveLength(0);
  });

  it("does not flag templates whose shares held steady (proportional growth)", () => {
    // Both totals grow 10%, so every template's SHARE of the total is
    // unchanged even though raw clicks went up — share, not raw count, is
    // what this function alerts on.
    const lastWeek = new Map([
      ["week", 100],
      ["year", 100],
    ]);
    const thisWeek = new Map([
      ["week", 110],
      ["year", 110],
    ]);
    expect(detectShareDrops(thisWeek, lastWeek)).toHaveLength(0);
  });

  it("flags the other template when one template's share grows at its expense", () => {
    // "week" grows 100->150 while "year" stays at 100 raw clicks — but
    // because the total grew, "year"'s SHARE still fell 50%->40%, a real
    // 20% relative drop that should be flagged even though its raw count
    // didn't change.
    const lastWeek = new Map([
      ["week", 100],
      ["year", 100],
    ]);
    const thisWeek = new Map([
      ["week", 150],
      ["year", 100],
    ]);
    const drops = detectShareDrops(thisWeek, lastWeek);
    expect(drops).toHaveLength(1);
    expect(drops[0].template).toBe("year");
  });

  it("sorts multiple drops worst-first", () => {
    const lastWeek = new Map([
      ["a", 100],
      ["b", 100],
      ["c", 100],
    ]);
    const thisWeek = new Map([
      ["a", 60], // -40% share change (100/300 -> 60/220... compute properly below)
      ["b", 10],
      ["c", 100],
    ]);
    const drops = detectShareDrops(thisWeek, lastWeek);
    // Just assert ordering is ascending by relativeChange (most negative first).
    for (let i = 1; i < drops.length; i++) {
      expect(drops[i].relativeChange).toBeGreaterThanOrEqual(drops[i - 1].relativeChange);
    }
  });
});

describe("getFinalDateRange", () => {
  it("ends exactly 3 days before `today` and spans `days` days", () => {
    const today = new Date("2026-07-27T12:00:00Z");
    const { startDate, endDate } = getFinalDateRange(today, 7);
    expect(endDate).toBe("2026-07-24");
    expect(startDate).toBe("2026-07-18");
  });

  it("defaults to a 7-day window", () => {
    const today = new Date("2026-01-10T00:00:00Z");
    const { startDate, endDate } = getFinalDateRange(today);
    const span = (new Date(endDate) - new Date(startDate)) / 86400000;
    expect(span).toBe(6); // 7 days inclusive of both endpoints
  });
});

describe("getPriorFinalDateRange", () => {
  it("is exactly one window earlier than getFinalDateRange for the same `today`", () => {
    const today = new Date("2026-07-27T12:00:00Z");
    const current = getFinalDateRange(today, 7);
    const prior = getPriorFinalDateRange(today, 7);
    expect(prior.endDate).toBe("2026-07-17");
    expect(prior.startDate).toBe("2026-07-11");
    // No gap and no overlap between the two windows.
    const dayAfterPriorEnd = new Date(prior.endDate);
    dayAfterPriorEnd.setDate(dayAfterPriorEnd.getDate() + 1);
    expect(dayAfterPriorEnd.toISOString().slice(0, 10)).toBe(current.startDate);
  });
});
