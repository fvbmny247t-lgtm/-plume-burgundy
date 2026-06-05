import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeft, ArrowUpRight } from "lucide-react";
import { useLang } from "../context/LanguageContext";
import { SUITES, HOME } from "../data/content";

const SuitesSlider = () => {
  const { t } = useLang();
  const suites = Object.values(SUITES);
  const [active, setActive] = useState(0);
  const suite = suites[active];

  const go = (delta) => setActive((i) => (i + delta + suites.length) % suites.length);
  const num = String(active + 1).padStart(2, "0");

  return (
    <section className="bg-cream py-20 md:py-32 px-6 md:px-12" data-testid="suites-slider">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 mb-12 md:mb-20 items-start">
          <div className="md:col-span-7">
            <p className="ps-overline text-ink/60 mb-5">— {t(HOME.suitesOverline)}</p>
            <h2 className="font-serif italic text-5xl md:text-7xl lg:text-[6.5rem] font-light leading-[0.95]">
              {t(HOME.suitesTitle)}
            </h2>
          </div>
          <div className="md:col-span-5 md:pt-12 md:text-right">
            <p className="font-sans text-base md:text-lg text-ink/80 leading-relaxed md:ml-auto max-w-md">
              {t(HOME.suitesIntro)}
            </p>
          </div>
        </div>

        {/* Big visual — DESKTOP: overlay content; MOBILE: just image + title */}
        <div className="relative h-[60vh] md:h-[85vh] overflow-hidden">
          <img
            key={suite.slug + "-img"}
            src={suite.cover}
            alt={t(suite.name)}
            className="absolute inset-0 w-full h-full object-cover fade-in"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink/55 via-ink/15 to-ink/30 md:via-ink/10" />

          {/* Top-left overline + tier */}
          <div className="absolute top-6 md:top-10 left-5 md:left-10 text-cream flex items-center gap-3 flex-wrap">
            <p className="ps-overline opacity-90">{num} — Plume Suites Collection</p>
            {suite.tier && (
              <span className="ps-overline border border-cream/70 px-2 py-0.5 text-cream/95" data-testid={`slider-tier-${suite.slug}`}>
                {t(suite.tier)}
              </span>
            )}
          </div>

          {/* Bottom-left content */}
          <div className="absolute bottom-6 md:bottom-12 left-5 md:left-10 text-cream max-w-xl pr-4">
            <h3
              key={suite.slug + "-title"}
              data-testid={`slider-title-${suite.slug}`}
              className="font-serif italic text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-light leading-[0.9] fade-in"
            >
              {t(suite.short)}
            </h3>
            <p className="hidden md:block font-serif italic text-lg md:text-2xl mt-5 md:mt-6 opacity-95 leading-snug max-w-sm">
              {t(suite.overlay)}
            </p>
          </div>

          {/* Bottom-right stats (DESKTOP only — mobile shows them below) */}
          <div className="hidden md:flex absolute bottom-14 right-10 text-cream items-end gap-12">
            <div className="text-center" data-testid={`slider-stat-rooms-${suite.slug}`}>
              <div className="font-serif italic text-5xl md:text-6xl font-light leading-none">{suite.stats.rooms}</div>
              <p className="ps-overline opacity-80 mt-2">{t(suite.stats.labels.rooms)}</p>
            </div>
            <div className="text-center" data-testid={`slider-stat-guests-${suite.slug}`}>
              <div className="font-serif italic text-5xl md:text-6xl font-light leading-none">{suite.stats.guests}</div>
              <p className="ps-overline opacity-80 mt-2">{t(suite.stats.labels.guests)}</p>
            </div>
          </div>
        </div>

        {/* Mobile-only: tagline + stats + CTA (no overlap with the image) */}
        <div className="md:hidden mt-6">
          <p className="font-serif italic text-lg text-terracotta leading-snug">
            {t(suite.overlay)}
          </p>
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-ink/15">
            <div data-testid={`slider-mobile-stat-rooms-${suite.slug}`}>
              <div className="font-serif italic text-4xl font-light leading-none">{suite.stats.rooms}</div>
              <p className="ps-overline text-ink/60 mt-2">{t(suite.stats.labels.rooms)}</p>
            </div>
            <div data-testid={`slider-mobile-stat-guests-${suite.slug}`}>
              <div className="font-serif italic text-4xl font-light leading-none">{suite.stats.guests}</div>
              <p className="ps-overline text-ink/60 mt-2">{t(suite.stats.labels.guests)}</p>
            </div>
            <div>
              <div className="font-serif italic text-2xl font-light leading-none mt-2">{suite.stats.size}</div>
              <p className="ps-overline text-ink/60 mt-2">{t(suite.stats.labels.size)}</p>
            </div>
          </div>
          <Link
            to={`/sejours/${suite.slug}`}
            data-testid={`slider-mobile-cta-${suite.slug}`}
            className="inline-flex items-center gap-3 mt-7 border border-ink text-ink hover:bg-ink hover:text-cream transition-colors px-6 py-3 uppercase text-[11px] tracking-[0.3em] w-full justify-center"
          >
            {t(HOME.suitesCta)} <ArrowUpRight size={14} />
          </Link>
        </div>

        {/* Desktop CTA — overlay bottom-left below title */}
        <Link
          to={`/sejours/${suite.slug}`}
          data-testid={`slider-cta-${suite.slug}`}
          className="hidden md:inline-flex items-center gap-3 mt-8 border border-ink/80 hover:bg-ink hover:text-cream transition-colors px-7 py-3 uppercase text-[11px] tracking-[0.3em]"
        >
          {t(HOME.suitesCta)} — {t(suite.short)} <ArrowUpRight size={14} />
        </Link>

        {/* Footer controls */}
        <div className="mt-8 md:mt-12 flex items-center justify-between pt-6 border-t border-ink/15">
          <div className="flex items-center gap-6 md:gap-10">
            {suites.map((s, i) => (
              <button
                key={s.slug}
                data-testid={`slider-tab-${s.slug}`}
                onClick={() => setActive(i)}
                className="relative uppercase text-[11px] tracking-[0.3em] transition-colors pb-1"
              >
                {i === active && (
                  <span className="inline-block mr-3 text-terracotta">—</span>
                )}
                <span className={i === active ? "text-ink" : "text-ink/40 hover:text-ink/70"}>
                  {t(s.short)}
                </span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              data-testid="slider-prev"
              onClick={() => go(-1)}
              className="w-10 h-10 border border-ink/30 hover:bg-ink hover:text-cream transition-colors flex items-center justify-center"
              aria-label="Previous"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              data-testid="slider-next"
              onClick={() => go(1)}
              className="w-10 h-10 border border-ink/30 hover:bg-ink hover:text-cream transition-colors flex items-center justify-center"
              aria-label="Next"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuitesSlider;
