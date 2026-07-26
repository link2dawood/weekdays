import React from "react";
import { Link } from "react-router-dom";
import { mondayOf, weeksInIsoYear } from "../../components/dateUtils";
import { svDateShort } from "../../i18n/sv";
import SEO from "../../components/SEO";
import { canonicalFor, svYearMeta } from "../../data/seo";

const SvYear = ({ year } = {}) => {
  const y = Number(year);
  const total = weeksInIsoYear(y);
  const weeks = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <section className="app">
      <SEO {...svYearMeta(y)} canonical={canonicalFor(`/sv/veckor-${year}`)} />
      <div className="breadcrumb">
        <Link to="/sv">Hem</Link> / Veckor {year}
      </div>
      <h1>Veckonummer {year}</h1>
      <p className="lead">
        År {year} har <strong>{total} veckor</strong>. Klicka på en vecka för att
        se dess datum.
      </p>

      <div className="grid">
        {weeks.map((w) => {
          const mo = mondayOf(w, y);
          const su = new Date(mo);
          su.setDate(mo.getDate() + 6);
          return (
            <Link key={w} className="wk" to={`/sv/vecka-${w}-${y}`}>
              <div className="n">Vecka {w}</div>
              <div className="r">
                {svDateShort(mo)} – {svDateShort(su)}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="prevnext">
        <Link to={`/sv/veckor-${y - 1}`}>
          <span className="lbl">Föregående</span>Veckor {y - 1}
        </Link>
        <Link className="nx" to={`/sv/veckor-${y + 1}`}>
          <span className="lbl">Nästa</span>Veckor {y + 1}
        </Link>
      </div>

      <p>
        Se även <Link to={`/sv/helgdagar-${year}`}>röda dagar {year}</Link>. På
        finska: <Link to={`/vuosi-${year}`}>viikot {year}</Link>.
      </p>
    </section>
  );
};

export default SvYear;
