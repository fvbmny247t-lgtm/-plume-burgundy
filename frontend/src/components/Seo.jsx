import React from "react";
import { Helmet } from "react-helmet-async";
import { useLang } from "../context/LanguageContext";
import { SITE } from "../data/content";

const Seo = ({
  title,
  description,
  image,
  path = "",
  type = "website",
  jsonLd = null,
}) => {
  const { lang } = useLang();
  const finalTitle = title ? `${title} — ${SITE.name}` : `${SITE.name} — Boutique Hospitality in Burgundy`;
  const finalDesc = description ||
    (lang === "fr"
      ? "Plume Suites Collection — un boutique hotel intimiste au bord du canal de Bourgogne, à Fleurey-sur-Ouche. Deux suites éditoriales : Douceur & L'Envolée. Gastronomie, vignobles, vélo, slow living."
      : "Plume Suites Collection — an intimate boutique hotel by the Burgundy canal in Fleurey-sur-Ouche. Two editorial suites: Douceur & L'Envolée. Gastronomy, vineyards, cycling, slow living.");
  const finalImage = image || SITE.defaultImage;
  const url = `${SITE.url}${path}`;

  return (
    <Helmet>
      <html lang={lang} />
      <title>{finalTitle}</title>
      <meta name="description" content={finalDesc} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={url} />

      <meta property="og:type" content={type} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDesc} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:locale" content={lang === "fr" ? "fr_FR" : "en_US"} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDesc} />
      <meta name="twitter:image" content={finalImage} />

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};

export default Seo;
