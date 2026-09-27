import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../../context/LanguageContext";
import { useCarnet, formatApiErrorDetail } from "../../context/CarnetAuthContext";
import Seo from "../../components/Seo";
import { CarnetShell, CarnetCard, Field, SubmitButton, ErrorNote, CarnetFootLink } from "../../components/carnet/carnetUi";

const CarnetRegister = () => {
  const { t, lang } = useLang();
  const { user, register } = useCarnet();
  const navigate = useNavigate();
  const [form, setForm] = useState({ first_name: "", last_name: "", email: "", password: "", password_confirm: "" });
  const [newsletter, setNewsletter] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/carnet", { replace: true });
  }, [user, navigate]);

  const upd = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.password_confirm) {
      setError(t({ fr: "Les mots de passe ne correspondent pas.", en: "Passwords do not match." }));
      return;
    }
    setLoading(true);
    try {
      await register({ ...form, newsletter_opt_in: newsletter, locale: lang });
      navigate("/carnet", { replace: true });
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Seo title="Ouvrir mon Carnet" noindex />
      <CarnetShell
        eyebrow={t({ fr: "Bienvenue", en: "Welcome" })}
        title={t({ fr: "Ouvrez votre Carnet", en: "Open your Carnet" })}
        subtitle={t({
          fr: "Votre Carnet rassemble votre histoire avec Plume et les attentions qui l'accompagnent.",
          en: "Your Carnet gathers your story with Plume and the attentions that come with it.",
        })}
        testid="carnet-register-page"
      >
        <CarnetCard>
          <form onSubmit={submit} data-testid="carnet-register-form">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
              <Field label={t({ fr: "Prénom", en: "First name" })} value={form.first_name} onChange={upd("first_name")} required testid="carnet-register-firstname" />
              <Field label={t({ fr: "Nom", en: "Last name" })} value={form.last_name} onChange={upd("last_name")} required testid="carnet-register-lastname" />
            </div>
            <Field label={t({ fr: "Adresse email", en: "Email address" })} type="email" value={form.email} onChange={upd("email")} required autoComplete="username" testid="carnet-register-email" />
            <Field label={t({ fr: "Mot de passe", en: "Password" })} type="password" value={form.password} onChange={upd("password")} required minLength={8} autoComplete="new-password" testid="carnet-register-password" />
            <Field label={t({ fr: "Confirmer le mot de passe", en: "Confirm password" })} type="password" value={form.password_confirm} onChange={upd("password_confirm")} required minLength={8} autoComplete="new-password" testid="carnet-register-password-confirm" />

            <label className="flex items-start gap-3 mb-6 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={newsletter}
                onChange={(e) => setNewsletter(e.target.checked)}
                data-testid="carnet-register-newsletter"
                className="mt-1 accent-[#b9785d] w-4 h-4"
              />
              <span className="font-sans text-sm text-ink/70 leading-relaxed">
                {t({
                  fr: "Je souhaite recevoir La Lettre de Marie, quelques nouvelles de la maison par an.",
                  en: "I would like to receive La Lettre de Marie, a few notes from the house each year.",
                })}
              </span>
            </label>

            <ErrorNote testid="carnet-register-error">{error}</ErrorNote>
            <SubmitButton loading={loading} testid="carnet-register-submit">
              {t({ fr: "Ouvrir mon Carnet", en: "Open my Carnet" })}
            </SubmitButton>
          </form>
        </CarnetCard>
        <CarnetFootLink
          to="/carnet/connexion"
          prompt={{ fr: "Vous avez déjà un Carnet ?", en: "Already have a Carnet?" }}
          action={{ fr: "Se connecter", en: "Sign in" }}
          testid="carnet-goto-login"
        />
      </CarnetShell>
    </>
  );
};

export default CarnetRegister;
