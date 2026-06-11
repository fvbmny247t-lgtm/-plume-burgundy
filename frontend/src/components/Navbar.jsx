import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
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
    { to: "/contact", label: NAV.contact },
  ];

  const pathname = location.pathname;
  // Pages with a full-bleed image/video hero start with light text
  const heroIsDark =
    pathname === "/" ||
    pathname === "/art-de-vivre" ||
    /^\/sejours\/[^/]+$/.test(pathname);

  // At top of image-hero pages: white. On scroll OR on cream pages: ink (Nespresso brown).
  const useDarkContent = !heroIsDark || scrolled;
  const textColor = useDarkContent ? "text-ink" : "text-cream";
  const logoVariant = useDarkContent ? "dark" : "white";

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      data-testid="main-navbar"
    >
      {/* Navbar always transparent — content color changes on scroll */}
      <div
        className={`flex items-center justify-between px-6 md:px-10 py-4 md:py-5 transition-colors duration-500 ${textColor}`}
      >
        <Link to="/" data-testid="nav-home-link" aria-label="Plume Suites" className="block">
          <PlumeLogo variant={logoVariant} size="sm" />
        </Link>

        <nav className="hidden lg:flex items-center gap-9">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              data-testid={`nav-link-${l.to.replace("/", "")}`}
              className={({ isActive }) =>
                `font-sans uppercase text-[11px] tracking-[0.3em] hover:opacity-70 transition-opacity ${
                  isActive ? "opacity-100" : "opacity-90"
                }`
              }
            >
              {t(l.label)}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4 md:gap-5">
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

          <button
            data-testid="mobile-menu-toggle"
            onClick={() => setOpen((o) => !o)}
            className="lg:hidden p-1"
            aria-label="Menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu — fullscreen overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-ink text-cream pt-20 px-6 pb-12 overflow-y-auto"
          data-testid="mobile-menu"
        >
          <nav className="flex flex-col gap-6 mt-4">
            {links.map((l, i) => (
              <Link
                key={l.to}
                to={l.to}
                data-testid={`mobile-nav-${l.to.replace("/", "")}`}
                className="font-serif italic text-4xl border-b border-cream/15 pb-4"
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
        </div>
      )}
    </header>
  );
};

export default Navbar;
