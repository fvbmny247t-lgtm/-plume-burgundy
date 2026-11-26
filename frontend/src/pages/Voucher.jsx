import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { Feather, Printer } from "lucide-react";
import { useLang } from "../context/LanguageContext";
import Seo from "../components/Seo";

const API = `${process.env.REACT_APP_BACKEND_URL}/api/giftcards`;

const fmtDate = (iso, lang) => {
  if (!iso) return "";
  try { return new Date(iso).toLocaleDateString(lang === "en" ? "en-GB" : "fr-FR", { day: "numeric", month: "long", year: "numeric" }); }
  catch { return iso; }
};

const Voucher = () => {
  const { t, lang } = useLang();
  const { code } = useParams();
  const [data, setData] = useState(undefined);

  useEffect(() => {
    axios.get(`${API}/voucher/${code}`).then(({ data }) => setData(data)).catch(() => setData(null));
  }, [code]);

  if (data === undefined) return <div className="min-h-[70vh] bg-cream" data-testid="gc-voucher-loading" />;

  return (
    <>
      <Seo title={t({ fr: "Votre bon cadeau", en: "Your gift voucher" })} noindex />
      <section className="min-h-[85vh] bg-cream text-ink px-6 pt-32 pb-24 flex justify-center print:pt-8" data-testid="gc-voucher-page">
        <div className="w-full max-w-xl">
          {data === null ? (
            <p className="text-center font-sans text-sm text-red-700" data-testid="gc-voucher-notfound">
              {t({ fr: "Ce bon est introuvable.", en: "This voucher cannot be found." })}
            </p>
          ) : (
            <>
              <div className="bg-white border-2 border-ink/15 p-10 md:p-12 text-center relative" data-testid="gc-voucher-card">
                <div className="flex justify-center mb-6"><Feather size={30} strokeWidth={1.3} className="text-terracotta" /></div>
                <p className="ps-overline text-ink/50 mb-2">{t({ fr: "Bon cadeau", en: "Gift voucher" })}</p>
                <p className="font-serif italic text-xs tracking-[0.3em] text-ink/40 mb-6">PLUME SUITES · BOURGOGNE</p>
                <h1 className="font-serif italic font-light text-3xl md:text-4xl mb-6">{data.coffret_name}</h1>
                {data.recipient_name && (
                  <p className="font-sans text-sm text-ink/60 mb-2">{t({ fr: "Pour", en: "For" })} <span className="text-ink">{data.recipient_name}</span></p>
                )}
                {data.message && (
                  <p className="font-serif italic text-lg text-ink/80 my-6 leading-relaxed">« {data.message} »</p>
                )}
                <div className="my-8 py-5 border-y border-dashed border-ink/20">
                  <p className="ps-overline text-ink/50 mb-2">{t({ fr: "Code", en: "Code" })}</p>
                  <p className="font-serif text-2xl tracking-[0.2em]" data-testid="gc-voucher-code">{data.code}</p>
                </div>
                <p className="font-sans text-xs text-ink/50">
                  {data.status === "redeemed"
                    ? t({ fr: "Bon déjà utilisé", en: "Voucher already used" })
                    : data.status === "expired"
                    ? t({ fr: "Bon expiré", en: "Voucher expired" })
                    : `${t({ fr: "Valable jusqu'au", en: "Valid until" })} ${fmtDate(data.expires_at, lang)}`}
                </p>
              </div>

              <div className="mt-8 text-center print:hidden">
                {data.status === "active" ? (
                  <>
                    <p className="font-sans text-sm text-ink/60 mb-5 leading-relaxed">
                      {t({ fr: "Pour profiter de ce bon, remplissez le formulaire « Utiliser mon bon » : nous conviendrons ensemble des dates de votre séjour.", en: "To enjoy this voucher, fill in the \u201cUse my gift card\u201d form: we will arrange your stay dates together." })}
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center">
                      <Link to={`/utiliser-mon-bon?code=${data.code}`} data-testid="gc-voucher-use" className="bg-ink text-cream px-6 py-3 uppercase text-[11px] tracking-[0.25em] hover:bg-terracotta transition-colors">
                        {t({ fr: "Utiliser mon bon", en: "Use my gift card" })}
                      </Link>
                      <button onClick={() => window.print()} data-testid="gc-voucher-print" className="inline-flex items-center gap-2 border border-ink/30 px-6 py-3 uppercase text-[11px] tracking-[0.25em] hover:border-terracotta hover:text-terracotta transition-colors">
                        <Printer size={14} strokeWidth={1.5} /> {t({ fr: "Imprimer", en: "Print" })}
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="font-sans text-sm text-ink/55" data-testid="gc-voucher-used-note">
                    {data.status === "redeemed"
                      ? t({ fr: "Ce bon a déjà été utilisé. Merci !", en: "This voucher has already been used. Thank you!" })
                      : t({ fr: "Ce bon n'est plus valable.", en: "This voucher is no longer valid." })}
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
