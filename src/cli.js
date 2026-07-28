#!/usr/bin/env node
// Shared CLI for Search Console tasks: `check` (F-07 — verifies the service
// account actually has Full access to the domain property), `submit-sitemap`
// (F-08 — submits sitemap.xml after a deploy), `templates`/`coverage`/
// `weekly-report` (G-03 — weekly Search Console summary posted to Slack),
// and `sample-coverage` (G-04 — the daily job that actually produces the
// index-coverage data `coverage` reads).
//
// Plain Node, not part of the Vite app bundle (nothing here is imported by
// src/main.jsx or src/entry-server.jsx), so it can use Node-only packages
// like google-auth-library without affecting the client bundle.
//
// Auth: a GCP service-account JSON key, provided as GOOGLE_APPLICATION_CREDENTIALS_JSON
// (the raw JSON string — the standard way to pass a service-account key through a CI
// secret without writing a file to disk). Falls back to GOOGLE_APPLICATION_CREDENTIALS
// (a file path) for local use, via google-auth-library's own default resolution.

import { pathToFileURL } from "node:url";
import { SITE_URL } from "./data/seo.js";
import {
  SITE_PROPERTY,
  getClient,
  getFinalDateRange,
  getPriorFinalDateRange,
  queryClicksByPage,
  clicksByTemplate,
  detectShareDrops,
} from "./lib/searchConsole.js";
import { runDailySample, latestHistoryEntry } from "./lib/indexCoverage.js";

const FULL_ACCESS_LEVELS = new Set(["siteOwner", "siteFullUser"]);

async function check() {
  const client = await getClient();
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_PROPERTY)}`;
  const res = await client.request({ url });
  const { permissionLevel, siteUrl } = res.data;

  console.log(`Site:             ${siteUrl}`);
  console.log(`Permission level: ${permissionLevel}`);

  if (!FULL_ACCESS_LEVELS.has(permissionLevel)) {
    console.error(
      `\nFAIL: service account does not have full access to ${SITE_PROPERTY} (got "${permissionLevel}").\n` +
        "Add it inside Search Console under Settings -> Users and permissions with Full access — " +
        "creating the key alone does nothing.",
    );
    process.exit(1);
  }
  console.log("\nOK");
}

async function submitSitemap() {
  const client = await getClient();
  const sitemapUrl = `${SITE_URL}/sitemap.xml`;
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_PROPERTY)}/sitemaps/${encodeURIComponent(sitemapUrl)}`;
  await client.request({ url, method: "PUT" });
  console.log(`Submitted ${sitemapUrl} to Search Console for ${SITE_PROPERTY}.`);
}

// G-03: per-template clicks for the most recent finalized week vs the week
// before it, plus any template whose click SHARE dropped more than 20%.
// Returns structured data (used by both the CLI's own printout and
// weeklyReport()'s Slack message) rather than printing directly.
async function templates() {
  const client = await getClient();
  const current = getFinalDateRange();
  const prior = getPriorFinalDateRange();

  const [currentRows, priorRows] = await Promise.all([
    queryClicksByPage(client, current.startDate, current.endDate),
    queryClicksByPage(client, prior.startDate, prior.endDate),
  ]);

  const thisWeek = clicksByTemplate(currentRows);
  const lastWeek = clicksByTemplate(priorRows);
  const drops = detectShareDrops(thisWeek, lastWeek);

  return { current, prior, thisWeek, lastWeek, drops };
}

// G-03's read side of G-04's data: reads whatever the daily sample-coverage
// job (runDailySample(), below) most recently recorded. Deliberately does
// NOT re-sample here — sampling costs URL Inspection API quota, and that's
// the daily job's job; this just reports on it.
async function coverage() {
  const latest = latestHistoryEntry();
  if (!latest) {
    return {
      implemented: true,
      hasData: false,
      note: "no index-coverage samples recorded yet — the daily sample-coverage job hasn't run",
    };
  }
  return { implemented: true, hasData: true, date: latest.date, summary: latest.summary };
}

