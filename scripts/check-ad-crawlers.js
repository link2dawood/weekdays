import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const siteUrl = (process.env.SITE_URL || "https://viikkonro.fi").replace(
  /\/$/,
  "",
);

const crawlers = [
  "Mediapartners-Google",
  "Google-Display-Ads-Bot",
  "AdsBot-Google",
];

function parseRobots(source) {
  const groups = [];
  let agents = [];
  let rules = [];

  const commit = () => {
    if (agents.length) groups.push({ agents, rules });
    agents = [];
    rules = [];
  };

  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) continue;

    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const field = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();

    if (field === "user-agent") {
      if (rules.length) commit();
      agents.push(value.toLowerCase());
    } else if (field === "allow" || field === "disallow") {
      if (agents.length) rules.push({ field, value });
    }
  }
  commit();
  return groups;
}

function robotsAllowsRoot(source, crawler) {
  const groups = parseRobots(source);
  const crawlerName = crawler.toLowerCase();
  const specific = groups.filter(({ agents }) =>
    agents.some((agent) => crawlerName.startsWith(agent)),
  );
  const matching = specific.length
    ? specific
    : groups.filter(({ agents }) => agents.includes("*"));
  const applicable = matching
    .flatMap(({ rules }) => rules)
    .filter(({ value }) => value && "/".startsWith(value));

  if (!applicable.length) return true;
  const longest = Math.max(...applicable.map(({ value }) => value.length));
  return applicable.some(
    ({ field, value }) => value.length === longest && field === "allow",
  );
}

async function fetchText(url, userAgent) {
  const response = await fetch(url, {
    headers: { "user-agent": userAgent },
    redirect: "follow",
  });
  return {
    body: await response.text(),
    contentType: response.headers.get("content-type") || "",
    status: response.status,
    url: response.url,
  };
}

const failures = [];
const robots = await fetchText(`${siteUrl}/robots.txt`, crawlers[0]);
if (robots.status !== 200) {
  failures.push(`/robots.txt returned HTTP ${robots.status}`);
} else {
  for (const crawler of crawlers) {
    if (!robotsAllowsRoot(robots.body, crawler)) {
      failures.push(`/robots.txt blocks ${crawler} from /`);
    }
  }
}

for (const crawler of crawlers) {
  const homepage = await fetchText(`${siteUrl}/`, crawler);
  const hasRealPage =
    homepage.body.includes('id="weekNow"') &&
    homepage.body.includes("<title>");
  if (homepage.status !== 200 || !hasRealPage) {
    failures.push(
      `${crawler} received HTTP ${homepage.status} without the complete homepage`,
    );
  } else {
    console.log(`${crawler}: HTTP 200, complete homepage`);
  }
}

// ads.txt is deliberately optional until AdSense issues the account-specific
// publisher line. Once public/ads.txt is committed, this monitor automatically
// requires the identical file to be reachable over HTTPS and via HTTP→HTTPS.
const localAdsPath = path.join(root, "public/ads.txt");
if (fs.existsSync(localAdsPath)) {
  const expected = fs.readFileSync(localAdsPath, "utf8").trim();
  const googleSellerLine = expected
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) =>
      /^google\.com,\s*pub-\d{16},\s*(?:DIRECT|RESELLER)(?:,\s*[a-z0-9]+)?$/i.test(
        line,
      ),
    );

  if (!googleSellerLine) {
    failures.push("public/ads.txt has no valid Google pub-<16 digits> seller line");
  }

  for (const url of [
    `${siteUrl}/ads.txt`,
    `${siteUrl.replace(/^https:/, "http:")}/ads.txt`,
  ]) {
    const liveAds = await fetchText(url, "Google-Display-Ads-Bot");
    if (liveAds.status !== 200) {
      failures.push(`${url} returned HTTP ${liveAds.status}`);
    } else if (liveAds.body.trim() !== expected) {
      failures.push(`${url} does not match public/ads.txt`);
    } else if (!liveAds.contentType.toLowerCase().startsWith("text/plain")) {
      failures.push(`${url} returned ${liveAds.contentType || "no Content-Type"}`);
    } else {
      console.log(`${url}: HTTP 200, content matches public/ads.txt`);
    }
  }
} else {
  console.warn(
    "ads.txt: pending account linkage; public/ads.txt is intentionally absent",
  );
}

if (failures.length) {
  for (const failure of failures) console.error(`FAIL: ${failure}`);
  process.exitCode = 1;
} else {
  console.log("Ad crawler reachability: OK");
}
