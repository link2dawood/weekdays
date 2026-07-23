import React from "react";
import "../App.css";
import SEO from "../components/SEO";
import { homeMeta } from "../data/seo";
import Weekcounter from "../components/Weekcounter";
import WeeklySearch from "../components/WeeklySearch";
import FAQ from "../components/FAQ";
import WeeksOfMonth from "../components/WeeksOfMonth";
import YearsWeek from "../components/YearsWeek";
import QuickLinks from "../components/QuickLinks";

const Home = () => {
  // Computed directly in the render body (not an effect) so it's correct
  // during SSR/prerendering too — an effect-based computation (like
  // Weekcounter's) would render as build-time-empty state on the server.
  const meta = homeMeta(new Date());
  return (
    <>
      <SEO title={meta.title} description={meta.description} />
      <div className="app">
        <Weekcounter />
        <WeeklySearch />
        <WeeksOfMonth />
        <YearsWeek />
        <QuickLinks />
        <FAQ />
      </div>
    </>
  );
};

export default Home;
