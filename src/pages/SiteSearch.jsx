import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  isoWeek,
  isoYear,
  weeksInIsoYear,
  M_SHORT,
  PRERENDER_MIN_YEAR,
  PRERENDER_MAX_YEAR,
} from "../components/dateUtils";
import SEO from "../components/SEO";
import { canonicalFor } from "../data/seo";

// Interprets a free-text query the way someone would actually type it, and
// resolves it to the single most relevant page. This is the real on-site
// search endpoint that index.html's WebSite/SearchAction structured data
// points at (Google's sitelinks searchbox) — the markup is only honest if a
// query typed here actually lands somewhere useful, so every recognized
// shape below maps to a real, already-prerendered page.
function resolveQuery(raw) {
  const q = raw.trim().toLowerCase();
  if (!q) return null;

  // Explicit date: "24.7.2026", "24.7.26", "24.7." (implied current year).
  let m = q.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})?$/);
  if (m) {
    const day = +m[1];
    const month = +m[2];
    let year = m[3] ? +m[3] : new Date().getFullYear();
    if (year < 100) year += 2000;
    const d = new Date(year, month - 1, day);
    if (d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day) {
      return `/viikko-${isoWeek(d)}-${isoYear(d)}`;
    }
  }

  // ISO date: "2026-07-24".
  m = q.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) {
    const d = new Date(+m[1], +m[2] - 1, +m[3]);
    if (d.getMonth() === +m[2] - 1 && d.getDate() === +m[3]) {
      return `/viikko-${isoWeek(d)}-${isoYear(d)}`;
    }
  }

  // Week number: "viikko 30", "vk 30", "viikko 30 2026", "viikko 30/2026".
  m = q.match(/^(?:viikko|vk)\s*(\d{1,2})\s*(?:[/\-\s]\s*(\d{4}))?$/);
  if (m) {
    const week = +m[1];
    const year = m[2] ? +m[2] : isoYear(new Date());
    if (week >= 1 && week <= weeksInIsoYear(year)) {
      return `/viikko-${week}-${year}`;
    }
  }

  // Bare "30/2026" or "30-2026" (week/year without the word "viikko").
  m = q.match(/^(\d{1,2})\s*[/-]\s*(\d{4})$/);
  if (m) {
    const week = +m[1];
    const year = +m[2];
    if (week >= 1 && week <= weeksInIsoYear(year)) {
      return `/viikko-${week}-${year}`;
    }
  }

  // Month name + optional year: "heinäkuu 2026", "heinäkuussa 2026".
  for (let i = 0; i < M_SHORT.length; i++) {
    if (q.includes(M_SHORT[i])) {
      const ym = q.match(/(\d{4})/);
      const year = ym ? +ym[1] : isoYear(new Date());
      if (year >= PRERENDER_MIN_YEAR && year <= PRERENDER_MAX_YEAR) {
        return `/kuukausi-${i + 1}-${year}`;
      }
    }
  }

  // Bare year: "2026".
  m = q.match(/^(\d{4})$/);
  if (m) {
    const year = +m[1];
    if (year >= PRERENDER_MIN_YEAR && year <= PRERENDER_MAX_YEAR) {
      return `/vuosi-${year}`;
    }
  }

  return null;
}

const SiteSearch = () => {
  const navigate = useNavigate();
  // Start empty so the prerendered HTML (built with no query string) and the
  // first client render match exactly — hydration-safe, same pattern as
  // WeeklySearch/DateToWeek. The real query is only read after mount,
  // client-side; reading it during render instead (e.g. via
  // useSearchParams()) would make the very first client render diverge from
  // the query-less server markup and throw a hydration mismatch.
  const [q, setQ] = useState("");

  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("q") || "";
    setQ(raw);
    const target = resolveQuery(raw);
    if (target) navigate(target, { replace: true });
  }, [navigate]);

  return (
    <section className="app">
      {/* noindex: this is a query-resolution endpoint, not content of its
          own — every real result redirects to an already-indexed page. */}
      <SEO title="Haku | Viikko Nro" robots="noindex, follow" canonical={canonicalFor("/haku")} />
      <div className="breadcrumb">
        <Link to="/">Etusivu</Link> / Haku
      </div>
      <h1>Ei tuloksia{q ? ` haulle "${q}"` : ""}</h1>
      <p>
        Kokeile esimerkiksi päivämäärää (<strong>24.7.2026</strong>), viikkoa
        (<strong>viikko 30 2026</strong>) tai vuotta (<strong>2026</strong>).
        Voit myös selata <Link to={`/vuosi-${isoYear(new Date())}`}>kuluvaa vuotta</Link>{" "}
        tai lukea <Link to="/mika-on-viikkonumero">mikä on viikkonumero</Link>.
      </p>
    </section>
  );
};

export default SiteSearch;
