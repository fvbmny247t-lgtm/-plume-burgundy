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
  noindex = false,
}) => {
  const { lang } = useLang();
  const finalTitle = title ? `${title} — ${SITE.name}` : `${SITE.name} — Suites de charme en Bourgogne, près de Dijon`;
  const finalDesc = description ||
    (lang === "fr"
      ? "Plume Suites, deux suites de charme au cœur de la Bourgogne, à Fleurey-sur-Ouche près de Dijon. Au-dessus du restaurant Ô P'tit Repère du Goût, entre canal, vignobles et art de vivre bourguignon."
      : "Plume Suites — character suites in the heart of Burgundy, in Fleurey-sur-Ouche near Dijon. Above the Ô P'tit Repère du Goût restaurant, between canal, vineyards and the Burgundy art of living.");
  const rawImage = image || SITE.defaultImage;
  const finalImage = rawImage.startsWith("http") ? rawImage : `${SITE.url}${rawImage}`;
  const url = `${SITE.url}${path}`;

  return (
    <Helmet>
      <html lang={lang} />
      <title>{finalTitle}</title>
      <meta name="description" content={finalDesc} />
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow"} />
      {!noindex && <link rel="canonical" href={url} />}

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
