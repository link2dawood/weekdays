import React from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import { canonicalFor, routeMeta } from "../data/seo";

const TOOLS = [
  {
    to: "/paivamaara-viikoksi",
    name: "Päivämäärästä viikkonumeroon",
    desc: "Syötä päivä ja näe sen viikkonumero, viikonpäivä ja viikon päivämäärät.",
  },
  {
    to: "/viikko-paivamaaraksi",
    name: "Viikosta päivämääräksi",
    desc: "Syötä viikko ja vuosi, näe viikon alkamis- ja päättymispäivä sekä viikonpäivät.",
  },
  {
    to: "/tyopaivalaskuri",
    name: "Työpäivälaskuri",
    desc: "Työpäivät kahden päivän välillä, viikonloput ja arkipyhät huomioiden.",
  },
  {
    to: "/paivien-erotus",
    name: "Päivien erotus",
    desc: "Montako päivää ja viikkoa kahden päivämäärän välillä on.",
  },
  {
    to: "/upota-widgetti",
    name: "Upota widgetti",
    desc: "Näytä kuluva viikkonumero omalla sivustollasi yhdellä koodirivillä.",
  },
];

const Calculators = () => (
  <section className="app">
    <SEO {...routeMeta["/laskurit"]} canonical={canonicalFor("/laskurit")} />
    <div className="breadcrumb">
      <Link to="/">Etusivu</Link> / Laskurit
    </div>
    <h1>Viikkolaskurit ja päivämäärätyökalut</h1>
    <p className="lead">
      Ilmaisia, nopeita työkaluja viikkonumeroihin ja päivämääriin. Kaikki
      laskennat ISO 8601 -standardin ja Suomen arkipyhien mukaan.
    </p>

    <div className="tool-grid">
      {TOOLS.map((t) => (
        <Link key={t.to} className="tool-card" to={t.to}>
          <span className="tool-name">{t.name}</span>
          <span className="tool-desc">{t.desc}</span>
        </Link>
      ))}
    </div>

    <p>
      Etsitkö kuluvaa viikkoa? Katso <Link to="/">mikä viikko nyt on</Link> tai
      selaa <Link to="/vuosi-2026">vuoden 2026 viikkonumeroita</Link>.
    </p>
  </section>
);

export default Calculators;
