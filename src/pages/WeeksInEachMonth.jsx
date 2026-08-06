import React from "react";
import { Link, useParams } from "react-router-dom";
import {
  M_FULL,
  M_GENITIVE,
  M_INESSIVE,
  M_SLUG,
  fmtShortFi,
  isoWeek,
  isoYear,
  validateMonth,
  validateYear,
  PRERENDER_MIN_YEAR as YEAR_MIN,
  PRERENDER_MAX_YEAR as YEAR_MAX,
} from "../components/dateUtils";
import WeekCard from "../components/WeekCard";
import QuickFacts from "../components/QuickFacts";
import SEO from "../components/SEO";
import { canonicalFor, monthFaqs, monthMeta, monthStats } from "../data/seo";
import { flagDaysInYear } from "../data/flagDayPages";
import { schoolHolidayPeriodsInWeek } from "../data/schoolHolidayPages";
import NotFound from "./NotFound";

const WeeksInEachMonth = ({ month: pMonth, year: pYear } = {}) => {
  const params = useParams();

  const month = pMonth ?? params.month;
  const year = pYear ?? params.year;
  const y = Number(year);
  const m = Number(month);

  if (!validateYear(y) || !validateMonth(m)) return <NotFound />;

  var mi = m - 1;

  const getMonthWeeks = (y, mi) => {
    const dim = new Date(y, mi + 1, 0).getDate();

    const seen = {};
    const weeks = [];

    for (let dd = 1; dd <= dim; dd++) {
      const dt = new Date(y, mi, dd);

      const wy = isoYear(dt);
      const k = `${wy}-${isoWeek(dt)}`;

      if (seen[k]) continue;

      seen[k] = true;

      // A boundary week can belong to an adjacent ISO year; skip it if that
      // year is outside the prerendered range (e.g. Dec 2035 → week 1 2036),
      // so the grid never renders a WeekCard linking a page that 404s.
      if (wy < YEAR_MIN || wy > YEAR_MAX) continue;

      weeks.push({
        week: isoWeek(dt),
        year: wy,
      });
    }

    return weeks;
  };

  const weeks = getMonthWeeks(y, mi);
  // December/January pages frequently span an ISO year boundary (e.g.
  // December 2025 runs weeks 49-52/2025 then week 1/2026) — a bare
  // "{first}-{last}" range would misread as descending ("49-1") in that
  // case, so the years are only stated when they actually differ.
  const firstWeek = weeks[0];
  const lastWeek = weeks[weeks.length - 1];
  const weekRangeText =
    firstWeek.year === lastWeek.year
      ? `viikot ${firstWeek.week}–${lastWeek.week}`
      : `viikot ${firstWeek.week}/${firstWeek.year}–${lastWeek.week}/${lastWeek.year}`;
  // Genitive, capitalized, in "{genitive} viikot {year}" order ("Kesäkuun
  // viikot 2026") — matches how people actually search ("kesäkuun viikot",
  // "heinäkuun viikot 2026") as a literal contiguous phrase, and matches
  // monthMeta()'s title in seo.js, so the H1/lead and <title> never disagree.
  const genitiveCap = M_GENITIVE[mi].replace(/^./, (c) => c.toUpperCase());

  // Shared with prerender.js's monthFaqNodes()/CollectionPage so the visible
  // FAQ, the quick-facts list, and their schema equivalents all read from the
  // same computation — same discipline as calendarFaqs()/workingDaysFaqs().
  const faqs = monthFaqs(m, y);
  const stats = monthStats(y, m);
  const officialHolidayCount = stats.holidays.filter((h) => h.official).length;
  const monthFlagDays = flagDaysInYear(y).filter((d) => d.month === m);
  // STEP 6: only ever surfaces CONFIRMED school-holiday periods —
  // schoolHolidayPeriodsInWeek() already filters out estimated/unknown ones.
  const hasConfirmedSchoolHoliday = weeks.some(
    (w) => schoolHolidayPeriodsInWeek(w.year, w.week).length > 0,
  );

  var prevM = m - 1,
    prevY = y;
  if (prevM < 1) {
    prevM = 12;
    prevY = y - 1;
  }
  var nextM = m + 1,
    nextY = y;
  if (nextM > 12) {
    nextM = 1;
    nextY = y + 1;
  }

  return (
    <section className="app">
      <SEO
        {...monthMeta(m, y)}
        canonical={canonicalFor(`/kuukausi-${month}-${year}`)}
      />
      <div className="breadcrumb">
        <Link to={"/"}>Etusivu</Link> /{" "}
        <Link to={`/vuosi-${year}`}>Viikot {year}</Link> / {M_FULL[mi]}
      </div>
      <h1 id="mh">
        {genitiveCap} viikot {year}
      </h1>
      <p className="lead">
        <span className="answer-sentence">
          <strong>
            {M_FULL[mi]} {year} sisältää {weeks.length} viikkoa: {weekRangeText}.
          </strong>
        </span>{" "}
        Tässä kaikki {weeks.length} viikkoa, jotka kuuluvat {M_GENITIVE[mi]}{" "}
        {year} kalenteriin. Osa viikoista voi jatkua viereiseen kuukauteen.
      </p>

      <QuickFacts
        facts={[
          { label: "Kuukausi", value: M_FULL[mi] },
          { label: "Vuosi", value: year },
          { label: "Viikkoja", value: stats.weekCount },
          { label: "Työpäiviä", value: stats.working },
          { label: "Arkipyhiä", value: officialHolidayCount },
          { label: "Ensimmäinen päivä", value: fmtShortFi(stats.firstDay) },
          { label: "Viimeinen päivä", value: fmtShortFi(stats.lastDay) },
        ]}
      />

      {monthFlagDays.length > 0 && (
        <p className="note-soft">
          Liputuspäivät {M_INESSIVE[mi]} {year}:{" "}
          {monthFlagDays.map((d, i) => (
            <span key={d.slug}>
              {i > 0 && ", "}
              <Link to={`/liputuspaivat-${year}#${d.slug}`}>{d.name}</Link>
            </span>
          ))}
          .
        </p>
      )}

      <div className="grid">
        {weeks.map((w) => (
          <WeekCard key={`${w.year}-${w.week}`} w={w.week} y={w.year} />
        ))}
      </div>
      <div className="prevnext">
        {prevY >= YEAR_MIN && (
          <Link to={`/kuukausi-${prevM}-${prevY}`}>
            <span className="lbl">Edellinen</span>
            {M_FULL[prevM - 1]} {prevY}
          </Link>
        )}
        {nextY <= YEAR_MAX && (
          <Link className="nx" to={`/kuukausi-${nextM}-${nextY}`}>
            <span className="lbl">Seuraava</span>
            {M_FULL[nextM - 1]} {nextY}
          </Link>
        )}
      </div>

      <section className="prose">
        <h2>Usein kysytyt kysymykset</h2>
        {faqs.map((item, index) => (
          <details key={item.q} open={index === 0}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </section>

      <section className="related">
        <h2>Katso myös</h2>

        <h3>Kuukaudet {y}</h3>
        <div className="pills">
          {M_FULL.map((name, i) =>
            i + 1 === m ? null : (
              <Link
                key={i}
                className="pill"
                to={`/kuukausi-${i + 1}-${y}`}
                onClick={() => window.scrollTo(0, 0)}
              >
                {name}
              </Link>
            ),
          )}
        </div>

        <h3>Vuosi {y}</h3>
        <ul className="links">
          <li>
            <Link to={`/vuosi-${y}`} onClick={() => window.scrollTo(0, 0)}>
              Kaikki viikot vuonna {y}
            </Link>
          </li>
          <li>
            <Link to={`/kalenteri-${y}`} onClick={() => window.scrollTo(0, 0)}>
              Vuoden {y} kalenteri
            </Link>
          </li>
          <li>
            <Link to={`/pyhapaivat-${y}`} onClick={() => window.scrollTo(0, 0)}>
              Pyhäpäivät ja liputuspäivät {y}
            </Link>
          </li>
          <li>
            <Link to={`/tyopaivat-${y}`} onClick={() => window.scrollTo(0, 0)}>
              Työpäivät ja arkipäivät {y}
            </Link>
          </li>
          {/* STEP 6: Month Page → Confirmed School Holiday Pages, only when
              this month actually overlaps a CONFIRMED period. */}
          {hasConfirmedSchoolHoliday && (
            <li>
              <Link to={`/koululomat-${y}`} onClick={() => window.scrollTo(0, 0)}>
                Koululomat {y} alueittain
              </Link>
            </li>
          )}
          <li>
            <Link
              to={`/tyopaivat-${M_SLUG[mi]}-${y}`}
              onClick={() => window.scrollTo(0, 0)}
            >
              Työpäivät {M_INESSIVE[mi]} {y}
            </Link>
          </li>
          <li>
            <Link
              to={`/q${Math.ceil(m / 3)}-${y}`}
              onClick={() => window.scrollTo(0, 0)}
            >
              Q{Math.ceil(m / 3)} {y}
            </Link>
          </li>
          <li>
            <Link to={`/tulosta-${y}`} onClick={() => window.scrollTo(0, 0)}>
              Tulostettava viikkolista {y}
            </Link>
          </li>
        </ul>
      </section>
    </section>
  );
};

export default WeeksInEachMonth;
