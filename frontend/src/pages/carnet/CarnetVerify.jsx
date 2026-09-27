import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useLang } from "../../context/LanguageContext";
import { useCarnet, formatApiErrorDetail } from "../../context/CarnetAuthContext";
import Seo from "../../components/Seo";
import { CarnetShell, CarnetCard } from "../../components/carnet/carnetUi";

// mode: "verify" (nouveau compte) | "change" (changement d'email)
const CarnetVerify = ({ mode = "verify" }) => {
  const { t } = useLang();
  const { client, refreshMe } = useCarnet();
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [state, setState] = useState("loading"); // loading | ok | error
  const [message, setMessage] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const endpoint = mode === "change" ? "/verify-email-change" : "/verify-email";
    if (!token) {
      setState("error");
      setMessage(t({ fr: "Lien invalide.", en: "Invalid link." }));
      return;
    }
    client
      .post(endpoint, { token })
      .then(() => {
        setState("ok");
        refreshMe();
      })
      .catch((err) => {
        setState("error");
        setMessage(formatApiErrorDetail(err.response?.data?.detail) || err.message);
      });
  }, [token, mode, client, refreshMe, t]);

  const okTitle = mode === "change"
    ? t({ fr: "Adresse confirmée", en: "Email confirmed" })
    : t({ fr: "Email confirmé", en: "Email confirmed" });
  const okText = mode === "change"
    ? t({ fr: "Votre nouvelle adresse email est bien confirmée.", en: "Your new email address is confirmed." })
    : t({ fr: "Votre adresse est confirmée. Votre Carnet est ouvert.", en: "Your email is confirmed. Your Carnet is open." });

  return (
    <>
      <Seo title="Confirmation" noindex />
      <CarnetShell
        eyebrow={t({ fr: "Votre espace", en: "Your space" })}
        title={state === "ok" ? okTitle : state === "error" ? t({ fr: "Lien invalide", en: "Invalid link" }) : t({ fr: "Un instant…", en: "One moment…" })}
        testid="carnet-verify-page"
      >
        <CarnetCard>
          {state === "loading" && (
            <p className="text-center font-sans text-sm text-ink/60" data-testid="carnet-verify-loading">
              {t({ fr: "Confirmation en cours…", en: "Confirming…" })}
            </p>
          )}
          {state === "ok" && (
            <div className="text-center" data-testid="carnet-verify-ok">
              <p className="font-sans text-sm text-ink/70 mb-6">{okText}</p>
              <Link
                to="/carnet"
                data-testid="carnet-verify-goto-carnet"
                className="inline-flex bg-ink text-cream px-6 py-3 uppercase text-[11px] tracking-[0.3em] hover:bg-terracotta transition-colors"
              >
                {t({ fr: "Ouvrir mon Carnet", en: "Open my Carnet" })}
              </Link>
            </div>
          )}
          {state === "error" && (
            <div className="text-center" data-testid="carnet-verify-error">
              <p className="font-sans text-sm text-red-700 mb-6">{message}</p>
              <Link to="/carnet/connexion" className="text-terracotta hover:underline underline-offset-4 text-sm">
                {t({ fr: "Retour à la connexion", en: "Back to sign in" })}
              </Link>
            </div>
          )}
        </CarnetCard>
      </CarnetShell>
    </>
  );
};

export default CarnetVerify;
