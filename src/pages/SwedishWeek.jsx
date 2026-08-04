import { Link, Navigate } from "react-router-dom";
import SEO from "../components/SEO";
import {
  PRERENDER_MAX_YEAR as YEAR_MAX,
  PRERENDER_MIN_YEAR as YEAR_MIN,
} from "../components/dateUtils";
import { canonicalFor } from "../data/seo";
import { formatSwedishDate, swedishWeekFacts, swedishWeekFaqs, swedishWeekMeta } from "../data/swedishContent";

const SwedishWeek = ({ week, year }) => {
  const fact = swedishWeekFacts(week, year);
  if (!fact) return <Navigate to={"/sv/veckor-" + year} replace />;
  const previous = fact.week === 1
    ? fact.year > YEAR_MIN
      ? swedishWeekFacts(swedishWeekFacts(1, fact.year - 1).total, fact.year - 1)
      : null
    : swedishWeekFacts(fact.week - 1, fact.year);
  const next = fact.week === fact.total
    ? fact.year < YEAR_MAX
      ? swedishWeekFacts(1, fact.year + 1)
      : null
    : swedishWeekFacts(fact.week + 1, fact.year);
  const faqs = swedishWeekFaqs(fact.week, fact.year);
  return (
    <section className="app">
      <SEO
        {...swedishWeekMeta(fact.week, fact.year)}
        canonical={canonicalFor("/sv/vecka-" + fact.week + "-" + fact.year)}
        lang="sv"
        alternates={[
          { lang: "sv-FI", href: canonicalFor("/sv/vecka-" + fact.week + "-" + fact.year) },
          { lang: "fi", href: canonicalFor("/viikko-" + fact.week + "-" + fact.year) },
          { lang: "x-default", href: canonicalFor("/viikko-" + fact.week + "-" + fact.year) },
        ]}
      />
      <div className="breadcrumb">
        <Link to="/">Viikko Nro</Link> / <Link to="/sv">Svenska</Link> / <Link to={"/sv/veckor-" + fact.year}>Veckor {fact.year}</Link> / Vecka {fact.week}
      </div>
      <h1>Vecka {fact.week} år {fact.year}</h1>
      <p className="lead">
        <strong>Vecka {fact.week} pågår från {formatSwedishDate(fact.monday)} till {formatSwedishDate(fact.sunday)}.</strong>
      </p>
      <div className="days">
        {fact.days.map((item) => (
          <article className={"day " + ([0, 6].includes(item.date.getDay()) ? "weekend" : "")} key={item.date.toISOString()}>
            <div className="day-head">
              <span className="wd">{item.weekday}</span>
              <span className="dt">{formatSwedishDate(item.date)}</span>
            </div>
          </article>
        ))}
      </div>
      <div className="prose">
        <h2>Datum för vecka {fact.week}</h2>
        <p>
          Veckan börjar på måndag och omfattar sju kalenderdagar. Den följer ISO 8601,
          standarden för veckonummer som används i Finland och övriga Norden.
        </p>
        <h2>Vanliga frågor</h2>
        {faqs.map((item, index) => (
          <details key={item.q} open={index === 0}><summary>{item.q}</summary><p>{item.a}</p></details>
        ))}
      </div>
      <div className="prevnext">
        {previous && <Link to={"/sv/vecka-" + previous.week + "-" + previous.year}><span className="lbl">Föregående</span>Vecka {previous.week}</Link>}
        {next && <Link className="nx" to={"/sv/vecka-" + next.week + "-" + next.year}><span className="lbl">Nästa</span>Vecka {next.week}</Link>}
      </div>
      <p>Finsk version: <Link to={"/viikko-" + fact.week + "-" + fact.year}>viikko {fact.week}/{fact.year}</Link>.</p>
    </section>
  );
};

export default SwedishWeek;
