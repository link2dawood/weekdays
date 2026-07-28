import { describe, it, expect } from "vitest";
import { formatWeeklyReport } from "./cli.js";

function templatesResult({ drops = [] } = {}) {
  return {
    current: { startDate: "2026-07-18", endDate: "2026-07-24" },
    prior: { startDate: "2026-07-11", endDate: "2026-07-17" },
    thisWeek: new Map([
      ["week", 500],
      ["year", 300],
      ["home", 200],
    ]),
    lastWeek: new Map([
      ["week", 450],
      ["year", 350],
      ["home", 200],
    ]),
    drops,
  };
}

const NO_COVERAGE_YET = {
  implemented: true,
  hasData: false,
  note: "no index-coverage samples recorded yet — the daily sample-coverage job hasn't run",
};

describe("formatWeeklyReport", () => {
  it("lists templates sorted by clicks descending, with the date range", () => {
    const text = formatWeeklyReport(templatesResult(), NO_COVERAGE_YET);
    expect(text).toContain("2026-07-18 to 2026-07-24");
    const weekIdx = text.indexOf("• week: 500");
    const yearIdx = text.indexOf("• year: 300");
    const homeIdx = text.indexOf("• home: 200");
    expect(weekIdx).toBeGreaterThan(-1);
    expect(weekIdx).toBeLessThan(yearIdx);
    expect(yearIdx).toBeLessThan(homeIdx);
  });

  it("includes a warning section listing click-share drops when present", () => {
    const drops = [{ template: "year", lastShare: 0.35, thisShare: 0.2, relativeChange: -0.4286 }];
    const text = formatWeeklyReport(templatesResult({ drops }), NO_COVERAGE_YET);
    expect(text).toContain("Click-share drops >20%");
    expect(text).toContain("year:");
    expect(text).toContain("35.0%");
    expect(text).toContain("20.0%");
  });

  it("omits the drops section entirely when there are none", () => {
    const text = formatWeeklyReport(templatesResult({ drops: [] }), NO_COVERAGE_YET);
    expect(text).not.toContain("Click-share drops");
  });

  it("honestly reports coverage as pending when the daily job hasn't run yet", () => {
    const text = formatWeeklyReport(templatesResult(), NO_COVERAGE_YET);
    expect(text).toContain("Index coverage");
    expect(text).toContain("daily sample-coverage job hasn't run");
  });

  it("renders real per-template coverage data once G-04 has recorded a sample", () => {
    const coverageResult = {
      implemented: true,
      hasData: true,
      date: "2026-07-27",
      summary: {
        week: { sampled: 25, indexed: 24, indexedShare: 0.96, canonicalMismatches: 0, mismatchRate: 0 },
        widget: { sampled: 0, indexed: 0, indexedShare: null, canonicalMismatches: 0, mismatchRate: null },
      },
    };
    const text = formatWeeklyReport(templatesResult(), coverageResult);
    expect(text).toContain("sampled 2026-07-27");
    expect(text).toContain("week: 96% indexed (24/25), 0 canonical mismatch(es)");
    // A template with zero samples that day shouldn't render a bogus 0%/null row.
    expect(text).not.toContain("widget:");
  });
});
