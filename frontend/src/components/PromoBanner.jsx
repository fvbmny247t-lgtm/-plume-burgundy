import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import { useLang } from "../context/LanguageContext";

const KEY = "ps_promo_closed_until";
const ALLOWED = ["/", "/reserver"]; // banner shows only on Home & Reservation

// Discreet, premium fixed promo banner above the navbar. Pushes the navbar down
// via the CSS var --promo-h (read by Navbar) so there is no layout jump.
const PromoBanner = () => {
  const { lang } = useLang();
  const { pathname } = useLocation();
  const fr = lang !== "en";
  const show = ALLOWED.includes(pathname);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const ref = useRef(null);

  // Restore state (closed for 1 day)
  useEffect(() => {
    let until = 0;
    try {
      until = parseInt(localStorage.getItem(KEY) || "0", 10);
    } catch (e) { /* ignore */ }
    if (!until || Date.now() > until) setOpen(true);
  }, []);

  // Slight transparency once the page is scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Keep --promo-h in sync with the actual rendered height (handles wrapping / language / route)
  useEffect(() => {
    const apply = () => {
      const h = show && open && ref.current ? ref.current.offsetHeight : 0;
      document.documentElement.style.setProperty("--promo-h", `${h}px`);
    };
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, [open, lang, show, pathname]);

  const close = () => {
    setOpen(false);
    document.documentElement.style.setProperty("--promo-h", "0px");
    try {
      localStorage.setItem(KEY, String(Date.now() + 24 * 60 * 60 * 1000));
    } catch (e) { /* ignore */ }
  };

  if (!show) return null;

  const anchor = fr ? "/cgv#offre-semaine10" : "/cgv#long-stay-semaine10";

  return (
    <div
      aria-hidden={!open}
      data-testid="promo-banner"
      className={`fixed top-0 left-0 right-0 z-[70] transition-transform duration-500 ease-out ${
        open ? "translate-y-0" : "-translate-y-full pointer-events-none"
      }`}
    >
      <div
        ref={ref}
        className={`text-cream transition-colors duration-300 ${
          scrolled ? "bg-terracotta/85 backdrop-blur-sm" : "bg-terracotta"
        }`}
      >
        <div className="relative max-w-7xl mx-auto px-9 md:px-12 py-2 md:py-2.5">
          <p className="text-center font-sans text-[10.5px] md:text-xs leading-snug tracking-[0.01em] pr-6">
            <span>
              {fr ? "Prenez le temps de découvrir la Bourgogne." : "Take the time to discover Burgundy."}
            </span>{" "}
            <span className="whitespace-normal">
              {fr ? "–10 % dès 6 nuits jusqu'au 31 janvier 2027 " : "10% off stays of 6 nights or more until 31 January 2027 "}
              <Link
                to={anchor}
                data-testid="promo-asterisk"
                aria-label={fr ? "Conditions de l'offre" : "Offer terms"}
                className="no-underline hover:opacity-70 transition-opacity"
              >
                *
              </Link>
            </span>
          </p>
          <button
            type="button"
            onClick={close}
            data-testid="promo-close"
            aria-label={fr ? "Fermer le bandeau" : "Close banner"}
            className="absolute right-2.5 md:right-4 top-1/2 -translate-y-1/2 text-cream/80 hover:text-cream transition-colors p-1"
          >
            <X size={16} strokeWidth={1.6} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromoBanner;
