import React from "react";
import { Link } from "react-router-dom";
import { isoWeek, isoYear } from "./dateUtils";
const QuickLinks = () => {
  const NOW = new Date();
  const W_NOW = isoWeek(NOW);
  const Y_NOW = isoYear(NOW);
  return (
    <>
      <section>
        <h2 className="mh">Pikalinkit</h2>
        <div className="quicklinks">
          <Link
            className="ql"
            to={`/kalenteri-${Y_NOW}`}
            onClick={() => window.scrollTo(0, 0)}
          >
            <b>Vuoden {Y_NOW} kalenteri</b>
            <span>Kaikki viikot ja juhlapäivät yhdellä sivulla</span>
          </Link>
          <Link
            className="ql"
            to={`/tulosta-${Y_NOW}`}
            onClick={() => window.scrollTo(0, 0)}
          >
            <b>Tulostettava viikkokalenteri</b>
            <span>Tulosta koko vuoden viikot</span>
          </Link>
          <Link
            className="ql"
            to={`/pyhapaivat-${Y_NOW}`}
            onClick={() => window.scrollTo(0, 0)}
          >
            <b>Suomen pyhäpäivät {Y_NOW}</b>
            <span>Arkipyhät, viikonpäivät ja viikkonumerot</span>
          </Link>
          <Link
            className="ql"
            to={`/tyopaivat-${Y_NOW}`}
            onClick={() => window.scrollTo(0, 0)}
          >
            <b>Työpäivät {Y_NOW}</b>
            <span>Montako työpäivää vuodessa</span>
          </Link>
          <Link
            className="ql"
            to="/mika-on-viikkonumero"
            onClick={() => window.scrollTo(0, 0)}
          >
            <b>Mikä on viikkonumero?</b>
            <span>Miten viikot lasketaan</span>
          </Link>
          <Link
            className="ql"
            to="/kuinka-monta-viikkoa-vuodessa"
            onClick={() => window.scrollTo(0, 0)}
          >
            <b>Kuinka monta viikkoa vuodessa on?</b>
            <span>52 tai 53 viikkoa</span>
          </Link>
          <Link className="ql" to="/ukk" onClick={() => window.scrollTo(0, 0)}>
            <b>UKK</b>
            <span>Vastauksia viikoista</span>
          </Link>
        </div>
      </section>
    </>
  );
};

export default QuickLinks;
