import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { useLang } from "../../context/LanguageContext";
import Seo from "../../components/Seo";
import { CarnetShell, CarnetCard } from "../../components/carnet/carnetUi";

const API = `${process.env.REACT_APP_BACKEND_URL}/api/carnet`;

// mode: "confirm" | "unsubscribe"
const NewsletterAction = ({ mode = "confirm" }) => {
  const { t } = useLang();
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [state, setState] = useState("loading");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const endpoint = mode === "unsubscribe" ? "/newsletter/unsubscribe" : "/newsletter/confirm";
    if (!token) {
      setState("error");
      return;
    }
    axios
      .post(`${API}${endpoint}`, { token })
      .then(() => setState("ok"))
      .catch(() => setState("error"));
  }, [token, mode]);

  const copy = {
    confirm: {
      loading: t({ fr: "Confirmation en cours…", en: "Confirming…" }),
      okTitle: t({ fr: "Inscription confirmée", en: "Subscription confirmed" }),
      okText: t({ fr: "Merci. Vous recevrez désormais La Lettre de Marie.", en: "Thank you. You will now receive La Lettre de Marie." }),
    },
    unsubscribe: {
      loading: t({ fr: "Désinscription en cours…", en: "Unsubscribing…" }),
      okTitle: t({ fr: "Vous êtes désinscrit", en: "You are unsubscribed" }),
      okText: t({ fr: "Vous ne recevrez plus La Lettre de Marie. À bientôt peut-être.", en: "You will no longer receive La Lettre de Marie. See you soon perhaps." }),
    },
  }[mode];

  return (
    <>
      <Seo title="La Lettre de Marie" noindex />
      <CarnetShell
        eyebrow={t({ fr: "La Lettre de Marie", en: "La Lettre de Marie" })}
        title={state === "ok" ? copy.okTitle : state === "error" ? t({ fr: "Lien invalide", en: "Invalid link" }) : t({ fr: "Un instant…", en: "One moment…" })}
        testid="newsletter-action-page"
      >
        <CarnetCard>
          {state === "loading" && <p className="text-center font-sans text-sm text-ink/60" data-testid="newsletter-loading">{copy.loading}</p>}
          {state === "ok" && (
            <div className="text-center" data-testid="newsletter-ok">
              <p className="font-sans text-sm text-ink/70 mb-6">{copy.okText}</p>
              <Link to="/" className="text-terracotta hover:underline underline-offset-4 text-sm">
                {t({ fr: "Retour à l'accueil", en: "Back home" })}
              </Link>
            </div>
          )}
          {state === "error" && (
            <p className="text-center font-sans text-sm text-red-700" data-testid="newsletter-error">
              {t({ fr: "Ce lien est invalide ou a expiré.", en: "This link is invalid or has expired." })}
            </p>
          )}
        </CarnetCard>
      </CarnetShell>
    </>
  );
};

export default NewsletterAction;
