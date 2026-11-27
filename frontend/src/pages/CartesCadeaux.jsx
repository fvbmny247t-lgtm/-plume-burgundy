import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { X, ArrowRight, ArrowLeft, ArrowDown } from "lucide-react";
import { useLang } from "../context/LanguageContext";
import Seo from "../components/Seo";
import Img from "../components/Img";
import Reveal from "../components/Reveal";
import GiftCardVisual from "../components/GiftCardVisual";

const HERO_IMG = "/media/06c7bdiw_50CA4710-2440-42FD-BA71-5227C2500D01.JPG";

const API = `${process.env.REACT_APP_BACKEND_URL}/api/giftcards`;

const fmtPrice = (n) => `${Number(n)} €`;


// Exemple de menu affiché dans la fiche de l'Échappée ; la carte suit les saisons.
// shortcut: codé par slug ; à passer dans l'admin des coffrets si le menu change souvent.
const SAMPLE_MENUS = {
  "echappee-gourmande": [
    { name: { fr: "Ravioles de homard", en: "Lobster ravioli" }, detail: { fr: "Coulis de gambas, pleurotes", en: "Prawn coulis, oyster mushrooms" } },
    { name: { fr: "Bœuf confit 7 heures en croustillant", en: "Seven-hour confit beef in a crisp shell" }, detail: { fr: "Purée de patates douces, réduction au Pedro Ximénez", en: "Sweet potato purée, Pedro Ximénez reduction" } },
    { name: { fr: "Popcorn", en: "Popcorn" }, detail: { fr: "Cœur popcorn, maïs torréfié, sablé, crème brûlée", en: "Popcorn heart, roasted corn, shortbread, crème brûlée" } },
  ],
};

// shortcut: badge codé par slug ; à déplacer dans l'admin des coffrets si on veut le changer souvent.
const BADGES = {
  "envolee-deux": { fr: "Signature", en: "Signature" },
};

// La carte telle que la reçoit le bénéficiaire : une bande photo + un carton crème.
// Mise en page en flux simple (pas d'aspect-ratio ni de position absolue) pour rester stable partout.
const GiftPreview = ({ coffret, suiteLabel, recipient, message, price, lang }) => {
  const { t } = useLang();
  return (
    <GiftCardVisual
      title={coffret.name[lang] || coffret.name.fr}
      subtitle={suiteLabel}
      recipient={recipient}
      message={message}
      footerLeft={t({ fr: "Valable 12 mois", en: "Valid 12 months" })}
      footerRight={price != null ? fmtPrice(price) : null}
    />
  );
};

