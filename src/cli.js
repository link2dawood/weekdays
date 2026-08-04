#!/usr/bin/env node
// Shared CLI for Search Console tasks: `check` (F-07 — verifies the service
// account actually has Full access to the domain property) and
// `submit-sitemap` (F-08 — submits sitemap.xml after a deploy).
//
// Plain Node, not part of the Vite app bundle (nothing here is imported by
// src/main.jsx or src/entry-server.jsx), so it can use Node-only packages
// like google-auth-library without affecting the client bundle.
//
// Auth: a GCP service-account JSON key, provided as GOOGLE_APPLICATION_CREDENTIALS_JSON
// (the raw JSON string — the standard way to pass a service-account key through a CI
// secret without writing a file to disk). Falls back to GOOGLE_APPLICATION_CREDENTIALS
// (a file path) for local use, via google-auth-library's own default resolution.

import { GoogleAuth } from "google-auth-library";
import { SITE_URL } from "./data/seo.js";

const SITE_PROPERTY = `sc-domain:${new URL(SITE_URL).hostname}`;
// webmasters (not the newer searchconsole API) is what still exposes the
// sites.get permission check and sitemap submission used here.
const SCOPES = ["https://www.googleapis.com/auth/webmasters"];
const FULL_ACCESS_LEVELS = new Set(["siteOwner", "siteFullUser"]);

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

async function getClient() {
  const auth = new GoogleAuth({ ...credentialsFromEnv(), scopes: SCOPES });
  return auth.getClient();
}

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

async function inspect() {
  const year = new Date().getFullYear();
  const requested = process.argv.slice(3);
  const paths = requested.length
    ? requested
    : [
        "/",
        "/ukk",
        `/kalenteri-${year}`,
        `/vuosi-${year}`,
        "/mika-on-viikkonumero",
        "/en",
      ];
  const client = await getClient();

  for (const pathOrUrl of paths) {
    const inspectionUrl = new URL(pathOrUrl, SITE_URL);
    if (inspectionUrl.origin !== new URL(SITE_URL).origin) {
      throw new Error(`Refusing to inspect an URL outside ${SITE_URL}: ${inspectionUrl}`);
    }

    const res = await client.request({
      url: "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
      method: "POST",
      data: {
        inspectionUrl: inspectionUrl.href,
        siteUrl: SITE_PROPERTY,
        languageCode: "fi-FI",
      },
    });
    const status = res.data.inspectionResult?.indexStatusResult ?? {};

    console.log(`\n${inspectionUrl.href}`);
    console.log(`  Verdict:          ${status.verdict ?? "UNKNOWN"}`);
    console.log(`  Coverage:         ${status.coverageState ?? "Unavailable"}`);
    console.log(`  Indexing:         ${status.indexingState ?? "Unavailable"}`);
    console.log(`  Fetch:            ${status.pageFetchState ?? "Unavailable"}`);
    console.log(`  Robots:           ${status.robotsTxtState ?? "Unavailable"}`);
    console.log(`  Last crawl:       ${status.lastCrawlTime ?? "Never/unknown"}`);
    console.log(`  Declared canon.:  ${status.userCanonical ?? "Unavailable"}`);
    console.log(`  Google canon.:    ${status.googleCanonical ?? "Unavailable"}`);
    console.log(`  Known sitemaps:   ${(status.sitemap ?? []).join(", ") || "None reported"}`);
  }
}

const commands = { check, inspect, "submit-sitemap": submitSitemap };
const [, , commandName] = process.argv;
const run = commands[commandName];

if (!run) {
  console.error(`Usage: node src/cli.js <${Object.keys(commands).join("|")}>`);
  process.exit(1);
}

run().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
