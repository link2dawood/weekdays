import React from "react";
import { Link } from "react-router-dom";
import { isoWeek, isoYear, mondayOf } from "../../components/dateUtils";
import { svDate } from "../../i18n/sv";
import SEO from "../../components/SEO";
import { canonicalFor, svHomeMeta } from "../../data/seo";

// Swedish landing. The current week is computed in the render body (like the
// Finnish Home) so it ships in the prerendered HTML; the daily rebuild keeps it
// fresh.
const SvHome = () => {
  const now = new Date();
  const w = isoWeek(now);
  const y = isoYear(now);
  const mo = mondayOf(w, y);
  const su = new Date(mo);
  su.setDate(mo.getDate() + 6);

  return (
    <section className="app">
      <SEO {...svHomeMeta(now)} canonical={canonicalFor("/sv")} />
      <h1>Vecka {w}</h1>
      <p className="lead">
        Just nu är det <strong>vecka {w}</strong> år {y}. Veckan börjar måndag{" "}
        {svDate(mo)} och slutar söndag {svDate(su)}. Veckonummer enligt ISO 8601
        (veckan börjar på måndag).
      </p>
      <p>
        <Link className="btn" to={`/sv/vecka-${w}-${y}`}>
          Öppna vecka {w}
        </Link>
      </p>
      <p>
        Bläddra: <Link to={`/sv/veckor-${y}`}>alla veckor {y}</Link> ·{" "}
        <Link to={`/sv/helgdagar-${y}`}>röda dagar {y}</Link>. På finska:{" "}
        <Link to="/">viikkonro.fi</Link>.
      </p>
    </section>
  );
};

export default SvHome;
