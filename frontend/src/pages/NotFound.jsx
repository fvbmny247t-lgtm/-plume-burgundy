import React from "react";
import { Link } from "react-router-dom";
import Seo from "../components/Seo";
import { useLang } from "../context/LanguageContext";
import { NAV } from "../data/content";

// Real, visible 404 page. Marked noindex,nofollow and WITHOUT canonical so that
// unknown / legacy URLs (/es/, /de/, /new-page ...) are dropped from Google's index.
const NotFound = () => {
  const { t } = useLang();
  return (
    <div className="bg-cream text-ink min-h-[70vh] flex items-center" data-testid="notfound-page">
      <Seo
        title={t({ fr: "Page introuvable (404)", en: "Page not found (404)" })}
        description={t({
          fr: "Cette page n'existe pas ou a été supprimée.",
          en: "This page does not exist or has been removed.",
        })}
        noindex
      />
      <div className="max-w-2xl mx-auto text-center px-6 py-28">
        <p className="ps-overline text-terracotta">— 404</p>
        <h1 className="font-serif italic text-5xl md:text-7xl font-light leading-[1] mt-5">
          {t({ fr: "Cette page n'existe pas.", en: "This page doesn't exist." })}
        </h1>
        <p className="font-sans text-base md:text-lg text-ink/75 leading-relaxed mt-6">
          {t({
            fr: "La page que vous cherchez a peut-être été déplacée ou supprimée. Retrouvez le calme de la Bourgogne depuis nos pages principales.",
            en: "The page you are looking for may have moved or been removed. Find your way back through our main pages.",
          })}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
          <Link to="/" className="ps-btn-primary" data-testid="notfound-home">{t({ fr: "Accueil", en: "Home" })}</Link>
          <Link to="/sejours" className="ps-btn-outline" data-testid="notfound-sejours">{t(NAV.sejours)}</Link>
          <Link to="/journal" className="ps-btn-outline" data-testid="notfound-journal">{t(NAV.journal)}</Link>
          <Link to="/contact" className="ps-btn-outline" data-testid="notfound-contact">{t(NAV.contact)}</Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
