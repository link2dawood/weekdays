import React from "react";
import { Link } from "react-router-dom";

const TermsAndConditions = () => {
  return (
    <section className="app">
      <div className="breadcrumb">
        <Link to="/">Home</Link> / Terms And Conditions
      </div>
      <h1>Terms And Conditions</h1>
      <p>Last Updated: June 23, 2026</p>
      <div className="prose">
        <p>
          Welcome to <strong>Week Now</strong> These terms and conditions
          outline the rules and regulations for the use of our website and
          services.
        </p>
      </div>
      <h2>1. Acceptance of Terms</h2>
      <div className="prose">
        <p>
          By accessing this website, we assume you accept these terms and
          conditions in full. Do not continue to use <strong>Week Now</strong>{" "}
          if you do not agree to take all of the terms and conditions stated on
          this page.
        </p>
      </div>
      <h2>2. Intellectual Property</h2>
      <div className="prose">
        <p>
          Unless otherwise stated, <strong>Week Now</strong> owns the
          intellectual property rights for all material and code on this
          website. All intellectual property rights are reserved. You may view
          and print pages for your own personal use, subject to restrictions set
          in these terms.
        </p>
      </div>
      <p>You must not:</p>
      <ul>
        <li>
          Republish material or core source code from this website without
          explicit credit.
        </li>
        <li>Sell, rent, or sub-license material from the platform.</li>
        <li>Reproduce, duplicate, or copy material for commercial clones.</li>
      </ul>

      <h2>3. Disclaimer of Liability</h2>
      <div className="prose">
        <p>
          The tools and calculators on this website are provided on an "as-is"
          basis. While we strive for absolute technical and mathematical
          accuracy, we make no warranties that the calendar data or formulas are
          completely free of edge-case errors. <strong>Week Now</strong> will
          not be held liable for any scheduling disruptions, data discrepancies,
          or damages arising out of the use of our web calculators.
        </p>
      </div>
    </section>
  );
};

export default TermsAndConditions;
