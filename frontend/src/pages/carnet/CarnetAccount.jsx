import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useLang } from "../../context/LanguageContext";
import { useCarnet, formatApiErrorDetail } from "../../context/CarnetAuthContext";
import Seo from "../../components/Seo";
import { CarnetCard, Field, ErrorNote, SuccessNote } from "../../components/carnet/carnetUi";

const Block = ({ title, children }) => (
  <div className="mb-6">
    <h2 className="ps-overline text-ink/50 mb-4">{title}</h2>
    <CarnetCard>{children}</CarnetCard>
  </div>
);

const CarnetAccount = () => {
  const { t } = useLang();
  const { user, setUser, logout, refreshMe, client } = useCarnet();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({ first_name: "", last_name: "" });
  const [pwd, setPwd] = useState({ current_password: "", new_password: "", new_password_confirm: "" });
  const [emailForm, setEmailForm] = useState({ new_email: "", password: "" });
  const [delPwd, setDelPwd] = useState("");
  const [msg, setMsg] = useState({});

  useEffect(() => {
    if (user) setProfile({ first_name: user.first_name, last_name: user.last_name });
  }, [user]);

  useEffect(() => {
    if (user === null) navigate("/carnet/connexion", { replace: true });
  }, [user, navigate]);

  if (user === undefined || user === null)
    return <div className="min-h-[70vh] bg-cream" data-testid="carnet-account-loading" />;

  const setNote = (k, type, text) => setMsg((m) => ({ ...m, [k]: { type, text } }));
  const Note = ({ k, okKey, okText }) => {
    const n = msg[k];
    if (!n) return null;
    return n.type === "ok"
      ? <SuccessNote testid={`carnet-account-${okKey}-success`}>{n.text}</SuccessNote>
      : <ErrorNote testid={`carnet-account-${okKey}-error`}>{n.text}</ErrorNote>;
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const { data } = await client.patch("/profile", profile);
      setUser(data);
      setNote("profile", "ok", t({ fr: "Vos informations sont enregistrées.", en: "Your details are saved." }));
    } catch (err) {
      setNote("profile", "err", formatApiErrorDetail(err.response?.data?.detail));
    }
  };

  const changePwd = async (e) => {
    e.preventDefault();
    if (pwd.new_password !== pwd.new_password_confirm) {
      setNote("pwd", "err", t({ fr: "Les mots de passe ne correspondent pas.", en: "Passwords do not match." }));
      return;
    }
    try {
      await client.post("/change-password", pwd);
      setPwd({ current_password: "", new_password: "", new_password_confirm: "" });
      setNote("pwd", "ok", t({ fr: "Mot de passe modifié.", en: "Password changed." }));
    } catch (err) {
      setNote("pwd", "err", formatApiErrorDetail(err.response?.data?.detail));
    }
  };

  const changeEmail = async (e) => {
    e.preventDefault();
    try {
      await client.post("/change-email", emailForm);
      setEmailForm({ new_email: "", password: "" });
      refreshMe();
      setNote("email", "ok", t({ fr: "Un email de confirmation a été envoyé à votre nouvelle adresse.", en: "A confirmation email was sent to your new address." }));
    } catch (err) {
      setNote("email", "err", formatApiErrorDetail(err.response?.data?.detail));
    }
  };

  const unsubscribe = async () => {
    // Le lien de désinscription est dans chaque email ; ici on renvoie vers la gestion par email.
    setNote("nl", "ok", t({ fr: "Le lien de désinscription se trouve en bas de chaque Lettre de Marie.", en: "The unsubscribe link is at the bottom of every Lettre de Marie." }));
  };
  const subscribe = async () => {
    try {
      await client.post("/newsletter/subscribe", { email: user.email, source: "compte" });
      refreshMe();
      setNote("nl", "ok", t({ fr: "Un email de confirmation vous a été envoyé.", en: "A confirmation email has been sent to you." }));
    } catch (err) {
      setNote("nl", "err", formatApiErrorDetail(err.response?.data?.detail));
    }
  };

  const deleteAccount = async (e) => {
    e.preventDefault();
    if (!window.confirm(t({ fr: "Supprimer définitivement votre Carnet ? Cette action est irréversible.", en: "Permanently delete your Carnet? This cannot be undone." }))) return;
    try {
      await client.delete("/account", { data: { password: delPwd } });
      logout();
      navigate("/", { replace: true });
    } catch (err) {
      setNote("del", "err", formatApiErrorDetail(err.response?.data?.detail));
    }
  };

  return (
    <>
      <Seo title="Mon compte" noindex />
      <section className="min-h-[80vh] bg-cream text-ink px-6 pt-32 pb-24" data-testid="carnet-account-page">
        <div className="max-w-xl mx-auto">
          <Link to="/carnet" className="inline-flex items-center gap-2 text-sm text-ink/60 hover:text-terracotta transition-colors mb-8" data-testid="carnet-account-back">
            <ArrowLeft size={15} strokeWidth={1.5} /> {t({ fr: "Mon Carnet", en: "My Carnet" })}
          </Link>
          <h1 className="font-serif italic font-light text-4xl md:text-5xl leading-tight mb-10">
            {t({ fr: "Mon compte", en: "My account" })}
          </h1>

          <Block title={t({ fr: "Informations", en: "Details" })}>
            <form onSubmit={saveProfile} data-testid="carnet-profile-form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                <Field label={t({ fr: "Prénom", en: "First name" })} value={profile.first_name} onChange={(e) => setProfile((p) => ({ ...p, first_name: e.target.value }))} required testid="carnet-profile-firstname" />
                <Field label={t({ fr: "Nom", en: "Last name" })} value={profile.last_name} onChange={(e) => setProfile((p) => ({ ...p, last_name: e.target.value }))} required testid="carnet-profile-lastname" />
              </div>
              <Note k="profile" okKey="profile" />
              <button type="submit" data-testid="carnet-profile-submit" className="bg-ink text-cream px-6 py-3 uppercase text-[11px] tracking-[0.3em] hover:bg-terracotta transition-colors">
                {t({ fr: "Enregistrer", en: "Save" })}
              </button>
            </form>
          </Block>

          <Block title={t({ fr: "Adresse email", en: "Email address" })}>
            <p className="font-sans text-sm text-ink/60 mb-4">{t({ fr: "Adresse actuelle", en: "Current address" })} : <span className="text-ink" data-testid="carnet-current-email">{user.email}</span></p>
            <form onSubmit={changeEmail} data-testid="carnet-email-form">
              <Field label={t({ fr: "Nouvelle adresse", en: "New address" })} type="email" value={emailForm.new_email} onChange={(e) => setEmailForm((f) => ({ ...f, new_email: e.target.value }))} required testid="carnet-email-new" />
              <Field label={t({ fr: "Mot de passe", en: "Password" })} type="password" value={emailForm.password} onChange={(e) => setEmailForm((f) => ({ ...f, password: e.target.value }))} required autoComplete="current-password" testid="carnet-email-password" />
              <Note k="email" okKey="email" />
              <button type="submit" data-testid="carnet-email-submit" className="bg-ink text-cream px-6 py-3 uppercase text-[11px] tracking-[0.3em] hover:bg-terracotta transition-colors">
                {t({ fr: "Changer d'adresse", en: "Change address" })}
              </button>
            </form>
          </Block>

          <Block title={t({ fr: "Mot de passe", en: "Password" })}>
            <form onSubmit={changePwd} data-testid="carnet-password-form">
              <Field label={t({ fr: "Mot de passe actuel", en: "Current password" })} type="password" value={pwd.current_password} onChange={(e) => setPwd((p) => ({ ...p, current_password: e.target.value }))} required autoComplete="current-password" testid="carnet-password-current" />
              <Field label={t({ fr: "Nouveau mot de passe", en: "New password" })} type="password" value={pwd.new_password} onChange={(e) => setPwd((p) => ({ ...p, new_password: e.target.value }))} required minLength={8} autoComplete="new-password" testid="carnet-password-new" />
              <Field label={t({ fr: "Confirmer", en: "Confirm" })} type="password" value={pwd.new_password_confirm} onChange={(e) => setPwd((p) => ({ ...p, new_password_confirm: e.target.value }))} required minLength={8} autoComplete="new-password" testid="carnet-password-confirm" />
              <Note k="pwd" okKey="password" />
              <button type="submit" data-testid="carnet-password-submit" className="bg-ink text-cream px-6 py-3 uppercase text-[11px] tracking-[0.3em] hover:bg-terracotta transition-colors">
                {t({ fr: "Modifier le mot de passe", en: "Change password" })}
              </button>
            </form>
          </Block>

          <Block title={t({ fr: "La Lettre de Marie", en: "La Lettre de Marie" })}>
            <p className="font-sans text-sm text-ink/70 mb-4" data-testid="carnet-account-newsletter-status">
              {{
                none: t({ fr: "Vous ne recevez pas encore La Lettre de Marie.", en: "You do not yet receive La Lettre de Marie." }),
                pending: t({ fr: "Inscription en attente de confirmation.", en: "Subscription awaiting confirmation." }),
                confirmed: t({ fr: "Vous recevez La Lettre de Marie.", en: "You receive La Lettre de Marie." }),
                unsubscribed: t({ fr: "Vous êtes désinscrit.", en: "You are unsubscribed." }),
              }[user.newsletter_status]}
            </p>
            <Note k="nl" okKey="newsletter" />
            {(user.newsletter_status === "none" || user.newsletter_status === "unsubscribed") ? (
              <button onClick={subscribe} data-testid="carnet-account-newsletter-subscribe" className="bg-ink text-cream px-6 py-3 uppercase text-[11px] tracking-[0.3em] hover:bg-terracotta transition-colors">
                {t({ fr: "M'inscrire", en: "Subscribe" })}
              </button>
            ) : (
              <button onClick={unsubscribe} data-testid="carnet-account-newsletter-unsub" className="border border-ink/30 px-6 py-3 uppercase text-[11px] tracking-[0.3em] hover:border-terracotta hover:text-terracotta transition-colors">
                {t({ fr: "Me désinscrire", en: "Unsubscribe" })}
              </button>
            )}
          </Block>

          <Block title={t({ fr: "Supprimer mon Carnet", en: "Delete my Carnet" })}>
            <p className="font-sans text-sm text-ink/60 mb-4">
              {t({ fr: "La suppression est définitive. Vos Plumes et votre historique seront perdus.", en: "Deletion is permanent. Your Plumes and history will be lost." })}
            </p>
            <form onSubmit={deleteAccount} data-testid="carnet-delete-form">
              <Field label={t({ fr: "Mot de passe", en: "Password" })} type="password" value={delPwd} onChange={(e) => setDelPwd(e.target.value)} required autoComplete="current-password" testid="carnet-delete-password" />
              <Note k="del" okKey="delete" />
              <button type="submit" data-testid="carnet-delete-submit" className="border border-red-300 text-red-700 px-6 py-3 uppercase text-[11px] tracking-[0.3em] hover:bg-red-50 transition-colors">
                {t({ fr: "Supprimer définitivement", en: "Delete permanently" })}
              </button>
            </form>
          </Block>
        </div>
      </section>
    </>
  );
};

export default CarnetAccount;
