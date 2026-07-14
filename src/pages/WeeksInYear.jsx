import React from "react";
import { Link } from "react-router-dom";
import { isoWeek, isoYear, weeksInIsoYear } from "../components/dateUtils";

const WeeksInYear = () => {
  const YEAR_MIN = 2020,
    YEAR_MAX = 2035;

  const years = [];
  for (let y = YEAR_MIN; y <= YEAR_MAX; y++) {
    years.push(y);
  }

  // 53-week years, computed for accuracy (extractable facts for search/AI).
  const longYears = [];
  for (let y = 2020; y <= 2040; y++) {
    if (weeksInIsoYear(y) === 53) longYears.push(y);
  }

  const NOW = new Date();
  const W_NOW = isoWeek(NOW);
  const Y_NOW = isoYear(NOW);

  return (
    <>
      <section className="app">
        <div className="breadcrumb">
          <Link to="/">Etusivu</Link> / Viikkoja vuodessa
        </div>
        <h1>Kuinka monta viikkoa vuodessa on?</h1>
        <div className="prose">
          <p>
            Useimmissa vuosissa on <strong>52 viikkoa</strong>. Suunnilleen
            joka viides tai kuudes vuosi on kuitenkin sellainen, jossa on{" "}
            <strong>53 viikkoa</strong>.
          </p>
          <p>
            Vuodessa on 53 viikkoa, kun se alkaa <strong>torstaista</strong>,
            tai kun <strong>karkausvuosi</strong> alkaa keskiviikosta.
            Esimerkiksi vuosissa 2020 ja 2026 on molemmissa 53 viikkoa.
          </p>
          <p>
            Tämä työkalu käsittelee eron automaattisesti, joten näkemäsi
            viikkonumero on aina oikein.
          </p>
        </div>

        <h2 className="mh">53 viikon vuodet</h2>
        <p className="lead">
          Seuraavissa vuosissa on poikkeuksellinen viikko 53. Kaikissa muissa
          vuosissa on 52 viikkoa.
        </p>
        <div className="pills">
          {longYears.map((y) => (
            <Link
              key={y}
              to={`/year/${y}`}
              className={`pill ${y === Y_NOW ? "active" : ""}`}
              onClick={() => window.scrollTo(0, 0)}
            >
              {y}
            </Link>
          ))}
        </div>

        <h2 className="mh">Selaa vuoden viikkoja</h2>
        <div className="pills">
          {years.map((y) => (
            <Link
              key={y}
              to={`/year/${y}`}
              className={`pill ${y === Y_NOW ? "active" : ""}`}
            >
              {y}
            </Link>
          ))}
        </div>
      </section>
    </>
  );
};

export default WeeksInYear;