const ExperienceModal = ({ coffret, startStep, onClose }) => {
  const { t, lang } = useLang();
  const [step, setStep] = useState(startStep || "detail");
  const hasOptions = (coffret.suite_options || []).length > 0;
  const [optionKey, setOptionKey] = useState(hasOptions ? coffret.suite_options[0].key : null);
  const [mainImg, setMainImg] = useState(coffret.image_url);
  const [form, setForm] = useState({ recipient_name: "", message: "", buyer_first_name: "", buyer_last_name: "", buyer_email: "", buyer_phone: "" });
  const [cgvOk, setCgvOk] = useState(false);
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
        buyer_name: `${form.buyer_first_name.trim()} ${form.buyer_last_name.trim()}`.trim(),
        buyer_first_name: form.buyer_first_name.trim(), buyer_last_name: form.buyer_last_name.trim(),
        buyer_email: form.buyer_email, buyer_phone: form.buyer_phone.trim(),
        recipient_name: form.recipient_name, message: form.message,
        locale: lang, origin_url: window.location.origin,
      });
      window.location.href = data.checkout_url;
    } catch (err) {
      setError(t({ fr: "Le paiement est momentanément indisponible. Réessayez.", en: "Payment is momentarily unavailable. Please retry." }));
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-[90] bg-ink/75 backdrop-blur-sm overflow-y-auto animate-in fade-in-0 duration-300" data-testid="gc-experience-modal" onClick={onClose}>
      <div className="min-h-full flex items-start md:items-center justify-center p-4 md:p-8">
        <div className="bg-cream w-full max-w-4xl overflow-clip relative my-4 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-500 ease-out" onClick={(e) => e.stopPropagation()}>
          <button onClick={onClose} data-testid="gc-modal-close" aria-label="Fermer"
            className="absolute top-3 right-3 z-10 w-10 h-10 bg-cream/90 text-ink flex items-center justify-center hover:text-terracotta transition-colors">
            <X size={18} strokeWidth={1.5} />
          </button>

          {step === "detail" && (
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="bg-ink">
                {/* photo au format portrait, qui reste visible pendant qu'on lit le texte (au lieu d'être étirée sur toute la hauteur) */}
                <div className="md:sticky md:top-0">
                  {/* la photo devient elle-même transparente vers le bas : elle se fond dans le brun sans calque ni limite visible */}
                  <div style={{ "--photo-fade": "linear-gradient(to bottom, #000 0%, #000 22%, rgba(0,0,0,.94) 34%, rgba(0,0,0,.8) 46%, rgba(0,0,0,.6) 58%, rgba(0,0,0,.4) 69%, rgba(0,0,0,.22) 80%, rgba(0,0,0,.09) 90%, rgba(0,0,0,.02) 96%, transparent 100%)" }} className="aspect-[4/5] overflow-hidden md:[mask-image:var(--photo-fade)] md:[-webkit-mask-image:var(--photo-fade)]">
                    <Img src={mainImg} alt={coffret.name[lang] || coffret.name.fr} loading="eager" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
              <div className="p-8 pt-14 md:p-10 md:pt-14 flex flex-col">
                <p className="ps-overline text-terracotta mb-2">{coffret.tagline[lang] || coffret.tagline.fr}</p>
                <h2 className="font-serif italic font-light text-3xl md:text-4xl leading-tight mb-4">{coffret.name[lang] || coffret.name.fr}</h2>
                <p className="font-sans text-sm text-ink/70 leading-relaxed mb-6">{coffret.long_description[lang] || coffret.long_description.fr}</p>

                {hasOptions && (
                  <div className="mb-6">
                    <p className="ps-overline text-ink/50 mb-3">{t({ fr: "Choisissez votre suite", en: "Choose your suite" })}</p>
                    <div className="flex gap-3">
                      {coffret.suite_options.map((o) => (
                        <button key={o.key} onClick={() => setOptionKey(o.key)} data-testid={`gc-suite-${o.key}`}
                          className={`flex-1 border px-4 py-3 text-left transition-colors ${optionKey === o.key ? "border-terracotta bg-terracotta/5" : "border-ink/20 hover:border-ink/40"}`}>
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
                        <span aria-hidden="true" className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-terracotta" /> {inc[lang] || inc.fr}
                      </li>
                    ))}
                  </ul>
                </div>

                {SAMPLE_MENUS[coffret.slug] && (
                  <div className="mb-8 pt-6 border-t border-ink/10 text-center" data-testid="gc-sample-menu">
                    <p className="ps-overline text-ink/50">{t({ fr: "Exemple de menu", en: "Sample menu" })}</p>
                    <ul className="mt-5 space-y-4">
                      {SAMPLE_MENUS[coffret.slug].map((m, i) => (
                        <li key={i}>
                          <p className="font-serif text-xl leading-tight">{t(m.name)}</p>
                          <p className="font-sans text-[13px] text-ink/55 mt-1">{t(m.detail)}</p>
                        </li>
                      ))}
                    </ul>
                    <a href="https://www.optitreperedugout.fr" target="_blank" rel="noreferrer" data-testid="gc-restaurant-submark"
                      aria-label={t({ fr: "Découvrir le restaurant Ô P'tit Repère du Goût", en: "Discover the Ô P'tit Repère du Goût restaurant" })}
                      className="mt-12 inline-block opacity-90 hover:opacity-100 transition-opacity">
                      <Img src="/images/submark-repere-du-gout.png" alt="Ô P'tit Repère du Goût" className="h-7 w-auto mx-auto" />
                    </a>
                    <p className="font-serif italic text-sm text-ink/50 mt-6 max-w-xs mx-auto">
                      {t({
                        fr: "Ce menu est donné à titre d'exemple : il change avec les saisons. Contactez-nous pour connaître celui prévu à vos dates.",
                        en: "This menu is only an example, as it changes with the seasons. Contact us to find out the menu for your dates.",
                      })}
                    </p>
                  </div>
                )}

                {coffret.usage && (
                  <p className="font-sans text-xs text-ink/50 leading-relaxed mb-6 border-l-2 border-terracotta/40 pl-3">
                    {coffret.usage[lang] || coffret.usage.fr}
                  </p>
                )}

                <div className="mt-auto flex items-center justify-between gap-4 pt-4 border-t border-ink/10">
                  <div className="shrink-0">
                    {coffret.from_price && <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-ink/45 block">{t({ fr: "À partir de", en: "From" })}</span>}
                    <span className="font-serif text-2xl lg:text-3xl whitespace-nowrap">{fmtPrice(price)}</span>
                  </div>
                  <button onClick={() => setStep("personalize")} data-testid="gc-to-personalize"
                    className="inline-flex items-center gap-2 whitespace-nowrap bg-ink text-cream px-4 lg:px-6 py-3.5 uppercase text-[10px] lg:text-[11px] tracking-[0.18em] lg:tracking-[0.2em] hover:bg-terracotta transition-colors">
                    <span className="lg:hidden">{t({ fr: "Offrir", en: "Gift it" })}</span>
                    <span className="hidden lg:inline">{t({ fr: "Offrir cette expérience", en: "Gift this experience" })}</span>
                    <ArrowRight size={15} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {step !== "detail" && (
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 md:p-12 bg-sand flex flex-col justify-center items-center">
                <p className="ps-overline text-ink/45 mb-4 text-center">{t({ fr: "Aperçu de votre cadeau", en: "Your gift preview" })}</p>
                <GiftPreview coffret={{ ...coffret, image_url: previewImg }} suiteLabel={suiteLabel} recipient={form.recipient_name} message={form.message} price={price} lang={lang} />
              </div>

              <div className="p-8 pt-14 md:p-10 md:pt-14 flex flex-col">
                <button onClick={() => setStep(step === "recap" ? "personalize" : "detail")} className="inline-flex items-center gap-2 text-sm text-ink/55 hover:text-terracotta mb-5">
                  <ArrowLeft size={15} strokeWidth={1.5} /> {t({ fr: "Retour", en: "Back" })}
                </button>

                {step === "personalize" && (
                  <>
                    <h3 className="font-serif italic text-2xl font-light mb-5">{t({ fr: "Personnalisez votre cadeau", en: "Personalise your gift" })}</h3>
                    <div className="mb-4">
                      <label className="block ps-overline text-ink/60 mb-2">{t({ fr: "Nom du bénéficiaire", en: "Recipient's name" })}</label>
                      <input value={form.recipient_name} onChange={upd("recipient_name")} data-testid="gc-recipient"
                        className="w-full border-0 border-b border-ink/25 bg-transparent px-0 py-2.5 font-sans text-sm outline-none focus:border-terracotta" />
                    </div>
                    <div className="mb-6">
                      <label className="block ps-overline text-ink/60 mb-2">{t({ fr: "Votre message (facultatif)", en: "Your message (optional)" })}</label>
                      <textarea rows={4} value={form.message} onChange={upd("message")} data-testid="gc-message"
                        className="w-full border-0 border-b border-ink/25 bg-transparent px-0 py-2.5 font-sans text-sm outline-none focus:border-terracotta resize-none" />
                    </div>
                    <button onClick={() => setStep("recap")} data-testid="gc-to-recap"
                      className="mt-auto inline-flex items-center justify-center gap-2 bg-ink text-cream px-6 py-3.5 uppercase text-[11px] tracking-[0.2em] hover:bg-terracotta transition-colors">
                      {t({ fr: "Continuer", en: "Continue" })} <ArrowRight size={15} strokeWidth={1.5} />
                    </button>
                  </>
                )}

                {step === "recap" && (
                  <form onSubmit={pay} data-testid="gc-recap-form">
                    <h3 className="font-serif italic text-2xl font-light mb-5">{t({ fr: "Dernière étape", en: "Final step" })}</h3>
                    <div className="border-y border-ink/15 py-4 mb-6 text-sm">
                      <div className="flex justify-between mb-1"><span className="text-ink/55">{coffret.name[lang] || coffret.name.fr}</span><span className="font-serif">{fmtPrice(price)}</span></div>
                      {suiteLabel && <div className="text-ink/55 text-xs">{suiteLabel}</div>}
                      {form.recipient_name && <div className="text-ink/55 text-xs mt-1">{t({ fr: "Pour", en: "For" })} {form.recipient_name}</div>}
                    </div>
                    <div className="grid grid-cols-2 gap-x-6">
                      <div className="mb-4">
                        <label className="block ps-overline text-ink/60 mb-2">{t({ fr: "Prénom", en: "First name" })}</label>
                        <input required autoComplete="given-name" value={form.buyer_first_name} onChange={upd("buyer_first_name")} data-testid="gc-buyer-first-name"
                          className="w-full border-0 border-b border-ink/25 bg-transparent px-0 py-2.5 font-sans text-sm outline-none focus:border-terracotta" />
                      </div>
                      <div className="mb-4">
                        <label className="block ps-overline text-ink/60 mb-2">{t({ fr: "Nom", en: "Last name" })}</label>
                        <input required autoComplete="family-name" value={form.buyer_last_name} onChange={upd("buyer_last_name")} data-testid="gc-buyer-last-name"
                          className="w-full border-0 border-b border-ink/25 bg-transparent px-0 py-2.5 font-sans text-sm outline-none focus:border-terracotta" />
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block ps-overline text-ink/60 mb-2">{t({ fr: "Votre email", en: "Your email" })}</label>
                      <input required type="email" autoComplete="email" value={form.buyer_email} onChange={upd("buyer_email")} data-testid="gc-buyer-email"
                        className="w-full border-0 border-b border-ink/25 bg-transparent px-0 py-2.5 font-sans text-sm outline-none focus:border-terracotta" />
                      <p className="text-xs text-ink/45 mt-1">{t({ fr: "Vous recevrez la carte cadeau par email.", en: "You will receive the gift card by email." })}</p>
                    </div>
                    <div className="mb-5">
                      <label className="block ps-overline text-ink/60 mb-2">{t({ fr: "Téléphone", en: "Phone" })}</label>
                      <input required type="tel" autoComplete="tel" value={form.buyer_phone} onChange={upd("buyer_phone")} data-testid="gc-buyer-phone"
                        className="w-full border-0 border-b border-ink/25 bg-transparent px-0 py-2.5 font-sans text-sm outline-none focus:border-terracotta" />
                    </div>
                    <label className="flex items-start gap-3 mb-5 cursor-pointer font-sans text-xs text-ink/70 leading-relaxed">
                      <input type="checkbox" required checked={cgvOk} onChange={(e) => setCgvOk(e.target.checked)} data-testid="gc-cgv"
                        className="mt-0.5 h-4 w-4 shrink-0 accent-terracotta" />
                      <span>
                        {t({ fr: "J'ai lu et j'accepte les ", en: "I have read and accept the " })}
                        <a href={lang === "en" ? "/cgv#gift-cards" : "/cgv#cartes-cadeaux"} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-terracotta">
                          {t({ fr: "conditions générales de vente", en: "terms and conditions of sale" })}
                        </a>.
                      </span>
                    </label>
                    {error && <p className="text-sm text-red-700 mb-4" data-testid="gc-pay-error">{error}</p>}
                    <button type="submit" disabled={loading || !cgvOk} data-testid="gc-pay-submit"
                      className="w-full bg-ink text-cream py-4 font-sans text-sm uppercase tracking-[0.2em] hover:bg-terracotta transition-colors disabled:opacity-60">
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

      {/* STATEMENT */}
      <section className="bg-cream text-ink pt-24 md:pt-32 pb-16 md:pb-24 px-6" data-testid="gc-statement">
        <Reveal as="p" className="max-w-3xl mx-auto text-center font-serif italic font-light text-3xl sm:text-4xl lg:text-[44px] leading-[1.2]">
          {t({
            fr: "Offrir une carte Plume Suites, c'est offrir du temps. Celui que l'on prend pour soi, pour l'autre, au bord du canal de Bourgogne.",
            en: "To give a Plume Suites card is to give time. The kind you keep for yourself, for the other, by the Burgundy canal.",
          })}
        </Reveal>
      </section>

      {/* EXPÉRIENCES — les trois offres visibles d'un coup */}
      <section className="bg-cream text-ink px-6 md:px-12 pb-24 md:pb-32" data-testid="gc-coffrets">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-x-8 lg:gap-x-12 gap-y-16">
          {/* subgrid : image, accroche, titre, texte et prix tombent sur les mêmes lignes d'une carte à l'autre */}
          {coffrets.map((c, idx) => {
            const name = c.name[lang] || c.name.fr;
            return (
              <Reveal key={c.id} delay={idx * 110} as="article" data-testid={`gc-coffret-${c.slug}`} className="flex flex-col md:grid md:grid-rows-subgrid md:row-span-5 md:gap-y-0">
                <button onClick={() => open(c, "detail")} aria-label={name} className="group relative block overflow-hidden aspect-[4/5]">
                  <Img src={c.image_url} alt={name} className="w-full h-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-[1.04]" />
                  {BADGES[c.slug] && (
                    <span className="absolute top-4 left-4 bg-cream/95 text-ink font-serif italic text-[15px] px-3.5 py-1.5 leading-none">
                      {t(BADGES[c.slug])}
                    </span>
                  )}
                </button>
                <p className="font-serif italic text-base text-ink/60 mt-7 self-end">{c.tagline[lang] || c.tagline.fr}</p>
                <h2 className="font-serif italic font-light text-3xl lg:text-[34px] leading-[1.1] mt-1">{name}</h2>
                <p lang={lang} className="font-sans text-[15px] text-ink/75 leading-relaxed mt-4 flex-1 text-justify hyphens-auto">
                  {(c.short_description && (c.short_description[lang] || c.short_description.fr)) || ""}
                </p>
                <div className="mt-7 pt-5 border-t border-ink/15 flex items-center justify-between gap-4 md:flex-col md:items-start xl:flex-row xl:items-center">
                  <p className="font-serif text-2xl leading-none whitespace-nowrap">
                    {c.from_price && <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-ink/50 mr-1.5 align-middle">{t({ fr: "dès", en: "from" })}</span>}
                    {fmtPrice(c.price)}
                  </p>
                  <div className="flex items-center gap-5">
                    <button onClick={() => open(c, "detail")} data-testid={`gc-discover-${c.slug}`}
                      className="font-sans uppercase text-[10px] tracking-[0.3em] text-ink/70 hover:text-terracotta transition-colors border-b border-ink/25 hover:border-terracotta pb-1 whitespace-nowrap">
                      {t({ fr: "Détails", en: "Details" })}
                    </button>
                    <button onClick={() => open(c, "personalize")} data-testid={`gc-offer-${c.slug}`}
                      className="bg-terracotta hover:bg-terracottaDark text-cream transition-colors px-6 py-3 uppercase text-[10px] tracking-[0.3em]">
                      {t({ fr: "Offrir", en: "Gift this" })}
                    </button>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* LA CARTE — l'objet que l'on offre, posé sur une photo de la maison */}
      {coffrets[0] && (
        <section className="bg-sand text-ink px-6 md:px-12 py-24 md:py-32" data-testid="gc-the-card">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-10 lg:gap-16 items-center">
            <div className="md:col-span-5">
              <p className="ps-overline text-terracotta mb-4">{t({ fr: "La carte", en: "The card" })}</p>
              <h2 className="font-serif italic font-light text-4xl md:text-5xl leading-[1.05]">
                {t({ fr: "Une carte à son nom.", en: "A card in their name." })}
              </h2>
              <p className="font-sans text-[15px] text-ink/75 leading-relaxed mt-6 max-w-md">
                {t({
                  fr: "Vous choisissez l'expérience, écrivez quelques mots, et voyez la carte se composer sous vos yeux. Dès le paiement, elle arrive par email, prête à être transmise ou imprimée et glissée dans une enveloppe.",
                  en: "Choose the experience, write a few words, and watch the card take shape. Once paid, it arrives by email, ready to forward or print and slip into an envelope.",
                })}
              </p>
              <ol className="mt-10 space-y-5 font-sans text-sm text-ink/75">
                {[
                  { fr: "Vous offrez, la carte arrive par email avec son code.", en: "You gift it; the card arrives by email with its code." },
                  { fr: "Le bénéficiaire choisit ses dates sur la page Réserver.", en: "The recipient picks dates on the Book page." },
                  { fr: "Nous réservons la suite pour lui et confirmons le séjour.", en: "We book the suite and confirm the stay." },
                ].map((step, i) => (
                  <li key={i} className="flex gap-5 border-t border-ink/15 pt-5">
                    <span className="font-serif italic text-xl text-terracotta leading-none">{i + 1}.</span>
                    <span>{t(step)}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="md:col-span-7">
              <div className="relative">
                <Img src={coffrets[1]?.image_url || coffrets[0].image_url} alt="" className="w-full aspect-[4/3] object-cover" />
                <div className="relative -mt-24 sm:-mt-32 mx-4 sm:mx-10 md:mx-0 md:-ml-8 lg:-ml-12 md:mr-6 lg:mr-16">
                  <GiftPreview coffret={coffrets[0]} recipient="Claire & Antoine"
                    message={t({ fr: "Pour souffler un peu, rien que vous deux.", en: "A little time to breathe, just the two of you." })}
                    price={coffrets[0].price} lang={lang} />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* UTILISER UNE CARTE */}
      <section className="bg-cream text-ink px-6 py-24 md:py-32" data-testid="gc-redeem-cta">
        <Reveal className="max-w-2xl mx-auto text-center">
          <p className="ps-overline text-terracotta mb-5">{t({ fr: "Vous avez reçu une carte ?", en: "Received a card?" })}</p>
          <p className="font-serif italic font-light text-3xl md:text-4xl leading-snug">
            {t({ fr: "Choisissez vos dates, nous nous occupons du reste.", en: "Pick your dates, we take care of the rest." })}
          </p>
          <Link to="/reserver?carte=1" data-testid="gc-use-link"
            className="inline-flex items-center gap-3 mt-10 border border-ink text-ink px-8 py-4 uppercase text-[11px] tracking-[0.3em] hover:bg-ink hover:text-cream transition-colors">
            {t({ fr: "Utiliser ma carte cadeau", en: "Use my gift card" })} <ArrowRight size={14} strokeWidth={1.5} />
          </Link>
        </Reveal>
      </section>

      {selected && <ExperienceModal coffret={selected} startStep={startStep} onClose={() => setSelected(null)} />}
    </>
  );
};

export default CartesCadeaux;
