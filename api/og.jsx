// Dynamic Open Graph image (1200×630 PNG) generated at the edge with @vercel/og.
// Shows the live current ISO-8601 week number, so every share/preview reflects
// "which week is it now" — the site's whole purpose. Replaces the old static
// SVG (which social platforms don't render as a preview at all).
//
// This is a Vercel Edge Function (not part of the Vite build). It lives in
// /api, so the site is reachable at /api/og. The SPA-fallback rewrite in
// vercel.json excludes /api/ so this isn't swallowed by index.html.
import { ImageResponse } from "@vercel/og";

export const config = { runtime: "edge" };

// ISO 8601 week number. The edge runtime's clock is UTC; a few hours' skew
// right at the Monday 00:00 boundary is irrelevant for a preview image, so we
// compute purely in UTC and keep it dependency-free.
function isoWeekAndYear(now) {
  const d = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const dayNum = (d.getUTCDay() + 6) % 7; // Mon=0 … Sun=6
  d.setUTCDate(d.getUTCDate() - dayNum + 3); // Thursday of this week
  const isoYear = d.getUTCFullYear();
  const firstThursday = new Date(Date.UTC(isoYear, 0, 4));
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
  const week = 1 + Math.round((d - firstThursday) / 604800000);
  return { week, isoYear };
}

export default function handler(req) {
  let week, isoYear;
  try {
    ({ week, isoYear } = isoWeekAndYear(new Date()));
  } catch {
    week = null;
  }

  // Optional override: /api/og?w=31&y=2026 lets a specific week page ship its
  // own card without changing this file. Falls back to the live current week.
  try {
    const url = new URL(req.url);
    const w = parseInt(url.searchParams.get("w"), 10);
    const y = parseInt(url.searchParams.get("y"), 10);
    if (w >= 1 && w <= 53) week = w;
    if (y >= 1970 && y <= 2100) isoYear = y;
  } catch {
    // ignore malformed query
  }

  const heading = week ? `Viikko ${week}` : "Viikkonumero";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "90px 96px",
          background: "linear-gradient(135deg, #15211f 0%, #0f2a21 55%, #16130f 100%)",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 34,
            letterSpacing: 6,
            color: "#bbf7d0",
          }}
        >
          VIIKKONRO.FI
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", marginTop: 26 }}>
          <span style={{ fontSize: 156, fontWeight: 800, lineHeight: 1 }}>
            {heading}
          </span>
          {week && isoYear ? (
            <span
              style={{
                fontSize: 56,
                color: "#e0a23b",
                marginLeft: 28,
                marginBottom: 22,
              }}
            >
              / {isoYear}
            </span>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            width: 240,
            height: 12,
            marginTop: 36,
            background: "#8900ff",
            borderRadius: 8,
          }}
        />

        <div
          style={{
            display: "flex",
            marginTop: 42,
            fontSize: 54,
            color: "#e7eceb",
          }}
        >
          Mikä viikko nyt on?
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 18,
            fontSize: 30,
            color: "#8aa39b",
          }}
        >
          Ilmainen viikkonumerolaskuri · ISO 8601
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      // Cache at the CDN for a day; the week only changes weekly, and a stale
      // image for a few minutes after a rollover is harmless for previews.
      headers: {
        "cache-control": "public, max-age=3600, s-maxage=86400",
      },
    },
  );
}
