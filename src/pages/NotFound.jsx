import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { isoYear } from "../components/dateUtils";

const NotFound = () => {
  const NOW = new Date();
  const Y_NOW = isoYear(NOW);

  // Unknown URLs are served the prerendered home HTML (HTTP 200) before React
  // swaps in this view, so flip robots to noindex and set a 404 title while
  // this page is shown — preventing thin/duplicate pages from being indexed.
  useEffect(() => {
    const robots = document.querySelector('meta[name="robots"]');
    const prevRobots = robots ? robots.getAttribute("content") : null;
    const prevTitle = document.title;

    if (robots) robots.setAttribute("content", "noindex, follow");
    document.title = "Sivua ei löytynyt (404) | Viikko Nro";

    return () => {
      if (robots && prevRobots !== null) {
        robots.setAttribute("content", prevRobots);
      }
      document.title = prevTitle;
    };
  }, []);

  return (
    <section className="app">
      <div className="breadcrumb">
        <Link to="/">Etusivu</Link> / 404
      </div>
      <div className="eyebrow">Virhe 404</div>
      <h1>Sivua ei löytynyt</h1>
      <p className="lead">
        Valitettavasti etsimääsi sivua ei ole olemassa, se on poistettu tai
        osoite on kirjoitettu väärin.
      </p>
      <div className="prose">
        <p>
          Tarkista osoite tai palaa etusivulle jatkaaksesi. Voit myös katsoa{" "}
          <Link to={`/year/${Y_NOW}`} onClick={() => window.scrollTo(0, 0)}>
            vuoden {Y_NOW} viikot
          </Link>
          .
        </p>
      </div>
      <p>
        <Link className="btn" to="/" onClick={() => window.scrollTo(0, 0)}>
          Palaa etusivulle
        </Link>
      </p>
    </section>
  );
};

export default NotFound;
