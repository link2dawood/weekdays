import { Helmet } from "react-helmet-async";

// Sets this page's <title>/description/robots for as long as it's mounted;
// react-helmet-async restores the previous values automatically on unmount,
// so client-side navigation between routes always shows the right tab title.
const SEO = ({ title, description, robots }) => (
  <Helmet>
    <title>{title}</title>
    {description && <meta name="description" content={description} />}
    {robots && <meta name="robots" content={robots} />}
  </Helmet>
);

export default SEO;
