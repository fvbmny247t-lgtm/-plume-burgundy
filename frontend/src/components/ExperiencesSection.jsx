import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X, Plus, ArrowUpRight } from "lucide-react";
import { useLang } from "../context/LanguageContext";
import { EXPERIENCES, EXPERIENCES_SECTION } from "../data/content";
import Img from "./Img";

const ExperienceModal = ({ exp, onClose }) => {
  const { t } = useLang();
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] bg-ink/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
      onClick={onClose}
      data-testid="experience-modal"
    >
      <div
        className="bg-cream text-ink max-w-4xl w-full max-h-[90vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-56 md:h-auto md:min-h-full">
          <Img src={exp.image} alt={t(exp.title)} className="absolute inset-0 w-full h-full object-cover" />
        </div>
        <div className="p-7 md:p-10 relative">
          <button
            onClick={onClose}
            aria-label="Fermer"
            data-testid="experience-modal-close"
            className="absolute top-5 right-5 text-ink/60 hover:text-ink transition-colors"
          >
            <X size={24} strokeWidth={1.4} />
          </button>
          <p className="ps-overline text-terracotta">— {t({ fr: "Expérience", en: "Experience" })}</p>
          <h3 className="font-serif italic text-3xl md:text-4xl font-light leading-tight mt-3 pr-8">
            {t(exp.title)}
          </h3>
          <p className="font-serif italic text-2xl text-terracotta mt-3">{exp.price} €</p>
          <p className="font-sans text-sm md:text-base text-ink/80 leading-relaxed mt-5">
            {t(exp.editorial)}
          </p>

          <p className="ps-overline text-ink/60 mt-8 mb-4">{t(EXPERIENCES_SECTION.includesLabel)}</p>
          <ul className="space-y-3">
            {exp.includes.map((inc, i) => (
              <li key={i} className="flex items-start gap-3 font-sans text-sm text-ink/85">
                <span className="mt-1.5 w-1.5 h-1.5 bg-terracotta rounded-full shrink-0" />
                {t(inc)}
              </li>
            ))}
          </ul>

          <Link
            to="/reserver"
            data-testid="experience-modal-reserve"
            className="inline-flex items-center gap-3 mt-9 bg-terracotta hover:bg-terracottaDark text-cream transition-colors px-7 py-3 uppercase text-[11px] tracking-[0.3em]"
          >
            {t(EXPERIENCES_SECTION.ctaReserve)} <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

const ExperiencesSection = ({ embedded = false }) => {
  const { t } = useLang();
  const [active, setActive] = useState(null);

  return (
    <section
      className={`${embedded ? "bg-sand" : "bg-cream"} text-ink py-20 md:py-28 px-6 md:px-12`}
      data-testid="experiences-section"
    >
      <div className="max-w-7xl mx-auto">
        <div className="max-w-3xl">
          <p className="ps-overline text-ink/60">— {t(EXPERIENCES_SECTION.overline)}</p>
          <h2 className="font-serif italic text-5xl md:text-7xl font-light leading-[1] mt-4">
            {t(EXPERIENCES_SECTION.title)}
          </h2>
          <p className="font-sans text-base md:text-lg text-ink/80 leading-relaxed mt-6">
            {t(EXPERIENCES_SECTION.intro)}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-14">
          {EXPERIENCES.map((exp) => (
            <article
              key={exp.key}
              data-testid={`experience-card-${exp.key}`}
              className="group flex flex-col bg-cream border border-ink/10"
            >
              <button
                onClick={() => setActive(exp)}
                className="relative aspect-[4/3] overflow-hidden"
                aria-label={t(exp.title)}
              >
                <Img src={exp.image} alt={t(exp.title)} className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" />
                <span className="absolute top-4 right-4 bg-cream/95 text-ink font-serif italic text-lg px-3 py-1">
                  {exp.price} €
                </span>
              </button>
              <div className="p-6 md:p-7 flex flex-col flex-1">
                <h3 className="font-serif italic text-2xl md:text-3xl font-light leading-snug">
                  {t(exp.title)}
                </h3>
                <p className="font-sans text-sm text-ink/70 leading-relaxed mt-3 flex-1">
                  {t(exp.teaser)}
                </p>
                <button
                  onClick={() => setActive(exp)}
                  data-testid={`experience-detail-${exp.key}`}
                  className="inline-flex items-center gap-2 mt-6 text-ink hover:text-terracotta transition-colors uppercase text-[11px] tracking-[0.28em] border-b border-ink/30 hover:border-terracotta pb-1 self-start"
                >
                  <Plus size={13} /> {t(EXPERIENCES_SECTION.ctaDetail)}
                </button>
              </div>
            </article>
          ))}
        </div>

        <p className="font-sans text-xs md:text-sm text-ink/55 italic mt-10 max-w-2xl">
          {t(EXPERIENCES_SECTION.note)}
        </p>
      </div>

      {active && <ExperienceModal exp={active} onClose={() => setActive(null)} />}
    </section>
  );
};

export default ExperiencesSection;
