import React from "react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <>
      <section className="app">
        <div className="breadcrumb">
          <Link to="/">Home</Link> / Privacy Policy
        </div>
        <h1>Privacy Policy</h1>
        <div className="prose">
          <p>Last Updated: June 23, 2026</p>
        </div>
        <h2>1. Information We Collect</h2>
        <div className="prose">
          <p>
            <strong>Log Files:</strong> Like most standard web servers, we
            follow a standard procedure of using log files. These files log
            visitors when they visit websites. The information collected
            includes internet protocol (IP) addresses, browser type, Internet
            Service Provider (ISP), date and time stamp, and referring/exit
            pages.
          </p>
          <p>
            <strong>Cookies and Web Beacons:</strong> We use basic cookies to
            store user preferences (such as your chosen theme or dark mode
            preference) and to optimize your user experience.
          </p>
        </div>

        <h2>2. How We Use Your Information</h2>
        <div className="prose">
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, operate, and maintain our website.</li>
            <li>Improve, personalize, and expand our platform’s tools.</li>
            <li>Understand and analyze how you use our website.</li>
            <li>Monitor and prevent technical bugs or fraudulent activity.</li>
          </ul>
        </div>

        <h2>3. Data Protection (GDPR & CCPA)</h2>
        <div className="prose">
          <p>
            We do not sell, rent, or share your personal data with third
            parties. Your browser's data stays local to your machine wherever
            possible. You have the right to request access to, correction of, or
            deletion of any minimal logs associated with your IP address.
          </p>
        </div>

        <h2>4. Consent</h2>
        <div className="prose">
          <p>
            By using our website, you hereby consent to our Privacy Policy and
            agree to its terms.
          </p>
        </div>
      </section>
    </>
  );
};

export default PrivacyPolicy;
