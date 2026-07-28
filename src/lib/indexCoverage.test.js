import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  urlsByTemplate,
  sampleUrls,
  inspectUrl,
  summarizeByTemplate,
  detectCoverageAlerts,
  readHistory,
  appendHistory,
  latestHistoryEntry,
} from "./indexCoverage.js";

describe("urlsByTemplate", () => {
  it("groups real sitemap URLs by template and includes the high-volume templates", () => {
    const byTemplate = urlsByTemplate(2026);
    expect(byTemplate.get("week").length).toBeGreaterThan(50); // ~53/year x 11 years
    expect(byTemplate.get("home")).toEqual(["/"]);
    expect(byTemplate.has("swedish")).toBe(false); // retired, not in the sitemap
  });
});

describe("sampleUrls", () => {
  it("picks exactly `perTemplate` URLs when more are available", () => {
    const byTemplate = new Map([["week", Array.from({ length: 100 }, (_, i) => `/w${i}`)]]);
    const sample = sampleUrls(byTemplate, 25, () => 0.5);
    expect(sample.get("week")).toHaveLength(25);
  });

  it("takes every URL (no fewer, no duplicates) when fewer than `perTemplate` exist", () => {
    const byTemplate = new Map([["widget", ["/upota-widgetti"]]]);
    const sample = sampleUrls(byTemplate, 25);
    expect(sample.get("widget")).toEqual(["/upota-widgetti"]);
  });

  it("never samples the same URL twice within one template", () => {
    const byTemplate = new Map([["week", Array.from({ length: 30 }, (_, i) => `/w${i}`)]]);
    // A degenerate rng that would pick the same index every time if sampling
    // didn't remove already-picked URLs from the pool.
    const sample = sampleUrls(byTemplate, 25, () => 0);
    const unique = new Set(sample.get("week"));
    expect(unique.size).toBe(25);
  });

  it("is deterministic given the same rng sequence", () => {
    const byTemplate = new Map([["week", Array.from({ length: 10 }, (_, i) => `/w${i}`)]]);
    let calls = 0;
    const seq = [0.1, 0.9, 0.2, 0.8, 0.3];
    const rng = () => seq[calls++ % seq.length];
    const a = sampleUrls(new Map(byTemplate), 5, rng);
    calls = 0;
    const b = sampleUrls(new Map(byTemplate), 5, rng);
    expect(a.get("week")).toEqual(b.get("week"));
  });
});

describe("inspectUrl", () => {
  function mockClient(responseData) {
    return { request: async () => ({ data: responseData }) };
  }

  it("marks a page indexed when coverageState says so", async () => {
    const client = mockClient({
      inspectionResult: {
        indexStatusResult: {
          verdict: "PASS",
          coverageState: "Submitted and indexed",
          googleCanonical: "https://viikkonro.fi/viikko-30-2026",
        },
      },
    });
    const r = await inspectUrl(client, "/viikko-30-2026");
    expect(r.indexed).toBe(true);
    expect(r.canonicalMismatch).toBe(false);
  });

  it("flags a canonical mismatch when Google chose a different canonical", async () => {
    const client = mockClient({
      inspectionResult: {
        indexStatusResult: {
          verdict: "PASS",
          coverageState: "Submitted and indexed",
          googleCanonical: "https://viikkonro.fi/",
        },
      },
    });
    const r = await inspectUrl(client, "/viikko-30-2026");
    expect(r.canonicalMismatch).toBe(true);
  });

  it("marks a page not-indexed when the API reports no coverage", async () => {
    const client = mockClient({
      inspectionResult: {
        indexStatusResult: { verdict: "NEUTRAL", coverageState: "Crawled - currently not indexed" },
      },
    });
    const r = await inspectUrl(client, "/viikko-30-2026");
    expect(r.indexed).toBe(false);
  });

  it("handles a missing inspectionResult without throwing", async () => {
    const client = mockClient({});
    const r = await inspectUrl(client, "/viikko-30-2026");
    expect(r.indexed).toBe(false);
    expect(r.canonicalMismatch).toBe(false);
  });
});

