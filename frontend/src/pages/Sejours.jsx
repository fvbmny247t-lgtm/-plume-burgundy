import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { useLang } from "../context/LanguageContext";
import { SEJOURS_PAGE, SUITES } from "../data/content";
import Seo from "../components/Seo";

const Sejours = () => {
  const { t } = useLang();
  return (
    <div data-testid="sejours-page" className="bg-cream text-ink">
      <Seo
        title={t({ fr: "Séjours — Douceur & L'Envolée", en: "Stays — Douceur & L'Envolée" })}
        description={t({
          fr: "Deux suites éditoriales au bord du canal de Bourgogne. Douceur, chaleureuse et familiale. L'Envolée, exclusive et lumineuse.",
          en: "Two editorial suites by the Burgundy canal. Douceur, warm and family-friendly. L'Envolée, exclusive and full of light.",
        })}
        path="/sejours"
      />
      <section className="pt-40 md:pt-52 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <p className="ps-overline text-ink/60">{t(SEJOURS_PAGE.heroOverline)}</p>
          <h1 className="font-serif italic text-6xl md:text-[10rem] leading-[0.92] font-light mt-6">
            {t(SEJOURS_PAGE.heroTitle)}
          </h1>
          <p className="font-sans text-base md:text-lg max-w-xl mt-8 text-ink/80 leading-relaxed">
            {t(SEJOURS_PAGE.heroIntro)}
          </p>
        </div>
      </section>

      <section className="pb-24">
        {Object.values(SUITES).map((s, i) => (
          <Link
            key={s.slug}
            to={`/sejours/${s.slug}`}
            data-testid={`sejours-suite-${s.slug}`}
            className="group block border-t border-ink/15"
          >
            <div className={`grid grid-cols-1 md:grid-cols-12 gap-0 ${i % 2 === 1 ? "md:[direction:rtl]" : ""}`}>
              <div className="md:col-span-7 h-[60vh] md:h-[85vh] overflow-hidden md:[direction:ltr]">
                <img
                  src={s.cover}
                  alt={t(s.name)}
                  className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-105"
                />
              </div>
              <div className="md:col-span-5 px-6 md:px-16 py-12 md:py-0 flex flex-col justify-center md:[direction:ltr]">
                <p className="ps-overline text-ink/60">{t({ fr: "Suite", en: "Suite" })} · 0{i + 1}</p>
                <h2 className="font-serif italic text-5xl md:text-7xl font-light mt-4 leading-[1]">
                  {t(s.name)}
                </h2>
                <p className="font-serif italic text-xl md:text-2xl mt-6 text-terracotta">
                  {t(s.overlay)}
                </p>
                <p className="font-sans text-sm md:text-base mt-6 text-ink/80 leading-relaxed">
                  {t(s.intro)}
                </p>
                <span className="inline-flex items-center gap-2 ps-overline mt-10 text-ink">
                  {t({ fr: "Découvrir la suite", en: "Discover the suite" })} <ArrowUpRight size={16} />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
};

export default Sejours;
