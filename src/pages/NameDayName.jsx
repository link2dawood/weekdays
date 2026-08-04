import { Link, useParams } from "react-router-dom";
import SEO from "../components/SEO";
import { fmtFullFi, isoWeek, isoYear, WD } from "../components/dateUtils";
import {
  nameDayFaqs,
  nameDayNameMeta,
  nameDayNamePage,
} from "../data/nameDayPages";
import { canonicalFor, CONTENT_UPDATED_FI } from "../data/seo";
import NotFound from "./NotFound";

const NameDayName = () => {
  const { name } = useParams();
  const page = nameDayNamePage(name);
  if (!page) return <NotFound />;
  const meta = nameDayNameMeta(page.slug);
  const first = page.dates[0];
  const week = isoWeek(first);
  const weekYear = isoYear(first);
  const faqs = nameDayFaqs(page, "name");

  return (
    <section className="app">
      <SEO {...meta} canonical={canonicalFor(page.path)} />
      <div className="breadcrumb">
        <Link to="/">Etusivu</Link> / Nimipäivät / {page.name}
      </div>
      <h1>{page.genitive} nimipäivä</h1>
      <div className="prose">
        <p className="lead">
          <strong>{page.genitive} nimipäivää vietetään {fmtFullFi(first)}.</strong>
        </p>
        <div className="panel">
          <div className="now-label">{page.genitive} nimipäivä lyhyesti</div>
          <ul>
            <li><strong>Päivämäärä:</strong> {fmtFullFi(first)}</li>
            <li><strong>Viikonpäivä vuonna {page.year}:</strong> {WD[first.getDay()]}</li>
            <li>
              <strong>Viikkonumero vuonna {page.year}:</strong>{" "}
              <Link to={`/viikko-${week}-${weekYear}`}>viikko {week}</Link>
            </li>
          </ul>
        </div>
        <p className="note-soft">Sisältö päivitetty {CONTENT_UPDATED_FI}.</p>

        <h2>Milloin {page.genitive} nimipäivä on?</h2>
        <p>
          {page.genitive} nimipäivä on {fmtFullFi(first)}. Sama kalenteripäivä
          toistuu vuosittain, mutta viikonpäivä ja viikkonumero vaihtuvat vuoden mukaan.
        </p>

        <h2>Keillä muilla on nimipäivä samana päivänä?</h2>
        <p>
          Katso kaikki saman päivän nimet sivulta{" "}
          <Link to={`/nimipaivat/${page.dateKeys[0]}`}>
            nimipäivät {fmtFullFi(first)}
          </Link>.
        </p>

        <h2>Usein kysyttyä: {page.genitive} nimipäivä</h2>
        <div className="faq-list">
          {faqs.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>

        <p>
          Katso myös <Link to="/nimipaivat/tanaan">nimipäivä tänään</Link>,{" "}
          <Link to={`/kalenteri-${page.year}`}>kalenteri {page.year}</Link> ja{" "}
          <Link to={`/vuosi-${page.year}`}>vuoden {page.year} viikkonumerot</Link>.
        </p>
      </div>
    </section>
  );
};

export default NameDayName;
