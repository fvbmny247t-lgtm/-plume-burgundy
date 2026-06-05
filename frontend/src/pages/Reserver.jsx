import React from "react";
import { Check, Lock, Sparkles, Tag } from "lucide-react";
import Seo from "../components/Seo";
import BookingIframe from "../components/BookingIframe";
import { useLang } from "../context/LanguageContext";
import { IMAGES } from "../data/content";

const Reserver = () => {
  const { t } = useLang();

  const benefits = [
    {
      icon: Tag,
      title: { fr: "Meilleur tarif garanti", en: "Best rate guaranteed" },
      text: {
        fr: "Aucune commission d'intermédiaire — le prix le plus juste, en direct.",
        en: "No intermediary commission — the fairest price, direct.",
      },
    },
    {
      icon: Lock,
      title: { fr: "Réservation sécurisée", en: "Secure booking" },
      text: {
        fr: "Paiement crypté, confirmation immédiate, conditions transparentes.",
        en: "Encrypted payment, instant confirmation, transparent terms.",
      },
    },
    {
      icon: Sparkles,
      title: { fr: "Attention premium", en: "Premium attention" },
      text: {
        fr: "Une petite intention à l'arrivée pour nos hôtes en direct.",
        en: "A welcome touch on arrival for our direct guests.",
      },
    },
  ];

  return (
    <div className="bg-cream text-ink" data-testid="reserver-page">
      <Seo
        title={t({ fr: "Réserver", en: "Book a stay" })}
        description={t({
          fr: "Réservez en direct votre séjour à Plume Suites — Douceur ou L'Envolée. Boutique hôtel au bord du canal de Bourgogne, Fleurey-sur-Ouche.",
          en: "Book your stay directly at Plume Suites — Douceur or L'Envolée. Boutique hotel by the Burgundy canal in Fleurey-sur-Ouche.",
        })}
        path="/reserver"
      />

      {/* HERO — editorial */}
      <section className="relative pt-32 md:pt-40 pb-12 md:pb-16 px-6 md:px-12 overflow-hidden">
        {/* Subtle decorative image strip */}
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-[0.08] pointer-events-none">
          <img src={IMAGES.envolee} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-7xl mx-auto">
          <p className="ps-overline text-terracotta">— {t({ fr: "Réservation directe", en: "Direct booking" })}</p>
          <h1 className="font-serif italic text-4xl md:text-6xl lg:text-7xl leading-[1] font-light mt-5 max-w-3xl">
            {t({ fr: "Choisir vos dates,\nc'est commencer le séjour.", en: "Choosing your dates\nis where the stay begins." })}
          </h1>
          <p className="font-sans text-base md:text-lg max-w-xl mt-7 text-ink/80 leading-relaxed">
            {t({
              fr: "Réservez directement auprès de Plume Suites — au meilleur tarif et avec l'attention qui nous est propre.",
              en: "Book directly with Plume Suites — at the best available rate and with our particular attention.",
            })}
          </p>
        </div>
      </section>

      {/* BENEFITS strip */}
      <section className="px-6 md:px-12 pb-14 md:pb-16">
        <div className="max-w-7xl mx-auto border-t border-ink/15 pt-10 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <div key={i} className="flex items-start gap-5" data-testid={`reserver-benefit-${i}`}>
                <div className="shrink-0 w-12 h-12 border border-terracotta text-terracotta flex items-center justify-center">
                  <Icon size={18} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-serif italic text-xl md:text-2xl text-ink">{t(b.title)}</p>
                  <p className="font-sans text-sm text-ink/70 mt-2 leading-relaxed">{t(b.text)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SMOOBU IFRAME — framed */}
      <section className="px-6 md:px-12 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between gap-6 mb-6">
            <div>
              <p className="ps-overline text-ink/60">— {t({ fr: "Calendrier & tarifs", en: "Calendar & rates" })}</p>
              <h2 className="font-serif italic text-3xl md:text-4xl mt-2 font-light">
                {t({ fr: "Vérifier les disponibilités", en: "Check availability" })}
              </h2>
            </div>
            <div className="hidden md:flex items-center gap-2 text-xs font-sans text-ink/60 uppercase tracking-[0.25em]">
              <Check size={14} className="text-terracotta" />
              {t({ fr: "Tarif direct", en: "Direct rate" })}
            </div>
          </div>
          <div className="bg-white border border-ink/10 p-2 md:p-4 shadow-sm">
            <BookingIframe />
          </div>
        </div>
      </section>

      {/* CLOSING editorial line */}
      <section className="px-6 md:px-12 pb-28">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-serif italic text-2xl md:text-3xl text-ink/85 leading-snug">
            {t({
              fr: "« Une réservation, c'est déjà une attention — la nôtre commence ici. »",
              en: "“A reservation is already a gesture of care — ours starts here.”",
            })}
          </p>
        </div>
      </section>
    </div>
  );
};

export default Reserver;