// G-04: the daily job. Samples URLs, inspects them, records history, and
// posts to Slack immediately if a threshold is breached — independent of
// (and faster than) G-03's weekly summary.
async function sampleCoverage() {
  const { entry, alerts } = await runDailySample();
  console.log(`Sampled ${entry.date}:`, JSON.stringify(entry.summary, null, 2));
  if (alerts.length > 0) {
    const text = [
      ":rotating_light: *viikkonro.fi — index coverage alert*",
      "",
      ...alerts.map((a) => `• ${a}`),
    ].join("\n");
    await postToSlack(text);
  }
}

function pct(n) {
  return `${(n * 100).toFixed(1)}%`;
}

function formatTemplatesSection({ current, thisWeek, drops }) {
  const rows = [...thisWeek.entries()].sort((a, b) => b[1] - a[1]);
  const lines = [
    `*Templates* (clicks, ${current.startDate} to ${current.endDate}):`,
    ...rows.map(([template, clicks]) => `• ${template}: ${clicks}`),
  ];
  if (drops.length > 0) {
    lines.push("", ":warning: *Click-share drops >20% week-over-week:*");
    for (const d of drops) {
      lines.push(
        `• ${d.template}: ${pct(d.lastShare)} → ${pct(d.thisShare)} (${pct(d.relativeChange)})`,
      );
    }
  }
  return lines.join("\n");
}

function formatCoverageSection(coverageResult) {
  if (!coverageResult.hasData) {
    return `*Index coverage*: _${coverageResult.note}_`;
  }
  const lines = [`*Index coverage* (sampled ${coverageResult.date}):`];
  for (const [template, s] of Object.entries(coverageResult.summary)) {
    if (s.sampled === 0) continue;
    lines.push(
      `• ${template}: ${(s.indexedShare * 100).toFixed(0)}% indexed (${s.indexed}/${s.sampled}), ${s.canonicalMismatches} canonical mismatch(es)`,
    );
  }
  return lines.join("\n");
}

export function formatWeeklyReport(templatesResult, coverageResult) {
  return [
    `:bar_chart: *viikkonro.fi — weekly Search Console report*`,
    "",
    formatTemplatesSection(templatesResult),
    "",
    formatCoverageSection(coverageResult),
  ].join("\n");
}

async function postToSlack(text) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log("No SLACK_WEBHOOK_URL secret configured — printing report instead:\n");
    console.log(text);
    return;
  }
  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    throw new Error(`Slack webhook returned ${res.status}: ${await res.text()}`);
  }
  console.log("Posted weekly report to Slack.");
}

async function weeklyReport() {
  const [templatesResult, coverageResult] = await Promise.all([templates(), coverage()]);
  await postToSlack(formatWeeklyReport(templatesResult, coverageResult));
}

const commands = {
  check,
  "submit-sitemap": submitSitemap,
  templates,
  coverage,
  "weekly-report": weeklyReport,
  "sample-coverage": sampleCoverage,
};
// Guards the dispatch below so importing this file (e.g. cli.test.js
// importing formatWeeklyReport) doesn't also execute a CLI command and
// process.exit() — only `node src/cli.js ...` as the actual entry point does.
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const [, , commandName] = process.argv;
  const run = commands[commandName];

  if (!run) {
    console.error(`Usage: node src/cli.js <${Object.keys(commands).join("|")}>`);
    process.exit(1);
  }

  run()
    .then((result) => {
      // `templates`/`coverage` return data (used programmatically by
      // weekly-report); print it when run directly from the CLI so they're
      // still useful for manual inspection.
      if (result !== undefined && commandName !== "weekly-report") {
        console.log(JSON.stringify(result, (_, v) => (v instanceof Map ? Object.fromEntries(v) : v), 2));
      }
    })
    .catch((err) => {
      console.error(err.message || err);
      process.exit(1);
    });
}
