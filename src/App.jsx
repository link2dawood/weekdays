import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import YearCalendar from "./pages/YearCalendar";
import Navbar from "./components/Navbar";
import FAQPage from "./pages/FAQPage";
import WeekDays from "./pages/WeekDays";
import WeeksInEachMonth from "./pages/WeeksInEachMonth";
import WeekCard from "./components/WeekCard";
import ThisYearWeek from "./pages/thisYearWeek";
import WhatWeek from "./pages/WhatWeek";
import PrintCalendar from "./pages/PrintCalendar";
import WeeksInYear from "./pages/WeeksInYear";
const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/year/:year" element={<YearCalendar />} />
        <Route path="/year/:current" element={<ThisYearWeek />} />
        <Route path="/week/:week/:year" element={<WeekDays />} />
        <Route path="/month/:month/:year" element={<WeeksInEachMonth />} />
        <Route path="/what-is-a-week-number" element={<WhatWeek />} />
        <Route path="/weeks-in-a-year" element={<WeeksInYear />} />
        <Route path="/print/:year" element={<PrintCalendar />} />
        <Route path="/faq" element={<FAQPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
