// Shared "fact block" renderer for AI Overview / GEO extraction — a real
// key-value <dl> (not prose) so answer engines can lift a single fact without
// parsing a sentence. Every field must come from a value the page already
// computes elsewhere (FAQ text, structured data, or visible copy); this
// component never derives or invents a fact of its own.
//
// variant="list" (default) renders a labelled definition list inside a
// "prose" section, matching the "Nopeat faktat" block already shipped on
// month/year pages. variant="stats" reuses the .stat-row/.stat-box markup
// WorkingDays.jsx already had, so pages with that big-number layout don't get
// a second, duplicate fact block next to it — same data, one presentation.
const QuickFacts = ({ title = "Nopeat faktat", facts, variant = "list" }) => {
  if (variant === "stats") {
    return (
      <div className="stat-row">
        {facts.map(({ label, value }) => (
          <div className="stat-box" key={label}>
            <div className="n">{value}</div>
            <div className="l">{label}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className="prose quick-facts">
      <h2>{title}</h2>
      <dl>
        {facts.map(({ label, value }) => (
          <div className="qf-row" key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};

export default QuickFacts;
