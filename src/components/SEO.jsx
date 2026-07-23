import { Helmet } from "react-helmet-async";

// Sets this page's <title>/description/robots/canonical for as long as it's
// mounted; react-helmet-async restores the previous values automatically on
// unmount, so client-side navigation between routes always shows the right
// tab title. `canonical` matters most for routes that are never prerendered
// (/year, /week, /month, /print) — without it they'd keep whatever canonical
// was baked into the index.html shell they were served from (the homepage's).
const SEO = ({ title, description, robots, canonical }) => (
  <Helmet>
    <title>{title}</title>
    {description && <meta name="description" content={description} />}
    {robots && <meta name="robots" content={robots} />}
    {canonical && <link rel="canonical" href={canonical} />}
  </Helmet>
);

export default SEO;
