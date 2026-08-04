import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import { fmtFullFi } from "../components/dateUtils";
import { nameDayFaqs, todayNameDayMeta, todayNameDayPage } from "../data/nameDayPages";
import { nameDaySlug, nameDayNames } from "../data/nameDays";
import { canonicalFor } from "../data/seo";

const NameDaysToday = () => {
  const page = todayNameDayPage();
  const meta = todayNameDayMeta();
  const availableNames = nameDayNames();
  const faqs = nameDayFaqs(page, "today");

  return (
    <section className="app">
      <SEO {...meta} canonical={canonicalFor(page.path)} />
      <div className="breadcrumb">
        <Link to="/">Etusivu</Link> / Nimipäivä tänään
      </div>
      <h1>Nimipäivä tänään</h1>
      <div className="prose">
        <p className="lead">
          {page.available ? (
            <strong>
              Tänään {fmtFullFi(page.date)} nimipäivää {page.names.length === 1 ? "viettää" : "viettävät"}{" "}
              {page.names.join(", ")}.
            </strong>
          ) : (
            <strong>
              Päivän {fmtFullFi(page.date)} nimipäivät eivät vielä sisälly palvelun varmennettuun aineistoon.
            </strong>
          )}
        </p>

        {page.available ? (
          <>
            <h2>Kuka viettää nimipäivää tänään?</h2>
            <ul>
              {page.names.map((name) => (
                <li key={name}><Link to={`/nimipaiva/${nameDaySlug(name)}`}>{name}</Link></li>
              ))}
            </ul>
            <p>
              Tänään on {page.weekdayEssive} ja päivä kuuluu{" "}
              <Link to={`/viikko-${page.week}-${page.weekYear}`}>viikkoon {page.week}</Link>.
            </p>
          </>
        ) : (
          <>
            <h2>Miksi tämän päivän nimipäiviä ei näytetä?</h2>
            <p>
              Julkaisemme vain varmennettua nimipäivätietoa. Aineisto on tällä hetkellä
              rajattu, joten puuttuvia nimiä ei korvata arvauksilla tai paikkamerkeillä.
            </p>
            <h2>Mitkä nimipäivät ovat jo saatavilla?</h2>
            <ul>
              {availableNames.map((item) => (
                <li key={item.slug}><Link to={`/nimipaiva/${item.slug}`}>{item.name}</Link></li>
              ))}
            </ul>
          </>
        )}

        <h2>Usein kysyttyä tämän päivän nimipäivistä</h2>
        <div className="faq-list">
          {faqs.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>

        <p>
          Katso myös <Link to={`/kalenteri-${page.weekYear}`}>kalenteri {page.weekYear}</Link>{" "}
          ja <Link to={`/viikko-${page.week}-${page.weekYear}`}>kuluva viikko {page.week}</Link>.
        </p>
      </div>
    </section>
  );
};

export default NameDaysToday;
