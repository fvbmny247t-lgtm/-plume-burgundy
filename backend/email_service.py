"""Branded transactional emails for Plume Suites (contact form + Carnet Plume).

All sending goes through email_provider.send_email so the mail provider
(Infomaniak SMTP) can change without touching call sites.
"""
import os
import logging
import html as html_lib

from email_provider import send_email

logger = logging.getLogger(__name__)

SENDER_EMAIL = os.environ.get("FROM_EMAIL", "hello@plumesuites.fr")
CONTACT_INBOX = os.environ.get("CONTACT_INBOX", "hello@plumesuites.fr")
LOGO_URL = os.environ.get("EMAIL_LOGO_URL", "")

INK = "#3b312b"
CREAM = "#f5f1ea"
TERRA = "#b9785d"


def _esc(value: str) -> str:
    return html_lib.escape(value or "").replace("\n", "<br/>")


def _shell(inner_html: str, unsubscribe_url: str = "") -> str:
    """Wrap content in the branded Plume Suites email shell (email-safe inline CSS)."""
    logo_block = (
        f'<img src="{LOGO_URL}" alt="Plume Suites" width="150" '
        f'style="display:block;margin:0 auto;width:150px;max-width:60%;height:auto;border:0;" />'
        if LOGO_URL else
        f'<div style="font-family:Georgia,\'Times New Roman\',serif;font-size:24px;letter-spacing:6px;color:{INK};font-weight:400;">PLUME</div>'
        f'<div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:5px;color:{TERRA};margin-top:4px;">SUITES</div>'
    )
    unsub = (
        f'<br/><a href="{unsubscribe_url}" style="color:{TERRA};text-decoration:none;">Se désinscrire de La Lettre de Marie</a>'
        if unsubscribe_url else ""
    )
    return f"""<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:{CREAM};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:{CREAM};padding:32px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid rgba(59,49,43,0.10);">
        <tr><td style="padding:36px 40px 0 40px;text-align:center;">
          {logo_block}
          <div style="height:1px;background-color:rgba(59,49,43,0.12);margin:24px 0 0 0;"></div>
        </td></tr>
        <tr><td style="padding:32px 40px 40px 40px;">
          {inner_html}
        </td></tr>
        <tr><td style="padding:24px 40px 36px 40px;border-top:1px solid rgba(59,49,43,0.10);">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.7;color:rgba(59,49,43,0.7);">
              <strong style="color:{INK};">Plume Suites</strong><br/>
              8 Rue des Vieilles Carrieres, 21410 Fleurey-sur-Ouche, Bourgogne<br/>
              +33 6 95 48 87 60 &nbsp;&middot;&nbsp;
              <a href="mailto:hello@plumesuites.fr" style="color:{TERRA};text-decoration:none;">hello@plumesuites.fr</a>
              {unsub}
            </td></tr>
          </table>
        </td></tr>
      </table>
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:rgba(59,49,43,0.4);margin-top:18px;letter-spacing:2px;">BOURGOGNE &middot; COSTA DEL SOL</div>
    </td></tr>
  </table>
</body></html>"""


def _heading(text: str) -> str:
    return f'<h1 style="font-family:Georgia,\'Times New Roman\',serif;font-style:italic;font-weight:400;font-size:30px;line-height:1.2;color:{INK};margin:0 0 18px 0;">{text}</h1>'


def _para(text: str) -> str:
    return f'<p style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:rgba(59,49,43,0.85);margin:0 0 16px 0;">{text}</p>'


def _button(url: str, label: str) -> str:
    return (
        f'<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px 0;"><tr>'
        f'<td style="background-color:{TERRA};"><a href="{url}" '
        f'style="display:inline-block;padding:14px 30px;font-family:Arial,Helvetica,sans-serif;'
        f'font-size:12px;letter-spacing:2px;text-transform:uppercase;color:{CREAM};text-decoration:none;">{label}</a>'
        f'</td></tr></table>'
    )


def _signature(lang: str) -> str:
    who = "Marie, Plume Suites" if lang != "en" else "Marie, Plume Suites"
    return _para(f'Avec toute mon attention,<br/><span style="font-style:italic;">{who}</span>') if lang != "en" \
        else _para(f'With my warmest regards,<br/><span style="font-style:italic;">{who}</span>')


