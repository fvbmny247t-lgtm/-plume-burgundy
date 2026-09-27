"""Provider-agnostic transactional email sending (Infomaniak SMTP).

The application-facing signature is deliberately stable:

    await send_email(to, subject, html, reply_to=None)

If the provider changes later, only this module changes.
"""
import os
import ssl
import asyncio
import logging
import smtplib
from email.message import EmailMessage
from email.utils import formataddr

logger = logging.getLogger(__name__)


def _required(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def is_configured() -> bool:
    return bool(os.environ.get("SMTP_PASSWORD"))


def _send_smtp(to: str, subject: str, html: str, reply_to: str | None = None) -> None:
    host = _required("SMTP_HOST")
    port = int(_required("SMTP_PORT"))
    user = _required("SMTP_USER")
    password = _required("SMTP_PASSWORD")
    from_email = _required("FROM_EMAIL")
    from_name = _required("FROM_NAME")
    default_reply = os.environ.get("REPLY_TO", from_email)

    message = EmailMessage()
    message["From"] = formataddr((from_name, from_email))
    message["To"] = to
    message["Subject"] = subject
    message["Reply-To"] = reply_to or default_reply
    message.set_content(
        "Ce message contient du contenu HTML. Veuillez l'ouvrir dans un client email compatible."
    )
    message.add_alternative(html, subtype="html")

    tls_context = ssl.create_default_context()
    if port == 465:
        with smtplib.SMTP_SSL(host, port, context=tls_context, timeout=20) as smtp:
            smtp.login(user, password)
            smtp.send_message(message)
    elif port == 587:
        with smtplib.SMTP(host, port, timeout=20) as smtp:
            smtp.ehlo()
            smtp.starttls(context=tls_context)
            smtp.ehlo()
            smtp.login(user, password)
            smtp.send_message(message)
    else:
        raise RuntimeError("SMTP_PORT must be 465 or 587")


async def send_email(to: str, subject: str, html: str, reply_to: str | None = None) -> bool:
    """Send one HTML email. Blocking smtplib runs off the event loop."""
    await asyncio.to_thread(_send_smtp, to, subject, html, reply_to)
    return True
