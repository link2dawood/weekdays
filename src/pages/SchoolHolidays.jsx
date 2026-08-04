import { Link } from "react-router-dom";
import { fmtFullFi } from "../components/dateUtils";
import SEO from "../components/SEO";
import {
  SCHOOL_HOLIDAY_SOURCES,
  schoolHolidayFaqs,
  schoolHolidayMeta,
  schoolHolidayPage,
  schoolHolidayYears,
} from "../data/schoolHolidayPages";
import { canonicalFor, CONTENT_UPDATED_FI } from "../data/seo";
import NotFound from "./NotFound";

function HolidayTable({ groups, year, label }) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>{label}</th>
            <th>Päivämäärät</th>
            <th>Vertailukaupungit</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <tr key={group.week + group.cities.join("-")}>
              <td>
                <Link to={"/viikko-" + group.week + "-" + year}>
                  <strong>Viikko {group.week}</strong>
                </Link>
              </td>
              <td>
                {fmtFullFi(group.startDate)}–{fmtFullFi(group.endDate)}
              </td>
              <td>{group.cities.join(", ")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const SchoolHolidays = ({ year }) => {
  const selectedYear = Number(year);
  const page = schoolHolidayPage(selectedYear);
  if (!page) return <NotFound />;

  const meta = schoolHolidayMeta(selectedYear);
  const faqs = schoolHolidayFaqs(selectedYear);
  const sources = page.sourceKeys.map((key) => SCHOOL_HOLIDAY_SOURCES[key]);

  return (
    <section className="app">
      <SEO
        {...meta}
        canonical={canonicalFor("/koululomat-" + selectedYear)}
      />

      <div className="breadcrumb">
        <Link to="/">Etusivu</Link> / Koululomat {selectedYear}
      </div>

      <h1>Koululomat {selectedYear} – hiihto- ja syyslomat</h1>

      <div className="prose">
        <p className="lead">
          <strong>
            Koululaisten hiihtoloma {selectedYear} ajoittuu Suomessa alueesta
            riippuen viikoille 8, 9 tai 10.
          </strong>{" "}
          Syysloman, joululoman ja lukuvuoden muiden päivien tarkka ajankohta
          riippuu kunnasta ja oppilaitoksesta.
        </p>

        <div className="panel">
          <div className="now-label">Koululomat {selectedYear} lyhyesti</div>
          <ul>
            <li><strong>Hiihto- eli talviloma:</strong> viikot 8–10 alueittain.</li>
            <li>
              <strong>Syysloma:</strong>{" "}
              {selectedYear === 2026
                ? "viikko 42 tai 43 vertailukaupungista riippuen."
                : "Helsingissä vahvistetusti viikko 42; muut kunnat tarkistettava erikseen."}
            </li>
            <li><strong>Päätöksentekijä:</strong> opetuksen järjestäjä, yleensä kunta.</li>
            <li><strong>Kohderyhmä:</strong> ensisijaisesti perusopetus.</li>
          </ul>
        </div>

        <p className="note-soft">Sisältö ja lähteet tarkistettu {CONTENT_UPDATED_FI}.</p>

        <h2>Milloin hiihtoloma {selectedYear} on?</h2>
        <p>
          Talviloma porrastetaan kolmen viikon jaksolle. Alla olevat kaupungit
          ovat Opetushallituksen Manner-Suomen maakuntapääkaupunkien
          vertailusta; lista ei tarkoita, että jokainen samalla alueella oleva
          kunta noudattaa täsmälleen samaa aikaa.
        </p>
        <HolidayTable
          groups={page.winter}
          year={selectedYear}
          label="Hiihtolomaviikko"
        />

        <h2>Milloin syysloma {selectedYear} on?</h2>
        <p>
          {selectedYear === 2026
            ? "Syysloma osuu vertailukaupungeissa viikolle 42 tai 43. Joissakin kunnissa loma kestää koko viikon, toisissa maanantaista perjantaihin."
            : "Syksyn 2027 valtakunnallista kuntavertailua ei ole vielä julkaistu. Taulukossa näkyy vain Helsingin virallisesti vahvistettu aika, eikä sitä yleistetä muihin kuntiin."}
        </p>
        <HolidayTable
          groups={page.autumn}
          year={selectedYear}
          label="Syyslomaviikko"
        />

        <div className="panel">
          <div className="now-label">Tarkista aina oma kunta ja koulu</div>
          <p>{page.coverageNote}</p>
          <p>
            Esiopetuksen, lukion ja ammatillisen oppilaitoksen ajat voivat
            poiketa perusopetuksesta. Myös yksittäinen koulu voi siirtää
            työpäivää. Varmista lopullinen tieto kunnan sivulta tai Wilmasta.
          </p>
        </div>

        <h2>Muut koululomien ajankohdat vuonna {selectedYear}</h2>
        <ul>
          {page.otherPeriods.map((item) => <li key={item}>{item}</li>)}
        </ul>

        <h2>Miksi koululomat vaihtelevat alueittain?</h2>
        <p>
          Suomessa opetuksen järjestäjä päättää lukuvuoden työ- ja loma-ajoista
          lain asettamissa rajoissa. Talvilomien porrastus viikoille 8–10
          jakaa lomaliikennettä, mutta myös syys- ja joululomissa on
          kuntakohtaisia eroja. Lukion, ammatillisen koulutuksen ja
          esiopetuksen kalenterit voivat lisäksi poiketa peruskoulusta.
        </p>

        <h2>Viralliset lähteet</h2>
        <ul>
          {sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noopener noreferrer">
                {source.label}
              </a>
            </li>
          ))}
        </ul>

        <h2>Aiheeseen liittyviä sivuja</h2>
        <div className="quicklinks">
          <Link className="ql" to={"/kalenteri-" + selectedYear}>
            <b>Viikkokalenteri {selectedYear}</b>
            <span>Kaikki kuukaudet, viikot ja juhlapäivät</span>
          </Link>
          <Link className="ql" to={"/vuosi-" + selectedYear}>
            <b>Viikkonumerot {selectedYear}</b>
            <span>Kaikki ISO-viikot päivämäärineen</span>
          </Link>
          {schoolHolidayYears
            .filter((item) => item !== selectedYear)
            .map((item) => (
              <Link className="ql" to={"/koululomat-" + item} key={item}>
                <b>Koululomat {item}</b>
                <span>Hiihto- ja syyslomat alueittain</span>
              </Link>
            ))}
        </div>

        <h2>Usein kysytyt kysymykset</h2>
        {faqs.map((item, index) => (
          <details key={item.q} open={index === 0}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
};

export default SchoolHolidays;
