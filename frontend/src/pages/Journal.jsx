import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import { JOURNAL_PAGE } from "../data/content";
import Seo from "../components/Seo";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Journal = () => {
  const { t, lang } = useLang();
  const [items, setItems] = useState([]);

  useEffect(() => {
    axios.get(`${API}/journal`).then((r) => setItems(r.data)).catch(() => {});
  }, []);

  return (
    <div className="bg-cream text-ink" data-testid="journal-page">
      <Seo
        title={t({ fr: "Journal — Bourgogne, vélo, gastronomie & vignobles", en: "Journal — Burgundy, cycling, gastronomy & vineyards" })}
        description={t({
          fr: "Inspirations slow living, itinéraires à vélo le long du canal de Bourgogne, escapades dans les vignobles, table de saison — le carnet éditorial de Plume Suites.",
          en: "Slow living inspirations, cycling itineraries along the Burgundy canal, vineyard escapes, seasonal table — the editorial notebook of Plume Suites.",
        })}
        path="/journal"
      />
      <section className="pt-36 md:pt-44 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <p className="ps-overline text-ink/60">— {t(JOURNAL_PAGE.heroOverline)}</p>
          <h1 className="font-serif italic text-5xl md:text-7xl lg:text-[7rem] leading-[0.95] font-light mt-5">
            {t(JOURNAL_PAGE.heroTitle)}
          </h1>
          <p className="font-sans text-base md:text-lg max-w-xl mt-8 text-ink/80 leading-relaxed">
            {t(JOURNAL_PAGE.heroIntro)}
          </p>
        </div>
      </section>

      <section className="pb-32 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          {items.length === 0 && (
            <p className="font-serif italic text-2xl text-ink/50">…</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-y-20 md:gap-12">
            {items.map((a, i) => {
              const span = i === 0 ? "md:col-span-12" : i % 3 === 1 ? "md:col-span-7" : i % 3 === 2 ? "md:col-span-5" : "md:col-span-6";
              const aspect = i === 0 ? "aspect-[16/8]" : "aspect-[4/5]";
              return (
                <Link
                  key={a.slug}
                  to={`/journal/${a.slug}`}
                  data-testid={`journal-card-${a.slug}`}
                  className={`group block ${span}`}
                >
                  <div className={`${aspect} overflow-hidden mb-5`}>
                    <img src={a.cover} alt={a.title[lang]} className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-105" />
                  </div>
                  <div className="flex items-center gap-4 mb-2">
                    <span className="ps-overline text-terracotta">{a.category[lang]}</span>
                    <span className="text-xs text-ink/50 font-sans">{a.read_time[lang]}</span>
                  </div>
                  <h2 className={`font-serif italic font-light leading-[1.05] ${i === 0 ? "text-5xl md:text-7xl" : "text-3xl md:text-4xl"}`}>
                    {a.title[lang]}
                  </h2>
                  <p className="font-sans text-sm md:text-base mt-4 text-ink/75 leading-relaxed max-w-2xl">
                    {a.excerpt[lang]}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Journal;
