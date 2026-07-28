// Shared Search Console helpers: auth, URL->template classification, and the
// "final" date-range logic. Reused by src/cli.js's `check`/`submit-sitemap`
// (F-07/F-08) and `templates`/`coverage`/`weekly-report` (G-03) — and meant
// to be reused again by G-04's index-coverage sampling once that's built, so
// every consumer agrees on what a "template" is and what counts as settled
// data, instead of each feature inventing its own.

import { GoogleAuth } from "google-auth-library";
import { SITE_URL } from "../data/seo.js";

export const SITE_PROPERTY = `sc-domain:${new URL(SITE_URL).hostname}`;

// webmasters (not the newer searchconsole API) is what exposes both the
// sites.get permission check (F-07) and searchAnalytics.query (G-03) under
// one scope.
export const WEBMASTERS_SCOPE = "https://www.googleapis.com/auth/webmasters";

function credentialsFromEnv() {
  const raw = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!raw) return {};
  try {
    return { credentials: JSON.parse(raw) };
  } catch {
    throw new Error(
      "GOOGLE_APPLICATION_CREDENTIALS_JSON is set but isn't valid JSON — paste the whole service-account key file contents verbatim.",
    );
  }
}

export async function getClient(scopes = [WEBMASTERS_SCOPE]) {
  const auth = new GoogleAuth({ ...credentialsFromEnv(), scopes });
  return auth.getClient();
}

// Search Console's Search Analytics data for the most recent ~2-3 days is
// provisional and can still change after the fact. dataState:'final' (passed
// in the query itself) restricts results to fully-processed rows, but the
// API will still happily return data for those recent, unsettled days if
// asked for them — this computes a window that ends 3 days before `today` so
// every day requested is safely past that settling period.
export function getFinalDateRange(today = new Date(), days = 7) {
  const end = new Date(today);
  end.setDate(end.getDate() - 3);
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));
  const iso = (d) => d.toISOString().slice(0, 10);
  return { startDate: iso(start), endDate: iso(end) };
}

// The window immediately before getFinalDateRange()'s, for week-over-week
// comparison — i.e. "last week" relative to the same `today`.
export function getPriorFinalDateRange(today = new Date(), days = 7) {
  const shifted = new Date(today);
  shifted.setDate(shifted.getDate() - days);
  return getFinalDateRange(shifted, days);
}

// Maps a Search Console "page" value (a full URL) to the template it
// belongs to, mirroring AppRoutes.jsx's route patterns. Order matters: more
// specific patterns must be checked before broader look-alikes (the
// tulostettava-kalenteri- print variant before the general kalenteri- one).
const TEMPLATE_RULES = [
  [/\/tulostettava-kalenteri-\d+$/, "calendar-print"],
  [/\/kalenteri-\d+(-[12])?$/, "calendar"],
  [/\/viikko-\d+-\d+$/, "week"],
  [/\/kuukausi-\d+-\d+$/, "month"],
  [/\/vuosi-\d+$/, "year"],
  [/\/tulosta-\d+$/, "print"],
  [/\/pyhapaivat-\d+$/, "holidays"],
  [/\/tyopaivat-\d+$/, "working-days"],
  [
    /\/(laskurit|paivamaara-viikoksi|viikko-paivamaaraksi|tyopaivalaskuri|paivien-erotus)$/,
    "calculators",
  ],
  [/\/upota-widgetti$/, "widget"],
  [/\/(mika-on-viikkonumero|kuinka-monta-viikkoa-vuodessa|ukk)$/, "explainer"],
  [/\/(tietoa-meista|ota-yhteytta|tietosuoja|kayttoehdot)$/, "info"],
  [/\/sv(\/.*)?$/, "swedish"],
  [/\/haku$/, "search"],
  [/^\/?$/, "home"],
];

export function templateFor(pageUrl) {
  let path;
  try {
    path = new URL(pageUrl).pathname;
  } catch {
    path = pageUrl;
  }
  for (const [pattern, name] of TEMPLATE_RULES) {
    if (pattern.test(path)) return name;
  }
  return "other";
}

// Sums Search Analytics rows ({ keys: [page], clicks, impressions, ... })
// by template. Returns a Map<template, totalClicks>.
export function clicksByTemplate(rows) {
  const totals = new Map();
  for (const row of rows) {
    const template = templateFor(row.keys[0]);
    totals.set(template, (totals.get(template) || 0) + row.clicks);
  }
  return totals;
}

function totalOf(map) {
  let sum = 0;
  for (const v of map.values()) sum += v;
  return sum;
}

// Compares this week's per-template click totals against last week's and
// flags any template whose CLICK SHARE — its slice of that week's total
// clicks, not its raw click count — dropped by more than `thresholdFraction`
// relative to its own prior share. Share (not raw clicks) is what isolates a
// template's own health from a site-wide traffic swing that would move every
// template's raw numbers together.
export function detectShareDrops(thisWeek, lastWeek, thresholdFraction = 0.2) {
  const thisTotal = totalOf(thisWeek);
  const lastTotal = totalOf(lastWeek);
  const templates = new Set([...thisWeek.keys(), ...lastWeek.keys()]);
  const drops = [];
  for (const t of templates) {
    const lastShare = lastTotal > 0 ? (lastWeek.get(t) || 0) / lastTotal : 0;
    if (lastShare <= 0) continue; // nothing to compare a drop against
    const thisShare = thisTotal > 0 ? (thisWeek.get(t) || 0) / thisTotal : 0;
    const relativeChange = (thisShare - lastShare) / lastShare;
    // Epsilon guards the boundary itself ("drops more than 20%" is an
    // alerting floor, so exactly -20% should still flag) against floating-
    // point noise — e.g. (0.4-0.5)/0.5 evaluates to -0.19999999999999996 in
    // IEEE 754, not exactly -0.2, which would otherwise dodge the threshold.
    if (relativeChange <= -thresholdFraction + 1e-9) {
      drops.push({ template: t, thisShare, lastShare, relativeChange });
    }
  }
  return drops.sort((a, b) => a.relativeChange - b.relativeChange);
}

export async function queryClicksByPage(client, startDate, endDate) {
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_PROPERTY)}/searchAnalytics/query`;
  const res = await client.request({
    url,
    method: "POST",
    data: {
      startDate,
      endDate,
      dimensions: ["page"],
      dataState: "final",
      rowLimit: 25000,
    },
  });
  return res.data.rows || [];
}
