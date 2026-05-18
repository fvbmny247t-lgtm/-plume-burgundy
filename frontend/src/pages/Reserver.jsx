import React from "react";
import Seo from "../components/Seo";
import BookingIframe from "../components/BookingIframe";
import { useLang } from "../context/LanguageContext";

const Reserver = () => {
  const { t } = useLang();
  return (
    <div className="bg-cream text-ink" data-testid="reserver-page">
      <Seo
        title={t({ fr: "Réserver", en: "Book a stay" })}
        description={t({
          fr: "Réservez en direct votre séjour à Plume Suites — Douceur ou L'Envolée. Hôtel boutique au bord du canal de Bourgogne, Fleurey-sur-Ouche.",
          en: "Book your stay directly at Plume Suites — Douceur or L'Envolée. Boutique hotel by the Burgundy canal in Fleurey-sur-Ouche.",
        })}
        path="/reserver"
      />

      <section className="pt-32 md:pt-44 pb-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <p className="ps-overline text-ink/60">
            {t({ fr: "Réservation directe", en: "Direct booking" })}
          </p>
          <h1 className="font-serif italic text-5xl md:text-8xl leading-[0.95] font-light mt-6 max-w-5xl">
            {t({ fr: "Réserver votre séjour.", en: "Book your stay." })}
          </h1>
          <p className="font-sans text-base md:text-lg max-w-xl mt-8 text-ink/80 leading-relaxed">
            {t({
              fr: "Tarifs en direct, sans commission. Réservation sécurisée via notre channel manager.",
              en: "Direct rates, no commission. Secure booking through our channel manager.",
            })}
          </p>
        </div>
      </section>

      <section className="px-6 md:px-12 pb-32">
        <div className="max-w-7xl mx-auto border-t border-ink/15 pt-10">
          <BookingIframe />
        </div>
      </section>
    </div>
  );
};

export default Reserver;
