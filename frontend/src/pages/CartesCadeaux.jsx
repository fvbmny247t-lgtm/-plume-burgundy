import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Gift, Sparkles, X } from "lucide-react";
import { useLang } from "../context/LanguageContext";
import Seo from "../components/Seo";
import Img from "../components/Img";

const API = `${process.env.REACT_APP_BACKEND_URL}/api/giftcards`;

const BuyModal = ({ coffret, onClose }) => {
  const { t, lang } = useLang();
  const [form, setForm] = useState({ buyer_name: "", buyer_email: "", recipient_name: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const upd = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/checkout`, {
        coffret_id: coffret.id,
        ...form,
        locale: lang,
        origin_url: window.location.origin,
      });
      window.location.href = data.checkout_url;
    } catch (err) {
      setError(t({ fr: "Le paiement est momentanément indisponible. Réessayez.", en: "Payment is momentarily unavailable. Please retry." }));
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/70 backdrop-blur-sm px-4" data-testid="gc-buy-modal" onClick={onClose}>
      <div className="bg-cream w-full max-w-lg p-8 md:p-10 relative max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} data-testid="gc-modal-close" aria-label="Fermer" className="absolute top-4 right-4 text-ink/50 hover:text-ink">
          <X size={22} strokeWidth={1.5} />
        </button>
        <p className="ps-overline text-terracotta mb-2">{t({ fr: "Offrir", en: "Gift" })}</p>
        <h2 className="font-serif italic font-light text-3xl mb-1">{coffret.name[lang] || coffret.name.fr}</h2>
        <p className="font-sans text-sm text-ink/60 mb-6">{coffret.price} €</p>
        <form onSubmit={submit} data-testid="gc-buy-form">
          {[
            { k: "buyer_name", label: { fr: "Votre nom", en: "Your name" }, type: "text", req: true },
            { k: "buyer_email", label: { fr: "Votre email", en: "Your email" }, type: "email", req: true },
            { k: "recipient_name", label: { fr: "Nom du bénéficiaire (facultatif)", en: "Recipient name (optional)" }, type: "text", req: false },
          ].map((f) => (
            <div key={f.k} className="mb-4">
              <label className="block ps-overline text-ink/60 mb-2">{t(f.label)}</label>
              <input type={f.type} required={f.req} value={form[f.k]} onChange={upd(f.k)} data-testid={`gc-${f.k}`}
                className="w-full border border-ink/20 bg-white px-4 py-3 font-sans text-sm outline-none focus:border-terracotta" />
            </div>
          ))}
          <div className="mb-5">
            <label className="block ps-overline text-ink/60 mb-2">{t({ fr: "Petit mot (facultatif)", en: "Personal note (optional)" })}</label>
            <textarea rows={3} value={form.message} onChange={upd("message")} data-testid="gc-message"
              className="w-full border border-ink/20 bg-white px-4 py-3 font-sans text-sm outline-none focus:border-terracotta resize-none" />
          </div>
          {error && <p className="text-sm text-red-700 mb-4" data-testid="gc-buy-error">{error}</p>}
          <button type="submit" disabled={loading} data-testid="gc-buy-submit"
            className="w-full bg-ink text-cream py-4 font-sans text-sm uppercase tracking-[0.2em] hover:bg-terracotta transition-colors disabled:opacity-60">
            {loading ? "…" : t({ fr: "Procéder au paiement", en: "Proceed to payment" })}
          </button>
          <p className="text-center text-xs text-ink/40 mt-3">{t({ fr: "Paiement sécurisé par Stripe", en: "Secure payment by Stripe" })}</p>
        </form>
      </div>
    </div>
  );
};

const CartesCadeaux = () => {
  const { t, lang } = useLang();
  const [coffrets, setCoffrets] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    axios.get(`${API}/coffrets`).then(({ data }) => setCoffrets(data)).catch(() => setCoffrets([]));
  }, []);

  return (
    <>
      <Seo title={t({ fr: "Cartes cadeaux — Offrir une expérience Plume", en: "Gift cards — Offer a Plume experience" })}
        description={t({ fr: "Offrez une parenthèse en Bourgogne : coffrets expérience Plume Suites à offrir pour les fêtes.", en: "Offer a Burgundy escape: Plume Suites experience gift cards for the holidays." })} path="/cartes-cadeaux" />

      {/* HERO festif */}
      <section className="relative bg-ink text-cream pt-32 pb-20 px-6 overflow-hidden" data-testid="gc-hero">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <p className="ps-overline text-terracotta mb-4 flex items-center justify-center gap-2">
            <Sparkles size={14} strokeWidth={1.5} /> {t({ fr: "Édition des fêtes", en: "Holiday edition" })}
          </p>
          <h1 className="font-serif italic font-light text-4xl sm:text-5xl lg:text-6xl leading-tight mb-6">
            {t({ fr: "Offrez une parenthèse", en: "Offer a moment away" })}
          </h1>
          <p className="font-sans text-base text-cream/70 max-w-2xl mx-auto leading-relaxed">
            {t({
              fr: "Une nuit en suite, un dîner gastronomique, un séjour tout en douceur. Offrez bien plus qu'un cadeau : une expérience en Bourgogne, à vivre quand on le souhaite.",
              en: "A night in a suite, a gourmet dinner, an unhurried stay. Offer far more than a gift: a Burgundy experience, to enjoy whenever they wish.",
            })}
          </p>
        </div>
      </section>

      {/* Coffrets */}
      <section className="bg-cream text-ink py-20 px-6" data-testid="gc-coffrets">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {coffrets.map((c) => (
              <article key={c.id} className="bg-white border border-ink/10 flex flex-col group" data-testid={`gc-coffret-${c.slug}`}>
                <div className="aspect-[4/3] overflow-hidden">
                  <Img src={c.image_url} alt={c.name[lang] || c.name.fr} loading="eager" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="p-7 flex flex-col flex-1">
                  <p className="ps-overline text-terracotta mb-2">{(c.tagline && (c.tagline[lang] || c.tagline.fr)) || ""}</p>
                  <h2 className="font-serif italic text-2xl font-light mb-3">{c.name[lang] || c.name.fr}</h2>
                  <p className="font-sans text-sm text-ink/60 leading-relaxed mb-4 flex-1">{c.description[lang] || c.description.fr}</p>
                  <ul className="mb-5 space-y-1.5">
                    {(c.includes || []).map((inc, i) => (
                      <li key={i} className="font-sans text-xs text-ink/55 flex items-start gap-2">
                        <span className="text-terracotta mt-0.5">—</span> {inc[lang] || inc.fr}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between pt-4 border-t border-ink/10">
                    <span className="font-serif text-2xl">{c.price} €</span>
                    <button onClick={() => setSelected(c)} data-testid={`gc-offer-${c.slug}`}
                      className="inline-flex items-center gap-2 bg-ink text-cream px-5 py-3 uppercase text-[10px] tracking-[0.2em] hover:bg-terracotta transition-colors">
                      <Gift size={14} strokeWidth={1.5} /> {t({ fr: "Offrir", en: "Gift this" })}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="text-center mt-16">
            <p className="font-sans text-sm text-ink/60">
              {t({ fr: "Vous avez déjà reçu un bon cadeau ?", en: "Already received a gift card?" })}{" "}
              <Link to="/utiliser-mon-bon" data-testid="gc-use-link" className="text-terracotta hover:underline underline-offset-4">
                {t({ fr: "Utiliser mon bon", en: "Use my gift card" })}
              </Link>
            </p>
          </div>
        </div>
      </section>

      {selected && <BuyModal coffret={selected} onClose={() => setSelected(null)} />}
    </>
  );
};

export default CartesCadeaux;
