import React, { useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import Seo from "../components/Seo";

const API = `${process.env.REACT_APP_BACKEND_URL}/api/giftcards`;

const Field = ({ label, testid, textarea, ...props }) => (
  <div className="mb-4">
    <label className="block ps-overline text-ink/60 mb-2">{label}</label>
    {textarea ? (
      <textarea data-testid={testid} rows={3} className="w-full border border-ink/20 bg-white px-4 py-3 font-sans text-sm outline-none focus:border-terracotta resize-none" {...props} />
    ) : (
      <input data-testid={testid} className="w-full border border-ink/20 bg-white px-4 py-3 font-sans text-sm outline-none focus:border-terracotta" {...props} />
    )}
  </div>
);

const RedeemGift = () => {
  const { t, lang } = useLang();
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    code: params.get("code") || "",
    guest_name: "", guest_email: "", guest_phone: "",
    desired_dates: "", nb_guests: 2, suite_pref: "", message: "",
  });
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const upd = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await axios.post(`${API}/redeem`, { ...form, nb_guests: Number(form.nb_guests), locale: lang });
      setDone(true);
    } catch (err) {
      const d = err.response?.data?.detail;
      setError(typeof d === "string" ? d : t({ fr: "Une erreur est survenue. Vérifiez votre code.", en: "Something went wrong. Please check your code." }));
    } finally { setLoading(false); }
  };

  return (
    <>
      <Seo title={t({ fr: "Utiliser mon bon cadeau", en: "Use my gift card" })} noindex />
      <section className="min-h-[80vh] bg-cream text-ink px-6 pt-32 pb-24 flex justify-center" data-testid="gc-redeem-page">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <p className="ps-overline text-terracotta mb-3">{t({ fr: "Bon cadeau", en: "Gift card" })}</p>
            <h1 className="font-serif italic font-light text-4xl md:text-5xl leading-tight">{t({ fr: "Utiliser mon bon", en: "Use my gift card" })}</h1>
            <p className="font-sans text-sm text-ink/60 mt-4 leading-relaxed">
              {t({ fr: "Indiquez votre code et vos dates souhaitées. Nous revenons vers vous pour confirmer votre séjour.", en: "Enter your code and preferred dates. We'll get back to you to confirm your stay." })}
            </p>
          </div>
          <div className="bg-white border border-ink/10 p-8 md:p-10">
            {done ? (
              <div className="text-center" data-testid="gc-redeem-success">
                <p className="font-serif italic text-2xl mb-4">{t({ fr: "Demande envoyée", en: "Request sent" })}</p>
                <p className="font-sans text-sm text-ink/65 leading-relaxed">
                  {t({ fr: "Merci ! Nous avons bien reçu votre demande et revenons vers vous très vite pour convenir des dates.", en: "Thank you! We've received your request and will get back to you shortly to arrange the dates." })}
                </p>
              </div>
            ) : (
              <form onSubmit={submit} data-testid="gc-redeem-form">
                <Field label={t({ fr: "Code du bon", en: "Gift code" })} value={form.code} onChange={upd("code")} required testid="gc-redeem-code" placeholder="PLUME-XXXX-XXXX" />
                <Field label={t({ fr: "Votre nom", en: "Your name" })} value={form.guest_name} onChange={upd("guest_name")} required testid="gc-redeem-name" />
                <Field label={t({ fr: "Votre email", en: "Your email" })} type="email" value={form.guest_email} onChange={upd("guest_email")} required testid="gc-redeem-email" />
                <Field label={t({ fr: "Téléphone (facultatif)", en: "Phone (optional)" })} value={form.guest_phone} onChange={upd("guest_phone")} testid="gc-redeem-phone" />
                <Field label={t({ fr: "Dates souhaitées", en: "Preferred dates" })} value={form.desired_dates} onChange={upd("desired_dates")} required testid="gc-redeem-dates" placeholder={t({ fr: "ex. 14–16 février", en: "e.g. 14–16 February" })} />
                <Field label={t({ fr: "Un mot pour nous (facultatif)", en: "A note for us (optional)" })} textarea value={form.message} onChange={upd("message")} testid="gc-redeem-message" />
                {error && <p className="text-sm text-red-700 mb-4" data-testid="gc-redeem-error">{error}</p>}
                <button type="submit" disabled={loading} data-testid="gc-redeem-submit"
                  className="w-full bg-ink text-cream py-4 font-sans text-sm uppercase tracking-[0.2em] hover:bg-terracotta transition-colors disabled:opacity-60">
                  {loading ? "…" : t({ fr: "Envoyer ma demande", en: "Send my request" })}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default RedeemGift;
