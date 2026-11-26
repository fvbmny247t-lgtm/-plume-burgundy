import React from "react";
import { useSearchParams } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import Seo from "../components/Seo";
import GiftRedeemForm from "../components/GiftRedeemForm";

const RedeemGift = () => {
  const { t } = useLang();
  const [params] = useSearchParams();

  return (
    <>
      <Seo title={t({ fr: "Utiliser ma carte cadeau", en: "Use my gift card" })} noindex />
      <section className="bg-cream text-ink px-6 pt-36 md:pt-44 pb-24" data-testid="gc-redeem-page">
        <div className="w-full max-w-xl mx-auto">
          <p className="ps-overline text-terracotta mb-4">{t({ fr: "Carte cadeau", en: "Gift card" })}</p>
          <h1 className="font-serif italic font-light text-4xl md:text-6xl leading-[1.02] mb-5">
            {t({ fr: "Le séjour qu'on vous a offert.", en: "The stay you were given." })}
          </h1>
          <p className="font-sans text-[15px] text-ink/70 leading-relaxed mb-12 max-w-md">
            {t({
              fr: "Indiquez votre code et les dates qui vous font envie. Nous nous occupons de la réservation.",
              en: "Enter your code and the dates you have in mind. We take care of the booking.",
            })}
          </p>
          <GiftRedeemForm initialCode={params.get("code") || ""} />
        </div>
      </section>
    </>
  );
};

export default RedeemGift;
