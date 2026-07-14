import React from "react";
import { Link } from "react-router-dom";
import { featuredFaqs } from "../data/faqs";

const FAQ = () => {
  return (
    <>
      <section>
        <h2 className="mh">Usein kysytyt kysymykset</h2>
        {featuredFaqs.map((item, i) => (
          <details key={item.q} open={i === 0}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
        <p className="faq-more">
          <Link to="/faq" onClick={() => window.scrollTo(0, 0)}>
            Katso kaikki usein kysytyt kysymykset →
          </Link>
        </p>
      </section>
    </>
  );
};

export default FAQ;
