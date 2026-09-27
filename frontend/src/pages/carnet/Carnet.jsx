import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Feather, Settings, LogOut, Mail } from "lucide-react";
import { useLang } from "../../context/LanguageContext";
import { useCarnet } from "../../context/CarnetAuthContext";
import Seo from "../../components/Seo";

const Loader = () => (
  <div className="min-h-[70vh] bg-cream flex items-center justify-center" data-testid="carnet-loading">
    <p className="font-serif italic text-ink/50 text-xl">…</p>
  </div>
);

const Carnet = () => {
  const { t } = useLang();
  const { user, logout, refreshMe, client } = useCarnet();
  const navigate = useNavigate();
  const [resent, setResent] = useState(false);

  if (user === undefined) return <Loader />;
  if (user === null) {
    navigate("/carnet/connexion", { replace: true });
    return <Loader />;
  }

  const resend = async () => {
    try {
      await client.post("/resend-verification");
      setResent(true);
    } catch (e) {
      setResent(true);
    }
  };

  const subscribeNewsletter = async () => {
    await client.post("/newsletter/subscribe", { email: user.email, source: "carnet" });
    refreshMe();
  };

  const nlLabel = {
    none: t({ fr: "Vous ne recevez pas encore La Lettre de Marie.", en: "You do not yet receive La Lettre de Marie." }),
    pending: t({ fr: "Inscription en attente de confirmation par email.", en: "Subscription awaiting email confirmation." }),
    confirmed: t({ fr: "Vous recevez La Lettre de Marie.", en: "You receive La Lettre de Marie." }),
    unsubscribed: t({ fr: "Vous êtes désinscrit de La Lettre de Marie.", en: "You are unsubscribed from La Lettre de Marie." }),
  }[user.newsletter_status] || "";

  return (
    <>
      <Seo title="Mon Carnet" noindex />
      <section className="min-h-[80vh] bg-cream text-ink px-6 pt-32 pb-24" data-testid="carnet-dashboard">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between gap-6 mb-12">
            <div>
              <p className="ps-overline text-terracotta mb-3">{t({ fr: "Votre Carnet Plume", en: "Your Carnet Plume" })}</p>
              <h1 className="font-serif italic font-light text-4xl md:text-5xl leading-tight" data-testid="carnet-greeting">
                {t({ fr: "Bonjour", en: "Hello" })} {user.first_name}
              </h1>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link to="/carnet/compte" data-testid="carnet-account-link" aria-label={t({ fr: "Mon compte", en: "My account" })}
                className="w-10 h-10 border border-ink/20 flex items-center justify-center hover:border-terracotta hover:text-terracotta transition-colors">
                <Settings size={16} strokeWidth={1.5} />
              </Link>
              <button onClick={logout} data-testid="carnet-logout" aria-label={t({ fr: "Se déconnecter", en: "Sign out" })}
                className="w-10 h-10 border border-ink/20 flex items-center justify-center hover:border-terracotta hover:text-terracotta transition-colors">
                <LogOut size={16} strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {!user.email_verified && (
            <div className="bg-terracotta/10 border border-terracotta/30 px-5 py-4 mb-10 flex flex-col sm:flex-row sm:items-center gap-3" data-testid="carnet-verify-banner">
              <Mail size={18} strokeWidth={1.5} className="text-terracotta shrink-0" />
              <p className="font-sans text-sm text-ink/80 flex-1">
                {t({ fr: "Confirmez votre adresse email pour activer pleinement votre Carnet.", en: "Confirm your email address to fully activate your Carnet." })}
              </p>
              <button onClick={resend} disabled={resent} data-testid="carnet-resend-verification"
                className="font-sans text-[11px] uppercase tracking-[0.2em] text-terracotta hover:underline disabled:opacity-50 shrink-0">
                {resent ? t({ fr: "Email envoyé", en: "Email sent" }) : t({ fr: "Renvoyer l'email", en: "Resend email" })}
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <div className="bg-white border border-ink/10 p-8 md:col-span-1" data-testid="carnet-plumes-card">
              <Feather size={22} strokeWidth={1.5} className="text-terracotta mb-4" />
              <p className="font-serif text-5xl font-light" data-testid="carnet-plumes-balance">{user.plumes_balance}</p>
              <p className="ps-overline text-ink/50 mt-2">{t({ fr: "Plumes", en: "Plumes" })}</p>
              {user.plumes_pending > 0 && (
                <p className="font-sans text-xs text-ink/50 mt-3">
                  {user.plumes_pending} {t({ fr: "Plumes à venir", en: "Plumes to come" })}
                </p>
              )}
            </div>
            <div className="bg-white border border-ink/10 p-8 md:col-span-2 flex flex-col justify-center">
              <p className="font-serif italic text-2xl font-light mb-3">{t({ fr: "Votre histoire avec Plume", en: "Your story with Plume" })}</p>
              <p className="font-sans text-sm text-ink/60 leading-relaxed">
                {t({
                  fr: "Vos séjours réservés en direct nourrissent doucement votre Carnet. Ils apparaîtront ici dès que la connexion à nos réservations sera active.",
                  en: "Your directly booked stays gently nourish your Carnet. They will appear here as soon as our reservations connection is active.",
                })}
              </p>
            </div>
          </div>

          <div className="mb-12">
            <h2 className="ps-overline text-ink/50 mb-4">{t({ fr: "Mes séjours", en: "My stays" })}</h2>
            <div className="bg-white border border-ink/10 p-8 text-center" data-testid="carnet-stays-empty">
              <p className="font-sans text-sm text-ink/50">
                {t({ fr: "Vos séjours apparaîtront ici.", en: "Your stays will appear here." })}
              </p>
            </div>
          </div>

          <div>
            <h2 className="ps-overline text-ink/50 mb-4">{t({ fr: "La Lettre de Marie", en: "La Lettre de Marie" })}</h2>
            <div className="bg-white border border-ink/10 p-8 flex flex-col sm:flex-row sm:items-center gap-4" data-testid="carnet-newsletter-card">
              <p className="font-sans text-sm text-ink/70 flex-1" data-testid="carnet-newsletter-status">{nlLabel}</p>
              {(user.newsletter_status === "none" || user.newsletter_status === "unsubscribed") && (
                <button onClick={subscribeNewsletter} data-testid="carnet-newsletter-subscribe"
                  className="inline-flex bg-ink text-cream px-5 py-3 uppercase text-[10px] tracking-[0.3em] hover:bg-terracotta transition-colors shrink-0">
                  {t({ fr: "M'inscrire", en: "Subscribe" })}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Carnet;
