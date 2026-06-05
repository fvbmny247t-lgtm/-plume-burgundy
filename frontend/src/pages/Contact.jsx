import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useLang } from "../context/LanguageContext";
import { CONTACT_PAGE, FOOTER, NAV } from "../data/content";
import Seo from "../components/Seo";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Contact = () => {
  const { t, lang } = useLang();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [state, setState] = useState({ loading: false, ok: false, err: false });

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setState({ loading: true, ok: false, err: false });
    try {
      await axios.post(`${API}/contact`, { ...form, locale: lang });
      setState({ loading: false, ok: true, err: false });
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setState({ loading: false, ok: false, err: true });
    }
  };

  return (
    <div className="bg-cream text-ink" data-testid="contact-page">
      <Seo
        title={t({ fr: "Contact", en: "Contact" })}
        description={t({
          fr: "Contactez Plume Suites — boutique hôtel au bord du canal de Bourgogne, Fleurey-sur-Ouche.",
          en: "Contact Plume Suites — boutique hotel by the Burgundy canal, Fleurey-sur-Ouche.",
        })}
        path="/contact"
      />
      <section className="pt-36 md:pt-44 pb-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <p className="ps-overline text-ink/60">— {t(CONTACT_PAGE.overline)}</p>
          <h1 className="font-serif italic text-4xl md:text-6xl lg:text-[5.5rem] leading-[1] font-light mt-5 max-w-4xl">
            {t(CONTACT_PAGE.title)}
          </h1>
          <p className="font-sans text-base md:text-lg max-w-xl mt-7 text-ink/80 leading-relaxed">
            {t(CONTACT_PAGE.intro)}
          </p>
        </div>
      </section>

      <section className="px-6 md:px-12 pb-32">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
          <form onSubmit={onSubmit} data-testid="contact-form" className="lg:col-span-7 space-y-8">
            <div>
              <label className="ps-overline text-ink/60 block mb-2">{t(CONTACT_PAGE.fields.name)}</label>
              <input
                required
                data-testid="contact-name"
                name="name"
                value={form.name}
                onChange={onChange}
                className="w-full bg-transparent border-b border-ink/30 py-3 font-serif italic text-2xl focus:outline-none focus:border-terracotta transition-colors"
              />
            </div>
            <div>
              <label className="ps-overline text-ink/60 block mb-2">{t(CONTACT_PAGE.fields.email)}</label>
              <input
                required
                type="email"
                data-testid="contact-email"
                name="email"
                value={form.email}
                onChange={onChange}
                className="w-full bg-transparent border-b border-ink/30 py-3 font-serif italic text-2xl focus:outline-none focus:border-terracotta transition-colors"
              />
            </div>
            <div>
              <label className="ps-overline text-ink/60 block mb-2">{t(CONTACT_PAGE.fields.subject)}</label>
              <input
                data-testid="contact-subject"
                name="subject"
                value={form.subject}
                onChange={onChange}
                className="w-full bg-transparent border-b border-ink/30 py-3 font-serif italic text-2xl focus:outline-none focus:border-terracotta transition-colors"
              />
            </div>
            <div>
              <label className="ps-overline text-ink/60 block mb-2">{t(CONTACT_PAGE.fields.message)}</label>
              <textarea
                required
                data-testid="contact-message"
                name="message"
                value={form.message}
                onChange={onChange}
                rows={5}
                className="w-full bg-transparent border-b border-ink/30 py-3 font-sans text-base focus:outline-none focus:border-terracotta transition-colors resize-none"
              />
            </div>

            <div className="flex items-center gap-6 flex-wrap pt-4">
              <button
                type="submit"
                disabled={state.loading}
                data-testid="contact-submit"
                className="ps-btn-primary disabled:opacity-60"
              >
                {state.loading ? t(CONTACT_PAGE.fields.sending) : t(CONTACT_PAGE.fields.submit)}
              </button>
              {state.ok && (
                <p data-testid="contact-success" className="font-serif italic text-terracotta">
                  {t(CONTACT_PAGE.fields.success)}
                </p>
              )}
              {state.err && (
                <p data-testid="contact-error" className="font-serif italic text-red-700">
                  {t(CONTACT_PAGE.fields.error)}
                </p>
              )}
            </div>
          </form>

          <aside className="lg:col-span-5 space-y-10">
            <div>
              <p className="ps-overline text-ink/60 mb-3">{t({ fr: "Adresse", en: "Address" })}</p>
              <p className="font-serif italic text-2xl md:text-3xl leading-snug">{t(CONTACT_PAGE.address)}</p>
            </div>
            <div>
              <p className="ps-overline text-ink/60 mb-3">{t({ fr: "Réservation directe", en: "Direct booking" })}</p>
              <Link
                to="/reserver"
                data-testid="contact-book"
                className="ps-btn-outline"
              >
                {t(NAV.book)}
              </Link>
            </div>
            <div>
              <p className="ps-overline text-ink/60 mb-3">{t(FOOTER.followTitle)}</p>
              <ul className="space-y-2 font-serif italic text-xl">
                {FOOTER.social.map((s) => (
                  <li key={s.label}><a href={s.href} target="_blank" rel="noreferrer" className="hover:text-terracotta transition-colors">{s.label}</a></li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default Contact;
