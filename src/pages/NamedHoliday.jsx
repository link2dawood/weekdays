import { Link, useParams } from "react-router-dom";
import SEO from "../components/SEO";
import {
  PRERENDER_MAX_YEAR,
  PRERENDER_MIN_YEAR,
  fmtFullFi,
} from "../components/dateUtils";
import {
  holidayFaqs,
  holidayPageFor,
  holidayPageMeta,
} from "../data/holidayPages";
import { canonicalFor, CONTENT_UPDATED_FI } from "../data/seo";
import NotFound from "./NotFound";

const NamedHoliday = () => {
  const { holidayYear, holidaySlug } = useParams();
  const year = holidayYear?.match(/^pyhat-(\d{4})$/)?.[1];
  const page = holidayPageFor(year, holidaySlug);
  if (!page) return <NotFound />;

  const meta = holidayPageMeta(page.year, page.slug);
  const faqs = holidayFaqs(page);
  const status = page.official ? "Virallinen pyhäpäivä" : "Vietetty juhlapäivä";

  return (
    <section className="app">
      <SEO {...meta} canonical={canonicalFor(page.path)} />
      <div className="breadcrumb">
        <Link to="/">Etusivu</Link> /{" "}
        <Link to={`/pyhapaivat-${page.year}`}>Pyhäpäivät {page.year}</Link> /{" "}
        {page.displayName}
      </div>

      <h1>{page.displayName} {page.year}</h1>

      <div className="prose">
        <p className="lead">
          <strong>
            {page.displayName} {page.year} on {page.weekdayEssive}{" "}
            {fmtFullFi(page.date)} ja kuuluu viikkoon {page.week}.
          </strong>
        </p>

        <div className="panel">
          <div className="now-label">{page.displayName} {page.year} lyhyesti</div>
          <ul>
            <li><strong>Päivämäärä:</strong> {fmtFullFi(page.date)}</li>
            <li><strong>Viikonpäivä:</strong> {page.weekday}</li>
            <li>
              <strong>Viikkonumero:</strong>{" "}
              <Link to={`/viikko-${page.week}-${page.weekYear}`}>
                viikko {page.week}
              </Link>
            </li>
            <li><strong>Asema:</strong> {status}</li>
            <li><strong>Tyyppi:</strong> {page.kind}</li>
          </ul>
        </div>

        <p className="note-soft">Sisältö päivitetty {CONTENT_UPDATED_FI}.</p>

        <h2>Milloin {page.displayName.toLowerCase()} on vuonna {page.year}?</h2>
        <p>
          {page.displayName} on {page.weekdayEssive} {fmtFullFi(page.date)}.
          {" "}{page.rule} Vuonna {page.year} päivä on {page.kind}.
        </p>

        <h2>Mille viikolle {page.displayName.toLowerCase()} {page.year} osuu?</h2>
        <p>
          Päivä kuuluu ISO 8601 -kalenterissa{" "}
          <Link to={`/viikko-${page.week}-${page.weekYear}`}>
            viikkoon {page.week} vuonna {page.weekYear}
          </Link>.
          Suomessa viikko alkaa maanantaina ja päättyy sunnuntaina.
        </p>

        <h2>Onko {page.displayName.toLowerCase()} virallinen pyhäpäivä?</h2>
        <p>
          {page.official
            ? `${page.displayName} on Suomessa virallinen pyhäpäivä.`
            : `${page.displayName} ei ole Suomessa virallinen pyhäpäivä, vaikka se on monilla työpaikoilla vapaa tai tavallista lyhyempi työpäivä.`}
          {" "}Kaikki vuoden päivät ja niiden asema löytyvät{" "}
          <Link to={`/pyhapaivat-${page.year}`}>pyhäpäivien {page.year} listasta</Link>.
        </p>

        <h2>Miten {page.displayName.toLowerCase()} päivämäärä määräytyy?</h2>
        <p>{page.rule}</p>

        <h2>Usein kysyttyä: {page.displayName.toLowerCase()}</h2>
        <div className="faq-list">
          {faqs.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>

        <p>
          Katso myös <Link to={`/kalenteri-${page.year}`}>viikkokalenteri {page.year}</Link>,{" "}
          <Link to={`/pyhapaivat-${page.year}`}>kaikki pyhäpäivät {page.year}</Link>{" "}
          ja <Link to={`/vuosi-${page.year}`}>vuoden {page.year} viikkonumerot</Link>.
        </p>

        <div className="prevnext">
          {page.year > PRERENDER_MIN_YEAR && (
            <Link to={`/pyhat-${page.year - 1}/${page.slug}`}>
              <span className="lbl">Edellinen</span>{page.displayName} {page.year - 1}
            </Link>
          )}
          {page.year < PRERENDER_MAX_YEAR && (
            <Link className="nx" to={`/pyhat-${page.year + 1}/${page.slug}`}>
              <span className="lbl">Seuraava</span>{page.displayName} {page.year + 1}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default NamedHoliday;
