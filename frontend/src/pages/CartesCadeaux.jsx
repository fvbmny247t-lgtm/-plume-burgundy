import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { X, ArrowRight, ArrowLeft, Check, ArrowDown } from "lucide-react";
import { useLang } from "../context/LanguageContext";
import Seo from "../components/Seo";
import Img from "../components/Img";
import Reveal from "../components/Reveal";

const HERO_IMG = "/media/06c7bdiw_50CA4710-2440-42FD-BA71-5227C2500D01.JPG";

const API = `${process.env.REACT_APP_BACKEND_URL}/api/giftcards`;

const fmtPrice = (n) => `${Number(n)} €`;

const GiftPreview = ({ coffret, suiteLabel, recipient, message, price, lang }) => {
  const { t } = useLang();
  return (
    <div className="rounded-2xl overflow-hidden border border-ink/15 shadow-[0_20px_50px_-20px_rgba(59,49,43,0.35)] bg-cream" data-testid="gc-preview">
      <div className="relative h-36 overflow-hidden">
        <Img src={coffret.image_url} alt="" loading="eager" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
        <div className="absolute bottom-3 left-5 right-5 text-cream">
          <p className="font-serif italic text-[10px] tracking-[0.3em] opacity-80">PLUME SUITES</p>
        </div>
      </div>
      <div className="p-6 text-center">
        <p className="ps-overline text-terracotta mb-2">{t({ fr: "Carte cadeau", en: "Gift card" })}</p>
        <h4 className="font-serif italic text-2xl font-light leading-tight">{coffret.name[lang] || coffret.name.fr}</h4>
        {suiteLabel && <p className="font-sans text-xs text-ink/55 mt-1">{suiteLabel}</p>}
        {recipient && <p className="font-sans text-sm text-ink/70 mt-4">{t({ fr: "Pour", en: "For" })} <span className="text-ink">{recipient}</span></p>}
        {message && <p className="font-serif italic text-sm text-ink/70 mt-3 leading-relaxed">« {message} »</p>}
        <div className="mt-5 pt-4 border-t border-dashed border-ink/20 flex items-center justify-between">
          <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink/45">{t({ fr: "Valable 12 mois", en: "Valid 12 months" })}</span>
          <span className="font-serif text-xl">{fmtPrice(price)}</span>
        </div>
      </div>
    </div>
  );
};

