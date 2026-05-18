import React from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { useLang } from "../context/LanguageContext";
import { HOME, SUITES, ART_BLOCKS, IMAGES, NAV } from "../data/content";

const Home = () => {
  const { t } = useLang();

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative h-screen w-full overflow-hidden" data-testid="hero-section">
        <div className="absolute inset-0">
          <img
            src={IMAGES.hero}
            alt="Plume Suites — Bourgogne"
            className="w-full h-full object-cover kenburns"
          />
          <div className="absolute inset-0 bg-ink/35" />
        </div>

        <div className="relative h-full w-full px-6 md:px-12 pt-32 md:pt-40 pb-16 flex flex-col justify-between text-cream">
          <div className="max-w-2xl fade-in">
            <p className="ps-overline opacity-90">{t(HOME.heroLabel)}</p>
            <p className="font-serif italic text-base md:text-lg mt-2 opacity-90">{t(HOME.heroLabelSub)}</p>
          </div>

          <div className="fade-in max-w-5xl">
            <h1 className="font-serif text-5xl sm:text-7xl lg:text-[8rem] leading-[0.95] font-light italic">
              {t(HOME.heroTitle)}
            </h1>
            <p className="font-sans text-sm md:text-base mt-8 max-w-xl opacity-90 leading-relaxed">
              {t(HOME.heroIntro)}
            </p>
            <div className="mt-10 flex items-center gap-6 flex-wrap">
              <Link to="/sejours" data-testid="hero-cta-suites" className="ps-btn-outline-light">
                {t(HOME.heroCta)}
              </Link>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] opacity-80">
                <ArrowDown size={14} /> Scroll
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 right-6 md:right-12 font-serif italic text-sm md:text-base text-cream/80">
            {t(HOME.heroCollection)}
          </div>
        </div>
      </section>

      {/* EDITORIAL INTRO */}
      <section className="bg-cream text-ink py-24 md:py-40 px-6 md:px-12" data-testid="editorial-section">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            <p className="ps-overline text-ink/60 mb-6">{t(HOME.editorialOverline)}</p>
            <h2 className="font-serif italic text-5xl md:text-7xl leading-[1.02] font-light">
              {t(HOME.editorialTitle)}
            </h2>
          </div>
          <div className="lg:col-span-5 flex flex-col gap-6 lg:pt-12">
            <p className="font-sans text-base leading-relaxed">{t(HOME.editorialP1)}</p>
            <p className="font-serif italic text-2xl md:text-3xl leading-snug">
              {t(HOME.editorialSide)}
            </p>
            <p className="font-sans text-sm text-ink/70 leading-relaxed">{t(HOME.editorialP2)}</p>
          </div>
        </div>
      </section>

      {/* SUITES SECTION */}
      <section className="bg-cream pb-24" data-testid="suites-section">
        <div className="max-w-7xl mx-auto px-6 md:px-12 mb-16">
          <p className="ps-overline text-ink/60">{t(HOME.suitesOverline)}</p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mt-4">
            <h2 className="font-serif italic text-4xl md:text-6xl font-light leading-tight max-w-3xl">
              {t(HOME.suitesTitle)}
            </h2>
            <p className="font-sans text-sm md:text-base max-w-md text-ink/80 leading-relaxed">
              {t(HOME.suitesIntro)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
          {Object.values(SUITES).map((s) => (
            <Link
              key={s.slug}
              to={`/sejours/${s.slug}`}
              data-testid={`suite-card-${s.slug}`}
              className="group relative h-[80vh] overflow-hidden block"
            >
              <img
                src={s.cover}
                alt={t(s.name)}
                className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-ink/25 group-hover:bg-ink/35 transition-colors" />
              <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-between text-cream">
                <p className="ps-overline opacity-90">{t({ fr: "Suite", en: "Suite" })}</p>
                <div>
                  <h3 className="font-serif italic text-4xl md:text-5xl leading-[1.05] mb-4">
                    {t(s.name)}
                  </h3>
                  <p className="font-sans text-sm max-w-sm opacity-90 mb-6">{t(s.overlay)}</p>
                  <span className="inline-flex items-center gap-2 ps-overline">
                    {t({ fr: "Découvrir", en: "Discover" })} <ArrowUpRight size={16} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ART DE VIVRE BENTO */}
      <section className="bg-cream py-24 md:py-32 px-6 md:px-12" data-testid="art-section">
        <div className="max-w-7xl mx-auto">
          <p className="ps-overline text-ink/60">{t(HOME.artOverline)}</p>
          <h2 className="font-serif italic text-5xl md:text-7xl font-light mt-4 mb-6 leading-[1]">
            {t(HOME.artTitle)}
          </h2>
          <p className="font-sans text-base md:text-lg max-w-2xl text-ink/80 leading-relaxed mb-16">
            {t(HOME.artIntro)}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
            {ART_BLOCKS.map((b, i) => (
              <div
                key={b.key}
                data-testid={`art-block-${b.key}`}
                className={`group relative overflow-hidden ${
                  i === 0 ? "md:col-span-7 md:row-span-2 h-[60vh] md:h-[80vh]" :
                  i === 1 ? "md:col-span-5 h-[50vh]" :
                  i === 2 ? "md:col-span-5 h-[50vh]" :
                  "md:col-span-7 h-[50vh]"
                }`}
              >
                <img
                  src={b.image}
                  alt={t(b.title)}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
                <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-end text-cream">
                  <p className="ps-overline opacity-90">{t(b.overline)}</p>
                  <h3 className="font-serif italic text-3xl md:text-4xl mt-2">{t(b.title)}</h3>
                  <p className="font-sans text-sm mt-2 max-w-sm opacity-90">{t(b.text)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex justify-end">
            <Link to="/art-de-vivre" data-testid="art-section-cta" className="ps-btn-outline">
              {t(NAV.artDeVivre)}
            </Link>
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section className="bg-terracotta text-cream py-32 md:py-48 px-6 md:px-12" data-testid="quote-section">
        <div className="max-w-5xl mx-auto text-center">
          <p className="ps-overline opacity-80 mb-10">— Édito</p>
          <p className="font-serif italic text-3xl md:text-6xl leading-[1.1] font-light">
            « {t(HOME.quote) } »
          </p>
          <p className="ps-overline opacity-80 mt-10">{t(HOME.quoteAttr)}</p>
        </div>
      </section>

      {/* LOCATION */}
      <section className="bg-cream py-24 md:py-32 px-6 md:px-12" data-testid="location-section">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
          <div className="md:col-span-5">
            <p className="ps-overline text-ink/60">{t(HOME.locationOverline)}</p>
            <h2 className="font-serif italic text-5xl md:text-7xl font-light mt-4 leading-[1] mb-8">
              {t(HOME.locationTitle)}
            </h2>
            <p className="font-sans text-base text-ink/80 leading-relaxed max-w-md">
              {t(HOME.locationText)}
            </p>
          </div>
          <div className="md:col-span-7 h-[60vh] overflow-hidden">
            <img src={IMAGES.canal} alt="Bourgogne canal" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* COSTA DEL SOL */}
      <section className="relative h-[80vh] overflow-hidden" data-testid="costa-section">
        <img src={IMAGES.costa} alt="Costa del Sol 2027" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-ink/40" />
        <div className="relative h-full w-full flex flex-col justify-center px-6 md:px-12 text-cream">
          <div className="max-w-3xl">
            <p className="ps-overline opacity-80">{t(HOME.costaOverline)}</p>
            <h2 className="font-serif italic text-5xl md:text-8xl font-light mt-4 leading-[0.95]">
              {t(HOME.costaTitle)}
            </h2>
            <p className="font-sans text-base mt-6 max-w-xl opacity-90">{t(HOME.costaText)}</p>
          </div>
        </div>
      </section>

      {/* JOURNAL PREVIEW */}
      <section className="bg-cream py-24 md:py-32 px-6 md:px-12" data-testid="journal-preview-section">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div>
              <p className="ps-overline text-ink/60">{t(HOME.journalOverline)}</p>
              <h2 className="font-serif italic text-4xl md:text-6xl font-light mt-4 leading-tight max-w-2xl">
                {t(HOME.journalTitle)}
              </h2>
            </div>
            <p className="font-sans text-sm md:text-base max-w-md text-ink/80">{t(HOME.journalIntro)}</p>
          </div>

          <JournalPreview />

          <div className="mt-12 flex justify-end">
            <Link to="/journal" data-testid="home-journal-cta" className="ps-btn-outline">
              {t({ fr: "Tout le journal", en: "Read the journal" })}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

import axios from "axios";
const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const JournalPreview = () => {
  const { t, lang } = useLang();
  const [items, setItems] = React.useState([]);
  React.useEffect(() => {
    axios.get(`${API}/journal`).then((r) => setItems(r.data.slice(0, 3))).catch(() => {});
  }, []);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
      {items.map((a) => (
        <Link
          to={`/journal/${a.slug}`}
          key={a.slug}
          data-testid={`journal-preview-${a.slug}`}
          className="group block"
        >
          <div className="aspect-[4/5] overflow-hidden mb-5">
            <img src={a.cover} alt={a.title[lang]} className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-105" />
          </div>
          <p className="ps-overline text-ink/60">{a.category[lang]}</p>
          <h3 className="font-serif italic text-2xl md:text-3xl mt-2 leading-snug">{a.title[lang]}</h3>
          <p className="font-sans text-sm mt-3 text-ink/70 leading-relaxed">{a.excerpt[lang]}</p>
        </Link>
      ))}
    </div>
  );
};

export default Home;
