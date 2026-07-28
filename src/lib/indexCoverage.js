// G-04 — Index coverage sampling: the early-warning system for Phase 1's
// central risk (near-duplicate week/month/year pages either get indexed
// individually or silently don't). Daily-sampled via the URL Inspection API,
// summarized per template, with history persisted so the trend is visible —
// not just today's snapshot.
//
// Shares auth and template classification with searchConsole.js (G-03)
// rather than duplicating them, so both features agree on what a
// "template" is.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getClient, SITE_PROPERTY, templateFor } from "./searchConsole.js";
import { sitemapEntries, canonicalFor } from "../data/seo.js";

const URL_INSPECTION_ENDPOINT =
  "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_HISTORY_PATH = path.resolve(__dirname, "../../data/index-coverage-history.json");

// Groups every URL in the SITEMAP (what we want indexed) by template. This
// is deliberately a different universe than G-03's templates(), which groups
// Search Analytics rows (what already got clicks) — sampling here needs to
// cover pages regardless of whether they've received any traffic yet, since
// the whole point is catching indexing problems before traffic would reveal
// them.
export function urlsByTemplate(year = new Date().getFullYear()) {
  const byTemplate = new Map();
  for (const { path: p } of sitemapEntries(year)) {
    const template = templateFor(p);
    if (!byTemplate.has(template)) byTemplate.set(template, []);
    byTemplate.get(template).push(p);
  }
  return byTemplate;
}

// Picks up to `perTemplate` URLs from each template's candidate list.
// `rng` is injectable (defaults to Math.random) so sampling is deterministic
// in tests; in production a fresh random subset each day gives broad
// coverage over time without needing to track what was sampled previously.
export function sampleUrls(byTemplate, perTemplate = 25, rng = Math.random) {
  const sample = new Map();
  for (const [template, paths] of byTemplate) {
    const pool = [...paths];
    const picked = [];
    const n = Math.min(perTemplate, pool.length);
    for (let i = 0; i < n; i++) {
      const idx = Math.floor(rng() * pool.length);
      picked.push(pool[idx]);
      pool.splice(idx, 1);
    }
    sample.set(template, picked);
  }
  return sample;
}

// Calls the URL Inspection API for one path and normalizes the response.
// `canonicalMismatch` is a plain string comparison between what WE declare
// (canonicalFor()) and what Google says it resolved to (googleCanonical) —
// deliberately exact, not fuzzy-normalized, so a real mismatch (redirect
// chain, duplicate-content signal, etc.) can't be silently averaged away.
export async function inspectUrl(client, urlPath) {
  const inspectionUrl = canonicalFor(urlPath);
  const res = await client.request({
    url: URL_INSPECTION_ENDPOINT,
    method: "POST",
    data: { inspectionUrl, siteUrl: SITE_PROPERTY },
  });
  const result = res.data?.inspectionResult?.indexStatusResult || {};
  const googleCanonical = result.googleCanonical;
  return {
    path: urlPath,
    verdict: result.verdict ?? "VERDICT_UNSPECIFIED",
    indexed: result.coverageState === "Submitted and indexed" || result.verdict === "PASS",
    canonicalMismatch: Boolean(googleCanonical) && googleCanonical !== inspectionUrl,
  };
}

// 600 req/min is the published quota ceiling (10/sec); spacing requests
// ~140ms apart keeps this comfortably under that (~7/sec) with margin for
// network jitter, rather than sprinting right up to the limit and risking
// 429s from timing slop. At ~25 URLs x ~15 templates (~375 requests), this
// also stays far under the 2,000/day ceiling without any special handling.
const REQUEST_INTERVAL_MS = 140;

export async function inspectAll(client, sample, { sleep = defaultSleep } = {}) {
  const results = new Map();
  for (const [template, paths] of sample) {
    const inspected = [];
    for (const urlPath of paths) {
      inspected.push(await inspectUrl(client, urlPath));
      await sleep(REQUEST_INTERVAL_MS);
    }
    results.set(template, inspected);
  }
  return results;
}

function defaultSleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Reduces per-URL inspection results to the per-template numbers both this
// file's own alerting and G-03's weekly report consume.
export function summarizeByTemplate(inspectedByTemplate) {
  const summary = {};
  for (const [template, results] of inspectedByTemplate) {
    const sampled = results.length;
    const indexed = results.filter((r) => r.indexed).length;
    const mismatches = results.filter((r) => r.canonicalMismatch).length;
    summary[template] = {
      sampled,
      indexed,
      indexedShare: sampled > 0 ? indexed / sampled : null,
      canonicalMismatches: mismatches,
      mismatchRate: sampled > 0 ? mismatches / sampled : null,
    };
  }
  return summary;
}

// G-04's own alerting: "week" is Phase 1's central risk (~1000 near-
// duplicate pages that either get indexed individually or don't), so its
// indexed share specifically gets a named floor. Canonical mismatches are
// checked across EVERY template, not just week, because a mismatch is
// usually a site-wide bug in canonical generation rather than a
// template-specific one.
export function detectCoverageAlerts(summary) {
  const alerts = [];
  const week = summary.week;
  if (week && week.indexedShare !== null && week.indexedShare < 0.7) {
    alerts.push(
      `week-page indexed share is ${(week.indexedShare * 100).toFixed(1)}% (below the 70% floor, ${week.indexed}/${week.sampled} sampled)`,
    );
  }
  for (const [template, s] of Object.entries(summary)) {
    if (s.mismatchRate !== null && s.mismatchRate > 0.05) {
      alerts.push(
        `${template}: canonical mismatch rate ${(s.mismatchRate * 100).toFixed(1)}% (above the 5% ceiling, ${s.canonicalMismatches}/${s.sampled} sampled)`,
      );
    }
  }
  return alerts;
}

// History persistence: a flat JSON array committed back to the repo by the
// daily workflow. There's no database in this project (static site, no
// backend — see CLAUDE.md), so a git-tracked file is the simplest thing that
// actually persists across independent CI runs and stays trivially
// inspectable/diffable.
export function readHistory(historyPath = DEFAULT_HISTORY_PATH) {
  if (!fs.existsSync(historyPath)) return [];
  return JSON.parse(fs.readFileSync(historyPath, "utf-8"));
}

export function appendHistory(entry, historyPath = DEFAULT_HISTORY_PATH) {
  const history = readHistory(historyPath);
  history.push(entry);
  fs.mkdirSync(path.dirname(historyPath), { recursive: true });
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2) + "\n");
  return history;
}

export function latestHistoryEntry(historyPath = DEFAULT_HISTORY_PATH) {
  const history = readHistory(historyPath);
  return history.length > 0 ? history[history.length - 1] : null;
}

// The daily job itself: sample, inspect, summarize, record, and report any
// threshold breaches — orchestrates everything above.
export async function runDailySample({ perTemplate = 25 } = {}) {
  const client = await getClient();
  const byTemplate = urlsByTemplate();
  const sample = sampleUrls(byTemplate, perTemplate);
  const inspected = await inspectAll(client, sample);
  const summary = summarizeByTemplate(inspected);
  const entry = { date: new Date().toISOString().slice(0, 10), summary };
  appendHistory(entry);
  const alerts = detectCoverageAlerts(summary);
  return { entry, alerts };
}
