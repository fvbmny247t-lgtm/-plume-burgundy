import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "../../context/LanguageContext";
import { useCarnet, formatApiErrorDetail } from "../../context/CarnetAuthContext";
import Seo from "../../components/Seo";
import { CarnetShell, CarnetCard, Field, SubmitButton, ErrorNote, CarnetFootLink } from "../../components/carnet/carnetUi";

const CarnetLogin = () => {
  const { t } = useLang();
  const { user, login } = useCarnet();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/carnet", { replace: true });
  }, [user, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/carnet", { replace: true });
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Seo title="Mon Carnet — Connexion" noindex />
      <CarnetShell
        eyebrow={t({ fr: "Votre espace", en: "Your space" })}
        title={t({ fr: "Votre Carnet Plume", en: "Your Carnet Plume" })}
        subtitle={t({ fr: "Retrouvez votre histoire avec Plume.", en: "Find your story with Plume." })}
        testid="carnet-login-page"
      >
        <CarnetCard>
          <form onSubmit={submit} data-testid="carnet-login-form">
            <Field
              label={t({ fr: "Adresse email", en: "Email address" })}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              testid="carnet-login-email"
            />
            <Field
              label={t({ fr: "Mot de passe", en: "Password" })}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              testid="carnet-login-password"
            />
            <ErrorNote testid="carnet-login-error">{error}</ErrorNote>
            <SubmitButton loading={loading} testid="carnet-login-submit">
              {t({ fr: "Se connecter", en: "Sign in" })}
            </SubmitButton>
          </form>
          <p className="text-center text-sm text-ink/50 mt-5">
            <button
              type="button"
              onClick={() => navigate("/carnet/mot-de-passe-oublie")}
              data-testid="carnet-forgot-link"
              className="hover:text-terracotta transition-colors"
            >
              {t({ fr: "Mot de passe oublié ?", en: "Forgot your password?" })}
            </button>
          </p>
        </CarnetCard>
        <CarnetFootLink
          to="/carnet/inscription"
          prompt={{ fr: "Vous n'avez pas encore de Carnet ?", en: "No Carnet yet?" }}
          action={{ fr: "Ouvrir mon Carnet", en: "Open my Carnet" }}
          testid="carnet-goto-register"
        />
      </CarnetShell>
    </>
  );
};

export default CarnetLogin;