# ---------------------------------------------------------------------------
# Contact form
# ---------------------------------------------------------------------------
def _customer_html(name: str, message: str, lang: str) -> str:
    safe_name = html_lib.escape(name or "")
    if lang == "en":
        inner = (
            _heading("Thank you, we've received your message.")
            + _para(f"Dear {safe_name},")
            + _para("Your message has reached us and we will reply to you personally as soon as possible.")
            + _signature("en")
            + f'<div style="margin:24px 0;padding:18px 20px;background-color:{CREAM};border-left:2px solid {TERRA};">'
            + '<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(59,49,43,0.55);margin:0 0 8px 0;">Your message</p>'
            + f'<p style="font-family:Georgia,serif;font-style:italic;font-size:15px;color:{INK};margin:0;line-height:1.6;">{_esc(message)}</p></div>'
        )
    else:
        inner = (
            _heading("Merci, nous avons bien reçu votre message.")
            + _para(f"Bonjour {safe_name},")
            + _para("Votre message nous est bien parvenu et nous y répondrons personnellement dans les meilleurs délais.")
            + _signature("fr")
            + f'<div style="margin:24px 0;padding:18px 20px;background-color:{CREAM};border-left:2px solid {TERRA};">'
            + '<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(59,49,43,0.55);margin:0 0 8px 0;">Votre message</p>'
            + f'<p style="font-family:Georgia,serif;font-style:italic;font-size:15px;color:{INK};margin:0;line-height:1.6;">{_esc(message)}</p></div>'
        )
    return _shell(inner)


def _notification_html(name: str, email: str, subject: str, message: str, lang: str) -> str:
    rows = [
        ("Nom", html_lib.escape(name or "")),
        ("Email", html_lib.escape(email or "")),
        ("Sujet", html_lib.escape(subject or "—")),
        ("Langue", html_lib.escape(lang or "fr")),
    ]
    rows_html = "".join(
        f'<tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:rgba(59,49,43,0.55);padding:6px 16px 6px 0;white-space:nowrap;vertical-align:top;">{k}</td>'
        f'<td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:{INK};padding:6px 0;">{v}</td></tr>'
        for k, v in rows
    )
    inner = (
        _heading("Nouveau message de contact")
        + f'<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px 0;">{rows_html}</table>'
        + f'<div style="padding:18px 20px;background-color:{CREAM};border-left:2px solid {TERRA};">'
        + '<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(59,49,43,0.55);margin:0 0 8px 0;">Message</p>'
        + f'<p style="font-family:Georgia,serif;font-size:15px;color:{INK};margin:0;line-height:1.7;">{_esc(message)}</p></div>'
    )
    return _shell(inner)


async def send_contact_emails(name: str, email: str, subject: str, message: str, lang: str = "fr") -> dict:
    """Send the internal notification and the customer auto-reply. Errors are logged, not raised."""
    result = {"notification": None, "confirmation": None, "error": None}
    subj_label = subject or ("Demande de contact" if lang != "en" else "Contact request")

    try:
        await send_email(
            CONTACT_INBOX,
            f"Nouveau message — {name} ({subj_label})",
            _notification_html(name, email, subject, message, lang),
            reply_to=email,
        )
        result["notification"] = "sent"
    except Exception as e:  # noqa: BLE001
        logger.error(f"Contact notification email failed: {e}")
        result["error"] = str(e)

    try:
        confirm_subject = "We've received your message — Plume Suites" if lang == "en" \
            else "Nous avons bien reçu votre message — Plume Suites"
        await send_email(
            email, confirm_subject, _customer_html(name, message, lang), reply_to=CONTACT_INBOX,
        )
        result["confirmation"] = "sent"
    except Exception as e:  # noqa: BLE001
        logger.error(f"Contact confirmation email failed: {e}")
        result["error"] = str(e)

    return result


# ---------------------------------------------------------------------------
# Carnet Plume — account + newsletter emails
# ---------------------------------------------------------------------------
async def send_verification_email(to: str, first_name: str, verify_url: str, lang: str = "fr") -> None:
    name = html_lib.escape(first_name or "")
    if lang == "en":
        inner = (
            _heading("Confirm your email address")
            + _para(f"Hello {name},")
            + _para("Thank you for opening your Carnet Plume. Please confirm your email address to activate it.")
            + _button(verify_url, "Confirm my email")
            + _para('If you did not create this account, you can simply ignore this message.')
            + _signature("en")
        )
        subject = "Confirm your email — Plume Suites"
    else:
        inner = (
            _heading("Confirmez votre adresse email")
            + _para(f"Bonjour {name},")
            + _para("Merci d'avoir ouvert votre Carnet Plume. Confirmez votre adresse email pour l'activer.")
            + _button(verify_url, "Confirmer mon email")
            + _para("Si vous n'êtes pas à l'origine de cette inscription, vous pouvez ignorer ce message.")
            + _signature("fr")
        )
        subject = "Confirmez votre email — Plume Suites"
    await send_email(to, subject, _shell(inner))


