import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, Copy } from "lucide-react";
import { useLang } from "../context/LanguageContext";
import Seo from "../components/Seo";

const API = `${process.env.REACT_APP_BACKEND_URL}/api/giftcards`;

const PaymentSuccess = () => {
  const { t } = useLang();
  const [params] = useSearchParams();
  const sessionId = params.get("session_id") || "";
  const [state, setState] = useState("checking"); // checking | paid | timeout | error
  const [card, setCard] = useState(null);
  const [copied, setCopied] = useState(false);
  const tries = useRef(0);

  useEffect(() => {
    if (!sessionId) { setState("error"); return; }
    let active = true;
    const poll = async () => {
      try {
        const { data } = await axios.get(`${API}/status/${sessionId}`);
        if (!active) return;
        if (data.payment_status === "paid") {
          setCard(data);
          setState("paid");
          return;
        }
      } catch (e) { /* keep trying */ }
      tries.current += 1;
      if (tries.current >= 12) { setState("timeout"); return; }
      setTimeout(poll, 2000);
    };
    poll();
    return () => { active = false; };
  }, [sessionId]);

  const copy = () => {
    if (card?.code) {
      navigator.clipboard?.writeText(card.code);
      setCopied(true);
    }
  };

  return (
    <>
      <Seo title={t({ fr: "Merci pour votre cadeau", en: "Thank you for your gift" })} noindex />
      <section className="min-h-[80vh] bg-cream text-ink px-6 pt-32 pb-24 flex justify-center" data-testid="gc-success-page">
        <div className="w-full max-w-lg text-center">
          {state === "checking" && (
            <p className="font-serif italic text-2xl text-ink/60" data-testid="gc-success-checking">
              {t({ fr: "Confirmation de votre paiement…", en: "Confirming your payment…" })}
            </p>
          )}
          {state === "paid" && (
            <div data-testid="gc-success-paid">
              <CheckCircle2 size={46} strokeWidth={1.3} className="text-terracotta mx-auto mb-6" />
              <h1 className="font-serif italic font-light text-4xl mb-4">{t({ fr: "Merci, c'est fait !", en: "Thank you, all set!" })}</h1>
              <p className="font-sans text-sm text-ink/65 leading-relaxed mb-8">
                {t({ fr: "Votre carte cadeau est prête. Nous venons de vous l'envoyer par email avec toutes les informations.", en: "Your gift card is ready. We've just emailed it to you with all the details." })}
              </p>
              <div className="bg-white border border-dashed border-terracotta p-6 mb-8">
                <p className="ps-overline text-ink/50 mb-2">{t({ fr: "Votre code cadeau", en: "Your gift code" })}</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="font-serif text-2xl tracking-[0.15em]" data-testid="gc-success-code">{card?.code}</span>
                  <button onClick={copy} aria-label="Copier" data-testid="gc-copy-code" className="text-ink/40 hover:text-terracotta">
                    <Copy size={18} strokeWidth={1.5} />
                  </button>
                </div>
                {copied && <p className="text-xs text-terracotta mt-2">{t({ fr: "Copié", en: "Copied" })}</p>}
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
                {card?.code && (
                  <Link to={`/bon/${card.code}`} data-testid="gc-view-voucher" className="bg-ink text-cream px-6 py-3 uppercase text-[11px] tracking-[0.25em] hover:bg-terracotta transition-colors">
                    {t({ fr: "Voir le bon", en: "View the voucher" })}
                  </Link>
                )}
                <Link to="/" className="border border-ink/30 px-6 py-3 uppercase text-[11px] tracking-[0.25em] hover:border-terracotta hover:text-terracotta transition-colors">
                  {t({ fr: "Retour à l'accueil", en: "Back home" })}
                </Link>
              </div>
            </div>
          )}
          {state === "timeout" && (
            <div data-testid="gc-success-timeout">
              <h1 className="font-serif italic font-light text-3xl mb-4">{t({ fr: "Paiement en cours de confirmation", en: "Payment is being confirmed" })}</h1>
              <p className="font-sans text-sm text-ink/60 mb-6">{t({ fr: "Votre carte cadeau vous sera envoyée par email dès confirmation. Vérifiez votre boîte dans quelques minutes.", en: "Your gift card will be emailed once confirmed. Please check your inbox in a few minutes." })}</p>
              <Link to="/" className="text-terracotta hover:underline underline-offset-4 text-sm">{t({ fr: "Retour à l'accueil", en: "Back home" })}</Link>
            </div>
          )}
          {state === "error" && (
            <p className="font-sans text-sm text-red-700" data-testid="gc-success-error">{t({ fr: "Lien invalide.", en: "Invalid link." })}</p>
          )}
        </div>
      </section>
    </>
  );
};

export default PaymentSuccess;
