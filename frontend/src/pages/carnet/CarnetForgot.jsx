import React, { useState } from "react";
import { useLang } from "../../context/LanguageContext";
import { useCarnet, formatApiErrorDetail } from "../../context/CarnetAuthContext";
import Seo from "../../components/Seo";
import { CarnetShell, CarnetCard, Field, SubmitButton, ErrorNote, SuccessNote, CarnetFootLink } from "../../components/carnet/carnetUi";

const CarnetForgot = () => {
  const { t, lang } = useLang();
  const { client } = useCarnet();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await client.post("/forgot-password", { email, locale: lang });
      setDone(true);
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Seo title="Mot de passe oublié" noindex />
      <CarnetShell
        eyebrow={t({ fr: "Votre espace", en: "Your space" })}
        title={t({ fr: "Mot de passe oublié", en: "Forgot password" })}
        subtitle={t({
          fr: "Indiquez votre adresse, nous vous enverrons un lien pour en choisir un nouveau.",
          en: "Enter your email and we will send you a link to choose a new one.",
        })}
        testid="carnet-forgot-page"
      >
        <CarnetCard>
          {done ? (
            <SuccessNote testid="carnet-forgot-success">
              {t({
                fr: "Si un Carnet existe avec cette adresse, un email vient de vous être envoyé.",
                en: "If a Carnet exists with this address, an email has just been sent to you.",
              })}
            </SuccessNote>
          ) : (
            <form onSubmit={submit} data-testid="carnet-forgot-form">
              <Field
                label={t({ fr: "Adresse email", en: "Email address" })}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                testid="carnet-forgot-email"
              />
              <ErrorNote testid="carnet-forgot-error">{error}</ErrorNote>
              <SubmitButton loading={loading} testid="carnet-forgot-submit">
                {t({ fr: "Envoyer le lien", en: "Send the link" })}
              </SubmitButton>
            </form>
          )}
        </CarnetCard>
        <CarnetFootLink
          to="/carnet/connexion"
          prompt={{ fr: "Vous vous souvenez ?", en: "Remembered it?" }}
          action={{ fr: "Se connecter", en: "Sign in" }}
          testid="carnet-forgot-goto-login"
        />
      </CarnetShell>
    </>
  );
};

export default CarnetForgot;
