import React from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { useLang } from "../context/LanguageContext";
import { HOME, SUITES, ART_BLOCKS, IMAGES, NAV } from "../data/content";
import Seo from "../components/Seo";
import SuitesSlider from "../components/SuitesSlider";
import RestaurantSection from "../components/RestaurantSection";
import ExperiencesSection from "../components/ExperiencesSection";
import Img from "../components/Img";

const Home = () => {
  const { t, lang } = useLang();

  const lodgingLd = {
    "@context": "https://schema.org",
    "@type": ["LodgingBusiness", "BedAndBreakfast"],
    "@id": "https://plumesuites.fr/#lodging",
    name: "Plume Suites",
    url: "https://plumesuites.fr",
    description: lang === "fr"
      ? "Deux suites de charme en Bourgogne, à Fleurey-sur-Ouche près de Dijon, au bord du canal de Bourgogne, au-dessus du restaurant Ô P'tit Repère du Goût."
      : "Two character suites in Burgundy, in Fleurey-sur-Ouche near Dijon, by the canal and above the Ô P'tit Repère du Goût restaurant.",
    image: "https://plumesuites.fr/og-image.jpg",
    telephone: "+33695488760",
    email: "hello@plumesuites.fr",
    priceRange: "€€€",
    numberOfRooms: 2,
    sameAs: ["https://www.instagram.com/plumesuites/"],
    address: {
      "@type": "PostalAddress",
      streetAddress: "8 Rue des Vieilles Carrières",
      addressLocality: "Fleurey-sur-Ouche",
      postalCode: "21410",
      addressRegion: "Côte-d'Or",
      addressCountry: "FR",
    },
    geo: { "@type": "GeoCoordinates", latitude: 47.2942, longitude: 4.8675 },
    starRating: { "@type": "Rating", ratingValue: "4" },
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Free Wi-Fi" },
      { "@type": "LocationFeatureSpecification", name: "Air conditioning" },
      { "@type": "LocationFeatureSpecification", name: "Restaurant" },
    ],
  };

  return (
    <div data-testid="home-page">
      <Seo path="/" jsonLd={lodgingLd} />
      {/* HERO — éditorial, vidéo only */}
      <section className="relative h-screen w-full overflow-hidden bg-ink" data-testid="hero-section">
        <div className="absolute inset-0">
          <video
            src={IMAGES.heroVideo}
            poster={IMAGES.heroPoster}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="w-full h-full object-cover"
            data-testid="hero-video"
          />
          {/* Subtle bottom gradient only — keep visual breath */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/15 to-ink/25" />
        </div>

        <div className="relative h-full w-full px-6 md:px-12 pt-28 md:pt-32 pb-10 flex flex-col justify-between text-cream">
          {/* Top-left: overline pill — darker for readability */}
          <div className="fade-in flex items-start gap-5">
            <div className="hidden md:block w-px h-12 bg-ink mt-1" />
            <div className="inline-flex flex-col bg-ink/40 backdrop-blur-sm px-4 py-2.5 rounded-sm">
              <p className="ps-overline text-cream/90">{t(HOME.heroLabel)}</p>
              <p className="font-serif italic text-sm md:text-base mt-0.5 text-cream/75">{t(HOME.heroLabelSub)}</p>
            </div>
          </div>

          {/* Center-bottom: huge title + minimal CTAs */}
          <div className="fade-in max-w-6xl pb-6 md:pb-8">
            <h1 className="font-serif text-[3.5rem] sm:text-7xl lg:text-[9rem] leading-[0.92] font-light italic whitespace-pre-line tracking-tight">
              {t(HOME.heroTitle)}
            </h1>
            <div className="mt-10 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
              <p className="font-sans text-sm md:text-base max-w-md opacity-90 leading-relaxed">
                {t(HOME.heroIntro)}
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <Link to="/reserver" data-testid="hero-cta-book" className="bg-terracotta hover:bg-terracottaDark text-cream px-7 py-3 uppercase text-[11px] tracking-[0.3em] transition-colors">
                  {t(HOME.heroCta)}
                </Link>
                <Link to="/sejours" data-testid="hero-cta-suites" className="text-cream/90 hover:text-cream uppercase text-[11px] tracking-[0.3em] border-b border-cream/40 hover:border-cream pb-1 transition-colors">
                  {t(HOME.heroCta2)}
                </Link>
                <a href="https://www.optitreperedugout.fr" target="_blank" rel="noreferrer" data-testid="hero-cta-restaurant" className="text-cream/90 hover:text-cream uppercase text-[11px] tracking-[0.3em] border-b border-cream/40 hover:border-cream pb-1 transition-colors">
                  {t({ fr: "Découvrir le restaurant", en: "Discover the restaurant" })}
                </a>
              </div>
            </div>
          </div>

          {/* Bottom-right signature */}
          <div className="absolute bottom-6 right-6 md:right-12 font-serif italic text-xs md:text-sm text-cream/70 tracking-wide">
            {t(HOME.heroCollection)}
          </div>

          {/* Subtle scroll arrow bottom-left */}
          <div className="absolute bottom-8 left-6 md:left-12 hidden md:flex flex-col items-center gap-2 text-cream/70">
            <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
            <ArrowDown size={14} className="animate-bounce" />
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

      {/* SUITES SLIDER */}
      <SuitesSlider />

      {/* RESTAURANT — Ô P'tit Repère du Goût (un étage plus bas) */}
      <RestaurantSection />

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
                <Img
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

      {/* PROLONGER L'EXPÉRIENCE */}
      <ExperiencesSection />

      {/* Mise en avant cartes cadeaux */}
      <section className="relative overflow-hidden" data-testid="giftcard-highlight-section">
        <div className="absolute inset-0">
          <Img src={IMAGES.restaurantChef} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-ink/70" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto text-center text-cream px-6 py-28 md:py-40">
          <p className="ps-overline text-terracotta mb-5">{t({ fr: "L'art d'offrir", en: "The art of giving" })}</p>
          <h2 className="font-serif italic font-light text-3xl md:text-4xl lg:text-5xl leading-[1.15] mb-6">
            {t({ fr: "Les plus beaux cadeaux sont ceux qui se vivent", en: "The finest gifts are the ones you live" })}
          </h2>
          <p className="font-sans text-base text-cream/75 max-w-xl mx-auto leading-relaxed mb-9">
            {t({
              fr: "Cette année, offrez une parenthèse hors du temps, une nuit d'exception ou un instant de gastronomie à partager.",
              en: "This year, offer a moment out of time, an exceptional night or a gastronomic instant to share.",
            })}
          </p>
          <Link to="/cartes-cadeaux" data-testid="home-giftcard-cta"
            className="inline-flex items-center gap-2 bg-cream text-ink px-8 py-4 rounded-full uppercase text-[11px] tracking-[0.25em] hover:bg-terracotta hover:text-cream transition-colors">
            {t({ fr: "Découvrir nos cartes cadeaux", en: "Discover our gift cards" })}
          </Link>
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
          <div className="md:col-span-7">
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="col-span-2 aspect-[16/10] overflow-hidden">
                <Img src={IMAGES.villageFleurey1} alt="Fleurey-sur-Ouche — La Grande Rue, carte postale ancienne" className="w-full h-full object-cover" />
              </div>
              <div className="aspect-[4/3] overflow-hidden">
                <Img src={IMAGES.villageFleurey2} alt="Fleurey-sur-Ouche — Le canal de Bourgogne, carte postale ancienne" className="w-full h-full object-cover" />
              </div>
              <div className="aspect-[4/3] overflow-hidden">
                <Img src={IMAGES.villageVineyard} alt="Dijon, scène de soir dans le centre historique" className="w-full h-full object-cover" />
              </div>
            </div>
            <p className="ps-overline text-ink/50 mt-4">
              {t({ fr: "— Fleurey-sur-Ouche · cartes postales anciennes", en: "— Fleurey-sur-Ouche · vintage postcards" })}
            </p>
          </div>
        </div>
      </section>

      {/* COSTA DEL SOL */}
      <section className="relative h-[85vh] overflow-hidden" data-testid="costa-section">
        <Img src={IMAGES.costa} alt="Costa del Sol 2027" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/65 via-ink/35 to-ink/20" />
        <div className="relative h-full w-full flex flex-col justify-center px-6 md:px-12 text-cream">
          <div className="max-w-3xl">
            <p className="ps-overline opacity-90">— {t(HOME.costaOverline)}</p>
            <h2 className="font-serif italic text-5xl md:text-7xl lg:text-[7rem] font-light mt-5 leading-[0.95]">
              {t(HOME.costaTitle)}
            </h2>
            <p className="font-sans text-base md:text-lg mt-6 max-w-xl opacity-95">{t(HOME.costaText)}</p>
            <div className="mt-8 flex items-center gap-6">
              <Link to="/journal/nouveau-chapitre-mediterraneen" className="border border-cream/60 hover:bg-cream hover:text-ink transition-colors px-6 py-3 uppercase text-[11px] tracking-[0.3em]">
                {t({ fr: "En savoir plus", en: "Learn more" })}
              </Link>
            </div>
          </div>
        </div>
        {/* Secondary detail image bottom-right */}
        <div className="hidden md:block absolute bottom-10 right-10 w-64 h-40 overflow-hidden shadow-2xl border-2 border-cream/30">
          <Img src={IMAGES.costaBg} alt="Costa del Sol, Andalousie — future adresse Plume Suites" className="w-full h-full object-cover" />
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
            <Img src={a.cover} alt={a.title[lang]} className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-105" />
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
