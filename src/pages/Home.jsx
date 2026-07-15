import React from "react";
import "../App.css";
import SEO from "../components/SEO";
import { routeMeta, homeDescription } from "../data/seo";
import Weekcounter from "../components/Weekcounter";
import WeeklySearch from "../components/WeeklySearch";
import FAQ from "../components/FAQ";
import WeeksOfMonth from "../components/WeeksOfMonth";
import YearsWeek from "../components/YearsWeek";
import QuickLinks from "../components/QuickLinks";

const Home = () => {
  return (
    <>
      {/* homeDescription() is computed live, so the week number in the meta
          description is always current for JS-rendering crawlers and users. */}
      <SEO title={routeMeta["/"].title} description={homeDescription()} />
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
