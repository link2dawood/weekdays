import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import { canonicalFor, routeMeta } from "../data/seo";

const SNIPPET = '<script src="https://viikkonro.fi/widget.js"></script>';

const EmbedWidget = () => {
  const meta = routeMeta["/upota-widgetti"];
  const demoRef = useRef(null);
  const [copied, setCopied] = useState(false);

  // Loads the real, production widget.js into the demo box — client-only
  // (same non-essential-supplementary treatment as WeeklySearch's date
  // picker), so this intentionally isn't in the prerendered/SSR markup.
  useEffect(() => {
    const el = demoRef.current;
    if (!el) return;
    const script = document.createElement("script");
    script.src = "/widget.js";
    el.appendChild(script);
    return () => {
      el.innerHTML = "";
    };
  }, []);

  const copySnippet = async () => {
    try {
      await navigator.clipboard.writeText(SNIPPET);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can be denied/unavailable; the snippet is still
      // selectable text in the <code> box, so this is a soft failure.
    }
  };

  return (
    <section className="app">
      <SEO title={meta.title} description={meta.description} canonical={canonicalFor("/upota-widgetti")} />
      <div className="breadcrumb">
        <Link to="/">Etusivu</Link> / Upota widgetti
      </div>
      <h1>Upota viikkonumero-widgetti sivullesi</h1>
      <p className="lead">
        Ilmainen, kevyt widgetti näyttää kuluvan ISO 8601 -viikkonumeron
        sivustollasi. Ei riippuvuuksia, ei asetuksia — yksi rivi koodia.
      </p>

      <h2 className="mh">Näin se näyttää</h2>
      <div ref={demoRef} style={{ minHeight: "2.2em" }} />

      <h2 className="mh">Lisää sivullesi</h2>
      <p>Liitä tämä rivi HTML-koodiisi siihen kohtaan, jossa haluat widgetin näkyvän:</p>
      <div className="code-box">
        <code>{SNIPPET}</code>
        <button type="button" className="btn" onClick={copySnippet}>
          {copied ? "Kopioitu!" : "Kopioi"}
        </button>
      </div>

      <h2 className="mh">Tietoa widgetistä</h2>
      <ul>
        <li>Näyttää aina kuluvan viikkonumeron kävijän omaan kellonaikaan perustuen.</li>
        <li>Ei ulkoisia riippuvuuksia eikä evästeitä.</li>
        <li>Ei aiheuta sivun sisällön hyppimistä latauksen aikana.</li>
        <li>Linkki takaisin osoitteeseen viikkonro.fi sisältyy widgettiin.</li>
      </ul>

      <p>
        Etsitkö sen sijaan omaa viikkolaskuria? Katso{" "}
        <Link to="/laskurit">kaikki viikkolaskurit ja päivämäärätyökalut</Link>.
      </p>
    </section>
  );
};

export default EmbedWidget;
