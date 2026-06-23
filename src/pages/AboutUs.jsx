import React from "react";
import { Link } from "react-router-dom";
const AboutUs = () => {
  return (
    <>
      <section className="app">
        <div className="breadcrumb">
          <Link to="/">Home</Link> / About Us
        </div>
        <h1>About Us</h1>
        <div className="prose">
          <p>
            Welcome to <strong>Week Now</strong>, your go-to digital tool for
            tracking time, calendar systems, and planning your year with
            precision.
          </p>
        </div>
        <h2>Who We Are?</h2>
        <div className="prose">
          <p>
            We are a team of passionate developers and productivity enthusiasts
            dedicated to simplifying how people interact with calendars. We
            believe that tracking time shouldn't be complicated, confusing, or
            bogged down by legacy regional calendar rules. That is why we built
            a streamlined, highly accurate platform based on global standards to
            give you instant clarity on your schedule.
          </p>
        </div>
        <h2>Our Mission</h2>
        <div className="prose">
          <p>
            Our mission is simple: to provide clean, lightning-fast, and
            accessible web tools that help individuals, project managers, and
            businesses stay aligned. By utilizing standard universal tracking
            systems like the ISO-8601 calendar system, we remove the guesswork
            from scheduling, date calculations, and tracking elapsed time.
          </p>
        </div>
        <h2>Why Choose Us?</h2>
        <ul>
          <li>
            <strong>Simplicity First:</strong> No clutter, no complicated setups
            just the exact date and time metrics you need, when you need them.
          </li>
          <li>
            <strong>Technical Accuracy:</strong> Built using robust logic
            parameters to ensure your data is perfectly synchronized with global
            standards.
          </li>
          <li>
            <strong>Accessible Anywhere:</strong> Fully optimized for mobile,
            desktop, and tablet browsers so you can check your schedule on the
            go.
          </li>
        </ul>
        <p>
          Thank you for making us a part of your daily productivity routine!
        </p>
      </section>
    </>
  );
};

export default AboutUs;
