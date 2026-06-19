import React from "react";
import { useLang } from "../context/LanguageContext";
import { ART_BLOCKS, ARTDEVIVRE_PAGE, IMAGES, HOME } from "../data/content";
import Seo from "../components/Seo";

const ArtDeVivre = () => {
  const { t } = useLang();
  return (
    <div className="bg-cream text-ink" data-testid="art-de-vivre-page">
      <Seo
        title={t({ fr: "Art de vivre — Bourgogne, canal & vignobles", en: "Lifestyle — Burgundy, canal & vineyards" })}
        description={t({
          fr: "Gastronomie, vélo le long du canal de Bourgogne, vignobles bourguignons, slow living — l'art de vivre Plume Suites.",
          en: "Gastronomy, cycling along the Burgundy canal, vineyards, slow living — the Plume Suites way.",
        })}
        path="/art-de-vivre"
      />
      {/* HERO */}
      <section className="relative h-[80vh] overflow-hidden">
        <img src={IMAGES.artDeVivreHeader} alt="" className="absolute inset-0 w-full h-full object-cover kenburns" />
        <div className="absolute inset-0 bg-ink/35" />
        <div className="absolute inset-0 px-6 md:px-12 pt-32 pb-16 flex flex-col justify-end text-cream">
          <p className="ps-overline opacity-90 mb-4">— {t(ARTDEVIVRE_PAGE.heroOverline)}</p>
          <h1 className="font-serif italic text-5xl md:text-7xl lg:text-[7rem] leading-[0.95] font-light max-w-4xl">
            {t(ARTDEVIVRE_PAGE.heroTitle)}
          </h1>
          <p className="font-sans text-base md:text-lg max-w-xl mt-7 opacity-90">{t(ARTDEVIVRE_PAGE.heroIntro)}</p>
        </div>
      </section>

      {/* INTRO QUOTE */}
      <section className="py-24 md:py-40 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <p className="font-serif italic text-3xl md:text-6xl leading-[1.1] font-light">
            {t(HOME.artIntro)}
          </p>
        </div>
      </section>

      {/* ALTERNATING BLOCKS */}
      {ART_BLOCKS.map((b, i) => (
        <section
          key={b.key}
          data-testid={`art-page-block-${b.key}`}
          className={`grid grid-cols-1 md:grid-cols-12 ${i % 2 === 1 ? "bg-ink text-cream" : "bg-cream text-ink"}`}
        >
          <div className={`md:col-span-7 h-[70vh] overflow-hidden ${i % 2 === 1 ? "md:order-2" : ""}`}>
            <img src={b.image} alt={t(b.title)} className="w-full h-full object-cover" />
          </div>
          <div className={`md:col-span-5 px-6 md:px-16 py-16 md:py-0 flex flex-col justify-center ${i % 2 === 1 ? "md:order-1" : ""}`}>
            <p className="ps-overline opacity-70">{t(b.overline)}</p>
            <h2 className="font-serif italic text-4xl md:text-6xl font-light mt-4 leading-[1.05]">
              {t(b.title)}
            </h2>
            <p className="font-sans text-base md:text-lg mt-6 opacity-85 leading-relaxed max-w-md">
              {t(b.text)}
            </p>
          </div>
        </section>
      ))}

      {/* CLOSING */}
      <section className="bg-terracotta text-cream py-32 md:py-48 px-6 md:px-12 text-center">
        <p className="ps-overline opacity-80 mb-8">— Plume</p>
        <h2 className="font-serif italic text-5xl md:text-8xl font-light leading-[1.02] max-w-4xl mx-auto">
          {t(ARTDEVIVRE_PAGE.closingTitle)}
        </h2>
        <p className="font-sans text-base md:text-lg mt-10 max-w-2xl mx-auto opacity-90">
          {t(ARTDEVIVRE_PAGE.closing)}
        </p>
      </section>
    </div>
  );
};

export default ArtDeVivre;
