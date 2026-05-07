import PropTypes from "prop-types";
import { Helmet } from "react-helmet-async";

const SITE_NAME = "KelolaSaldo";
const BASE_URL = "https://react-startup-project.vercel.app";
const DEFAULT_OG_IMAGE = `${BASE_URL}/og_image.webp`;

export const Seo = ({
  title,
  description,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  noIndex = false,
  canonical,
  twitterCard = "summary_large_image",
}) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const pageUrl = canonical ? `${BASE_URL}${canonical}` : BASE_URL;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {canonical && <link rel="canonical" href={pageUrl} />}

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />

      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};

Seo.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string.isRequired,
  ogImage: PropTypes.string,
  ogType: PropTypes.string,
  noIndex: PropTypes.bool,
  canonical: PropTypes.string,
  twitterCard: PropTypes.string,
};
