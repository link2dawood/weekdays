import { Routes, Route, useParams } from "react-router-dom";
import Home from "./pages/Home";
import YearCalendar from "./pages/YearCalendar";
import Navbar from "./components/Navbar";
import FAQPage from "./pages/FAQPage";
import WeekDays from "./pages/WeekDays";
import WeeksInEachMonth from "./pages/WeeksInEachMonth";
import WhatWeek from "./pages/WhatWeek";
import WeekStartsMonday from "./pages/WeekStartsMonday";
import PrintCalendar from "./pages/PrintCalendar";
import PublicHolidays from "./pages/PublicHolidays";
import WorkingDays from "./pages/WorkingDays";
import CalendarYear from "./pages/CalendarYear";
import Calculators from "./pages/Calculators";
import DateToWeek from "./pages/DateToWeek";
import WeekToDate from "./pages/WeekToDate";
import WorkingDaysBetween from "./pages/WorkingDaysBetween";
import DaysBetween from "./pages/DaysBetween";
import WeeksInYear from "./pages/WeeksInYear";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import NotFound from "./pages/NotFound";
import Footer from "./components/Footer";
import NamedHoliday from "./pages/NamedHoliday";
import NameDayName from "./pages/NameDayName";
import NameDaysDate from "./pages/NameDaysDate";
import NameDaysToday from "./pages/NameDaysToday";
import SchoolHolidays from "./pages/SchoolHolidays";
import CurrentMonth from "./pages/CurrentMonth";
import CurrentYear from "./pages/CurrentYear";
import WeekdayCalculator from "./pages/WeekdayCalculator";
import EnglishHome from "./pages/EnglishHome";

// Finnish dynamic pages use keyword-rich single-segment slugs
// (/viikko-30-2026, /kuukausi-7-2026, /vuosi-2026, /tulosta-2026). React Router
// can't parse two params inside one path segment, so a single /:slug route
// dispatches by pattern. Static routes (/ukk, /tietoa-meista, …) outrank /:slug, so
// only unmatched single segments ever reach this — the same reachability the
// old explicit routes had. Deterministic, so SSR and client hydration agree.
const DynamicSlug = () => {
  const { slug } = useParams();
  let m;
  if ((m = slug.match(/^viikko-(\d+)-(\d+)$/)))
    return <WeekDays week={+m[1]} year={+m[2]} />;
  if ((m = slug.match(/^kuukausi-(\d+)-(\d+)$/)))
    return <WeeksInEachMonth month={+m[1]} year={+m[2]} />;
  if ((m = slug.match(/^vuosi-(\d+)$/))) return <YearCalendar year={+m[1]} />;
  if ((m = slug.match(/^tulosta-(\d+)$/))) return <PrintCalendar year={+m[1]} />;
  if ((m = slug.match(/^pyhapaivat-(\d+)$/)))
    return <PublicHolidays year={+m[1]} />;
  if ((m = slug.match(/^tyopaivat-(\d+)$/))) return <WorkingDays year={+m[1]} />;
  if ((m = slug.match(/^koululomat-(\d+)$/)))
    return <SchoolHolidays year={+m[1]} />;
  if ((m = slug.match(/^kalenteri-(\d+)-(alkuvuosi|loppuvuosi)$/)))
    return <CalendarYear year={+m[1]} half={m[2] === "alkuvuosi" ? 1 : 2} />;
  if ((m = slug.match(/^kalenteri-(\d+)$/)))
    return <CalendarYear year={+m[1]} />;
  if ((m = slug.match(/^tulostettava-kalenteri-(\d+)$/)))
    return <CalendarYear year={+m[1]} print />;
  return <NotFound />;
};

// Router-agnostic app shell. Wrapped in <BrowserRouter> on the client (App.jsx)
// and in <StaticRouter> at build time for prerendering (entry-server.jsx).
const AppRoutes = () => {
  return (
    <>
      <Navbar />
      {/* Single <main> landmark wraps the routed page content (a11y: screen
          readers use it to jump to the primary content). */}
      <main id="main">
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/en" element={<EnglishHome />} />
        <Route path="/mika-on-viikkonumero" element={<WhatWeek />} />
        <Route path="/viikko-alkaa-maanantaista" element={<WeekStartsMonday />} />
        <Route path="/kuinka-monta-viikkoa-vuodessa" element={<WeeksInYear />} />
        <Route path="/mika-kuukausi-nyt" element={<CurrentMonth />} />
        <Route path="/mika-vuosi-nyt" element={<CurrentYear />} />
        <Route path="/viikonpaiva" element={<WeekdayCalculator />} />
        <Route path="/ukk" element={<FAQPage />} />
        <Route path="/laskurit" element={<Calculators />} />
        <Route path="/paivamaara-viikoksi" element={<DateToWeek />} />
        <Route path="/viikko-paivamaaraksi" element={<WeekToDate />} />
        <Route path="/tyopaivalaskuri" element={<WorkingDaysBetween />} />
        <Route path="/paivien-erotus" element={<DaysBetween />} />
        <Route path="/tietoa-meista" element={<AboutUs />} />
        <Route path="/ota-yhteytta" element={<ContactUs />} />
        <Route path="/tietosuoja" element={<PrivacyPolicy />} />
        <Route path="/kayttoehdot" element={<TermsAndConditions />} />
        <Route path="/nimipaivat/tanaan" element={<NameDaysToday />} />
        <Route path="/nimipaiva/:name" element={<NameDayName />} />
        <Route path="/nimipaivat/:monthDay" element={<NameDaysDate />} />
        <Route path="/:holidayYear/:holidaySlug" element={<NamedHoliday />} />
        <Route path="/:slug" element={<DynamicSlug />} />
        <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
};

export default AppRoutes;
