import React from "react";
import { Link, useParams } from "react-router-dom";
import SEO from "../components/SEO";
import { canonicalFor, workingDaysMeta } from "../data/seo";
import { holidaysInYear } from "../data/holidays";

const M_FULL = [
  "Tammikuu",
  "Helmikuu",
  "Maaliskuu",
  "Huhtikuu",
  "Toukokuu",
  "Kesäkuu",
  "Heinäkuu",
  "Elokuu",
  "Syyskuu",
  "Lokakuu",
  "Marraskuu",
  "Joulukuu",
];

// Working-days hub for a year (/tyopaivat-2026). Targets "montako työpäivää
// vuonna <y>" and payroll/HR queries — commercial intent, and neither
// competitor covers it. A työpäivä here is Mon–Fri that is not an official
// public holiday (arkipyhä). Purely a function of the year, so SSR and client
// hydration produce identical output.
const WorkingDays = ({ year: pYear } = {}) => {
  const params = useParams();
  const year = pYear ?? params.year;
  const y = Number(year);

  const officialSet = new Set(
    holidaysInYear(y)
      .filter((h) => h.official)
      .map((h) => h.date.toDateString()),
  );

  const months = Array.from({ length: 12 }, () => ({
    working: 0,
    weekend: 0,
    holiday: 0,
  }));
  let totalWorking = 0;
  let totalWeekend = 0;
  let totalHoliday = 0;

  const d = new Date(y, 0, 1);
  while (d.getFullYear() === y) {
    const mi = d.getMonth();
    const dow = d.getDay();
    if (dow === 0 || dow === 6) {
      months[mi].weekend += 1;
      totalWeekend += 1;
    } else if (officialSet.has(d.toDateString())) {
      months[mi].holiday += 1;
      totalHoliday += 1;
    } else {
      months[mi].working += 1;
      totalWorking += 1;
    }
    d.setDate(d.getDate() + 1);
  }

  return (
    <section className="app">
      <SEO {...workingDaysMeta(y)} canonical={canonicalFor(`/tyopaivat-${year}`)} />
      <div className="breadcrumb">
        <Link to="/">Etusivu</Link> /{" "}
        <Link to={`/vuosi-${year}`}>Viikot {year}</Link> / Työpäivät {year}
      </div>

      <h1>Työpäivät {year}</h1>

      <p className="lead">
        Vuonna {year} on <strong>{totalWorking} työpäivää</strong>. Työpäivä
        tarkoittaa maanantaista perjantaihin osuvaa päivää, joka ei ole
        virallinen arkipyhä.
      </p>

      <div className="stat-row">
        <div className="stat-box">
          <div className="n">{totalWorking}</div>
          <div className="l">Työpäivää</div>
        </div>
        <div className="stat-box">
          <div className="n">{totalWeekend}</div>
          <div className="l">Viikonlopun päivää</div>
        </div>
        <div className="stat-box">
          <div className="n">{totalHoliday}</div>
          <div className="l">Arkipyhää (ma–pe)</div>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Kuukausi</th>
              <th className="num">Työpäivät</th>
              <th className="num">Viikonloput</th>
              <th className="num">Arkipyhät</th>
            </tr>
          </thead>
          <tbody>
            {months.map((mo, i) => (
              <tr key={i}>
                <td>
                  <Link to={`/kuukausi-${i + 1}-${year}`}>{M_FULL[i]}</Link>
                </td>
                <td className="num">{mo.working}</td>
                <td className="num">{mo.weekend}</td>
                <td className="num">{mo.holiday}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="note-soft">
        Laskutapa: työpäiviksi lasketaan maanantai–perjantai, joista on
        vähennetty viralliset arkipyhät. Jouluaatto ja juhannusaatto ovat monilla
        työpaikoilla vapaita, mutta eivät ole virallisia arkipyhiä, joten ne
        sisältyvät yllä työpäiviin.
      </p>

      <p>
        Katso myös <Link to={`/pyhapaivat-${year}`}>pyhäpäivät {year}</Link>,{" "}
        <Link to={`/vuosi-${year}`}>vuoden {year} viikkonumerot</Link> ja{" "}
        <Link to={`/tulosta-${year}`}>tulostettava kalenteri</Link>.
      </p>

      <div className="prevnext">
        <Link to={`/tyopaivat-${y - 1}`}>
          <span className="lbl">Edellinen</span>Työpäivät {y - 1}
        </Link>
        <Link className="nx" to={`/tyopaivat-${y + 1}`}>
          <span className="lbl">Seuraava</span>Työpäivät {y + 1}
        </Link>
      </div>
    </section>
  );
};

export default WorkingDays;