async def send_welcome_carnet_email(to: str, first_name: str, carnet_url: str, lang: str = "fr") -> None:
    name = html_lib.escape(first_name or "")
    if lang == "en":
        inner = (
            _heading("Welcome to your Carnet Plume")
            + _para(f"Hello {name},")
            + _para("Your Carnet is now open. It quietly gathers your story with Plume and the little attentions that come with it.")
            + _button(carnet_url, "Open my Carnet")
            + _signature("en")
        )
        subject = "Your Carnet Plume is open — Plume Suites"
    else:
        inner = (
            _heading("Bienvenue dans votre Carnet Plume")
            + _para(f"Bonjour {name},")
            + _para("Votre Carnet est désormais ouvert. Il rassemble en toute discrétion votre histoire avec Plume et les attentions qui l'accompagnent.")
            + _button(carnet_url, "Ouvrir mon Carnet")
            + _signature("fr")
        )
        subject = "Votre Carnet Plume est ouvert — Plume Suites"
    await send_email(to, subject, _shell(inner))


async def send_reset_password_email(to: str, first_name: str, reset_url: str, lang: str = "fr") -> None:
    name = html_lib.escape(first_name or "")
    if lang == "en":
        inner = (
            _heading("Reset your password")
            + _para(f"Hello {name},")
            + _para("You asked to reset your password. This link is valid for one hour.")
            + _button(reset_url, "Choose a new password")
            + _para("If you did not make this request, you can ignore this message.")
            + _signature("en")
        )
        subject = "Reset your password — Plume Suites"
    else:
        inner = (
            _heading("Réinitialisez votre mot de passe")
            + _para(f"Bonjour {name},")
            + _para("Vous avez demandé à réinitialiser votre mot de passe. Ce lien est valable une heure.")
            + _button(reset_url, "Choisir un nouveau mot de passe")
            + _para("Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.")
            + _signature("fr")
        )
        subject = "Réinitialisez votre mot de passe — Plume Suites"
    await send_email(to, subject, _shell(inner))


async def send_password_changed_email(to: str, first_name: str, lang: str = "fr") -> None:
    name = html_lib.escape(first_name or "")
    if lang == "en":
        inner = (
            _heading("Your password has been changed")
            + _para(f"Hello {name},")
            + _para("This is a confirmation that your password was just changed. If this was not you, please contact us right away.")
            + _signature("en")
        )
        subject = "Your password has been changed — Plume Suites"
    else:
        inner = (
            _heading("Votre mot de passe a été modifié")
            + _para(f"Bonjour {name},")
            + _para("Nous vous confirmons que votre mot de passe vient d'être modifié. Si vous n'êtes pas à l'origine de ce changement, contactez-nous sans attendre.")
            + _signature("fr")
        )
        subject = "Votre mot de passe a été modifié — Plume Suites"
    await send_email(to, subject, _shell(inner))


async def send_newsletter_confirm_email(to: str, confirm_url: str, unsubscribe_url: str, lang: str = "fr") -> None:
    if lang == "en":
        inner = (
            _heading("Confirm your subscription to La Lettre de Marie")
            + _para("A few times a year, La Lettre de Marie shares news from the house, quiet ideas and small attentions.")
            + _para("Please confirm your subscription to start receiving it.")
            + _button(confirm_url, "Confirm my subscription")
            + _signature("en")
        )
        subject = "Confirm your subscription — La Lettre de Marie"
    else:
        inner = (
            _heading("Confirmez votre inscription à La Lettre de Marie")
            + _para("Quelques fois par an, La Lettre de Marie partage des nouvelles de la maison, des idées discrètes et de petites attentions.")
            + _para("Confirmez votre inscription pour commencer à la recevoir.")
            + _button(confirm_url, "Confirmer mon inscription")
            + _signature("fr")
        )
        subject = "Confirmez votre inscription — La Lettre de Marie"
    await send_email(to, subject, _shell(inner, unsubscribe_url=unsubscribe_url))


# ---------------------------------------------------------------------------
# Carnet Plume — cartes cadeaux (coffrets expérience)
# ---------------------------------------------------------------------------
def _fmt_date(iso_str: str, lang: str = "fr") -> str:
    try:
        from datetime import datetime as _dt
        d = _dt.fromisoformat(iso_str)
        months_fr = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"]
        if lang == "en":
            return d.strftime("%d %B %Y")
        return f"{d.day} {months_fr[d.month - 1]} {d.year}"
    except Exception:
        return iso_str or ""


