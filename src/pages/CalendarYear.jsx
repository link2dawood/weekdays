import React from "react";
import { Link } from "react-router-dom";
import { isoWeek, isoYear, M_FULL, weeksInIsoYear } from "../components/dateUtils";
import { getJuhlapaivat, getLiputuspaivat } from "../data/juhlapaivat";
import nimipaivat from "../data/nimipaivat.json";
import SEO from "../components/SEO";
import { canonicalFor, calendarMeta } from "../data/seo";

const YEAR_MIN = 2020;
// Rolling horizon: current year + 9 (≈2035 today), so the year pills and
// cross-links auto-advance every rebuild instead of freezing. Any /kalenteri-{y}
// still renders client-side via the dispatcher even outside this range.
const YEAR_MAX = new Date().getFullYear() + 9;
// getDay()-indexed Finnish weekday initials (Su, Mo, Tu, We, Th, Fr, Sa).
const WD_INITIAL = ["S", "M", "T", "K", "T", "P", "L"];

function pad(n) {
  return n < 10 ? "0" + n : "" + n;
}

// Print + print-preview CSS, scoped to calendar pages by living in a <style>
// this component renders — so @page / @media print here never affect
// /tulosta-{y} or any other route. Screen base styles are global (App.css).
const CAL_PRINT_CSS = `
.cal-print .breadcrumb,.cal-print .pills,.cal-print .cal-nimi,.cal-print .noprint,.cal-print .cal-seealso{display:none!important}
body:has(.cal-print) header,body:has(.cal-print) footer{display:none!important}
.cal-print h1{font-size:20px;white-space:nowrap;margin:4px 0 8px}
.cal-print .cal-grid,.cal-print .cal-grid-half{grid-template-columns:repeat(6,1fr);gap:6px}
.cal-print .cal-month{background:#fff;border-color:#999;padding:6px}
.cal-print .cal-day{background:none!important}
.cal-print .cal-day.sun,.cal-print .cal-day.hol{border-top:1px solid #000;border-bottom:1px solid #000}
.cal-print .cal-day.today{background:none!important;text-decoration:underline;font-weight:700}
.cal-print .cal-wk{background:#fff;color:#000;border:1px solid #000}
@page{size:A4 landscape;margin:8mm}
@media print{
  header,footer,.breadcrumb,.pills,.cal-nimi,.noprint,.cal-seealso{display:none!important}
  h1{font-size:16px;white-space:nowrap}
  .cal-grid,.cal-grid-half{grid-template-columns:repeat(6,1fr)!important;gap:4px}
  .cal-month{background:#fff;border-color:#999;break-inside:avoid;padding:5px}
  .cal-day{background:none!important;font-size:9px}
  .cal-day.sun,.cal-day.hol{border-top:1px solid #000;border-bottom:1px solid #000}
  .cal-day.today{background:none!important;text-decoration:underline;font-weight:700}
  .cal-wk{background:#fff!important;color:#000!important;border:1px solid #000}
}`;

