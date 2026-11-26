import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import { NAV } from "../data/content";
import PlumeLogo from "./PlumeLogo";

const Navbar = () => {
  const { lang, setLang, t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const links = [
    { to: "/art-de-vivre", label: NAV.artDeVivre },
    { to: "/sejours", label: NAV.sejours },
    { to: "/journal", label: NAV.journal },
    { to: "/cartes-cadeaux", label: NAV.giftcards },
    { to: "/contact", label: NAV.contact },
  ];

  const pathname = location.pathname;
  // Pages with a full-bleed image/video hero start with light text
  const heroIsDark =
    pathname === "/" ||
    pathname === "/art-de-vivre" ||
    pathname === "/cartes-cadeaux" ||
    /^\/sejours\/[^/]+$/.test(pathname);

  // At top of image-hero pages: white. On scroll OR on cream pages: ink (Nespresso brown).
  const useDarkContent = !heroIsDark || scrolled;
  const textColor = useDarkContent ? "text-ink" : "text-cream";
  const logoVariant = useDarkContent ? "dark" : "white";

  return (
    <header
      className="fixed left-0 right-0 z-50 transition-[top] duration-300 ease-out"
      style={{ top: "var(--promo-h, 0px)" }}
      data-testid="main-navbar"
    >
      {/* Navbar transparent — un seul calque de fond (opacity) synchronisé avec l'overlay */}
      <div
        className={`relative z-[60] flex items-center justify-between px-6 md:px-10 py-4 md:py-5 transition-colors duration-500 ease-out ${open ? "text-cream" : textColor}`}
      >
        {/* Fond crème au scroll : sans lui, le menu passe par-dessus le texte */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 bg-cream/95 backdrop-blur-sm border-b border-ink/10 transition-opacity duration-500 ease-out ${scrolled && !open ? "opacity-100" : "opacity-0"}`}
        />
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 bg-ink transition-opacity duration-500 ease-out ${open ? "opacity-100" : "opacity-0"}`}
        />
        <Link to="/" data-testid="nav-home-link" aria-label="Plume Suites" className="relative z-10 block">
          <PlumeLogo variant={open ? "white" : logoVariant} size="sm" />
        </Link>

        <nav className="relative z-10 hidden lg:flex items-center gap-6 xl:gap-9">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              data-testid={`nav-link-${l.to.replace("/", "")}`}
              className={({ isActive }) =>
                l.to === "/cartes-cadeaux"
                  ? `whitespace-nowrap font-serif italic text-[17px] leading-none transition-colors ${
                      isActive ? "text-terracotta" : useDarkContent ? "text-terracotta hover:text-terracottaDark" : "hover:text-terracotta"
                    }`
                  : `whitespace-nowrap font-sans uppercase text-[11px] tracking-[0.3em] hover:opacity-70 transition-opacity ${
                      isActive ? "opacity-100" : "opacity-90"
                    }`
              }
            >
              {t(l.label)}
            </NavLink>
          ))}
        </nav>

        <div className="relative z-10 flex items-center gap-4 md:gap-5">
          <div className="hidden md:flex items-center text-[11px] uppercase tracking-[0.3em] font-sans">
            <button
              data-testid="lang-switch-fr"
              onClick={() => setLang("fr")}
              className={`px-1.5 transition-opacity ${lang === "fr" ? "opacity-100" : "opacity-50 hover:opacity-80"}`}
            >
              FR
            </button>
            <span className="opacity-40">/</span>
            <button
              data-testid="lang-switch-en"
              onClick={() => setLang("en")}
              className={`px-1.5 transition-opacity ${lang === "en" ? "opacity-100" : "opacity-50 hover:opacity-80"}`}
            >
              EN
            </button>
          </div>

          <Link
            to="/reserver"
            data-testid="nav-book-button"
            className="hidden md:inline-flex items-center bg-terracotta text-cream px-4 py-2 uppercase text-[10px] tracking-[0.3em] hover:bg-terracottaDark transition-colors"
          >
            {t(NAV.book)}
          </Link>

          <a
            href="https://www.instagram.com/plumesuites/"
            target="_blank"
            rel="noreferrer"
            data-testid="nav-instagram"
            aria-label="Instagram"
            className="hidden md:inline-flex items-center hover:opacity-70 transition-opacity"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
          </a>

          <Link
            to="/carnet"
            data-testid="nav-carnet"
            aria-label={t(NAV.carnet)}
            className="hidden md:inline-flex items-center hover:opacity-70 transition-opacity"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </Link>

          <button
            data-testid="mobile-menu-toggle"
            onClick={() => setOpen((o) => !o)}
            className="lg:hidden relative w-7 h-7 flex items-center justify-center"
            aria-label="Menu"
            aria-expanded={open}
          >
            <span className="sr-only">Menu</span>
            <span
              className={`absolute block h-[2px] w-6 bg-current transition-all duration-300 ease-out ${
                open ? "rotate-45 translate-y-0 !bg-cream" : "-translate-y-[6px]"
              }`}
            />
            <span
              className={`absolute block h-[2px] w-6 bg-current transition-all duration-200 ease-out ${
                open ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`absolute block h-[2px] w-6 bg-current transition-all duration-300 ease-out ${
                open ? "-rotate-45 translate-y-0 !bg-cream" : "translate-y-[6px]"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu — fullscreen overlay, animated open/close */}
      <div
        className={`lg:hidden fixed inset-0 z-40 bg-ink text-cream pt-24 px-6 pb-12 overflow-y-auto transition-opacity duration-500 ease-out ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        data-testid="mobile-menu"
        aria-hidden={!open}
      >
        <nav className="flex flex-col gap-6 mt-4">
          {links.map((l, i) => (
            <Link
              key={l.to}
              to={l.to}
              data-testid={`mobile-nav-${l.to.replace("/", "")}`}
              style={{ transitionDelay: open ? `${120 + i * 70}ms` : "0ms" }}
              className={`font-serif italic text-4xl border-b border-cream/15 pb-4 transition-all duration-500 ease-out ${
                open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
              }`}
            >
              <span className="ps-overline text-cream/40 block mb-1">0{i + 1}</span>
              {t(l.label)}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-4 mt-10 text-xs uppercase tracking-[0.28em]">
          <button
            data-testid="mobile-lang-fr"
            onClick={() => setLang("fr")}
            className={lang === "fr" ? "opacity-100" : "opacity-50"}
          >
            FR
          </button>
          <span className="opacity-40">/</span>
          <button
            data-testid="mobile-lang-en"
            onClick={() => setLang("en")}
            className={lang === "en" ? "opacity-100" : "opacity-50"}
          >
            EN
          </button>
        </div>
        <Link
          to="/reserver"
          data-testid="mobile-book-button"
          className="mt-8 inline-flex bg-terracotta text-cream px-6 py-3 uppercase text-[11px] tracking-[0.3em]"
        >
          {t(NAV.book)}
        </Link>
        <Link
          to="/carnet"
          data-testid="mobile-carnet-link"
          className="mt-6 block font-sans text-[11px] uppercase tracking-[0.3em] text-cream/70 hover:text-cream transition-colors"
        >
          {t(NAV.carnet)}
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
