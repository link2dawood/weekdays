import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import YearCalendar from "./pages/YearCalendar";
import Navbar from "./components/Navbar";
import FAQPage from "./pages/FAQPage";
import WeekDays from "./pages/WeekDays";
import WeeksInEachMonth from "./pages/WeeksInEachMonth";
import WeekCard from "./components/WeekCard";
import WhatWeek from "./pages/WhatWeek";
import PrintCalendar from "./pages/PrintCalendar";
import WeeksInYear from "./pages/WeeksInYear";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import NotFound from "./pages/NotFound";
import Footer from "./components/Footer";
const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/year/:year" element={<YearCalendar />} />
        <Route path="/week/:week/:year" element={<WeekDays />} />
        <Route path="/month/:month/:year" element={<WeeksInEachMonth />} />
        <Route path="/what-is-a-week-number" element={<WhatWeek />} />
        <Route path="/weeks-in-a-year" element={<WeeksInYear />} />
        <Route path="/print/:year" element={<PrintCalendar />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/about-us" element={<AboutUs />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
};

export default App;
