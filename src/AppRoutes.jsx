import React from "react";
import { Routes, Route, useParams } from "react-router-dom";
import Home from "./pages/Home";
import YearCalendar from "./pages/YearCalendar";
import Navbar from "./components/Navbar";
import FAQPage from "./pages/FAQPage";
import WeekDays from "./pages/WeekDays";
import WeeksInEachMonth from "./pages/WeeksInEachMonth";
import WhatWeek from "./pages/WhatWeek";
import PrintCalendar from "./pages/PrintCalendar";
import PublicHolidays from "./pages/PublicHolidays";
import WorkingDays from "./pages/WorkingDays";
import Calculators from "./pages/Calculators";
import DateToWeek from "./pages/DateToWeek";
import WeekToDate from "./pages/WeekToDate";
import WorkingDaysBetween from "./pages/WorkingDaysBetween";
import DaysBetween from "./pages/DaysBetween";
import WeeksInYear from "./pages/WeeksInYear";
import SvHome from "./pages/sv/SvHome";
import SvWeek from "./pages/sv/SvWeek";
import SvYear from "./pages/sv/SvYear";
import SvHolidays from "./pages/sv/SvHolidays";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import NotFound from "./pages/NotFound";
import Footer from "./components/Footer";

// Finnish dynamic pages use keyword-rich single-segment slugs
// (/viikko-30-2026, /kuukausi-7-2026, /vuosi-2026, /tulosta-2026). React Router
// can't parse two params inside one path segment, so a single /:slug route
// dispatches by pattern. Static routes (/faq, /about-us, …) outrank /:slug, so
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
  return <NotFound />;
};

// Swedish (/sv/) pilot dispatcher — same pattern, Swedish slugs.
const SvDynamic = () => {
  const { slug } = useParams();
  let m;
  if ((m = slug.match(/^vecka-(\d+)-(\d+)$/)))
    return <SvWeek week={+m[1]} year={+m[2]} />;
  if ((m = slug.match(/^veckor-(\d+)$/))) return <SvYear year={+m[1]} />;
  if ((m = slug.match(/^helgdagar-(\d+)$/))) return <SvHolidays year={+m[1]} />;
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
        <Route path="/what-is-a-week-number" element={<WhatWeek />} />
        <Route path="/weeks-in-a-year" element={<WeeksInYear />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/laskurit" element={<Calculators />} />
        <Route path="/paivamaara-viikoksi" element={<DateToWeek />} />
        <Route path="/viikko-paivamaaraksi" element={<WeekToDate />} />
        <Route path="/tyopaivalaskuri" element={<WorkingDaysBetween />} />
        <Route path="/paivien-erotus" element={<DaysBetween />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/sv" element={<SvHome />} />
        <Route path="/sv/:slug" element={<SvDynamic />} />
        <Route path="/:slug" element={<DynamicSlug />} />
        <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
};

export default AppRoutes;
