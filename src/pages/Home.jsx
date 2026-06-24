import React from "react";
import "../App.css";
import Weekcounter from "../components/Weekcounter";
import WeeklySearch from "../components/WeeklySearch";
import FAQ from "../components/FAQ";
import WeeksOfMonth from "../components/WeeksOfMonth";
import YearsWeek from "../components/YearsWeek";
import QuickLinks from "../components/QuickLinks";

const Home = () => {
  return (
    <>
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
