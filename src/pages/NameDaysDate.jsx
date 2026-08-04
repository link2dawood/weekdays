import { Link, useParams } from "react-router-dom";
import SEO from "../components/SEO";
import { fmtFullFi } from "../components/dateUtils";
import {
  nameDayDateMeta,
  nameDayDatePage,
  nameDayFaqs,
} from "../data/nameDayPages";
import { nameDaySlug } from "../data/nameDays";
import { canonicalFor, CONTENT_UPDATED_FI } from "../data/seo";
import NotFound from "./NotFound";

const NameDaysDate = () => {
  const { monthDay } = useParams();
  const page = nameDayDatePage(monthDay);
  if (!page) return <NotFound />;
  const meta = nameDayDateMeta(page.dateKey);
  const faqs = nameDayFaqs(page, "date");

  return (
    <section className="app">
      <SEO {...meta} canonical={canonicalFor(page.path)} />
      <div className="breadcrumb">
        <Link to="/">Etusivu</Link> / Nimipäivät / {fmtFullFi(page.date)}
      </div>
      <h1>Nimipäivät {fmtFullFi(page.date)}</h1>
      <div className="prose">
        <p className="lead">
          <strong>
            {fmtFullFi(page.date)} nimipäivää {page.names.length === 1 ? "viettää" : "viettävät"}{" "}
            {page.names.join(", ")}.
          </strong>
        </p>
        <div className="panel">
          <div className="now-label">Päivän tiedot lyhyesti</div>
          <ul>
            <li><strong>Nimipäivät:</strong> {page.names.join(", ")}</li>
            <li><strong>Viikonpäivä:</strong> {page.weekdayEssive}</li>
            <li>
              <strong>Viikkonumero:</strong>{" "}
              <Link to={`/viikko-${page.week}-${page.weekYear}`}>viikko {page.week}</Link>
            </li>
          </ul>
        </div>
        <p className="note-soft">Sisältö päivitetty {CONTENT_UPDATED_FI}.</p>

        <h2>Keillä on nimipäivä {fmtFullFi(page.date)}?</h2>
        <ul>
          {page.names.map((name) => (
            <li key={name}>
              <Link to={`/nimipaiva/${nameDaySlug(name)}`}>{name}</Link>
            </li>
          ))}
        </ul>

        <h2>Mille viikolle {fmtFullFi(page.date)} osuu?</h2>
        <p>
          Päivä on {page.weekdayEssive} ja kuuluu{" "}
          <Link to={`/viikko-${page.week}-${page.weekYear}`}>
            viikkoon {page.week} vuonna {page.weekYear}
          </Link>.
        </p>

        <h2>Usein kysyttyä päivän nimipäivistä</h2>
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

export default NameDaysDate;
