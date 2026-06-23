import React from "react";

const Information = () => {
  return (
    <>
      <section>
        <h2>Weekly issues in Finland</h2>
        <div className="prose">
          <p>
            In Finland, weeks are numbered according to the
            <strong> ISO 8601 standard</strong>. The week always starts on
            <strong> Monday</strong> and ends on Sunday, unlike in some
            countries such as the United States, where the week often starts on
            Sunday.
          </p>

          <p>
            The first week of the year is the one that contains the first
            Thursday of the year. In practice, Week 1 is always the week that
            includes<strong> January 4th</strong>. Because of this, the first
            week of the year may include the last days of December, or the first
            days of January may belong to the last week of the previous year.
          </p>

          <p>
            A typical year has <strong>52 weeks</strong>. Approximately every
            five to six years, there is a year with 53 weeks. This calculator
            automatically handles these differences, so the week number you see
            is always correct.
          </p>
        </div>
      </section>
    </>
  );
};

export default Information;