const CalendarYear = ({ year, half = null, print = false } = {}) => {
  const y = Number(year);
  const juhla = getJuhlapaivat(y);
  const liputus = getLiputuspaivat(y);
  const totalWeeks = weeksInIsoYear(y);

  // "Today" in Europe/Helsinki. Server-rendered at build (the same current-date
  // pattern Home.jsx uses); the daily rebuild keeps it fresh and hydration
  // reconciles it to the viewer's day. Highlight only applies in the current year.
  const todayISO = new Date().toLocaleDateString("en-CA", {
    timeZone: "Europe/Helsinki",
  });
  const currentYear = Number(todayISO.slice(0, 4));
  const isCurrentYear = y === currentYear;

  const monthStart = half === 2 ? 6 : 0;
  const monthEnd = half === 1 ? 6 : 12; // exclusive
  const months = [];
  for (let m = monthStart; m < monthEnd; m++) months.push(m);

  const todayNames = isCurrentYear
    ? (nimipaivat[todayISO.slice(5)] || []).filter(
        (n) => n && !/^[A-Z]{2,}-\d/.test(n),
      )
    : [];

  const years = [];
  for (let yy = YEAR_MIN; yy <= YEAR_MAX; yy++) years.push(yy);

  const halfLabel =
    half === 1 ? ", 1. vuosipuolisko" : half === 2 ? ", 2. vuosipuolisko" : "";
  const canonicalPath = half
    ? `/kalenteri-${y}-${half}`
    : print
      ? `/tulostettava-kalenteri-${y}`
      : `/kalenteri-${y}`;

  const buildMonth = (m) => {
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const rows = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(y, m, d);
      const dow = date.getDay();
      const mmdd = `${pad(m + 1)}-${pad(d)}`;
      const holiday = juhla.get(mmdd);
      const flag = liputus.get(mmdd);
      const isMon = dow === 1;
      const isToday = `${y}-${mmdd}` === todayISO;
      const cls = ["cal-day"];
      if (dow === 0) cls.push("sun");
      if (dow === 6) cls.push("sat");
      if (holiday) cls.push("hol");
      if (isToday) cls.push("today");
      rows.push(
        <div
          key={d}
          className={cls.join(" ")}
          {...(isToday ? { "aria-current": "date" } : {})}
        >
          <span className="cal-wi">{WD_INITIAL[dow]}</span>
          <span className="cal-dn">{d}</span>
          {isMon && (
            <Link className="cal-wk" to={`/viikko-${isoWeek(date)}-${isoYear(date)}`}>
              vk {isoWeek(date)}
            </Link>
          )}
          {holiday && (
            <span className="cal-hol" title={holiday}>
              {holiday}
            </span>
          )}
          {flag && (
            <span className="cal-flag" title={flag} role="img" aria-label={flag}>
              🇫🇮
            </span>
          )}
        </div>,
      );
    }
    return (
      <div key={m} className="cal-month">
        <Link className="cal-month-h" to={`/kuukausi-${m + 1}-${y}`}>
          {M_FULL[m]} {y}
        </Link>
        <div className="cal-days">{rows}</div>
      </div>
    );
  };

  return (
    <section className={`app cal-page${print ? " cal-print" : ""}`}>
      <SEO {...calendarMeta(y, half, print)} canonical={canonicalFor(canonicalPath)} />
      <style dangerouslySetInnerHTML={{ __html: CAL_PRINT_CSS }} />

      <div className="breadcrumb">
        <Link to="/">Etusivu</Link> /{" "}
        <Link to={`/kalenteri-${currentYear}`}>Kalenteri</Link> / {y}
        {halfLabel}
      </div>

      <h1>Vuoden {y} kalenteri{halfLabel}</h1>

      <p className="lead">
        Vuosi {y} sisältää {totalWeeks} viikkoa. Kalenteri noudattaa ISO 8601
        -standardia: viikko alkaa maanantaista ja päättyy sunnuntaihin.
        Juhlapäivät ja viikkonumerot on merkitty.
        {isCurrentYear ? " Tämän päivän kohta on korostettu." : ""}
      </p>

      <div className="pills">
        {years.map((yy) => (
          <Link
            key={yy}
            to={`/kalenteri-${yy}`}
            className={`pill ${yy === y ? "active" : ""}`}
          >
            {yy}
          </Link>
        ))}
      </div>

      <div className="pills cal-halves">
        <Link to={`/kalenteri-${y}`} className={`pill ${!half ? "active" : ""}`}>
          Koko vuosi
        </Link>
        <Link
          to={`/kalenteri-${y}-1`}
          className={`pill ${half === 1 ? "active" : ""}`}
        >
          1. vuosipuolisko (tammi–kesäkuu)
        </Link>
        <Link
          to={`/kalenteri-${y}-2`}
          className={`pill ${half === 2 ? "active" : ""}`}
        >
          2. vuosipuolisko (heinä–joulukuu)
        </Link>
      </div>

      <div className={`cal-grid${half ? " cal-grid-half" : ""}`}>
        {months.map(buildMonth)}
      </div>

      {todayNames.length > 0 && (
        <p className="cal-nimi">
          Tänään on nimipäivä: <strong>{todayNames.join(", ")}</strong>
        </p>
      )}

      <p className="noprint">
        <button className="btn" onClick={() => window.print()}>
          Tulosta / tallenna PDF
        </button>
      </p>

      <div className="cal-seealso">
        <h2 id="mh">Katso myös</h2>
        <ul className="clean">
          <li>
            <Link to={`/vuosi-${y}`}>Kaikki viikot vuonna {y}</Link>
          </li>
          <li>
            <Link to={`/tulosta-${y}`}>Tulostettava viikkolista {y}</Link>
          </li>
          <li>
            <Link to={`/tulostettava-kalenteri-${y}`}>
              Tulostettava kalenteri A4 ({y})
            </Link>
          </li>
          {y - 1 >= YEAR_MIN && (
            <li>
              <Link to={`/kalenteri-${y - 1}`}>Vuoden {y - 1} kalenteri</Link>
            </li>
          )}
          {y + 1 <= YEAR_MAX && (
            <li>
              <Link to={`/kalenteri-${y + 1}`}>Vuoden {y + 1} kalenteri</Link>
            </li>
          )}
          {!half && (
            <li>
              <Link to={`/kalenteri-${y}-1`}>1. vuosipuolisko</Link> ·{" "}
              <Link to={`/kalenteri-${y}-2`}>2. vuosipuolisko</Link>
            </li>
          )}
        </ul>
      </div>
    </section>
  );
};

export default CalendarYear;
