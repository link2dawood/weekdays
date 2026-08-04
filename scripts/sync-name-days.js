import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const API_URL =
  "https://nimipaivarajapinta.fi/api/typesense/collections/namedays/documents/search";
const SOURCE_URL =
  "https://almanakka.helsinki.fi/fi/nimipaivat/nimipaivarajapinta";
const TOKEN = process.env.NIMIPAIVA_API_TOKEN;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataPath = path.join(root, "src/data/nimipaivat.json");
const metaPath = path.join(root, "src/data/nimipaivat.meta.json");

if (!TOKEN?.startsWith("ndt_")) {
  throw new Error(
    "Set NIMIPAIVA_API_TOKEN to the server-side token supplied by Yliopiston almanakkatoimisto.",
  );
}

const records = [];
const perPage = 100;
for (let page = 1; ; page += 1) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: "*",
      query_by: "name",
      filter_by: "type:=suomi",
      sort_by: "month:asc,day:asc,name:asc",
      page,
      per_page: perPage,
    }),
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    throw new Error(`Name-day API returned ${response.status}: ${detail}`);
  }

  const result = await response.json();
  const hits = Array.isArray(result.hits) ? result.hits : [];
  records.push(...hits.map((hit) => hit.document));
  if (hits.length < perPage || records.length >= Number(result.found ?? 0)) break;
}

if (records.length < 500) {
  throw new Error(
    `Refusing to replace the snapshot: API returned only ${records.length} Finnish names.`,
  );
}

const calendar = {};
for (const record of records) {
  const month = Number(record.month);
  const day = Number(record.day);
  const name = String(record.name ?? "").trim();
  const validDate = new Date(2024, month - 1, day);
  if (
    !name ||
    record.type !== "suomi" ||
    validDate.getMonth() !== month - 1 ||
    validDate.getDate() !== day
  ) {
    throw new Error(`Invalid Finnish name-day record: ${JSON.stringify(record)}`);
  }
  const key = `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  calendar[key] ??= [];
  if (!calendar[key].includes(name)) calendar[key].push(name);
}

const ordered = Object.fromEntries(
  Object.entries(calendar)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, names]) => [key, names.sort((a, b) => a.localeCompare(b, "fi"))]),
);
const syncedAt = new Date().toISOString();
const metadata = {
  language: "fi",
  source: "Yliopiston almanakkatoimiston nimipäivä- ja kalenterirajapinta",
  sourceUrl: SOURCE_URL,
  syncedAt,
  complete: true,
  attributionRequired: true,
  attribution: "Kalenteri- ja nimipäivätiedot tarjoaa Yliopiston almanakkatoimisto.",
};

await Promise.all([
  fs.writeFile(dataPath, `${JSON.stringify(ordered, null, 2)}\n`, "utf8"),
  fs.writeFile(metaPath, `${JSON.stringify(metadata, null, 2)}\n`, "utf8"),
]);

console.log(
  `Synced ${records.length} Finnish names across ${Object.keys(ordered).length} calendar dates (${syncedAt}).`,
);
