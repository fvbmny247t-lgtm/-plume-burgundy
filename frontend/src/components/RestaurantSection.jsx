import React, { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { useLang } from "../context/LanguageContext";
import { RESTAURANT } from "../data/content";
import Lightbox from "./Lightbox";

const RestaurantSection = () => {
  const { t } = useLang();
  const [lb, setLb] = useState(null);
  const imgs = RESTAURANT.images;

  return (
    <section className="bg-ink text-cream py-24 md:py-32 px-6 md:px-12" data-testid="restaurant-section">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Text */}
        <div className="lg:col-span-6 order-2 lg:order-1">
          <p className="ps-overline text-terracotta">— {t(RESTAURANT.overline)}</p>
          <h2 className="font-serif italic text-5xl md:text-7xl font-light leading-[1] mt-5">
            {t(RESTAURANT.title)}
          </h2>
          <p className="font-sans text-base md:text-lg text-cream/80 leading-relaxed mt-7 max-w-xl">
            {t(RESTAURANT.lead)}
          </p>
          <div className="mt-9">
            <p className="font-serif italic text-cream leading-snug text-[1.05rem] md:text-[1.3rem] lg:text-[1.4rem] md:whitespace-nowrap">
              « {t(RESTAURANT.quote)} »
            </p>
            <p className="font-sans uppercase tracking-[0.32em] text-[11px] text-terracotta mt-3">
              Michaël Felmann — Chef
            </p>
          </div>
          <p className="font-sans text-sm md:text-base text-cream/70 leading-relaxed mt-8 max-w-xl">
            {t(RESTAURANT.body)}
          </p>
          <a
            href={RESTAURANT.url}
            target="_blank"
            rel="noreferrer"
            data-testid="restaurant-cta"
            className="inline-flex items-center gap-3 mt-10 bg-terracotta hover:bg-terracottaDark text-cream transition-colors px-7 py-3 uppercase text-[11px] tracking-[0.3em]"
          >
            {t(RESTAURANT.cta)} <ArrowUpRight size={14} />
          </a>
        </div>

        {/* Image collage */}
        <div className="lg:col-span-6 order-1 lg:order-2 grid grid-cols-2 gap-3 md:gap-4">
          <button
            onClick={() => setLb(0)}
            className="col-span-2 aspect-[16/10] overflow-hidden group"
            data-testid="restaurant-img-0"
            aria-label="Agrandir"
          >
            <img src={imgs[0]} alt={RESTAURANT.name} className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" loading="lazy" />
          </button>
          {imgs.slice(1, 3).map((src, i) => (
            <button
              key={i}
              onClick={() => setLb(i + 1)}
              className="aspect-[4/5] overflow-hidden group"
              data-testid={`restaurant-img-${i + 1}`}
              aria-label="Agrandir"
            >
              <img src={src} alt={RESTAURANT.name} className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105" loading="lazy" />
            </button>
          ))}
        </div>
      </div>

      <Lightbox images={imgs} index={lb} onClose={() => setLb(null)} onChange={setLb} />
    </section>
  );
};

export default RestaurantSection;
