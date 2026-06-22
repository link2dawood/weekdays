import React from "react";

const FAQ = () => {
  return (
    <div>
      <section className="app">
        <div className="sec-head">Frequently asked questions</div>
        <h2>Questions about weekly numbers</h2>
        <details open>
          <summary>What week is it now?</summary>
          <p>
            The current weekly issue is displayed at the top of this page as
            soon as you open it. The issue is calculated based on the date on
            your device, so it is always up-to-date.
          </p>
        </details>
        <details>
          <summary>Does the week start on Monday or Sunday?</summary>
          <p>
            In Finland, the week starts on Monday and ends on Sunday according
            to the ISO 8601 standard.
          </p>
        </details>
        <details>
          <summary>How is the week number calculated?</summary>
          <p>
            The first week of the year is the one that includes the first
            Thursday of the year, January 4. From then on, each period starting
            on a Monday increases the week number by one.
          </p>
        </details>
        <details>
          <summary>How many weeks are there in a year?</summary>
          <p>
            Most years have 52 weeks. Some years have 53 weeks when the year
            starts on a Thursday or a leap year starts on a Wednesday.
          </p>
        </details>
      </section>
    </div>
  );
};

export default FAQ;
