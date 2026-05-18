import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useLang } from "../context/LanguageContext";
import { NAV, SMOOBU_BOOKING_URL } from "../data/content";
import PlumeLogo from "./PlumeLogo";

const Navbar = () => {
  const { lang, setLang, t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
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

  const navTextColor = scrolled || open ? "text-cream" : "text-cream";
  const navBg = scrolled || open ? "bg-ink" : "bg-transparent";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${navBg}`}
      data-testid="main-navbar"
    >
      <div className={`flex items-center justify-between px-6 md:px-12 py-5 md:py-6 ${navTextColor}`}>
        <Link to="/" data-testid="nav-home-link" aria-label="Plume Suites">
          <PlumeLogo />
        </Link>

        <nav className="hidden lg:flex items-center gap-10">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              data-testid={`nav-link-${l.to.replace("/", "")}`}
              className={({ isActive }) =>
                `font-sans uppercase text-xs tracking-[0.28em] hover:opacity-70 transition-opacity ${
                  isActive ? "opacity-100" : "opacity-90"
                }`
              }
            >
              {t(l.label)}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden md:flex items-center text-xs uppercase tracking-[0.25em] font-sans">
            <button
              data-testid="lang-switch-fr"
              onClick={() => setLang("fr")}
              className={`px-2 transition-opacity ${lang === "fr" ? "opacity-100" : "opacity-50 hover:opacity-80"}`}
            >
              FR
            </button>
            <span className="opacity-40">/</span>
            <button
              data-testid="lang-switch-en"
              onClick={() => setLang("en")}
              className={`px-2 transition-opacity ${lang === "en" ? "opacity-100" : "opacity-50 hover:opacity-80"}`}
            >
              EN
            </button>
          </div>

          <a
            href={SMOOBU_BOOKING_URL}
            target="_blank"
            rel="noreferrer"
            data-testid="nav-book-button"
            className="hidden md:inline-flex items-center bg-terracotta text-cream px-5 py-2.5 uppercase text-[11px] tracking-[0.28em] hover:bg-terracottaDark transition-colors"
          >
            {t(NAV.book)}
          </a>

          <button
            data-testid="mobile-menu-toggle"
            onClick={() => setOpen((o) => !o)}
            className="lg:hidden p-1"
            aria-label="Menu"
          >
            {open ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="lg:hidden bg-ink text-cream px-6 pt-6 pb-12 fade-in"
          data-testid="mobile-menu"
        >
          <nav className="flex flex-col gap-6">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                data-testid={`mobile-nav-${l.to.replace("/", "")}`}
                className="font-serif italic text-3xl"
              >
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
          <a
            href={SMOOBU_BOOKING_URL}
            target="_blank"
            rel="noreferrer"
            data-testid="mobile-book-button"
            className="mt-8 inline-flex bg-terracotta text-cream px-6 py-3 uppercase text-[11px] tracking-[0.28em]"
          >
            {t(NAV.book)}
          </a>
        </div>
      )}
    </header>
  );
};

export default Navbar;
