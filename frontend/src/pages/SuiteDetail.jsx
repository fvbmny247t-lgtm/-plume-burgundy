import React from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import { SUITES, NAV } from "../data/content";
import Seo from "../components/Seo";

const SuiteDetail = () => {
  const { slug } = useParams();
  const { t, lang } = useLang();
  const suite = SUITES[slug];
  if (!suite) return <Navigate to="/sejours" replace />;

  const hotelLd = {
    "@context": "https://schema.org",
    "@type": "HotelRoom",
    name: suite.name[lang],
    description: suite.intro[lang],
    image: suite.cover,
    bed: { "@type": "BedDetails", typeOfBed: "Queen" },
    occupancy: { "@type": "QuantitativeValue", maxValue: 2 },
    containedInPlace: {
      "@type": "Hotel",
      name: "Plume Suites Collection",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Fleurey-sur-Ouche",
        addressRegion: "Bourgogne-Franche-Comté",
        addressCountry: "FR",
      },
    },
  };

  return (
    <div className="bg-cream text-ink" data-testid={`suite-page-${slug}`}>
      <Seo
        title={suite.name[lang]}
        description={suite.intro[lang]}
        image={suite.cover}
        path={`/sejours/${slug}`}
        type="article"
        jsonLd={hotelLd}
      />
      {/* HERO */}
      <section className="relative h-screen w-full overflow-hidden">
        <img src={suite.cover} alt={t(suite.name)} className="absolute inset-0 w-full h-full object-cover kenburns" />
        <div className="absolute inset-0 bg-ink/35" />
        <div className="absolute inset-0 px-6 md:px-12 pt-32 pb-16 flex flex-col justify-end text-cream">
          <p className="ps-overline opacity-90 mb-4">Plume Suites Collection</p>
          <h1 className="font-serif italic text-6xl md:text-[10rem] leading-[0.9] font-light max-w-5xl">
            {t(suite.name)}
          </h1>
        </div>
      </section>

      {/* INTRO */}
      <section className="py-24 md:py-40 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <p className="ps-overline text-ink/60 mb-6">{t({ fr: "Introduction", en: "Introduction" })}</p>
          <p className="font-serif italic text-3xl md:text-5xl leading-[1.15] font-light max-w-4xl">
            {t(suite.intro)}
          </p>
        </div>
      </section>

      {/* FULLSCREEN OVERLAY */}
      <section className="relative h-[85vh] overflow-hidden" data-testid={`suite-overlay-${slug}`}>
        <img
          src={suite.gallery[1]}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-terracotta/55" />
        <div className="absolute inset-0 flex items-center justify-center px-6 md:px-12">
          <p className="font-serif italic text-cream text-4xl md:text-7xl text-center font-light leading-[1.05] max-w-4xl">
            {t(suite.overlayTitle)}
          </p>
        </div>
      </section>

      {/* EDITORIAL */}
      <section className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-6">
            <p className="ps-overline text-ink/60 mb-6">{t({ fr: "Éditorial", en: "Editorial" })}</p>
            <h2 className="font-serif italic text-4xl md:text-6xl font-light leading-[1.05]">
              {t(suite.editorialTitle)}
            </h2>
          </div>
          <div className="md:col-span-6 md:pt-10">
            <p className="font-sans text-base md:text-lg leading-relaxed text-ink/85">
              {t(suite.editorial)}
            </p>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-1" data-testid={`suite-gallery-${slug}`}>
        {suite.gallery.slice(0, 3).map((g, idx) => (
          <div key={idx} className="aspect-[4/5] overflow-hidden">
            <img src={g} alt="" className="w-full h-full object-cover transition-transform duration-[1500ms] hover:scale-105" />
          </div>
        ))}
      </section>

      {/* EXPERIENCE */}
      <section className="bg-ink text-cream py-24 md:py-32 px-6 md:px-12" data-testid={`suite-experience-${slug}`}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <p className="ps-overline opacity-70 mb-4">{t({ fr: "Expérience", en: "Experience" })}</p>
            <h2 className="font-serif italic text-4xl md:text-6xl font-light leading-[1.05]">
              {t(suite.experienceTitle)}
            </h2>
          </div>
          <div className="md:col-span-7">
            <ul className="space-y-5 text-2xl md:text-3xl font-serif italic font-light">
              {suite.experience.map((e, i) => (
                <li key={i} className="border-b border-cream/15 pb-5 flex justify-between gap-4">
                  <span>{t(e)}</span>
                  <span className="font-sans text-xs uppercase tracking-[0.25em] text-cream/60 pt-3">0{i + 1}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* DETAILS */}
      <section className="py-24 md:py-32 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <p className="ps-overline text-ink/60 mb-6">{t(suite.detailsTitle)}</p>
          <h2 className="font-serif italic text-4xl md:text-6xl font-light max-w-3xl leading-[1.05] mb-12">
            {t({ fr: "Une suite, pensée dans le détail.", en: "A suite, considered down to the detail." })}
          </h2>
          <ul className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10 font-sans text-base md:text-lg text-ink/85">
            {suite.details.map((d, i) => (
              <li key={i} className="border-t border-ink/20 pt-4">
                <span className="ps-overline text-ink/50 block mb-1">· 0{i + 1}</span>
                {t(d)}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA RESERVATION */}
      <section className="bg-terracotta text-cream py-24 md:py-32 px-6 md:px-12 text-center" data-testid={`suite-cta-${slug}`}>
        <p className="ps-overline opacity-80 mb-6">{t({ fr: "Réservation", en: "Booking" })}</p>
        <h2 className="font-serif italic text-5xl md:text-7xl font-light max-w-3xl mx-auto leading-[1.05]">
          {t({ fr: "Réserver votre séjour.", en: "Book your stay." })}
        </h2>
        <div className="mt-12 flex items-center justify-center gap-6 flex-wrap">
          <Link
            to="/reserver"
            data-testid={`suite-book-${slug}`}
            className="inline-flex items-center justify-center bg-cream text-ink px-8 py-4 uppercase text-xs tracking-[0.28em] hover:bg-ink hover:text-cream transition-colors"
          >
            {t(NAV.book)}
          </Link>
          <Link
            to="/sejours"
            data-testid={`suite-back-${slug}`}
            className="ps-btn-outline-light"
          >
            {t({ fr: "L'autre suite", en: "The other suite" })}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default SuiteDetail;
