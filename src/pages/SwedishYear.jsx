import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import {
  PRERENDER_MAX_YEAR as YEAR_MAX,
  PRERENDER_MIN_YEAR as YEAR_MIN,
  isoWeek,
  isoYear,
  mondayOf,
  weeksInIsoYear,
} from "../components/dateUtils";
import { canonicalFor } from "../data/seo";
import { formatSwedishDate, swedishYearFaqs, swedishYearMeta } from "../data/swedishContent";

const SwedishYear = ({ year }) => {
  const selectedYear = Number(year);
  const total = weeksInIsoYear(selectedYear);
  const weeks = Array.from({ length: total }, (_, index) => index + 1);
  const now = new Date();
  const currentWeek = isoWeek(now);
  const currentYear = isoYear(now);
  const faqs = swedishYearFaqs(selectedYear);
  return (
    <section className="app">
      <SEO
        {...swedishYearMeta(selectedYear)}
        canonical={canonicalFor("/sv/veckor-" + selectedYear)}
        lang="sv"
        alternates={[
          { lang: "sv-FI", href: canonicalFor("/sv/veckor-" + selectedYear) },
          { lang: "fi", href: canonicalFor("/vuosi-" + selectedYear) },
          { lang: "x-default", href: canonicalFor("/vuosi-" + selectedYear) },
        ]}
      />
      <div className="breadcrumb"><Link to="/">Viikko Nro</Link> / <Link to="/sv">Svenska</Link> / Veckor {selectedYear}</div>
      <h1>Veckonummer {selectedYear}</h1>
      <p className="lead">År {selectedYear} har <strong>{total} ISO-veckor</strong>. Välj en vecka för att se alla datum.</p>
      <div className="grid">
        {weeks.map((week) => {
          const monday = mondayOf(week, selectedYear);
          const sunday = new Date(monday);
          sunday.setDate(monday.getDate() + 6);
          const isCurrent = week === currentWeek && selectedYear === currentYear;
          return (
            <Link key={week} className={"wk " + (isCurrent ? "current" : "")} to={"/sv/vecka-" + week + "-" + selectedYear}>
              <div className="n">Vecka {week}</div>
              <div className="r">{monday.getDate()}.{monday.getMonth() + 1}.–{sunday.getDate()}.{sunday.getMonth() + 1}.</div>
            </Link>
          );
        })}
      </div>
      <div className="prose">
        <h2>Hur många veckor har {selectedYear}?</h2>
        <p>
          År {selectedYear} har {total} veckor enligt ISO 8601. Vecka 1 börjar{" "}
          {formatSwedishDate(mondayOf(1, selectedYear))}.
        </p>
        <h2>Vanliga frågor</h2>
        {faqs.map((item, index) => (
          <details key={item.q} open={index === 0}><summary>{item.q}</summary><p>{item.a}</p></details>
        ))}
      </div>
      <div className="prevnext">
        {selectedYear > YEAR_MIN && <Link to={"/sv/veckor-" + (selectedYear - 1)}><span className="lbl">Föregående</span>Veckor {selectedYear - 1}</Link>}
        {selectedYear < YEAR_MAX && <Link className="nx" to={"/sv/veckor-" + (selectedYear + 1)}><span className="lbl">Nästa</span>Veckor {selectedYear + 1}</Link>}
      </div>
      <p>Finsk version: <Link to={"/vuosi-" + selectedYear}>viikkonumerot {selectedYear}</Link>.</p>
    </section>
  );
};

export default SwedishYear;
