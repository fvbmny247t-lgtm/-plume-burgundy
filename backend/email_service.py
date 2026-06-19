"""Transactional email sending for Plume Suites contact form (Resend)."""
import os
import asyncio
import logging
import html as html_lib
import resend

logger = logging.getLogger(__name__)

resend.api_key = os.environ.get("RESEND_API_KEY", "")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "hello@plumesuites.fr")
CONTACT_INBOX = os.environ.get("CONTACT_INBOX", "hello@plumesuites.fr")
FROM = f"Plume Suites <{SENDER_EMAIL}>"

INK = "#3b312b"
CREAM = "#f5f1ea"
TERRA = "#b9785d"


def _esc(value: str) -> str:
    return html_lib.escape(value or "").replace("\n", "<br/>")


def _shell(inner_html: str) -> str:
    """Wrap content in the branded Plume Suites email shell (email-safe inline CSS)."""
    return f"""<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:{CREAM};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:{CREAM};padding:32px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid rgba(59,49,43,0.10);">
        <tr><td style="padding:36px 40px 0 40px;text-align:center;">
          <div style="font-family:Georgia,'Times New Roman',serif;font-size:24px;letter-spacing:6px;color:{INK};font-weight:400;">PLUME</div>
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:10px;letter-spacing:5px;color:{TERRA};margin-top:4px;">SUITES</div>
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


def _customer_html(name: str, message: str, lang: str) -> str:
    safe_name = html_lib.escape(name or "")
    if lang == "en":
        inner = (
            _heading("Thank you, we've received your message.")
            + _para(f"Dear {safe_name},")
            + _para("Your message has reached us and we will reply to you personally as soon as possible. "
                    "In the meantime, we wanted to confirm that your request has been received and is being taken care of.")
            + _para("With our warmest regards,<br/><span style=\"font-style:italic;\">The Plume Suites team</span>")
            + f'<div style="margin:24px 0;padding:18px 20px;background-color:{CREAM};border-left:2px solid {TERRA};">'
            + f'<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(59,49,43,0.55);margin:0 0 8px 0;">Your message</p>'
            + f'<p style="font-family:Georgia,serif;font-style:italic;font-size:15px;color:{INK};margin:0;line-height:1.6;">{_esc(message)}</p></div>'
        )
    else:
        inner = (
            _heading("Merci, nous avons bien reçu votre message.")
            + _para(f"Bonjour {safe_name},")
            + _para("Votre message nous est bien parvenu et nous y répondrons personnellement dans les meilleurs délais. "
                    "Nous tenions à vous confirmer que votre demande a bien été prise en charge.")
            + _para("Avec toute notre attention,<br/><span style=\"font-style:italic;\">L'équipe Plume Suites</span>")
            + f'<div style="margin:24px 0;padding:18px 20px;background-color:{CREAM};border-left:2px solid {TERRA};">'
            + f'<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(59,49,43,0.55);margin:0 0 8px 0;">Votre message</p>'
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
        + f'<p style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(59,49,43,0.55);margin:0 0 8px 0;">Message</p>'
        + f'<p style="font-family:Georgia,serif;font-size:15px;color:{INK};margin:0;line-height:1.7;">{_esc(message)}</p></div>'
    )
    return _shell(inner)


async def _send(params: dict):
    return await asyncio.to_thread(resend.Emails.send, params)


async def send_contact_emails(name: str, email: str, subject: str, message: str, lang: str = "fr") -> dict:
    """Send the internal notification and the customer auto-reply. Errors are logged, not raised."""
    result = {"notification": None, "confirmation": None, "error": None}
    if not resend.api_key:
        logger.warning("RESEND_API_KEY missing; skipping contact emails")
        result["error"] = "missing_api_key"
        return result

    subj_label = subject or ("Demande de contact" if lang != "en" else "Contact request")

    # 1) Notification to the business inbox
    try:
        notif = await _send({
            "from": FROM,
            "to": [CONTACT_INBOX],
            "reply_to": email,
            "subject": f"Nouveau message — {name} ({subj_label})",
            "html": _notification_html(name, email, subject, message, lang),
        })
        result["notification"] = notif.get("id") if isinstance(notif, dict) else str(notif)
    except Exception as e:  # noqa: BLE001
        logger.error(f"Contact notification email failed: {e}")
        result["error"] = str(e)

    # 2) Branded confirmation to the customer
    try:
        confirm_subject = "We've received your message — Plume Suites" if lang == "en" \
            else "Nous avons bien reçu votre message — Plume Suites"
        conf = await _send({
            "from": FROM,
            "to": [email],
            "reply_to": CONTACT_INBOX,
            "subject": confirm_subject,
            "html": _customer_html(name, message, lang),
        })
        result["confirmation"] = conf.get("id") if isinstance(conf, dict) else str(conf)
    except Exception as e:  # noqa: BLE001
        logger.error(f"Contact confirmation email failed: {e}")
        result["error"] = str(e)

    return result
