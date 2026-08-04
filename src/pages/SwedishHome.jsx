import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import { currentSwedishWeek, formatSwedishDate, swedishHomeFaqs, swedishHomeMeta } from "../data/swedishContent";
import { canonicalFor, CONTENT_UPDATED } from "../data/seo";

const SwedishHome = () => {
  const fact = currentSwedishWeek();
  const indexedYears = Array.from({ length: 7 }, (_, index) => fact.calendarYear - 2 + index);
  return (
    <section className="app">
      <SEO
        {...swedishHomeMeta()}
        canonical={canonicalFor("/sv")}
        lang="sv"
        alternates={[
          { lang: "sv-FI", href: canonicalFor("/sv") },
          { lang: "fi", href: canonicalFor("/") },
          { lang: "x-default", href: canonicalFor("/") },
        ]}
      />
      <div className="breadcrumb"><Link to="/">Suomeksi</Link> / Svenska</div>
      <h1>Vilken vecka är det nu?</h1>
      <p className="lead"><strong>Nu är det vecka {fact.week} år {fact.year}.</strong></p>
      <div className="result">
        <div className="main-text">Vecka {fact.week}</div>
        <div className="sub">
          Måndag {formatSwedishDate(fact.monday)} – söndag {formatSwedishDate(fact.sunday)}
        </div>
      </div>
      <div className="prose">
        <p className="note-soft">Innehållet granskat {CONTENT_UPDATED}.</p>
        <h2>Aktuell vecka och datum</h2>
        <p>
          Vecka {fact.week} börjar måndag {formatSwedishDate(fact.monday)} och slutar söndag{" "}
          {formatSwedishDate(fact.sunday)}. Se <Link to={"/sv/vecka-" + fact.week + "-" + fact.year}>
            alla datum i vecka {fact.week}
          </Link>.
        </p>
        <h2>Veckonummer i Finland</h2>
        <p>
          Finland använder ISO 8601. Veckan börjar på måndag, och vecka 1 är den vecka som
          innehåller årets första torsdag. Ett ISO-år har 52 eller 53 veckor.
        </p>
        <h2>Hitta en annan vecka</h2>
        <p>
          Öppna <Link to={"/sv/veckor-" + fact.year}>alla veckonummer {fact.year}</Link>.
          Där ser du varje veckas start- och slutdatum och kan öppna en detaljerad veckosida.
        </p>
        <div className="pills">
          {indexedYears.map((year) => (
            <Link key={year} className={"pill " + (year === fact.year ? "active" : "")} to={"/sv/veckor-" + year}>
              {year}
            </Link>
          ))}
        </div>
        <h2>Vanliga frågor</h2>
        {swedishHomeFaqs.map((item, index) => (
          <details key={item.q} open={index === 0}><summary>{item.q}</summary><p>{item.a}</p></details>
        ))}
      </div>
      <p>Se även <Link to="/">veckonumret på finska</Link> eller <Link to="/en">på engelska</Link>.</p>
    </section>
  );
};

export default SwedishHome;