describe("summarizeByTemplate", () => {
  it("computes indexedShare and mismatchRate correctly", () => {
    const inspected = new Map([
      [
        "week",
        [
          { path: "/a", indexed: true, canonicalMismatch: false },
          { path: "/b", indexed: true, canonicalMismatch: true },
          { path: "/c", indexed: false, canonicalMismatch: false },
          { path: "/d", indexed: false, canonicalMismatch: false },
        ],
      ],
    ]);
    const summary = summarizeByTemplate(inspected);
    expect(summary.week).toEqual({
      sampled: 4,
      indexed: 2,
      indexedShare: 0.5,
      canonicalMismatches: 1,
      mismatchRate: 0.25,
    });
  });

  it("reports null shares (not NaN/divide-by-zero) for a template with zero samples", () => {
    const summary = summarizeByTemplate(new Map([["widget", []]]));
    expect(summary.widget.indexedShare).toBeNull();
    expect(summary.widget.mismatchRate).toBeNull();
  });
});

describe("detectCoverageAlerts", () => {
  it("alerts when week's indexed share is below 70%", () => {
    const alerts = detectCoverageAlerts({
      week: { sampled: 25, indexed: 15, indexedShare: 0.6, canonicalMismatches: 0, mismatchRate: 0 },
    });
    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toMatch(/week-page indexed share/);
  });

  it("does not alert when week's indexed share is exactly at 70%", () => {
    const alerts = detectCoverageAlerts({
      week: { sampled: 20, indexed: 14, indexedShare: 0.7, canonicalMismatches: 0, mismatchRate: 0 },
    });
    expect(alerts).toHaveLength(0);
  });

  it("alerts on any template's canonical mismatch rate above 5%, not just week", () => {
    const alerts = detectCoverageAlerts({
      week: { sampled: 25, indexed: 25, indexedShare: 1, canonicalMismatches: 0, mismatchRate: 0 },
      month: { sampled: 25, indexed: 25, indexedShare: 1, canonicalMismatches: 3, mismatchRate: 0.12 },
    });
    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toMatch(/month/);
  });

  it("returns no alerts for healthy numbers", () => {
    const alerts = detectCoverageAlerts({
      week: { sampled: 25, indexed: 24, indexedShare: 0.96, canonicalMismatches: 0, mismatchRate: 0 },
    });
    expect(alerts).toHaveLength(0);
  });

  it("does not alert on a template with no samples (null shares)", () => {
    const alerts = detectCoverageAlerts({
      widget: { sampled: 0, indexed: 0, indexedShare: null, canonicalMismatches: 0, mismatchRate: null },
    });
    expect(alerts).toHaveLength(0);
  });
});

describe("history persistence", () => {
  let historyPath;

  beforeEach(() => {
    historyPath = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "idxcov-")), "history.json");
  });

  afterEach(() => {
    fs.rmSync(path.dirname(historyPath), { recursive: true, force: true });
  });

  it("returns an empty array when no history file exists yet", () => {
    expect(readHistory(historyPath)).toEqual([]);
  });

  it("appends entries and persists them across reads", () => {
    appendHistory({ date: "2026-07-27", summary: { week: { sampled: 25 } } }, historyPath);
    appendHistory({ date: "2026-07-28", summary: { week: { sampled: 25 } } }, historyPath);
    const history = readHistory(historyPath);
    expect(history).toHaveLength(2);
    expect(history[0].date).toBe("2026-07-27");
    expect(history[1].date).toBe("2026-07-28");
  });

  it("latestHistoryEntry returns the most recently appended entry", () => {
    appendHistory({ date: "2026-07-27", summary: {} }, historyPath);
    appendHistory({ date: "2026-07-28", summary: {} }, historyPath);
    expect(latestHistoryEntry(historyPath).date).toBe("2026-07-28");
  });

  it("latestHistoryEntry returns null when there's no history yet", () => {
    expect(latestHistoryEntry(historyPath)).toBeNull();
  });
});