const ExperienceModal = ({ coffret, startStep, onClose }) => {
  const { t, lang } = useLang();
  const [step, setStep] = useState(startStep || "detail");
  const hasOptions = (coffret.suite_options || []).length > 0;
  const [optionKey, setOptionKey] = useState(hasOptions ? coffret.suite_options[0].key : null);
  const [mainImg, setMainImg] = useState(coffret.image_url);
  const [form, setForm] = useState({ recipient_name: "", message: "", buyer_name: "", buyer_email: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const chosen = useMemo(
    () => (hasOptions ? coffret.suite_options.find((o) => o.key === optionKey) : null),
    [optionKey, hasOptions, coffret]
  );
  const price = chosen ? chosen.price : coffret.price;
  const suiteLabel = chosen ? chosen.label[lang] || chosen.label.fr : null;
  const previewImg = chosen ? chosen.image_url : coffret.image_url;
  const upd = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => { if (chosen) setMainImg(chosen.image_url); }, [chosen]);

  const pay = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const { data } = await axios.post(`${API}/checkout`, {
        coffret_id: coffret.id, option_key: optionKey,
        buyer_name: form.buyer_name, buyer_email: form.buyer_email,
        recipient_name: form.recipient_name, message: form.message,
        locale: lang, origin_url: window.location.origin,
      });
      window.location.href = data.checkout_url;
    } catch (err) {
      setError(t({ fr: "Le paiement est momentanément indisponible. Réessayez.", en: "Payment is momentarily unavailable. Please retry." }));
      setLoading(false);
    }
  };

  const gallery = coffret.images && coffret.images.length ? coffret.images : [coffret.image_url];

  return (
    <div className="fixed inset-0 z-[90] bg-ink/75 backdrop-blur-sm overflow-y-auto" data-testid="gc-experience-modal" onClick={onClose}>
      <div className="min-h-full flex items-start md:items-center justify-center p-4 md:p-8">
        <div className="bg-cream w-full max-w-4xl rounded-2xl overflow-hidden relative my-4" onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} data-testid="gc-modal-close" aria-label="Fermer"
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-cream/90 text-ink flex items-center justify-center hover:bg-terracotta hover:text-cream transition-colors">
            <X size={18} strokeWidth={1.5} />
          </button>

          {step === "detail" && (
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="bg-ink">
                <div className="aspect-[4/5] md:aspect-auto md:h-full overflow-hidden">
                  <Img src={mainImg} alt={coffret.name[lang] || coffret.name.fr} loading="eager" className="w-full h-full object-cover" />
                </div>
                <div className="hidden md:flex gap-2 p-3 bg-ink">
                  {gallery.slice(0, 4).map((g, i) => (
                    <button key={i} onClick={() => setMainImg(g)} className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${mainImg === g ? "border-terracotta" : "border-transparent opacity-70 hover:opacity-100"}`}>
                      <Img src={g} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-8 md:p-10 flex flex-col">
                <p className="ps-overline text-terracotta mb-2">{coffret.tagline[lang] || coffret.tagline.fr}</p>
                <h2 className="font-serif italic font-light text-3xl md:text-4xl leading-tight mb-4">{coffret.name[lang] || coffret.name.fr}</h2>
                <p className="font-sans text-sm text-ink/70 leading-relaxed mb-6">{coffret.long_description[lang] || coffret.long_description.fr}</p>

                {hasOptions && (
                  <div className="mb-6">
                    <p className="ps-overline text-ink/50 mb-3">{t({ fr: "Choisissez votre suite", en: "Choose your suite" })}</p>
                    <div className="flex gap-3">
                      {coffret.suite_options.map((o) => (
                        <button key={o.key} onClick={() => setOptionKey(o.key)} data-testid={`gc-suite-${o.key}`}
                          className={`flex-1 rounded-xl border px-4 py-3 text-left transition-colors ${optionKey === o.key ? "border-terracotta bg-terracotta/5" : "border-ink/20 hover:border-ink/40"}`}>
                          <span className="block font-serif text-base">{o.label[lang] || o.label.fr}</span>
                          <span className="block font-sans text-xs text-ink/55 mt-0.5">{fmtPrice(o.price)}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <p className="ps-overline text-ink/50 mb-3">{t({ fr: "Ce que comprend l'expérience", en: "What the experience includes" })}</p>
                  <ul className="space-y-2">
                    {coffret.includes.map((inc, i) => (
                      <li key={i} className="font-sans text-sm text-ink/70 flex items-start gap-2.5">
                        <Check size={15} strokeWidth={2} className="text-terracotta mt-0.5 shrink-0" /> {inc[lang] || inc.fr}
                      </li>
                    ))}
                  </ul>
                </div>

                {coffret.usage && (
                  <p className="font-sans text-xs text-ink/50 leading-relaxed mb-6 border-l-2 border-terracotta/40 pl-3">
                    {coffret.usage[lang] || coffret.usage.fr}
                  </p>
                )}

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-ink/10">
                  <div>
                    {coffret.from_price && <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink/45 block">{t({ fr: "À partir de", en: "From" })}</span>}
                    <span className="font-serif text-3xl">{fmtPrice(price)}</span>
                  </div>
                  <button onClick={() => setStep("personalize")} data-testid="gc-to-personalize"
                    className="inline-flex items-center gap-2 bg-ink text-cream px-6 py-3.5 rounded-full uppercase text-[11px] tracking-[0.2em] hover:bg-terracotta transition-colors">
                    {t({ fr: "Offrir cette expérience", en: "Gift this experience" })} <ArrowRight size={15} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {step !== "detail" && (
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 md:p-10 bg-ink/[0.03] flex flex-col justify-center">
                <p className="ps-overline text-ink/45 mb-4 text-center">{t({ fr: "Aperçu de votre cadeau", en: "Your gift preview" })}</p>
                <GiftPreview coffret={{ ...coffret, image_url: previewImg }} suiteLabel={suiteLabel} recipient={form.recipient_name} message={form.message} price={price} lang={lang} />
              </div>

              <div className="p-8 md:p-10 flex flex-col">
                <button onClick={() => setStep(step === "recap" ? "personalize" : "detail")} className="inline-flex items-center gap-2 text-sm text-ink/55 hover:text-terracotta mb-5">
                  <ArrowLeft size={15} strokeWidth={1.5} /> {t({ fr: "Retour", en: "Back" })}
                </button>

                {step === "personalize" && (
                  <>
                    <h3 className="font-serif italic text-2xl font-light mb-5">{t({ fr: "Personnalisez votre cadeau", en: "Personalise your gift" })}</h3>
                    <div className="mb-4">
                      <label className="block ps-overline text-ink/60 mb-2">{t({ fr: "Nom du bénéficiaire", en: "Recipient's name" })}</label>
                      <input value={form.recipient_name} onChange={upd("recipient_name")} data-testid="gc-recipient"
                        className="w-full border border-ink/20 rounded-lg bg-white px-4 py-3 font-sans text-sm outline-none focus:border-terracotta" />
                    </div>
                    <div className="mb-6">
                      <label className="block ps-overline text-ink/60 mb-2">{t({ fr: "Votre message (facultatif)", en: "Your message (optional)" })}</label>
                      <textarea rows={4} value={form.message} onChange={upd("message")} data-testid="gc-message"
                        className="w-full border border-ink/20 rounded-lg bg-white px-4 py-3 font-sans text-sm outline-none focus:border-terracotta resize-none" />
                    </div>
                    <button onClick={() => setStep("recap")} data-testid="gc-to-recap"
                      className="mt-auto inline-flex items-center justify-center gap-2 bg-ink text-cream px-6 py-3.5 rounded-full uppercase text-[11px] tracking-[0.2em] hover:bg-terracotta transition-colors">
                      {t({ fr: "Continuer", en: "Continue" })} <ArrowRight size={15} strokeWidth={1.5} />
                    </button>
                  </>
                )}

                {step === "recap" && (
                  <form onSubmit={pay} data-testid="gc-recap-form">
                    <h3 className="font-serif italic text-2xl font-light mb-5">{t({ fr: "Dernière étape", en: "Final step" })}</h3>
                    <div className="bg-white rounded-lg border border-ink/10 p-4 mb-5 text-sm">
                      <div className="flex justify-between mb-1"><span className="text-ink/55">{coffret.name[lang] || coffret.name.fr}</span><span className="font-serif">{fmtPrice(price)}</span></div>
                      {suiteLabel && <div className="text-ink/55 text-xs">{suiteLabel}</div>}
                      {form.recipient_name && <div className="text-ink/55 text-xs mt-1">{t({ fr: "Pour", en: "For" })} {form.recipient_name}</div>}
                    </div>
                    <div className="mb-4">
                      <label className="block ps-overline text-ink/60 mb-2">{t({ fr: "Votre nom", en: "Your name" })}</label>
                      <input required value={form.buyer_name} onChange={upd("buyer_name")} data-testid="gc-buyer-name"
                        className="w-full border border-ink/20 rounded-lg bg-white px-4 py-3 font-sans text-sm outline-none focus:border-terracotta" />
                    </div>
                    <div className="mb-5">
                      <label className="block ps-overline text-ink/60 mb-2">{t({ fr: "Votre email", en: "Your email" })}</label>
                      <input required type="email" value={form.buyer_email} onChange={upd("buyer_email")} data-testid="gc-buyer-email"
                        className="w-full border border-ink/20 rounded-lg bg-white px-4 py-3 font-sans text-sm outline-none focus:border-terracotta" />
                      <p className="text-xs text-ink/45 mt-1">{t({ fr: "Vous recevrez le bon cadeau par email.", en: "You will receive the gift card by email." })}</p>
                    </div>
                    {error && <p className="text-sm text-red-700 mb-4" data-testid="gc-pay-error">{error}</p>}
                    <button type="submit" disabled={loading} data-testid="gc-pay-submit"
                      className="w-full bg-ink text-cream py-4 rounded-full font-sans text-sm uppercase tracking-[0.2em] hover:bg-terracotta transition-colors disabled:opacity-60">
                      {loading ? "…" : `${t({ fr: "Payer", en: "Pay" })} ${fmtPrice(price)}`}
                    </button>
                    <p className="text-center text-xs text-ink/40 mt-3">{t({ fr: "Paiement sécurisé par Stripe", en: "Secure payment by Stripe" })}</p>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CartesCadeaux = () => {
  const { t, lang } = useLang();
  const [coffrets, setCoffrets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [startStep, setStartStep] = useState("detail");

  useEffect(() => {
    axios.get(`${API}/coffrets`).then(({ data }) => setCoffrets(data)).catch(() => setCoffrets([]));
  }, []);

  const open = (c, step) => { setSelected(c); setStartStep(step); };

  return (
    <>
      <Seo title={t({ fr: "Cartes cadeaux — Offrir une expérience Plume Suites", en: "Gift cards — Offer a Plume Suites experience" })}
        description={t({ fr: "Offrez une parenthèse en Bourgogne : nos cartes cadeaux, une nuit en suite ou une table imaginée par le chef.", en: "Offer a Burgundy escape: our gift cards, a night in a suite or a table imagined by the chef." })} path="/cartes-cadeaux" />

      {/* HERO — immersive fullscreen photography */}
      <section className="relative h-[92vh] min-h-[560px] w-full overflow-hidden bg-ink" data-testid="gc-hero">
        <Img src={HERO_IMG} alt="" loading="eager" className="absolute inset-0 w-full h-full object-cover kenburns" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/20 to-ink/70" />
        <div className="relative h-full w-full flex flex-col items-center justify-center text-center px-6 text-cream">
          <h1 className="font-serif italic font-light text-4xl sm:text-6xl lg:text-7xl leading-[1.05] max-w-3xl fade-in whitespace-pre-line">
            {t({ fr: "Offrir le temps\nde s'arrêter.", en: "Give the time\nto pause." })}
          </h1>
          <p className="font-sans text-sm md:text-base text-cream/80 max-w-lg mx-auto leading-relaxed mt-8 fade-in">
            {t({
              fr: "Une nuit dans nos suites, une table imaginée par le chef, un instant que l'on offre à ceux que l'on aime.",
              en: "A night in our suites, a table imagined by the chef, a moment to offer those you love.",
            })}
          </p>
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 ps-scroll-cue">
            <ArrowDown size={22} strokeWidth={1.2} className="text-cream/70" />
          </div>
        </div>
      </section>

      {/* STATEMENT — editorial scroll reveal */}
      <section className="bg-cream text-ink py-28 md:py-40 px-6" data-testid="gc-statement">
        <div className="max-w-4xl mx-auto text-center">
          <Reveal as="p" className="font-serif italic font-light text-3xl sm:text-4xl lg:text-5xl leading-[1.25] tracking-tight">
            {t({
              fr: "Offrir une carte Plume Suites, c'est offrir du temps. Celui que l'on prend pour soi, pour l'autre, loin du bruit, au bord du canal de Bourgogne.",
              en: "To give a Plume Suites card is to give time. The kind you keep for yourself, for the other, far from the noise, by the Burgundy canal.",
            })}
          </Reveal>
        </div>
      </section>

      {/* EXPERIENCES — card grid */}
      <section className="bg-cream text-ink pb-28 md:pb-40 px-6" data-testid="gc-coffrets">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-7 lg:gap-9">
          {coffrets.map((c, idx) => (
            <Reveal key={c.id} delay={idx * 110} className="h-full">
              <article data-testid={`gc-coffret-${c.slug}`}
                className="group h-full flex flex-col bg-white border border-ink/10 rounded-lg overflow-hidden transition-shadow duration-500 hover:shadow-[0_26px_55px_-30px_rgba(59,49,43,0.45)]">
                <button onClick={() => open(c, "detail")} aria-label={c.name[lang] || c.name.fr}
                  className="relative aspect-[4/3] overflow-hidden">
                  <Img src={c.image_url} alt={c.name[lang] || c.name.fr} loading="eager"
                    className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]" />
                  <span className="absolute top-4 right-4 bg-cream/95 text-ink font-serif italic text-base px-3 py-1.5 leading-none">
                    {c.from_price && <span className="font-sans not-italic text-[9px] uppercase tracking-[0.12em] text-ink/55 block mb-0.5">{t({ fr: "à partir de", en: "from" })}</span>}
                    {fmtPrice(c.price)}
                  </span>
                </button>
                <div className="p-6 md:p-7 flex flex-col flex-1">
                  <p className="font-serif italic text-sm text-terracotta mb-1.5">{c.tagline[lang] || c.tagline.fr}</p>
                  <h2 onClick={() => open(c, "detail")}
                    className="font-serif italic font-light text-2xl md:text-3xl leading-snug cursor-pointer hover:text-terracotta transition-colors">
                    {c.name[lang] || c.name.fr}
                  </h2>
                  <p className="font-sans text-sm text-ink/70 leading-relaxed mt-3 flex-1">
                    {(c.short_description && (c.short_description[lang] || c.short_description.fr)) || ""}
                  </p>
                  <div className="flex items-center justify-between gap-4 mt-6 pt-5 border-t border-ink/10">
                    <button onClick={() => open(c, "detail")} data-testid={`gc-discover-${c.slug}`}
                      className="text-ink hover:text-terracotta transition-colors uppercase text-[11px] tracking-[0.26em] border-b border-ink/30 hover:border-terracotta pb-1">
                      {t({ fr: "Découvrir", en: "Discover" })}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); open(c, "personalize"); }} data-testid={`gc-offer-${c.slug}`}
                      className="bg-terracotta hover:bg-terracottaDark text-cream transition-colors px-6 py-3 uppercase text-[11px] tracking-[0.28em]">
                      {t({ fr: "Offrir", en: "Gift this" })}
                    </button>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {/* REDEMPTION */}
        <Reveal className="max-w-2xl mx-auto text-center mt-32 md:mt-44 border-t border-ink/10 pt-16">
          <p className="font-serif italic font-light text-2xl md:text-3xl leading-snug mb-8">
            {t({ fr: "Vous avez reçu une carte cadeau Plume Suites ? Profitez de l'expérience qui vous a été offerte.", en: "Received a Plume Suites gift card? Enjoy the experience you were given." })}
          </p>
          <Link to="/reserver" data-testid="gc-use-link"
            className="inline-flex items-center gap-3 border border-ink text-ink px-8 py-3.5 uppercase text-[11px] tracking-[0.3em] hover:bg-ink hover:text-cream transition-colors">
            {t({ fr: "Utiliser ma carte cadeau", en: "Use my gift card" })} <ArrowRight size={14} strokeWidth={1.5} />
          </Link>
        </Reveal>
      </section>

      {selected && <ExperienceModal coffret={selected} startStep={startStep} onClose={() => setSelected(null)} />}
    </>
  );
};

export default CartesCadeaux;
