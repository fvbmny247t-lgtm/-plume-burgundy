import React from "react";
import { Link } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import Seo from "../components/Seo";

const PaymentCancel = () => {
  const { t } = useLang();
  return (
    <>
      <Seo title={t({ fr: "Paiement annulé", en: "Payment cancelled" })} noindex />
      <section className="min-h-[70vh] bg-cream text-ink px-6 pt-32 pb-24 flex justify-center" data-testid="gc-cancel-page">
        <div className="w-full max-w-lg text-center">
          <h1 className="font-serif italic font-light text-4xl mb-4">{t({ fr: "Paiement annulé", en: "Payment cancelled" })}</h1>
          <p className="font-sans text-sm text-ink/60 mb-8">
            {t({ fr: "Aucun montant n'a été débité. Vous pouvez reprendre à tout moment.", en: "No amount was charged. You can resume whenever you like." })}
          </p>
          <Link to="/cartes-cadeaux" data-testid="gc-cancel-back" className="bg-ink text-cream px-6 py-3 uppercase text-[11px] tracking-[0.25em] hover:bg-terracotta transition-colors">
            {t({ fr: "Revenir aux cartes cadeaux", en: "Back to gift cards" })}
          </Link>
        </div>
      </section>
    </>
  );
};

export default PaymentCancel;
