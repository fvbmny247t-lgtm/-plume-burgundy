import React, { useState } from "react";
import axios from "axios";
import { useLang } from "../context/LanguageContext";

const API = `${process.env.REACT_APP_BACKEND_URL}/api/giftcards`;

const inputCls =
  "w-full border-0 border-b border-ink/25 bg-transparent px-0 py-2.5 font-sans text-[15px] outline-none focus:border-terracotta placeholder:text-ink/35 transition-colors";

const Field = ({ label, testid, textarea, className = "", ...props }) => (
  <label className={`block mb-6 ${className}`}>
    <span className="block ps-overline text-ink/55 mb-1">{label}</span>
    {textarea ? (
      <textarea data-testid={testid} rows={2} className={`${inputCls} resize-none`} {...props} />
    ) : (
      <input data-testid={testid} className={inputCls} {...props} />
    )}
  </label>
);

// Formulaire « utiliser ma carte cadeau » : partagé entre la page /utiliser-mon-bon et la fenêtre de /reserver.
const GiftRedeemForm = ({ initialCode = "" }) => {
  const { t, lang } = useLang();
  const [form, setForm] = useState({
    code: initialCode,
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

  if (done) {
    return (
      <div className="py-6" data-testid="gc-redeem-success" role="status">
        <p className="font-serif italic text-3xl font-light mb-4">{t({ fr: "C'est noté.", en: "Noted." })}</p>
        <p className="font-sans text-[15px] text-ink/70 leading-relaxed">
          {t({
            fr: "Votre demande nous est bien parvenue. Nous vérifions les disponibilités et revenons vers vous très vite pour confirmer votre séjour.",
            en: "We've received your request. We'll check availability and get back to you shortly to confirm your stay.",
          })}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} data-testid="gc-redeem-form">
      <Field
        label={t({ fr: "Code de la carte", en: "Gift code" })}
        value={form.code} onChange={upd("code")} required testid="gc-redeem-code"
        placeholder="PLUME-XXXX-XXXX" autoComplete="off" spellCheck={false}
        style={{ letterSpacing: "0.12em", textTransform: "uppercase" }}
      />
      <Field label={t({ fr: "Dates souhaitées", en: "Preferred dates" })} value={form.desired_dates} onChange={upd("desired_dates")} required testid="gc-redeem-dates" placeholder={t({ fr: "ex. du 14 au 16 février", en: "e.g. 14–16 February" })} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
        <Field label={t({ fr: "Votre nom", en: "Your name" })} value={form.guest_name} onChange={upd("guest_name")} required testid="gc-redeem-name" autoComplete="name" />
        <Field label={t({ fr: "Téléphone", en: "Phone" })} type="tel" value={form.guest_phone} onChange={upd("guest_phone")} testid="gc-redeem-phone" autoComplete="tel" placeholder={t({ fr: "facultatif", en: "optional" })} />
      </div>
      <Field label={t({ fr: "Votre email", en: "Your email" })} type="email" value={form.guest_email} onChange={upd("guest_email")} required testid="gc-redeem-email" autoComplete="email" />
      <Field label={t({ fr: "Un mot pour nous", en: "A note for us" })} textarea value={form.message} onChange={upd("message")} testid="gc-redeem-message" placeholder={t({ fr: "facultatif", en: "optional" })} />
      {error && <p className="text-sm text-terracottaDark mb-4" data-testid="gc-redeem-error" role="alert">{error}</p>}
      <button type="submit" disabled={loading} data-testid="gc-redeem-submit"
        className="w-full bg-ink text-cream py-4 font-sans text-[11px] uppercase tracking-[0.3em] hover:bg-terracotta transition-colors disabled:opacity-60">
        {loading ? "…" : t({ fr: "Envoyer ma demande", en: "Send my request" })}
      </button>
      <p className="font-sans text-xs text-ink/50 mt-4 leading-relaxed">
        {t({
          fr: "Nous réservons la suite pour vous et vous confirmons le séjour par email.",
          en: "We book the suite for you and confirm your stay by email.",
        })}
      </p>
    </form>
  );
};

export default GiftRedeemForm;
