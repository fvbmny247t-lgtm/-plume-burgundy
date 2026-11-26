import React from "react";
import { useLang } from "../context/LanguageContext";
import PlumeLogo from "./PlumeLogo";

// Grain papier (bruit SVG) posé sur la bande terracotta.
const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.23  0 0 0 0 0.19  0 0 0 0 0.17  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;

// La carte cadeau Plume : bande terracotta avec le logo + carton crème.
// Utilisée pour l'aperçu à l'achat et pour la carte reçue (/bon/:code), afin qu'elles soient identiques.
// Mise en page en flux simple (pas d'aspect-ratio ni de position absolue pour le texte) pour rester stable partout.
const GiftCardVisual = ({ title, subtitle, recipient, message, code, footerLeft, footerRight, large = false }) => {
  const { t } = useLang();
  return (
    <div data-testid="gc-preview"
      className={`relative w-full grid ${large ? "grid-cols-[30%_1fr]" : "grid-cols-[28%_1fr] sm:grid-cols-[34%_1fr]"} bg-[#f6f0e4] text-ink overflow-hidden shadow-[0_24px_50px_-28px_rgba(59,49,43,0.55)] print:shadow-none print:border print:border-ink/15 [print-color-adjust:exact] [-webkit-print-color-adjust:exact]`}>
      <div className={`relative ${large ? "min-h-[320px]" : "min-h-[220px]"} bg-terracotta flex items-center justify-center p-3`}>
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.55] mix-blend-multiply" style={{ backgroundImage: GRAIN }} />
        <PlumeLogo variant="white" size="sm" className={`relative !h-auto !w-full ${large ? "max-w-[140px]" : "max-w-[110px]"}`} />
      </div>
      <div className={`flex flex-col min-w-0 ${large ? "p-6 sm:p-10" : "p-4 sm:p-7"}`}>
        <span className="font-sans text-[9px] uppercase tracking-[0.3em] text-terracotta whitespace-nowrap">{t({ fr: "Carte cadeau", en: "Gift card" })}</span>
        <div className={large ? "my-6 sm:my-8" : "my-5 sm:my-6"}>
          <p className={`font-serif italic font-light leading-tight break-words ${large ? "text-[26px] sm:text-[34px]" : "text-[22px] sm:text-[26px]"}`}>{title}</p>
          {subtitle && <p className="font-sans text-xs text-ink/55 mt-1">{subtitle}</p>}
          <p className={`font-serif text-ink/75 mt-3 break-words ${large ? "text-[17px]" : "text-[15px]"}`}>
            {t({ fr: "Pour", en: "For" })} {recipient || <span className="text-ink/35">…</span>}
          </p>
          {message && (
            <p className={`font-serif italic text-ink/60 mt-1.5 leading-snug break-words ${large ? "text-base" : "text-sm line-clamp-3"}`}>« {message} »</p>
          )}
        </div>
        {code && (
          <div className="mb-5">
            <p className="font-sans text-[9px] uppercase tracking-[0.3em] text-ink/45">{t({ fr: "Code", en: "Code" })}</p>
            <p className="font-serif text-xl sm:text-2xl tracking-[0.18em] mt-1 break-all" data-testid="gc-voucher-code">{code}</p>
          </div>
        )}
        <div className="mt-auto pt-3 border-t border-ink/10 flex items-baseline justify-between gap-3">
          <span className="font-sans text-[9px] uppercase tracking-[0.2em] text-ink/45 whitespace-nowrap">{footerLeft}</span>
          {footerRight && <span className="font-serif text-xl whitespace-nowrap">{footerRight}</span>}
        </div>
      </div>
    </div>
  );
};

export default GiftCardVisual;
