import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { Printer } from "lucide-react";
import { useLang } from "../context/LanguageContext";
import Seo from "../components/Seo";
import GiftCardVisual from "../components/GiftCardVisual";

const API = `${process.env.REACT_APP_BACKEND_URL}/api/giftcards`;

const fmtDate = (iso, lang) => {
  if (!iso) return "";
  try { return new Date(iso).toLocaleDateString(lang === "en" ? "en-GB" : "fr-FR", { day: "numeric", month: "long", year: "numeric" }); }
  catch { return iso; }
};

// La carte telle que la reçoit le bénéficiaire (lien de l'email), à transmettre ou imprimer.
const Voucher = () => {
  const { t, lang } = useLang();
  const { code } = useParams();
  const [data, setData] = useState(undefined);

  useEffect(() => {
    axios.get(`${API}/voucher/${code}`).then(({ data }) => setData(data)).catch(() => setData(null));
  }, [code]);

  if (data === undefined) return <div className="min-h-[70vh] bg-cream" data-testid="gc-voucher-loading" />;

  const [title, subtitle] = (data?.coffret_name || "").split(" — ");
  const statusLine =
    data?.status === "redeemed" ? t({ fr: "Carte déjà utilisée", en: "Card already used" })
    : data?.status === "expired" ? t({ fr: "Carte expirée", en: "Card expired" })
    : `${t({ fr: "Valable jusqu'au", en: "Valid until" })} ${fmtDate(data?.expires_at, lang)}`;

  return (
    <>
      <Seo title={t({ fr: "Votre carte cadeau", en: "Your gift card" })} noindex />
      <section className="bg-cream text-ink px-6 pt-32 md:pt-40 pb-24 print:p-0 print:bg-white" data-testid="gc-voucher-page">
        <div className="w-full max-w-2xl mx-auto">
          {data === null ? (
            <div className="text-center py-20" data-testid="gc-voucher-notfound">
              <p className="font-serif italic text-3xl font-light">{t({ fr: "Cette carte est introuvable.", en: "This card cannot be found." })}</p>
              <p className="font-sans text-sm text-ink/60 mt-4">{t({ fr: "Vérifiez le lien reçu par email, ou écrivez-nous à hello@plumesuites.fr.", en: "Check the link in your email, or write to us at hello@plumesuites.fr." })}</p>
            </div>
          ) : (
            <>
              <p className="ps-overline text-terracotta text-center mb-8 print:hidden">{t({ fr: "Votre carte cadeau", en: "Your gift card" })}</p>
              <div data-testid="gc-voucher-card">
                <GiftCardVisual large title={title} subtitle={subtitle} recipient={data.recipient_name}
                  message={data.message} code={data.code} footerLeft={statusLine} />
              </div>

              {/* visible seulement à l'impression : comment utiliser la carte */}
              <p className="hidden print:block font-sans text-xs text-ink/70 mt-6 leading-relaxed">
                {t({
                  fr: "Pour utiliser cette carte : rendez-vous sur plumesuites.fr, page Réserver, rubrique « J'ai une carte cadeau », puis indiquez le code et vos dates. Plume Suites, 8 rue des Vieilles Carrières, 21410 Fleurey-sur-Ouche · hello@plumesuites.fr",
                  en: "To use this card: go to plumesuites.fr, Book page, “I have a gift card”, then enter the code and your dates. Plume Suites, 8 rue des Vieilles Carrières, 21410 Fleurey-sur-Ouche · hello@plumesuites.fr",
                })}
              </p>

              <div className="mt-12 text-center print:hidden">
                {data.status === "active" ? (
                  <>
                    <p className="font-sans text-[15px] text-ink/70 leading-relaxed max-w-md mx-auto">
                      {t({
                        fr: "Choisissez vos dates : nous nous occupons de la réservation et vous confirmons le séjour par email.",
                        en: "Pick your dates: we take care of the booking and confirm your stay by email.",
                      })}
                    </p>
                    <div className="mt-8 flex flex-wrap gap-4 justify-center">
                      <Link to={`/reserver?carte=1&code=${encodeURIComponent(data.code)}`} data-testid="gc-voucher-use"
                        className="bg-terracotta text-cream px-8 py-4 uppercase text-[11px] tracking-[0.3em] hover:bg-terracottaDark transition-colors">
                        {t({ fr: "Utiliser ma carte", en: "Use my card" })}
                      </Link>
                      <button onClick={() => window.print()} data-testid="gc-voucher-print"
                        className="inline-flex items-center gap-2 border border-ink/30 px-8 py-4 uppercase text-[11px] tracking-[0.3em] hover:border-terracotta hover:text-terracotta transition-colors">
                        <Printer size={14} strokeWidth={1.5} /> {t({ fr: "Imprimer", en: "Print" })}
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="font-sans text-sm text-ink/60" data-testid="gc-voucher-used-note">
                    {data.status === "redeemed"
                      ? t({ fr: "Cette carte a déjà été utilisée. Merci, et à bientôt.", en: "This card has already been used. Thank you, see you soon." })
                      : t({ fr: "Cette carte n'est plus valable. Pour toute question : hello@plumesuites.fr", en: "This card is no longer valid. Any question: hello@plumesuites.fr" })}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
};

export default Voucher;
