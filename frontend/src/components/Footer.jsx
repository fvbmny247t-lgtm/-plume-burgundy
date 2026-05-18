import React from "react";
import { Link } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import { FOOTER, NAV, SMOOBU_BOOKING_URL } from "../data/content";
import PlumeLogo from "./PlumeLogo";

const Footer = () => {
  const { t } = useLang();

  return (
    <footer
      className="bg-ink text-cream pt-24 pb-10 px-6 md:px-12"
      data-testid="main-footer"
    >
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12">
        <div className="md:col-span-4">
          <PlumeLogo />
          <p className="mt-6 font-serif italic text-2xl leading-tight max-w-xs">
            {t(FOOTER.tagline)}
          </p>
          <a
            href={SMOOBU_BOOKING_URL}
            target="_blank"
            rel="noreferrer"
            data-testid="footer-book-button"
            className="ps-btn-outline-light mt-8"
          >
            {t(NAV.book)}
          </a>
        </div>

        <div className="md:col-span-3">
          <h4 className="ps-overline text-cream/70 mb-4">{t(FOOTER.addressTitle)}</h4>
          <p className="font-sans text-sm leading-relaxed text-cream/90">{t(FOOTER.address)}</p>
          <h4 className="ps-overline text-cream/70 mt-8 mb-4">{t(FOOTER.futureTitle)}</h4>
          <p className="font-sans text-sm text-cream/90">{t(FOOTER.future)}</p>
        </div>

        <div className="md:col-span-3">
          <h4 className="ps-overline text-cream/70 mb-4">{t(FOOTER.distancesTitle)}</h4>
          <ul className="space-y-2.5 font-sans text-sm text-cream/90">
            {FOOTER.distances.map((d, i) => (
              <li key={i} className="flex justify-between gap-4 border-b border-cream/10 pb-2">
                <span>{t(d.place)}</span>
                <span className="text-cream/60 italic font-serif">{t(d.value)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <h4 className="ps-overline text-cream/70 mb-4">{t(FOOTER.navTitle)}</h4>
          <ul className="space-y-2 text-sm font-sans">
            <li><Link data-testid="footer-link-art" to="/art-de-vivre" className="hover:text-terracotta transition-colors">{t(NAV.artDeVivre)}</Link></li>
            <li><Link data-testid="footer-link-sejours" to="/sejours" className="hover:text-terracotta transition-colors">{t(NAV.sejours)}</Link></li>
            <li><Link data-testid="footer-link-journal" to="/journal" className="hover:text-terracotta transition-colors">{t(NAV.journal)}</Link></li>
            <li><Link data-testid="footer-link-contact" to="/contact" className="hover:text-terracotta transition-colors">{t(NAV.contact)}</Link></li>
          </ul>
          <h4 className="ps-overline text-cream/70 mt-8 mb-4">{t(FOOTER.followTitle)}</h4>
          <ul className="space-y-2 text-sm font-sans">
            {FOOTER.social.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noreferrer" className="hover:text-terracotta transition-colors">{s.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-16 pt-6 border-t border-cream/15 flex flex-col md:flex-row justify-between gap-4 text-xs uppercase tracking-[0.25em] text-cream/60">
        <p>{t(FOOTER.rights)}</p>
        <p className="font-serif italic normal-case tracking-normal text-cream/70">Bourgogne · Costa del Sol</p>
      </div>
    </footer>
  );
};

export default Footer;
