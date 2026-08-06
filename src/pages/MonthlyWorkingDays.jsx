import { Link, useParams } from "react-router-dom";
import {
  M_FULL,
  M_INESSIVE,
  M_SLUG,
  fmtShortFi,
  getWeekdayName,
  PRERENDER_MIN_YEAR as YEAR_MIN,
  PRERENDER_MAX_YEAR as YEAR_MAX,
} from "../components/dateUtils";
import SEO from "../components/SEO";
import QuickFacts from "../components/QuickFacts";
import {
  canonicalFor,
  monthlyWorkingDayFaqs,
  monthlyWorkingDaysMeta,
  monthStats,
} from "../data/seo";
import { holidayLinkPath } from "../data/holidayPages";

// Working-day hub for a single calendar month (/tyopaivat-kesakuu-2026) —
// targets "työpäivät kesäkuu 2026" / "montako työpäivää elokuussa 2026"
// queries, a distinct search intent from both /tyopaivat-<year> (whole year)
// and /kuukausi-<m>-<y> (week numbering for the month). Props come from the
// /:slug dispatcher; useParams is the fallback. Purely a function of
// month/year, so SSR and hydration produce identical output.
const MonthlyWorkingDays = ({ month: pMonth, year: pYear } = {}) => {
  const params = useParams();
  const month = pMonth ?? params.month;
  const year = pYear ?? params.year;
  const m = Number(month);
  const y = Number(year);
  const monthName = M_FULL[m - 1];
  const monthInessive = M_INESSIVE[m - 1];
  const monthInessiveCap = monthInessive.replace(/^./, (c) => c.toUpperCase());
  const slug = M_SLUG[m - 1];

  // Shared with prerender.js's monthlyWorkingDaysNodes() (FAQPage +
  // CollectionPage JSON-LD), and the same monthStats() computation
  // WeeksInEachMonth.jsx already uses, so the visible page, the FAQ and the
  // schema can never disagree on a day count.
  const stats = monthStats(y, m);
  const officialHolidays = stats.holidays.filter((h) => h.official);
  const faqs = monthlyWorkingDayFaqs(m, y);
  const daysInMonth = stats.lastDay.getDate();

  const officialHolidayByDay = new Map(
    officialHolidays.map((h) => [h.date.getDate(), h]),
  );

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const date = new Date(y, m - 1, day);
    const dow = date.getDay();
    const holiday = officialHolidayByDay.get(day);
    const status = holiday
      ? "Arkipyhä"
      : dow === 0 || dow === 6
        ? "Viikonloppu"
        : "Työpäivä";
    return { day, date, holiday, status };
  });

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
        {...monthlyWorkingDaysMeta(m, y)}
        canonical={canonicalFor(`/tyopaivat-${slug}-${year}`)}
      />
      <div className="breadcrumb">
        <Link to="/">Etusivu</Link> /{" "}
        <Link to={`/vuosi-${year}`}>Viikot {year}</Link> /{" "}
        <Link to={`/tyopaivat-${year}`}>Työpäivät {year}</Link> / {monthName}
      </div>

      <h1>
        Työpäivät {monthInessive} {year}
      </h1>

      <p className="lead">
        <span className="answer-sentence">
          {monthInessiveCap} {year} on{" "}
          <strong>{stats.working} työpäivää</strong>.
        </span>{" "}
        Työpäivä tarkoittaa maanantaista perjantaihin osuvaa päivää, joka ei
        ole virallinen arkipyhä.
      </p>

      <QuickFacts
        facts={[
          { label: "Kuukausi", value: monthName },
          { label: "Vuosi", value: year },
          { label: "Työpäiviä", value: stats.working },
          { label: "Viikonlopun päiviä", value: stats.weekend },
          { label: "Arkipyhiä", value: officialHolidays.length },
          { label: "Päiviä kuukaudessa", value: daysInMonth },
          { label: "Ensimmäinen päivä", value: fmtShortFi(stats.firstDay) },
          { label: "Viimeinen päivä", value: fmtShortFi(stats.lastDay) },
        ]}
      />

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Päivä</th>
              <th>Viikonpäivä</th>
              <th>Tila</th>
            </tr>
          </thead>
          <tbody>
            {days.map((d) => (
              <tr key={d.day}>
                <td>{fmtShortFi(d.date)}</td>
                <td>{getWeekdayName(d.date)}</td>
                <td>
                  {d.holiday ? (
                    (() => {
                      const path = holidayLinkPath(d.holiday.name, d.holiday.date);
                      return path ? (
                        <Link to={path}>{d.holiday.name}</Link>
                      ) : (
                        d.holiday.name
                      );
                    })()
                  ) : (
                    d.status
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
                to={`/tyopaivat-${M_SLUG[i]}-${y}`}
                onClick={() => window.scrollTo(0, 0)}
              >
                {name}
              </Link>
            ),
          )}
        </div>

        <ul className="links">
          <li>
            <Link to={`/kuukausi-${m}-${y}`} onClick={() => window.scrollTo(0, 0)}>
              {monthName} {y} viikkonumerot
            </Link>
          </li>
          <li>
            <Link to={`/tyopaivat-${y}`} onClick={() => window.scrollTo(0, 0)}>
              Työpäivät koko vuonna {y}
            </Link>
          </li>
          <li>
            <Link to={`/pyhapaivat-${y}`} onClick={() => window.scrollTo(0, 0)}>
              Pyhäpäivät ja liputuspäivät {y}
            </Link>
          </li>
          <li>
            <Link to={`/vuosi-${y}`} onClick={() => window.scrollTo(0, 0)}>
              Kaikki viikot vuonna {y}
            </Link>
          </li>
        </ul>
      </section>

      <div className="prevnext">
        {(prevY >= YEAR_MIN) && (
          <Link to={`/tyopaivat-${M_SLUG[prevM - 1]}-${prevY}`}>
            <span className="lbl">Edellinen</span>
            {M_FULL[prevM - 1]} {prevY}
          </Link>
        )}
        {(nextY <= YEAR_MAX) && (
          <Link className="nx" to={`/tyopaivat-${M_SLUG[nextM - 1]}-${nextY}`}>
            <span className="lbl">Seuraava</span>
            {M_FULL[nextM - 1]} {nextY}
          </Link>
        )}
      </div>
    </section>
  );
};

export default MonthlyWorkingDays;