async def send_giftcard_email(to, buyer_name, coffret_name, code, recipient_name, message, expires_at, voucher_url, lang="fr"):
    name = html_lib.escape(buyer_name or "")
    coffret = html_lib.escape(coffret_name or "")
    recip = html_lib.escape(recipient_name or "")
    valid = _fmt_date(expires_at, lang)
    code_block = (
        f'<div style="margin:8px 0 24px 0;padding:22px;text-align:center;background-color:{CREAM};border:1px dashed {TERRA};">'
        f'<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(59,49,43,0.55);margin:0 0 8px 0;">'
        + ("Your gift code" if lang == "en" else "Votre code cadeau") + "</p>"
        f'<p style="font-family:Georgia,serif;font-size:26px;letter-spacing:3px;color:{INK};margin:0;">{html_lib.escape(code)}</p></div>'
    )
    msg_block = (
        f'<div style="margin:0 0 20px 0;padding:16px 18px;background-color:{CREAM};border-left:2px solid {TERRA};">'
        f'<p style="font-family:Georgia,serif;font-style:italic;font-size:15px;color:{INK};margin:0;line-height:1.6;">« {html_lib.escape(message)} »</p></div>'
        if message else ""
    )
    if lang == "en":
        inner = (
            _heading("Your gift card is ready")
            + _para(f"Hello {name},")
            + _para(f"Thank you. Your gift card for the <strong>{coffret}</strong> experience is ready to be offered"
                    + (f" to {recip}" if recip else "") + ".")
            + code_block + msg_block
            + _para(f"Valid until <strong>{valid}</strong>. To use it, the recipient simply fills in the short form on our site.")
            + (_button(voucher_url, "View the gift voucher") if voucher_url else "")
            + _signature("en")
        )
        subject = "Your Plume Suites gift card"
    else:
        inner = (
            _heading("Votre carte cadeau est prête")
            + _para(f"Bonjour {name},")
            + _para(f"Merci. Votre carte cadeau pour le coffret <strong>{coffret}</strong> est prête à être offerte"
                    + (f" à {recip}" if recip else "") + ".")
            + code_block + msg_block
            + _para(f"Valable jusqu'au <strong>{valid}</strong>. Pour l'utiliser, le bénéficiaire remplit simplement le court formulaire sur notre site.")
            + (_button(voucher_url, "Voir le bon cadeau") if voucher_url else "")
            + _signature("fr")
        )
        subject = "Votre carte cadeau Plume Suites"
    await send_email(to, subject, _shell(inner))


async def send_redemption_admin_email(req: dict):
    rows = [
        ("Code", req.get("code")),
        ("Coffret", req.get("coffret_name")),
        ("Nom", req.get("guest_name")),
        ("Email", req.get("guest_email")),
        ("Téléphone", req.get("guest_phone") or "—"),
        ("Dates souhaitées", req.get("desired_dates")),
        ("Voyageurs", req.get("nb_guests")),
        ("Suite souhaitée", req.get("suite_pref") or "—"),
    ]
    rows_html = "".join(
        f'<tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:rgba(59,49,43,0.55);padding:6px 16px 6px 0;white-space:nowrap;vertical-align:top;">{html_lib.escape(str(k))}</td>'
        f'<td style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:{INK};padding:6px 0;">{html_lib.escape(str(v))}</td></tr>'
        for k, v in rows
    )
    msg = req.get("message")
    msg_block = (
        f'<div style="padding:16px 18px;background-color:{CREAM};border-left:2px solid {TERRA};">'
        f'<p style="font-family:Georgia,serif;font-size:15px;color:{INK};margin:0;line-height:1.6;">{_esc(msg)}</p></div>'
        if msg else ""
    )
    inner = (
        _heading("Demande d'utilisation d'un bon cadeau")
        + f'<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px 0;">{rows_html}</table>'
        + msg_block
        + _para("Pensez à valider le séjour dans Smoobu, puis à marquer la demande comme traitée dans l'administration.")
    )
    await send_email(CONTACT_INBOX, f"Bon cadeau à traiter — {req.get('code')}", _shell(inner), reply_to=req.get("guest_email"))


async def send_redemption_guest_email(to, guest_name, coffret_name, code, lang="fr"):
    name = html_lib.escape(guest_name or "")
    coffret = html_lib.escape(coffret_name or "")
    if lang == "en":
        inner = (
            _heading("We've received your request")
            + _para(f"Hello {name},")
            + _para(f"Thank you. We've received your request to use your gift card (<strong>{coffret}</strong>, code {html_lib.escape(code)}). We will get back to you very soon to arrange the dates of your stay.")
            + _signature("en")
        )
        subject = "Your gift card request — Plume Suites"
    else:
        inner = (
            _heading("Nous avons bien reçu votre demande")
            + _para(f"Bonjour {name},")
            + _para(f"Merci. Nous avons bien reçu votre demande d'utilisation de votre carte cadeau (<strong>{coffret}</strong>, code {html_lib.escape(code)}). Nous revenons vers vous très vite pour convenir des dates de votre séjour.")
            + _signature("fr")
        )
        subject = "Votre demande de bon cadeau — Plume Suites"
    await send_email(to, subject, _shell(inner))
