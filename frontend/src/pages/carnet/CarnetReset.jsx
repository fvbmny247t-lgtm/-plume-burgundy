import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useLang } from "../../context/LanguageContext";
import { useCarnet, formatApiErrorDetail } from "../../context/CarnetAuthContext";
import Seo from "../../components/Seo";
import { CarnetShell, CarnetCard, Field, SubmitButton, ErrorNote, SuccessNote } from "../../components/carnet/carnetUi";

const CarnetReset = () => {
  const { t } = useLang();
  const { client } = useCarnet();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError(t({ fr: "Les mots de passe ne correspondent pas.", en: "Passwords do not match." }));
      return;
    }
    setLoading(true);
    try {
      await client.post("/reset-password", { token, password, password_confirm: confirm });
      setDone(true);
      setTimeout(() => navigate("/carnet/connexion", { replace: true }), 2500);
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Seo title="Nouveau mot de passe" noindex />
      <CarnetShell
        eyebrow={t({ fr: "Votre espace", en: "Your space" })}
        title={t({ fr: "Nouveau mot de passe", en: "New password" })}
        testid="carnet-reset-page"
      >
        <CarnetCard>
          {!token ? (
            <ErrorNote testid="carnet-reset-error">
              {t({ fr: "Lien invalide.", en: "Invalid link." })}
            </ErrorNote>
          ) : done ? (
            <SuccessNote testid="carnet-reset-success">
              {t({
                fr: "Votre mot de passe a été modifié. Redirection vers la connexion…",
                en: "Your password has been changed. Redirecting to sign in…",
              })}
            </SuccessNote>
          ) : (
            <form onSubmit={submit} data-testid="carnet-reset-form">
              <Field
                label={t({ fr: "Nouveau mot de passe", en: "New password" })}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                testid="carnet-reset-password"
              />
              <Field
                label={t({ fr: "Confirmer le mot de passe", en: "Confirm password" })}
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                testid="carnet-reset-password-confirm"
              />
              <ErrorNote testid="carnet-reset-error">{error}</ErrorNote>
              <SubmitButton loading={loading} testid="carnet-reset-submit">
                {t({ fr: "Enregistrer", en: "Save" })}
              </SubmitButton>
            </form>
          )}
          <p className="text-center text-sm text-ink/50 mt-5">
            <Link to="/carnet/connexion" className="hover:text-terracotta transition-colors">
              {t({ fr: "Retour à la connexion", en: "Back to sign in" })}
            </Link>
          </p>
        </CarnetCard>
      </CarnetShell>
    </>
  );
};

export default CarnetReset;
